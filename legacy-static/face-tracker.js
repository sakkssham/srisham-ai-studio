/**
 * face-tracker.js
 * 
 * Manages webcam access, loads MediaPipe Face Mesh,
 * and tracks the user's face with adaptive smoothing.
 */

class FaceTracker {
  constructor(videoElement) {
    this.video = videoElement;
    this.faceMesh = null;
    this.isActive = false;
    this.onResultsCallback = null;
    this.previousLandmarks = null;
    
    // Telemetry and status
    this.fps = 0;
    this.lastFrameTime = performance.now();
    this.frameCount = 0;
    this.fpsTimer = performance.now();
    this.isTrackingLocked = false;
    this.onStatusChange = null;

    // Adaptive smoothing parameter (One-Euro style adaptive EMA)
    this.smoothAlpha = 0.5; // base smoothing factor
  }

  /**
   * Initialize MediaPipe Face Mesh and camera stream
   */
  async initialize() {
    this.updateStatus("loading_models", "Loading facial tracking AI...");
    
    try {
      // 1. Initialize FaceMesh object from MediaPipe global CDN scripts
      if (typeof window.FaceMesh === 'undefined') {
        throw new Error("MediaPipe FaceMesh scripts not loaded. Check script CDN tags in HTML.");
      }

      this.faceMesh = new window.FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true, // Enable 478 landmarks (includes iris tracking)
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6
      });

      // 2. Set up the results callback with smoothing
      this.faceMesh.onResults((results) => {
        this.frameCount++;
        const now = performance.now();
        
        // Calculate real-time tracking FPS
        if (now - this.fpsTimer >= 1000) {
          this.fps = Math.round((this.frameCount * 1000) / (now - this.fpsTimer));
          this.frameCount = 0;
          this.fpsTimer = now;
        }

        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          this.isTrackingLocked = true;
          const rawLandmarks = results.multiFaceLandmarks[0];
          
          // Apply temporal smoothing to eliminate micro-jitter
          const smoothedLandmarks = this.smoothLandmarks(rawLandmarks);
          results.multiFaceLandmarks[0] = smoothedLandmarks;

          this.updateStatus("tracking", "Face tracked successfully");
          if (this.onResultsCallback) {
            this.onResultsCallback(results);
          }
        } else {
          this.isTrackingLocked = false;
          this.updateStatus("searching", "Searching for face...");
          if (this.onResultsCallback) {
            this.onResultsCallback(results); // Still trigger to draw background
          }
        }
      });

      this.updateStatus("ready", "Face tracker initialized.");
    } catch (error) {
      console.error("FaceTracker Init Error:", error);
      this.updateStatus("error", `Failed to initialize: ${error.message}`);
      throw error;
    }
  }

  /**
   * Starts the webcam stream and begins the frame analysis loop
   */
  async startCamera() {
    this.updateStatus("camera_request", "Requesting camera access...");
    
    const constraints = {
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
        frameRate: { ideal: 30 }
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.srcObject = stream;
      this.video.setAttribute("playsinline", true);
      this.video.muted = true;
      
      // Wait for video metadata and play
      await new Promise((resolve) => {
        this.video.onloadedmetadata = () => {
          this.video.play().then(resolve);
        };
      });

      this.isActive = true;
      this.runProcessingLoop();
      this.updateStatus("camera_active", "Camera streaming active.");
    } catch (error) {
      console.error("Camera access denied or failed:", error);
      this.updateStatus("camera_denied", "Camera permission denied or device not found.");
      throw error;
    }
  }

  /**
   * Stops tracking and releases webcam hardware
   */
  stop() {
    this.isActive = false;
    if (this.video.srcObject) {
      const tracks = this.video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      this.video.srcObject = null;
    }
    this.previousLandmarks = null;
    this.isTrackingLocked = false;
    this.updateStatus("stopped", "Studio offline");
  }

  /**
   * Internal processing loop running at screen refresh rate
   */
  async runProcessingLoop() {
    if (!this.isActive) return;

    if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
      try {
        await this.faceMesh.send({ image: this.video });
      } catch (err) {
        console.error("MediaPipe frame send error:", err);
      }
    }

    // Standard requestAnimationFrame keeps the loop synchronized with the GPU
    requestAnimationFrame(() => this.runProcessingLoop());
  }

  /**
   * Smooths the 468+ landmarks using an adaptive Exponential Moving Average (EMA).
   * If landmarks move quickly, the smoothing factor adapts to prevent dragging (lag).
   * If landmarks are stationary, the smoothing factor increases to eliminate jitter.
   */
  smoothLandmarks(current) {
    if (!this.previousLandmarks || this.previousLandmarks.length !== current.length) {
      this.previousLandmarks = current.map(p => ({ ...p }));
      return current;
    }

    // 1. Calculate overall face velocity (average distance moved across key points)
    const keyIndices = [4, 33, 263, 61, 291, 152]; // Nose, eyes outer, lips corners, chin
    let totalVelocity = 0;
    keyIndices.forEach(idx => {
      const curr = current[idx];
      const prev = this.previousLandmarks[idx];
      const dist = Math.sqrt(
        Math.pow(curr.x - prev.x, 2) + 
        Math.pow(curr.y - prev.y, 2) + 
        Math.pow(curr.z - prev.z, 2)
      );
      totalVelocity += dist;
    });
    const avgVelocity = totalVelocity / keyIndices.length;

    // 2. Adjust alpha dynamically based on velocity
    // If average movement is large, alpha goes up (responsiveness)
    // If movement is tiny, alpha goes down (stability)
    const velocityScale = 15.0; // Tune sensitivity
    const minAlpha = 0.25;      // Max smoothing (high stability)
    const maxAlpha = 0.85;      // Min smoothing (low latency)
    
    this.smoothAlpha = Math.min(maxAlpha, Math.max(minAlpha, minAlpha + avgVelocity * velocityScale));

    // 3. Apply the smoothed filter per landmark point
    const smoothed = current.map((p, i) => {
      const prev = this.previousLandmarks[i];
      const alpha = this.smoothAlpha;
      
      const sp = {
        x: alpha * p.x + (1 - alpha) * prev.x,
        y: alpha * p.y + (1 - alpha) * prev.y,
        z: alpha * p.z + (1 - alpha) * prev.z
      };
      
      return sp;
    });

    // Save smoothed values as reference for next frame
    this.previousLandmarks = smoothed.map(p => ({ ...p }));
    return smoothed;
  }

  /**
   * Registers callback to trigger when tracking results are computed
   */
  onResults(callback) {
    this.onResultsCallback = callback;
  }

  /**
   * Registers callback to monitor camera & tracking state changes
   */
  onStatus(callback) {
    this.onStatusChange = callback;
  }

  /**
   * Helper to trigger status updates to UI shell
   */
  updateStatus(state, message) {
    if (this.onStatusChange) {
      this.onStatusChange({
        state,
        message,
        fps: this.fps,
        isTrackingLocked: this.isTrackingLocked
      });
    }
  }
}

// Export if running in a module context, otherwise expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FaceTracker;
} else {
  window.FaceTracker = FaceTracker;
}
