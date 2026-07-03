/**
 * renderer.js
 * 
 * The graphics rendering engine for SRISHAM Virtual Makeup Studio.
 * Uses GPU-accelerated HTML5 Canvas 2D operations, clipping paths, 
 * composite blending modes, and real-time filters to render realistic makeup.
 */

class CosmeticRenderer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d", { willReadFrequently: false });
    this.sparklePattern = null;
    this.createSparklePattern();
  }

  /**
   * Clears the canvas and draws the raw video background frame
   */
  drawBackground(video) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Draw mirrored video for natural webcam mirror effect
    this.ctx.save();
    this.ctx.translate(w, 0);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(video, 0, 0, w, h);
    this.ctx.restore();
  }

  /**
   * Helper to create a static high-frequency sparkle pattern for shimmer/metallic finishes
   */
  createSparklePattern() {
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext("2d");
    pCtx.fillStyle = "rgba(255,255,255,0)";
    pCtx.fillRect(0, 0, 64, 64);
    
    // Draw tiny sparkle dots
    pCtx.fillStyle = "rgba(255, 255, 255, 0.9)";
    for (let i = 0; i < 40; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const r = 0.5 + Math.random() * 1.2;
      pCtx.beginPath();
      pCtx.arc(x, y, r, 0, Math.PI * 2);
      pCtx.fill();
    }
    
    this.sparklePattern = this.ctx.createPattern(pCanvas, "repeat");
  }

  /**
   * Main render function called per frame
   * @param {Object} results MediaPipe FaceMesh results
   * @param {Object} options Active makeup configurations and sliders
   */
  render(results, options) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const splitX = options.splitX; // value from 0 to w (null if split disabled)

    // 1. Draw raw camera video
    if (results.image) {
      this.drawBackground(results.image);
    } else {
      // Clear screen if camera not available
      this.ctx.fillStyle = "#121214";
      this.ctx.fillRect(0, 0, w, h);
    }

    // If no face is tracked, do not draw cosmetics
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    // MediaPipe landmarks are normalized (0 to 1). Mirror x-coordinate to match our mirrored background
    const rawLandmarks = results.multiFaceLandmarks[0];
    const landmarks = rawLandmarks.map(p => ({
      x: (1 - p.x) * w,
      y: p.y * h,
      z: p.z * w
    }));

    // 2. Apply makeup layers sequentially (back-to-front rendering)
    this.ctx.save();

    // If split screen is active, clip makeup drawing to the right side of the split coordinate
    const isSplit = typeof splitX === 'number' && splitX >= 0 && splitX <= w;
    if (isSplit) {
      this.ctx.beginPath();
      this.ctx.rect(splitX, 0, w - splitX, h);
      this.ctx.clip();
    }
    
    // Core skin makeup (Foundation, Contour, Blush, Highlight)
    if (options.face && options.face.enabled) {
      this.drawFoundation(landmarks, options.face);
      this.drawContour(landmarks, options.face);
      this.drawBlush(landmarks, options.cheeks);
      this.drawHighlight(landmarks, options.face);
    }

    // Eye makeup (Eyeshadow, Eyeliner, Mascara)
    if (options.eyes && options.eyes.enabled) {
      this.drawEyeshadow(landmarks, options.eyes);
      this.drawEyeliner(landmarks, options.eyes);
      this.drawMascara(landmarks, options.eyes);
    }

    // Eyebrows tint
    if (options.brows && options.brows.enabled) {
      this.drawEyebrows(landmarks, options.brows);
    }

    // Lip makeup (Lipstick, Gloss)
    if (options.lips && options.lips.enabled) {
      this.drawLips(landmarks, options.lips);
    }

    // Hair color tint
    if (options.hair && options.hair.enabled) {
      this.drawHair(landmarks, options.hair);
    }

    this.ctx.restore();

    // 3. Draw vertical split-screen divider and interactive handle
    if (isSplit) {
      this.ctx.save();
      
      // Divider line
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(splitX, 0);
      this.ctx.lineTo(splitX, h);
      this.ctx.stroke();

      // Outer glass ring for handle
      this.ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
      this.ctx.lineWidth = 1.5;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      this.ctx.beginPath();
      this.ctx.arc(splitX, h / 2, 22, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();

      // Inner white dot
      this.ctx.fillStyle = "#ffffff";
      this.ctx.shadowBlur = 0;
      this.ctx.beginPath();
      this.ctx.arc(splitX, h / 2, 6, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  /**
   * Helper to draw a smooth path through an array of landmark coordinates
   */
  drawPath(landmarks, indexArray) {
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

  /**
   * 1. Foundation: smooths skin tone while preserving fine pores
   */
  drawFoundation(landmarks, opts) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    this.ctx.save();
    this.ctx.beginPath();
    
    // Draw main face boundary
    this.drawPath(landmarks, FaceData.faceOutline);
    this.ctx.closePath();
    
    // Clip out eyes and mouth openings so foundation is not applied over them
    // Drawing subpaths inside a path with standard non-zero/evenodd rule creates holes
    this.drawPath(landmarks, FaceData.eyes.left.outline);
    this.ctx.closePath();
    
    this.drawPath(landmarks, FaceData.eyes.right.outline);
    this.ctx.closePath();
    
    this.drawPath(landmarks, FaceData.lips.outer);
    this.ctx.closePath();

    // Set styling and blend
    this.ctx.fillStyle = opts.foundationColor || "#f2d1b3";
    this.ctx.globalAlpha = opts.foundationOpacity * 0.45; // cap to avoid mask look
    this.ctx.globalCompositeOperation = "soft-light"; // preserves underlying skin highlights/shadows/pores
    
    // Use blur to feather edges of the face mask
    this.ctx.filter = "blur(4px)";
    this.ctx.fill("evenodd");
    this.ctx.restore();
  }

  /**
   * 2. Contour: structures jawline and cheek hollows using blurred multiply blending
   */
  drawContour(landmarks, opts) {
    const w = this.canvas.width;
    const intensity = opts.contourOpacity || 0;
    if (intensity === 0) return;

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.5;
    this.ctx.globalCompositeOperation = "multiply"; // Deepens shadows naturally
    this.ctx.strokeStyle = opts.contourColor || "#5a463b";
    this.ctx.lineWidth = Math.max(12, w * 0.045);
    this.ctx.lineCap = "round";
    this.ctx.filter = "blur(22px)"; // Generous blur for professional blending

    // Draw contour along cheekbones
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.rightCheekbone);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.leftCheekbone);
    this.ctx.stroke();

    // Draw contour along jawline
    this.ctx.lineWidth = Math.max(8, w * 0.03);
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.jawlineRight);
    this.ctx.stroke();

    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.contour.jawlineLeft);
    this.ctx.stroke();

    this.ctx.restore();
  }

  /**
   * 3. Blush: Radial gradients centered on cheek landmarks for soft-focus color
   */
  drawBlush(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const blushColor = opts.color || "#ff6b8b";
    
    // Get cheeks centers
    const rc = landmarks[FaceData.cheeks.rightCenter];
    const lc = landmarks[FaceData.cheeks.leftCenter];
    if (!rc || !lc) return;

    // Radius relative to face width (e.g. cheekbone to outer cheek edge)
    const ro = landmarks[FaceData.cheeks.rightOuter];
    const lo = landmarks[FaceData.cheeks.leftOuter];
    const radius = ro && lo ? Math.sqrt(Math.pow(rc.x - ro.x, 2) + Math.pow(rc.y - ro.y, 2)) * 1.2 : w * 0.08;

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.6;
    this.ctx.globalCompositeOperation = "soft-light"; // Seamless skin merging
    this.ctx.filter = "blur(6px)"; // Blend edges further

    // Right cheek blush radial gradient
    const rGrad = this.ctx.createRadialGradient(rc.x, rc.y, 0, rc.x, rc.y, radius);
    rGrad.addColorStop(0, blushColor);
    rGrad.addColorStop(0.4, blushColor);
    rGrad.addColorStop(1, "rgba(0,0,0,0)");
    this.ctx.fillStyle = rGrad;
    this.ctx.beginPath();
    this.ctx.arc(rc.x, rc.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Left cheek blush radial gradient
    const lGrad = this.ctx.createRadialGradient(lc.x, lc.y, 0, lc.x, lc.y, radius);
    lGrad.addColorStop(0, blushColor);
    lGrad.addColorStop(0.4, blushColor);
    lGrad.addColorStop(1, "rgba(0,0,0,0)");
    this.ctx.fillStyle = lGrad;
    this.ctx.beginPath();
    this.ctx.arc(lc.x, lc.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  /**
   * 4. Highlighter: applies luminous overlays to forehead, nose bridge, chin, and cheekbones
   */
  drawHighlight(landmarks, opts) {
    const intensity = opts.highlightOpacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.highlightColor || "#faf0e6";

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.75;
    this.ctx.globalCompositeOperation = "screen"; // Adds luminance (glow)
    this.ctx.filter = "blur(8px)";
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;

    // A. Nose Bridge line
    this.ctx.lineWidth = Math.max(3, w * 0.008);
    this.ctx.lineCap = "round";
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.highlight.noseBridge);
    this.ctx.stroke();

    // B. Forehead center glow
    const fh = landmarks[FaceData.highlight.foreheadCenter];
    if (fh) {
      const fGrad = this.ctx.createRadialGradient(fh.x, fh.y, 0, fh.x, fh.y, w * 0.05);
      fGrad.addColorStop(0, color);
      fGrad.addColorStop(1, "rgba(0,0,0,0)");
      this.ctx.fillStyle = fGrad;
      this.ctx.beginPath();
      this.ctx.arc(fh.x, fh.y, w * 0.05, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // C. Chin center glow
    const ch = landmarks[FaceData.highlight.chinCenter];
    if (ch) {
      const cGrad = this.ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, w * 0.03);
      cGrad.addColorStop(0, color);
      cGrad.addColorStop(1, "rgba(0,0,0,0)");
      this.ctx.fillStyle = cGrad;
      this.ctx.beginPath();
      this.ctx.arc(ch.x, ch.y, w * 0.03, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   * 5. Eyeshadow: wraps eyelids using vertical linear color gradients
   */
  drawEyeshadow(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.eyeshadowColor || "#a26b8b";
    
    // Draw for both eyes
    ["right", "left"].forEach(side => {
      const eyeLash = FaceData.eyes[side].upperLash;
      const eyeOutline = FaceData.eyes[side].outline;
      
      // Calculate eyeshadow upper boundary by offsetting the lash landmarks upwards
      // Height of eye is used to calibrate offset
      const innerCorner = landmarks[eyeOutline[0]];
      const outerCorner = landmarks[eyeOutline[8]];
      if (!innerCorner || !outerCorner) return;

      const eyeWidth = Math.sqrt(Math.pow(innerCorner.x - outerCorner.x, 2) + Math.pow(innerCorner.y - outerCorner.y, 2));
      const shadowHeight = eyeWidth * 0.65; // offset scale

      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.5;
      this.ctx.globalCompositeOperation = "multiply";
      this.ctx.filter = "blur(10px)"; // Feathers the shadow into the crease

      // Create path: Upper lash line and offset upper boundary
      this.ctx.beginPath();
      // 1. Draw along lash line
      eyeLash.forEach(idx => {
        const p = landmarks[idx];
        this.ctx.lineTo(p.x, p.y);
      });
      // 2. Draw outer edge, then curve back above the eye from outer to inner
      for (let i = eyeLash.length - 1; i >= 0; i--) {
        const p = landmarks[eyeLash[i]];
        // Offset y upwards (minus y)
        this.ctx.lineTo(p.x, p.y - shadowHeight);
      }
      this.ctx.closePath();

      // Shadow gradient: darker at lash line, fading upwards
      const midX = (innerCorner.x + outerCorner.x) / 2;
      const midY = (innerCorner.y + outerCorner.y) / 2;
      const grad = this.ctx.createLinearGradient(midX, midY, midX, midY - shadowHeight);
      grad.addColorStop(0, color);
      grad.addColorStop(0.5, color);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      this.ctx.fillStyle = grad;
      this.ctx.fill();

      // Metallic/Shimmer Finish overlay on eyeshadow
      if (opts.shimmer > 0 && this.sparklePattern) {
        this.ctx.save();
        this.ctx.globalAlpha = opts.shimmer * 0.8;
        this.ctx.globalCompositeOperation = "screen";
        this.ctx.fillStyle = this.sparklePattern;
        this.ctx.fill();
        this.ctx.restore();
      }

      this.ctx.restore();
    });
  }

  /**
   * 6. Eyeliner: draws sharp, tapered strokes along lash line with adaptive winged extensions
   */
  drawEyeliner(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.eyelinerColor || "#111111";

    ["right", "left"].forEach(side => {
      const lashLine = FaceData.eyes[side].upperLash;
      
      this.ctx.save();
      this.ctx.globalAlpha = intensity;
      this.ctx.globalCompositeOperation = "source-over"; // Solid line
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = Math.max(1.5, w * 0.0035);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";

      // A. Draw main lash line path
      this.ctx.beginPath();
      lashLine.forEach((idx, i) => {
        const p = landmarks[idx];
        if (i === 0) this.ctx.moveTo(p.x, p.y);
        else this.ctx.lineTo(p.x, p.y);
      });

      // B. Draw adaptive wing extension
      const outerCornerIdx = side === "right" ? 33 : 263;
      const innerCornerIdx = side === "right" ? 133 : 362;
      const outerP = landmarks[outerCornerIdx];
      const innerP = landmarks[innerCornerIdx];

      if (outerP && innerP) {
        // Wing vector: points outwards, slightly upwards
        const dx = outerP.x - innerP.x;
        const dy = outerP.y - innerP.y;
        
        // Calculate wing tip relative to eye size
        const wingLength = 0.28;
        const wingTipX = outerP.x + dx * wingLength;
        const wingTipY = outerP.y + dy * wingLength - Math.abs(dx) * 0.08;

        // Draw wing stroke
        this.ctx.lineTo(wingTipX, wingTipY);
      }
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  /**
   * 7. Mascara & Lashes: draws fine strokes radiating outward from upper lash line
   */
  drawMascara(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.mascaraColor || "#000000";

    ["right", "left"].forEach(side => {
      const lashLine = FaceData.eyes[side].upperLash;
      const innerCorner = landmarks[FaceData.eyes[side].outline[0]];
      const outerCorner = landmarks[FaceData.eyes[side].outline[8]];
      if (!innerCorner || !outerCorner) return;

      const eyeWidth = Math.sqrt(Math.pow(innerCorner.x - outerCorner.x, 2) + Math.pow(innerCorner.y - outerCorner.y, 2));
      const lashLength = eyeWidth * 0.16 * (opts.lashLength || 1.0);

      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.85;
      this.ctx.globalCompositeOperation = "source-over";
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = Math.max(0.6, w * 0.0012);
      this.ctx.lineCap = "round";

      // Draw individual lashes along the upper eye arch
      // We skip the extreme corners to look natural
      for (let i = 1; i < lashLine.length - 1; i++) {
        const p = landmarks[lashLine[i]];
        const prev = landmarks[lashLine[i - 1]];
        const next = landmarks[lashLine[i + 1]];
        if (!p || !prev || !next) continue;

        // Calculate normal vector (perpendicular to lash segment) pointing upwards
        const dx = next.x - prev.x;
        const dy = next.y - prev.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        // Perpendicular vector pointing outward/upward
        let nx = -dy / len;
        let ny = dx / len;
        
        // Ensure it points upwards
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        }

        // Add subtle outward fan effect depending on position (inner vs outer corner)
        const progress = i / lashLine.length; // 0 (inner) to 1 (outer)
        const fanX = side === "right" ? (progress - 0.5) * 0.5 : (0.5 - progress) * 0.5;
        nx += fanX;

        // Draw individual curved lash stroke
        this.ctx.beginPath();
        this.ctx.moveTo(p.x, p.y);
        
        // Control point for quadratic curve to simulate lash curl
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

  /**
   * 8. Eyebrows: applies color shading over natural brow landmarks
   */
  drawEyebrows(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const color = opts.color || "#4a3c31";

    ["right", "left"].forEach(side => {
      const path = FaceData.eyebrows[side];
      
      this.ctx.save();
      this.ctx.globalAlpha = intensity * 0.35; // keep soft
      this.ctx.globalCompositeOperation = "multiply";
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = Math.max(3, w * 0.015);
      this.ctx.lineCap = "round";
      this.ctx.lineJoin = "round";
      this.ctx.filter = "blur(5px)"; // soft hair blend

      this.ctx.beginPath();
      this.drawPath(landmarks, path);
      this.ctx.stroke();
      this.ctx.restore();
    });
  }

  /**
   * 9. Lips & Lipstick: fills lip mesh with finish adjustments (gloss, shimmer, matte)
   */
  drawLips(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = opts.color || "#e63946";
    const finish = opts.finish || "natural";

    this.ctx.save();
    this.ctx.globalAlpha = intensity;

    // A. Define lips path (Outer lip loop, then clip out inner lip loop mouth opening)
    this.ctx.beginPath();
    this.drawPath(landmarks, FaceData.lips.outer);
    this.ctx.closePath();
    this.drawPath(landmarks, FaceData.lips.inner);
    this.ctx.closePath();

    // B. Set blending base based on finish
    if (finish === "matte") {
      this.ctx.globalCompositeOperation = "multiply"; // Flat saturation, preserves folds
    } else if (finish === "glossy" || finish === "satin") {
      this.ctx.globalCompositeOperation = "multiply";
    } else if (finish === "metallic") {
      this.ctx.globalCompositeOperation = "multiply";
    } else if (finish === "velvet") {
      this.ctx.globalCompositeOperation = "soft-light"; // highly integrated finish
    } else {
      this.ctx.globalCompositeOperation = "multiply"; // natural
    }

    this.ctx.fillStyle = color;
    this.ctx.fill("evenodd");

    // C. Specular gloss highlight overlay
    const glossIntensity = opts.gloss || 0;
    if ((finish === "glossy" || finish === "satin" || glossIntensity > 0) && glossIntensity > 0) {
      this.ctx.save();
      // Clip drawing area to the lips to prevent highlights bleeding
      this.ctx.beginPath();
      this.drawPath(landmarks, FaceData.lips.outer);
      this.ctx.closePath();
      this.drawPath(landmarks, FaceData.lips.inner);
      this.ctx.closePath();
      this.ctx.clip("evenodd");

      // Draw white glossy reflection streaks on the lower lip center (e.g. around landmark 14 / 17)
      const bottomCenter = landmarks[17];
      const bottomInner = landmarks[14];
      
      if (bottomCenter && bottomInner) {
        this.ctx.globalAlpha = glossIntensity * 0.75;
        this.ctx.globalCompositeOperation = "screen"; // bright reflection
        this.ctx.filter = "blur(4px)";

        // Radial shine on lower lip center
        const shineRadiusX = w * 0.04;
        const shineRadiusY = w * 0.015;
        const shineGrad = this.ctx.createRadialGradient(
          bottomCenter.x, bottomCenter.y - shineRadiusY, 0,
          bottomCenter.x, bottomCenter.y - shineRadiusY, shineRadiusX
        );
        shineGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
        shineGrad.addColorStop(0.3, "rgba(255, 255, 255, 0.5)");
        shineGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
        
        this.ctx.fillStyle = shineGrad;
        this.ctx.beginPath();
        this.ctx.ellipse(bottomCenter.x, bottomCenter.y - shineRadiusY, shineRadiusX, shineRadiusY, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Upper lip peak highlights (indices 37, 267)
        const leftPeak = landmarks[37];
        const rightPeak = landmarks[267];
        if (leftPeak && rightPeak) {
          this.ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          this.ctx.beginPath();
          this.ctx.arc(leftPeak.x, leftPeak.y + 1, w * 0.006, 0, Math.PI * 2);
          this.ctx.arc(rightPeak.x, rightPeak.y + 1, w * 0.006, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }
      this.ctx.restore();
    }

    // D. Metallic/Shimmer sparkle pattern overlay
    const shimmerAmt = opts.shimmer || 0;
    if ((finish === "metallic" || shimmerAmt > 0) && shimmerAmt > 0 && this.sparklePattern) {
      this.ctx.save();
      // Clip to lips
      this.ctx.beginPath();
      this.drawPath(landmarks, FaceData.lips.outer);
      this.ctx.closePath();
      this.drawPath(landmarks, FaceData.lips.inner);
      this.ctx.closePath();
      this.ctx.clip("evenodd");

      this.ctx.globalAlpha = shimmerAmt * 0.9;
      this.ctx.globalCompositeOperation = "screen";
      this.ctx.fillStyle = this.sparklePattern;
      this.ctx.fill();
      this.ctx.restore();
    }

    this.ctx.restore();
  }

  /**
   * 10. Hair: applies soft-blended color mask over the upper head/hair hairline region
   */
  drawHair(landmarks, opts) {
    const intensity = opts.opacity || 0;
    if (intensity === 0) return;

    const w = this.canvas.width;
    const h = this.canvas.height;
    const color = opts.color || "#800020"; // Burgundy default

    this.ctx.save();
    this.ctx.globalAlpha = intensity * 0.4;
    this.ctx.globalCompositeOperation = "color"; // Tints colors without changing brightness
    this.ctx.filter = "blur(18px)";

    // Define approximate hair bounds starting from temple to crown
    // We anchor to hairline and forehead vertices
    this.ctx.beginPath();
    
    // Hairline path
    this.drawPath(landmarks, FaceData.hairline);
    
    // Extrude upwards into the hair region of the frame
    const topCenter = landmarks[10];
    if (topCenter) {
      const hairApexY = Math.max(0, topCenter.y - h * 0.35);
      
      // Close the loop by drawing up to the frame boundaries where hair lies
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

// Export if running in a module context, otherwise expose globally
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CosmeticRenderer;
} else {
  window.CosmeticRenderer = CosmeticRenderer;
}
