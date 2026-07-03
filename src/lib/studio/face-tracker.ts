/**
 * face-tracker.ts
 * 
 * Manages camera stream operations, interacts with the client-side MediaPipe
 * Face Mesh API, and applies adaptive EMA filtering to coordinates.
 */

import { Point3D } from './face-data';

declare global {
  interface Window {
    FaceMesh: any;
  }
}

export interface TrackerStatus {
  state: 'idle' | 'loading_models' | 'ready' | 'camera_request' | 'camera_active' | 'tracking' | 'searching' | 'stopped' | 'error' | 'camera_denied';
  message: string;
  fps: number;
  isTrackingLocked: boolean;
}

export class FaceTracker {
  private video: HTMLVideoElement;
  private faceMesh: any = null;
  private isActive = false;
  private onResultsCallback: ((results: any) => void) | null = null;
  private previousLandmarks: Point3D[] | null = null;
  private onStatusChange: ((status: TrackerStatus) => void) | null = null;

  // Real-time telemetry tracking
  private fps = 0;
  private frameCount = 0;
  private fpsTimer = typeof window !== 'undefined' ? performance.now() : 0;
  private isTrackingLocked = false;
  private currentStatusState: TrackerStatus['state'] = 'idle';

  // Adaptive smoothing parameters (One-Euro style dynamic filter)
  private smoothAlpha = 0.5;

  constructor(videoElement: HTMLVideoElement) {
    this.video = videoElement;
  }

  /**
   * Initialize MediaPipe Face Mesh client instance
   */
  async initialize() {
    this.updateStatus('loading_models', 'Loading face mesh AI models...');

    try {
      if (typeof window === 'undefined' || typeof window.FaceMesh === 'undefined') {
        throw new Error('MediaPipe FaceMesh scripts not loaded. Check script imports.');
      }

      this.faceMesh = new window.FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // 478 points (includes iris mesh)
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      this.faceMesh.onResults((results: any) => {
        this.frameCount++;
        const now = performance.now();

        // Calculate tracking cycle framerates
        if (now - this.fpsTimer >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
          this.frameCount = 0;
          this.fpsTimer = now;
        }

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          this.isTrackingLocked = true;
          const rawLandmarks = results.multiFaceLandmarks[0];

          // Apply adaptive smoothing to prevent pixel jitter
          const smoothedLandmarks = this.smoothLandmarks(rawLandmarks);
          results.multiFaceLandmarks[0] = smoothedLandmarks;

          this.updateStatus('tracking', 'Calibration lock active');
          if (this.onResultsCallback) {
            this.onResultsCallback(results);
          }
        } else {
          this.isTrackingLocked = false;
          this.updateStatus('searching', 'Calibrating face mesh alignment...');
          if (this.onResultsCallback) {
            this.onResultsCallback(results); // Still trigger to paint camera background frame
          }
        }
      });

      this.updateStatus('ready', 'AI model calibrated and ready.');
    } catch (error: any) {
      console.error('FaceTracker Init Error:', error);
      this.updateStatus('error', `Initialization failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Requests webcam permissions and begins frame looping
   */
  async startCamera() {
    this.updateStatus('camera_request', 'Acquiring camera device permissions...');

    const constraints = {
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
        frameRate: { ideal: 30 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;
      this.video.setAttribute('playsinline', 'true');
      this.video.muted = true;

      await new Promise<void>((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(() => resolve());
        };
      });

      this.isActive = true;
      this.runProcessingLoop();
      this.updateStatus('camera_active', 'Webcam preview active');
    } catch (error) {
      console.error('Camera access failed:', error);
      this.updateStatus('camera_denied', 'Camera permissions denied or camera not found.');
      throw error;
    }
  }

  /**
   * Stops loops and releases system webcam hardware lock
   */
  stop() {
    this.isActive = false;
    if (this.video.srcObject) {
      const stream = this.video.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.previousLandmarks = null;
    this.isTrackingLocked = false;
    this.updateStatus('stopped', 'Studio engine offline');
  }

  /**
   * Internal processing loop bound to GPU refresh rate
   */
  private async runProcessingLoop() {
    if (!this.isActive) return;

    if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
      try {
        await this.faceMesh.send({ image: this.video });
      } catch (err) {
        console.error('MediaPipe frame processing failure:', err);
      }
    }

    requestAnimationFrame(() => this.runProcessingLoop());
  }

  /**
   * Smooths landmarks using an adaptive Exponential Moving Average (EMA).
   * Accelerates smoothing coefficients under movement to minimize latency,
   * and scales up dampening coefficients when still to eliminate shimmer.
   */
  private smoothLandmarks(current: Point3D[]): Point3D[] {
    if (!this.previousLandmarks || this.previousLandmarks.length !== current.length) {
      this.previousLandmarks = current.map(p => ({ ...p }));
      return current;
    }

    // 1. Estimate facial displacement velocity using key reference anchors
    const keyIndices = [4, 33, 263, 61, 291, 152]; // nose tip, outer eyes, lip corners, chin
    let totalVelocity = 0;
    keyIndices.forEach(idx => {
      const curr = current[idx];
      const prev = this.previousLandmarks![idx];
      if (curr && prev) {
        const dist = Math.sqrt(
          Math.pow(curr.x - prev.x, 2) + 
          Math.pow(curr.y - prev.y, 2) + 
          Math.pow(curr.z - prev.z, 2)
        );
        totalVelocity += dist;
      }
    });
    const avgVelocity = totalVelocity / keyIndices.length;

    // 2. Adjust smoothing alpha coefficient based on movement speed
    const velocityScale = 15.0; // multiplier to amplify sensitivity
    const minAlpha = 0.25;      // baseline limit (heavy filter smoothing)
    const maxAlpha = 0.85;      // top limit (ultra low tracking latency)

    this.smoothAlpha = Math.min(maxAlpha, Math.max(minAlpha, minAlpha + avgVelocity * velocityScale));

    // 3. Map filtered displacements
    const smoothed = current.map((p, i) => {
      const prev = this.previousLandmarks![i];
      const alpha = this.smoothAlpha;

      if (!prev) return { ...p };

      return {
        x: alpha * p.x + (1 - alpha) * prev.x,
        y: alpha * p.y + (1 - alpha) * prev.y,
        z: alpha * p.z + (1 - alpha) * prev.z
      };
    });

    this.previousLandmarks = smoothed.map(p => ({ ...p }));
    return smoothed;
  }

  /**
   * Registers callback to trigger when landmarks are recalculated
   */
  onResults(callback: (results: any) => void) {
    this.onResultsCallback = callback;
  }

  /**
   * Registers callback to update user interface of status changes
   */
  onStatus(callback: (status: TrackerStatus) => void) {
    this.onStatusChange = callback;
  }

  /**
   * Helper to write state metrics to registered callbacks
   */
  private updateStatus(state: TrackerStatus['state'], message: string) {
    this.currentStatusState = state;
    if (this.onStatusChange) {
      this.onStatusChange({
        state,
        message,
        fps: this.fps,
        isTrackingLocked: this.isTrackingLocked
      });
    }
  }

  /**
   * Getter for active status state
   */
  get statusState(): TrackerStatus['state'] {
    return this.currentStatusState;
  }
}
