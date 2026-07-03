/**
 * cosmetic-renderer.ts
 * 
 * GPU-accelerated canvas renderer applying makeup paths onto face coordinates.
 * Integrates blending modes (soft-light, multiply, screen) and compare dividers.
 */

import { FaceData, Point3D } from './face-data';

export interface FaceOptions {
  enabled: boolean;
  foundationColor: string;
  foundationOpacity: number;
  contourColor: string;
  contourOpacity: number;
  highlightColor: string;
  highlightOpacity: number;
}

export interface CheeksOptions {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface EyesOptions {
  enabled: boolean;
  eyeshadowColor: string;
  opacity: number;
  shimmer: number;
  eyelinerColor: string;
  eyelinerOpacity: number;
  mascaraColor: string;
  mascaraOpacity: number;
  lashLength: number;
}

export interface BrowsOptions {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface LipsOptions {
  enabled: boolean;
  color: string;
  opacity: number;
  finish: 'natural' | 'matte' | 'glossy' | 'satin' | 'metallic' | 'velvet';
  gloss: number;
  shimmer: number;
}

export interface HairOptions {
  enabled: boolean;
  color: string;
  opacity: number;
}

export interface StudioOptions {
  splitX: number | null;
  face: FaceOptions;
  cheeks: CheeksOptions;
  eyes: EyesOptions;
  brows: BrowsOptions;
  lips: LipsOptions;
  hair: HairOptions;
}

export class CosmeticRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private sparklePattern: CanvasPattern | null = null;

  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d', { willReadFrequently: false })!;
    this.createSparklePattern();
  }

  /**
   * Clears the canvas and draws the raw video background frame (mirrored)
   */
  drawBackground(video: HTMLVideoElement) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(video, 0, 0, w, h);
    this.ctx.restore();
  }

  /**
   * Helper to create a static high-frequency sparkle pattern for shimmer/metallic finishes
   */
  private createSparklePattern() {
    if (typeof window === 'undefined') return;
    
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext('2d')!;
    pCtx.fillStyle = 'rgba(255,255,255,0)';
    pCtx.fillRect(0, 0, 64, 64);

    // Draw tiny random sparkle dots
    pCtx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const r = 0.5 + Math.random() * 1.2;
      pCtx.beginPath();
      pCtx.arc(x, y, r, 0, Math.PI * 2);
      pCtx.fill();
    }

    this.sparklePattern = this.ctx.createPattern(pCanvas, 'repeat');
  }

  /**
   * Main render function called per frame
   */
  render(results: any, options: StudioOptions) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const splitX = options.splitX;

    // 1. Paint underlying camera frame
    if (results.image) {
      this.drawBackground(results.image);
    } else {
      this.ctx.fillStyle = '#09090b';
      this.ctx.fillRect(0, 0, w, h);
    }

    // Abort overlays if tracking lost
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    const rawLandmarks: Point3D[] = results.multiFaceLandmarks[0];
    const landmarks: Point3D[] = rawLandmarks.map(p => ({
      x: (1 - p.x) * w,
      y: p.y * h,
      z: p.z * w
    }));

    // 2. Draw cosmetic layers (mirrored paths)
    this.ctx.save();

    const isSplit = typeof splitX === 'number' && splitX >= 0 && splitX <= w;
    if (isSplit) {
      this.ctx.beginPath();
      this.ctx.rect(splitX!, 0, w - splitX!, h);
      this.ctx.clip();
    }

    // Render layers back-to-front
    if (options.face && options.face.enabled) {
      this.drawFoundation(landmarks, options.face);
      this.drawContour(landmarks, options.face);
      this.drawBlush(landmarks, options.cheeks);
      this.drawHighlight(landmarks, options.face);
    }

    if (options.eyes && options.eyes.enabled) {
      this.drawEyeshadow(landmarks, options.eyes);
      this.drawEyeliner(landmarks, options.eyes);
      this.drawMascara(landmarks, options.eyes);
    }

    if (options.brows && options.brows.enabled) {
      this.drawEyebrows(landmarks, options.brows);
    }

    if (options.lips && options.lips.enabled) {
      this.drawLips(landmarks, options.lips);
    }

    if (options.hair && options.hair.enabled) {
      this.drawHair(landmarks, options.hair);
    }

    this.ctx.restore();

    // 3. Paint compare slider line
    if (isSplit) {
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(splitX!, 0);
      this.ctx.lineTo(splitX!, h);
      this.ctx.stroke();

      // Outer glass ring
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.beginPath();
      this.ctx.arc(splitX!, h / 2, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Center white dot
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(splitX!, h / 2, 6, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }
  }

  private drawPath(landmarks: Point3D[], indexArray: number[]) {
    indexArray.forEach((idx, i) => {
      const p = landmarks[idx];
      if (!p) return;
      if (i === 0) {
        this.ctx.moveTo(p.x, p.y);
      } else {
        this.ctx.lineTo(p.x, p.y);
      }
    });
  }

  private drawFoundation(landmarks: Point3D[], opts: FaceOptions) {
    this.ctx.save();
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.faceOutline);
    this.ctx.closePath();

    // Clip eyes and mouth holes
    this.drawPath(landmarks, FaceData.eyes.left.outline);
    this.ctx.closePath();
    this.drawPath(landmarks, FaceData.eyes.right.outline);
    this.ctx.closePath();
    this.drawPath(landmarks, FaceData.lips.outer);
    this.ctx.closePath();

    this.ctx.fillStyle = opts.foundationColor;
    this.ctx.globalAlpha = opts.foundationOpacity * 0.45;
    this.ctx.globalCompositeOperation = 'soft-light';
    this.ctx.filter = 'blur(4px)';
    this.ctx.fill('evenodd');
    this.ctx.restore();
  }

  private drawContour(landmarks: Point3D[], opts: FaceOptions) {
    const intensity = opts.contourOpacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.5;
    this.ctx.globalCompositeOperation = 'multiply';
    this.ctx.strokeStyle = opts.contourColor;
    this.ctx.lineWidth = Math.max(12, w * 0.045);
    this.ctx.lineCap = 'round';
    this.ctx.filter = 'blur(22px)';

    // Cheekbones
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.rightCheekbone);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.leftCheekbone);
    this.ctx.stroke();

    // Jawline
    this.ctx.lineWidth = Math.max(8, w * 0.03);
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.jawlineRight);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.jawlineLeft);
    this.ctx.stroke();
    this.ctx.restore();
  }

  private drawBlush(landmarks: Point3D[], opts: CheeksOptions) {
    const intensity = opts.opacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const blushColor = opts.color;

    const rc = landmarks[FaceData.cheeks.rightCenter];
    const lc = landmarks[FaceData.cheeks.leftCenter];
    if (!rc || !lc) return;

    const ro = landmarks[FaceData.cheeks.rightOuter];
    const lo = landmarks[FaceData.cheeks.leftOuter];
    const radius = ro && lo ? Math.sqrt(Math.pow(rc.x - ro.x, 2) + Math.pow(rc.y - ro.y, 2)) * 1.2 : w * 0.08;

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.6;
    this.ctx.globalCompositeOperation = 'soft-light';
    this.ctx.filter = 'blur(6px)';

    // Right Cheek radial glow
    const rGrad = this.ctx.createRadialGradient(rc.x, rc.y, 0, rc.x, rc.y, radius);
    rGrad.addColorStop(0, blushColor);
    rGrad.addColorStop(0.4, blushColor);
    rGrad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = rGrad;
    this.ctx.beginPath();
    this.ctx.arc(rc.x, rc.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Left Cheek radial glow
    const lGrad = this.ctx.createRadialGradient(lc.x, lc.y, 0, lc.x, lc.y, radius);
    lGrad.addColorStop(0, blushColor);
    lGrad.addColorStop(0.4, blushColor);
    lGrad.addColorStop(1, 'rgba(0,0,0,0)');
    this.ctx.fillStyle = lGrad;
    this.ctx.beginPath();
    this.ctx.arc(lc.x, lc.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  private drawHighlight(landmarks: Point3D[], opts: FaceOptions) {
    const intensity = opts.highlightOpacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.highlightColor;

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.75;
    this.ctx.globalCompositeOperation = 'screen';
    this.ctx.filter = 'blur(8px)';
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;

    // Nose
    this.ctx.lineWidth = Math.max(3, w * 0.008);
    this.ctx.lineCap = 'round';
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.highlight.noseBridge);
    this.ctx.stroke();

    // Forehead
    const fh = landmarks[FaceData.highlight.foreheadCenter];
    if (fh) {
      const fGrad = this.ctx.createRadialGradient(fh.x, fh.y, 0, fh.x, fh.y, w * 0.05);
      fGrad.addColorStop(0, color);
      fGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = fGrad;
      this.ctx.beginPath();
      this.ctx.arc(fh.x, fh.y, w * 0.05, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Chin
    const ch = landmarks[FaceData.highlight.chinCenter];
    if (ch) {
      const cGrad = this.ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, w * 0.03);
      cGrad.addColorStop(0, color);
      cGrad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = cGrad;
      this.ctx.beginPath();
      this.ctx.arc(ch.x, ch.y, w * 0.03, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  private drawEyeshadow(landmarks: Point3D[], opts: EyesOptions) {
    const intensity = opts.opacity;
    if (intensity === 0) return;

    const color = opts.eyeshadowColor;

    (['right', 'left'] as const).forEach(side => {
      const eyeLash = FaceData.eyes[side].upperLash;
      const eyeOutline = FaceData.eyes[side].outline;

      const innerCorner = landmarks[eyeOutline[0]];
      const outerCorner = landmarks[eyeOutline[8]];
      if (!innerCorner || !outerCorner) return;

      const eyeWidth = Math.sqrt(Math.pow(innerCorner.x - outerCorner.x, 2) + Math.pow(innerCorner.y - outerCorner.y, 2));
      const shadowHeight = eyeWidth * 0.65;

      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.5;
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.filter = 'blur(10px)';

      this.ctx.beginPath();
      eyeLash.forEach(idx => {
        const p = landmarks[idx];
        if (p) this.ctx.lineTo(p.x, p.y);
      });
      for (let i = eyeLash.length - 1; i >= 0; i--) {
        const p = landmarks[eyeLash[i]];
        if (p) this.ctx.lineTo(p.x, p.y - shadowHeight);
      }
      this.ctx.closePath();

      const midX = (innerCorner.x + outerCorner.x) / 2;
      const midY = (innerCorner.y + outerCorner.y) / 2;
      const grad = this.ctx.createLinearGradient(midX, midY, midX, midY - shadowHeight);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Shimmer patterns
      if (opts.shimmer > 0 && this.sparklePattern) {
        this.ctx.save();
        this.ctx.globalAlpha = opts.shimmer * 0.8;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = this.sparklePattern;
        this.ctx.fill();
        this.ctx.restore();
      }
      this.ctx.restore();
    });
  }

  private drawEyeliner(landmarks: Point3D[], opts: EyesOptions) {
    const intensity = opts.eyelinerOpacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.eyelinerColor;

    (['right', 'left'] as const).forEach(side => {
      const lashLine = FaceData.eyes[side].upperLash;

      this.ctx.save();
      this.ctx.globalAlpha = intensity;
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = Math.max(1.5, w * 0.0035);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';

      this.ctx.beginPath();
      lashLine.forEach((idx, i) => {
        const p = landmarks[idx];
        if (p) {
          if (i === 0) this.ctx.moveTo(p.x, p.y);
          else this.ctx.lineTo(p.x, p.y);
        }
      });

      const outerCornerIdx = side === 'right' ? 33 : 263;
      const innerCornerIdx = side === 'right' ? 133 : 362;
      const outerP = landmarks[outerCornerIdx];
      const innerP = landmarks[innerCornerIdx];

      if (outerP && innerP) {
        const dx = outerP.x - innerP.x;
        const dy = outerP.y - innerP.y;
        const wingLength = 0.28;
        const wingTipX = outerP.x + dx * wingLength;
        const wingTipY = outerP.y + dy * wingLength - Math.abs(dx) * 0.08;
        this.ctx.lineTo(wingTipX, wingTipY);
      }
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private drawMascara(landmarks: Point3D[], opts: EyesOptions) {
    const intensity = opts.mascaraOpacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.mascaraColor;

    (['right', 'left'] as const).forEach(side => {
      const lashLine = FaceData.eyes[side].upperLash;
      const innerCorner = landmarks[FaceData.eyes[side].outline[0]];
      const outerCorner = landmarks[FaceData.eyes[side].outline[8]];
      if (!innerCorner || !outerCorner) return;

      const eyeWidth = Math.sqrt(Math.pow(innerCorner.x - outerCorner.x, 2) + Math.pow(innerCorner.y - outerCorner.y, 2));
      const lashLength = eyeWidth * 0.16 * opts.lashLength;

      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.85;
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = Math.max(0.6, w * 0.0012);
      this.ctx.lineCap = 'round';

      for (let i = 1; i < lashLine.length - 1; i++) {
        const p = landmarks[lashLine[i]];
        const prev = landmarks[lashLine[i - 1]];
        const next = landmarks[lashLine[i + 1]];
        if (!p || !prev || !next) continue;

        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);

        let nx = -dy / len;
        let ny = dx / len;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }

        const progress = i / lashLine.length;
        const fanX = side === 'right' ? (progress - 0.5) * 0.5 : (0.5 - progress) * 0.5;
        nx += fanX;

        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);

        const cpX = p.x + nx * lashLength * 0.5;
        const cpY = p.y + ny * lashLength * 0.5 - 2;
        const targetX = p.x + nx * lashLength;
        const targetY = p.y + ny * lashLength;

        this.ctx.quadraticCurveTo(cpX, cpY, targetX, targetY);
        this.ctx.stroke();
      }
      this.ctx.restore();
    });
  }

  private drawEyebrows(landmarks: Point3D[], opts: BrowsOptions) {
    const intensity = opts.opacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.color;

    (['right', 'left'] as const).forEach(side => {
      const path = FaceData.eyebrows[side];
      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.35;
      this.ctx.globalCompositeOperation = 'multiply';
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = Math.max(3, w * 0.015);
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
      this.ctx.filter = 'blur(5px)';

      this.ctx.beginPath();
      this.drawPath(landmarks, path);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  private drawLips(landmarks: Point3D[], opts: LipsOptions) {
    const intensity = opts.opacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = opts.color;
    const finish = opts.finish;

    this.ctx.save();
    this.ctx.globalAlpha = intensity;

    // Define clip paths
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.lips.outer);
    this.ctx.closePath();
    this.drawPath(landmarks, FaceData.lips.inner);
    this.ctx.closePath();

    if (finish === 'velvet') {
      this.ctx.globalCompositeOperation = 'soft-light';
    } else {
      this.ctx.globalCompositeOperation = 'multiply';
    }

    this.ctx.fillStyle = color;
    this.ctx.fill('evenodd');

    // Gloss overlay
    const glossIntensity = opts.gloss;
    if ((finish === 'glossy' || finish === 'satin' || glossIntensity > 0) && glossIntensity > 0) {
      this.ctx.save();
      this.ctx.beginPath();
      this.drawPath(landmarks, FaceData.lips.outer);
      this.ctx.closePath();
      this.drawPath(landmarks, FaceData.lips.inner);
      this.ctx.closePath();
      this.ctx.clip('evenodd');

      const bottomCenter = landmarks[17];
      const bottomInner = landmarks[14];

      if (bottomCenter && bottomInner) {
        this.ctx.globalAlpha = glossIntensity * 0.75;
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.filter = 'blur(4px)';

        const shineRadiusX = w * 0.04;
        const shineRadiusY = w * 0.015;
        const shineGrad = this.ctx.createRadialGradient(
          bottomCenter.x, bottomCenter.y - shineRadiusY, 0,
          bottomCenter.x, bottomCenter.y - shineRadiusY, shineRadiusX
        );
        shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        shineGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
        shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        this.ctx.fillStyle = shineGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(bottomCenter.x, bottomCenter.y - shineRadiusY, shineRadiusX, shineRadiusY, 0, 0, Math.PI * 2);
        this.ctx.fill();

        const leftPeak = landmarks[37];
        const rightPeak = landmarks[267];
        if (leftPeak && rightPeak) {
          this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          this.ctx.beginPath();
          this.ctx.arc(leftPeak.x, leftPeak.y + 1, w * 0.006, 0, Math.PI * 2);
          this.ctx.arc(rightPeak.x, rightPeak.y + 1, w * 0.006, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    }

    // Shimmer overlay
    const shimmerAmt = opts.shimmer;
    if ((finish === 'metallic' || shimmerAmt > 0) && shimmerAmt > 0 && this.sparklePattern) {
      this.ctx.save();
      this.ctx.beginPath();
      this.drawPath(landmarks, FaceData.lips.outer);
      this.ctx.closePath();
      this.drawPath(landmarks, FaceData.lips.inner);
      this.ctx.closePath();
      this.ctx.clip('evenodd');

      this.ctx.globalAlpha = shimmerAmt * 0.9;
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fillStyle = this.sparklePattern;
      this.ctx.fill();
      this.ctx.restore();
    }
    this.ctx.restore();
  }

  private drawHair(landmarks: Point3D[], opts: HairOptions) {
    const intensity = opts.opacity;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = opts.color;

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.4;
    this.ctx.globalCompositeOperation = 'color';
    this.ctx.filter = 'blur(18px)';

    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.hairline);

    const topCenter = landmarks[10];
    if (topCenter) {
      const hairApexY = Math.max(0, topCenter.y - h * 0.35);
      this.ctx.lineTo(w, hairApexY);
      this.ctx.lineTo(w, 0);
      this.ctx.lineTo(0, 0);
      this.ctx.lineTo(0, hairApexY);
    }
    this.ctx.closePath();
    this.ctx.fillStyle = color;
    this.ctx.fill();
    this.ctx.restore();
  }
}
