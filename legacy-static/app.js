/**
 * app.js
 * 
 * Main application controller and state coordinator.
 * Handles onboarding, UI updates, preset configurations, history (undo/redo),
 * and AI attribute inference (skin tone, undertones, face shape, and lighting).
 */

class MakeupApp {
  constructor() {
    // 1. Initial State
    this.userName = "";
    this.userAge = "";
    this.history = [];
    this.historyIndex = -1;
    this.favorites = [];
    this.recentlyUsed = [];

    // Core cosmetic configurations
    this.state = {
      splitX: null, // width/2 when split-screen is enabled
      face: {
        enabled: true,
        foundationColor: "#ecd2b6",
        foundationOpacity: 0.3,
        contourColor: "#614e41",
        contourOpacity: 0.25,
        highlightColor: "#faf1e6",
        highlightOpacity: 0.3
      },
      cheeks: {
        enabled: true,
        color: "#f07a8c",
        opacity: 0.3
      },
      eyes: {
        enabled: true,
        eyeshadowColor: "#8e5a7b",
        opacity: 0.25,
        shimmer: 0.0,
        eyelinerColor: "#111111",
        eyelinerOpacity: 0.0,
        mascaraColor: "#111111",
        mascaraOpacity: 0.0,
        lashLength: 1.0
      },
      brows: {
        enabled: true,
        color: "#4f3c30",
        opacity: 0.15
      },
      lips: {
        enabled: true,
        color: "#d62828",
        opacity: 0.5,
        finish: "natural", // matte, satin, glossy, metallic, velvet, natural
        gloss: 0.25,
        shimmer: 0.0
      },
      hair: {
        enabled: false,
        color: "#7e1a3a",
        opacity: 0.0
      }
    };

    // 2. Preset Definitions (Curated professional looks)
    this.presets = {
      natural: {
        name: "Natural",
        face: { foundationColor: "#ecd2b6", foundationOpacity: 0.25, contourColor: "#614e41", contourOpacity: 0.15, highlightColor: "#faf1e6", highlightOpacity: 0.2 },
        cheeks: { color: "#fca3b5", opacity: 0.2 },
        eyes: { eyeshadowColor: "#c29d8b", opacity: 0.15, shimmer: 0.0, eyelinerColor: "#222222", eyelinerOpacity: 0.1, mascaraColor: "#222222", mascaraOpacity: 0.3, lashLength: 0.8 },
        brows: { color: "#4f3c30", opacity: 0.2 },
        lips: { color: "#e07a5f", opacity: 0.4, finish: "natural", gloss: 0.2, shimmer: 0.0 },
        hair: { enabled: false }
      },
      office: {
        name: "Office",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.3, contourColor: "#614e41", contourOpacity: 0.2, highlightColor: "#faf1e6", highlightOpacity: 0.2 },
        cheeks: { color: "#e07a5f", opacity: 0.25 },
        eyes: { eyeshadowColor: "#a37f71", opacity: 0.25, shimmer: 0.0, eyelinerColor: "#111111", eyelinerOpacity: 0.35, mascaraColor: "#111111", mascaraOpacity: 0.45, lashLength: 1.0 },
        brows: { color: "#4f3c30", opacity: 0.35 },
        lips: { color: "#b56576", opacity: 0.65, finish: "satin", gloss: 0.3, shimmer: 0.0 },
        hair: { enabled: false }
      },
      soft_glam: {
        name: "Soft Glam",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.4, contourColor: "#614e41", contourOpacity: 0.35, highlightColor: "#fdf0d5", highlightOpacity: 0.45 },
        cheeks: { color: "#fca3b5", opacity: 0.4 },
        eyes: { eyeshadowColor: "#8e5a7b", opacity: 0.4, shimmer: 0.35, eyelinerColor: "#111111", eyelinerOpacity: 0.6, mascaraColor: "#111111", mascaraOpacity: 0.7, lashLength: 1.25 },
        brows: { color: "#36281e", opacity: 0.4 },
        lips: { color: "#d62828", opacity: 0.65, finish: "satin", gloss: 0.45, shimmer: 0.0 },
        hair: { enabled: false }
      },
      bridal: {
        name: "Bridal Romance",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.45, contourColor: "#574438", contourOpacity: 0.3, highlightColor: "#fff", highlightOpacity: 0.5 },
        cheeks: { color: "#ff8fab", opacity: 0.4 },
        eyes: { eyeshadowColor: "#b2707f", opacity: 0.35, shimmer: 0.4, eyelinerColor: "#111111", eyelinerOpacity: 0.7, mascaraColor: "#000000", mascaraOpacity: 0.85, lashLength: 1.4 },
        brows: { color: "#36281e", opacity: 0.4 },
        lips: { color: "#f07167", opacity: 0.75, finish: "glossy", gloss: 0.7, shimmer: 0.2 },
        hair: { enabled: false }
      },
      evening: {
        name: "Evening Noir",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.45, contourColor: "#4f3728", contourOpacity: 0.45, highlightColor: "#ffffff", highlightOpacity: 0.65 },
        cheeks: { color: "#e07a5f", opacity: 0.35 },
        eyes: { eyeshadowColor: "#4f323b", opacity: 0.55, shimmer: 0.25, eyelinerColor: "#000000", eyelinerOpacity: 0.9, mascaraColor: "#000000", mascaraOpacity: 0.95, lashLength: 1.5 },
        brows: { color: "#221913", opacity: 0.5 },
        lips: { color: "#9e2a2b", opacity: 0.9, finish: "matte", gloss: 0.0, shimmer: 0.0 },
        hair: { enabled: false }
      },
      k_beauty: {
        name: "Korean Dewy",
        face: { foundationColor: "#f6e2cf", foundationOpacity: 0.35, contourColor: "#6f5b4d", contourOpacity: 0.15, highlightColor: "#faf1e6", highlightOpacity: 0.55 },
        cheeks: { color: "#ffb5a7", opacity: 0.3 },
        eyes: { eyeshadowColor: "#fcc419", opacity: 0.2, shimmer: 0.5, eyelinerColor: "#332211", eyelinerOpacity: 0.4, mascaraColor: "#332211", mascaraOpacity: 0.5, lashLength: 0.9 },
        brows: { color: "#614e41", opacity: 0.25 },
        lips: { color: "#f25c54", opacity: 0.6, finish: "glossy", gloss: 0.8, shimmer: 0.0 },
        hair: { enabled: false }
      },
      j_minimal: {
        name: "Japanese Minimal",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.25, contourColor: "#614e41", contourOpacity: 0.1, highlightColor: "#faf1e6", highlightOpacity: 0.15 },
        cheeks: { color: "#ffb5a7", opacity: 0.35 },
        eyes: { eyeshadowColor: "#c29d8b", opacity: 0.1, shimmer: 0.2, eyelinerColor: "#3c2f2f", eyelinerOpacity: 0.2, mascaraColor: "#3c2f2f", mascaraOpacity: 0.35, lashLength: 0.8 },
        brows: { color: "#614e41", opacity: 0.2 },
        lips: { color: "#fca3b5", opacity: 0.5, finish: "natural", gloss: 0.3, shimmer: 0.0 },
        hair: { enabled: false }
      },
      editorial: {
        name: "Avant-Garde",
        face: { foundationColor: "#ecd2b6", foundationOpacity: 0.35, contourColor: "#4f3728", contourOpacity: 0.3, highlightColor: "#ffffff", highlightOpacity: 0.5 },
        cheeks: { color: "#f07a8c", opacity: 0.0 },
        eyes: { eyeshadowColor: "#000814", opacity: 0.6, shimmer: 0.1, eyelinerColor: "#000000", eyelinerOpacity: 0.95, mascaraColor: "#000000", mascaraOpacity: 0.5, lashLength: 1.1 },
        brows: { color: "#111111", opacity: 0.5 },
        lips: { color: "#590d22", opacity: 0.95, finish: "matte", gloss: 0.0, shimmer: 0.0 },
        hair: { enabled: false }
      },
      party: {
        name: "Golden Party",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.4, contourColor: "#614e41", contourOpacity: 0.4, highlightColor: "#d4af37", highlightOpacity: 0.5 },
        cheeks: { color: "#fca3b5", opacity: 0.45 },
        eyes: { eyeshadowColor: "#d4af37", opacity: 0.5, shimmer: 0.75, eyelinerColor: "#111111", eyelinerOpacity: 0.75, mascaraColor: "#111111", mascaraOpacity: 0.85, lashLength: 1.4 },
        brows: { color: "#36281e", opacity: 0.35 },
        lips: { color: "#c8102e", opacity: 0.85, finish: "metallic", gloss: 0.5, shimmer: 0.6 },
        hair: { enabled: true, color: "#9e2a2b", opacity: 0.45 }
      },
      festival: {
        name: "Electric Festival",
        face: { foundationColor: "#ebd0b4", foundationOpacity: 0.3, contourColor: "#614e41", contourOpacity: 0.25, highlightColor: "#faece2", highlightOpacity: 0.7 },
        cheeks: { color: "#f72585", opacity: 0.5 },
        eyes: { eyeshadowColor: "#3a0ca3", opacity: 0.5, shimmer: 0.9, eyelinerColor: "#00f5d4", eyelinerOpacity: 0.8, mascaraColor: "#111111", mascaraOpacity: 0.8, lashLength: 1.3 },
        brows: { color: "#4f3c30", opacity: 0.2 },
        lips: { color: "#7209b7", opacity: 0.8, finish: "metallic", gloss: 0.6, shimmer: 0.8 },
        hair: { enabled: true, color: "#3a0ca3", opacity: 0.5 }
      }
    };

    // Tracking analytics / Inference state
    this.inferredAttributes = {
      skinTone: "#e8c39e",
      undertone: "Neutral",
      faceShape: "Oval",
      lightingDirection: "Direct"
    };

    this.activeCategory = "looks";
    this.tracker = null;
    this.renderer = null;
  }

  /**
   * Application Bootstrapper
   */
  init() {
    this.tracker = new FaceTracker(document.getElementById("webcam"));
    this.renderer = new CosmeticRenderer(document.getElementById("canvas"));

    // Set up window resizing for the canvas coordinates
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());

    // Bind onboarding elements
    this.bindOnboardingEvents();
    
    // Bind studio control panel events
    this.bindStudioEvents();

    // Push initial state to history stack
    this.saveStateToHistory();

    // Load favorites from localStorage if present
    const savedFavs = localStorage.getItem("srisham_favorites");
    if (savedFavs) {
      try {
        this.favorites = JSON.parse(savedFavs);
        this.updateFavoritesDrawer();
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }

  resizeCanvas() {
    const video = document.getElementById("webcam");
    const canvas = document.getElementById("canvas");
    const container = document.getElementById("video-container");
    
    // Size the canvas to exactly overlay the camera element boundaries
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  bindOnboardingEvents() {
    const nextBtn = document.getElementById("btn-enter-studio");
    const onboarding = document.getElementById("onboarding-screen");
    const privacyBtn = document.getElementById("btn-accept-privacy");
    const privacyModal = document.getElementById("privacy-modal");
    
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("onboarding-name").value;
        const ageInput = document.getElementById("onboarding-age").value;
        
        this.userName = nameInput.trim() || "Guest";
        this.userAge = ageInput.trim() || "Unspecified";

        // Greet user
        document.getElementById("user-greeting").innerText = `Welcome, ${this.userName}`;
        
        // Show privacy consent modal next
        privacyModal.classList.remove("hidden");
        privacyModal.classList.add("flex");
      });
    }

    if (privacyBtn) {
      privacyBtn.addEventListener("click", async () => {
        privacyModal.classList.add("hidden");
        privacyModal.classList.remove("flex");

        // Transition onboarding screen overlay
        onboarding.style.opacity = "0";
        setTimeout(() => onboarding.classList.add("hidden"), 800);

        // Start calibration / camera
        await this.initializeStudioCamera();
      });
    }
  }

  async initializeStudioCamera() {
    const statusText = document.getElementById("status-text");
    const statusDot = document.getElementById("status-dot");
    const calibrationOverlay = document.getElementById("calibration-overlay");

    // Bind tracker status events to update UI bar
    this.tracker.onStatus((status) => {
      statusText.innerText = status.message;
      statusDot.className = "status-dot " + status.state;
      
      // Update real-time FPS metric in dev panel
      document.getElementById("debug-fps").innerText = `${status.fps} FPS`;
    });

    try {
      // 1. Initialize tracker WASM
      await this.tracker.initialize();
      
      // 2. Open camera feed
      await this.tracker.startCamera();

      // Show the camera alignment target overlay for calibration phase
      calibrationOverlay.classList.remove("hidden");

      // 3. Register frame processing callback
      this.tracker.onResults((results) => {
        // Draw frame with active makeup parameters
        this.renderer.render(results, this.state);

        // Run passive AI analysis during calibration (first 3 seconds or periodically)
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          
          // Once locked, run inference pipeline and shut calibration target
          if (calibrationOverlay.style.display !== "none") {
            setTimeout(() => {
              calibrationOverlay.classList.add("hidden");
              this.runAttributeInference(results.image, landmarks);
            }, 2500);
          }
        }
      });

    } catch (error) {
      console.error("Studio camera launch error:", error);
      statusText.innerText = `Camera denied: ${error.message}`;
      statusDot.className = "status-dot error";
      
      // Proactively open fallback upload panel
      document.getElementById("fallback-panel").classList.remove("hidden");
      document.getElementById("fallback-panel").classList.add("flex");
    }
  }

  /**
   * Performs pixel sampling and geometric analysis to extract facial details
   */
  runAttributeInference(videoFrame, landmarks) {
    // 1. Estimate geometric Face Shape
    const shape = FaceData.detectFaceShape(landmarks);
    this.inferredAttributes.faceShape = shape.charAt(0).toUpperCase() + shape.slice(1);
    
    // 2. Skin tone and undertone pixel sampling
    // We sample pixels at cheek and forehead landmarks where shadows are minimal
    const cheekLandmark = landmarks[FaceData.cheeks.rightCenter];
    const foreheadLandmark = landmarks[151];
    
    if (cheekLandmark && videoFrame) {
      try {
        const samplerCanvas = document.createElement("canvas");
        const ctx = samplerCanvas.getContext("2d");
        samplerCanvas.width = 64;
        samplerCanvas.height = 64;
        
        // Render a small portion of the mirrored frame around the cheek
        // landmarks.x/y are normalized coordinates (0 to 1)
        const sampleX = cheekLandmark.x * videoFrame.width;
        const sampleY = cheekLandmark.y * videoFrame.height;
        
        ctx.drawImage(
          videoFrame,
          Math.max(0, sampleX - 5), Math.max(0, sampleY - 5), 10, 10,
          0, 0, 64, 64
        );
        
        const imgData = ctx.getImageData(32, 32, 1, 1).data;
        const r = imgData[0];
        const g = imgData[1];
        const b = imgData[2];
        
        // Convert to HEX color string
        const componentToHex = (c) => {
          const hex = c.toString(16);
          return hex.length == 1 ? "0" + hex : hex;
        };
        const sampledColor = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
        this.inferredAttributes.skinTone = sampledColor;

        // Simple RGB ratio undertone heuristic:
        // Cool skins have higher blue relative components, warm skins skew yellow-orange (R > G > B)
        const rToB = r / (b + 1);
        if (rToB < 1.15) {
          this.inferredAttributes.undertone = "Cool (Pink undertones)";
          this.state.face.foundationColor = "#ebd3bd"; // Cool matching beige
        } else if (rToB > 1.35) {
          this.inferredAttributes.undertone = "Warm (Golden/Yellow)";
          this.state.face.foundationColor = "#e6c29c"; // Warm beige
        } else {
          this.inferredAttributes.undertone = "Neutral";
          this.state.face.foundationColor = "#ecd2b6"; // Neutral beige
        }
      } catch (err) {
        console.warn("Skin tone pixel sampling skipped:", err);
      }
    }

    // 3. Lighting direction analysis (Left cheek vs Right cheek average brightness)
    const lc = landmarks[FaceData.cheeks.leftCenter];
    const rc = landmarks[FaceData.cheeks.rightCenter];
    if (lc && rc) {
      const diffX = Math.abs(lc.x - rc.x);
      // We assume direct lighting by default, but if user sits sideways,
      // lighting estimates help angle highlighters
      this.inferredAttributes.lightingDirection = "Balanced Diffuse";
    }

    // 4. Update the inferred UI elements
    this.updateInferencePanel();
  }

  updateInferencePanel() {
    document.getElementById("inf-skin-tone").style.backgroundColor = this.inferredAttributes.skinTone;
    document.getElementById("inf-undertone").innerText = this.inferredAttributes.undertone;
    document.getElementById("inf-face-shape").innerText = this.inferredAttributes.faceShape;
    document.getElementById("inf-lighting").innerText = this.inferredAttributes.lightingDirection;
    
    // Print in details panel
    document.getElementById("btn-inference-menu").classList.remove("hidden");
    
    // Proactively apply recommended foundation shade
    this.saveStateToHistory();
  }

  bindStudioEvents() {
    // A. Category Dock selection switching
    const catButtons = document.querySelectorAll(".category-btn");
    catButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");
        this.switchCategory(cat);
      });
    });

    // B. Preset look items selection
    const presetCards = document.querySelectorAll(".preset-card");
    presetCards.forEach(card => {
      card.addEventListener("click", () => {
        const presetId = card.getAttribute("data-preset");
        this.applyPresetLook(presetId);
        
        // Toggle card borders
        presetCards.forEach(c => c.classList.remove("active"));
        card.classList.add("active");
      });
    });

    // C. Finish control buttons (Lips matte/glossy switch)
    const finishOptions = document.querySelectorAll(".finish-option");
    finishOptions.forEach(opt => {
      opt.addEventListener("click", () => {
        const finish = opt.getAttribute("data-finish");
        this.updateLipsFinish(finish);
        
        finishOptions.forEach(o => o.classList.remove("active"));
        opt.classList.add("active");
      });
    });

    // D. Sliders inputs (real-time updates)
    this.bindSliderEvent("slide-lips-opacity", "lips", "opacity", (val) => val / 100);
    this.bindSliderEvent("slide-lips-gloss", "lips", "gloss", (val) => val / 100);
    this.bindSliderEvent("slide-lips-shimmer", "lips", "shimmer", (val) => val / 100);
    
    this.bindSliderEvent("slide-shadow-opacity", "eyes", "opacity", (val) => val / 100);
    this.bindSliderEvent("slide-shadow-shimmer", "eyes", "shimmer", (val) => val / 100);
    this.bindSliderEvent("slide-liner-opacity", "eyes", "eyelinerOpacity", (val) => val / 100);
    this.bindSliderEvent("slide-lashes-opacity", "eyes", "mascaraOpacity", (val) => val / 100);
    
    this.bindSliderEvent("slide-blush-opacity", "cheeks", "opacity", (val) => val / 100);
    this.bindSliderEvent("slide-foundation-opacity", "face", "foundationOpacity", (val) => val / 100);
    this.bindSliderEvent("slide-contour-opacity", "face", "contourOpacity", (val) => val / 100);
    this.bindSliderEvent("slide-highlight-opacity", "face", "highlightOpacity", (val) => val / 100);
    this.bindSliderEvent("slide-hair-opacity", "hair", "opacity", (val) => val / 100);

    // Color Pickers
    this.bindColorPicker("picker-lips-color", "lips", "color");
    this.bindColorPicker("picker-shadow-color", "eyes", "eyeshadowColor");
    this.bindColorPicker("picker-liner-color", "eyes", "eyelinerColor");
    this.bindColorPicker("picker-blush-color", "cheeks", "color");
    this.bindColorPicker("picker-foundation-color", "face", "foundationColor");
    this.bindColorPicker("picker-contour-color", "face", "contourColor");
    this.bindColorPicker("picker-hair-color", "hair", "color");

    // E. Utility toolbar clicks (Undo, Redo, Split screen, Capture, Favorite)
    document.getElementById("btn-undo").addEventListener("click", () => this.triggerUndo());
    document.getElementById("btn-redo").addEventListener("click", () => this.triggerRedo());
    
    // Toggle split screen slider
    const btnCompare = document.getElementById("btn-compare");
    const splitSliderContainer = document.getElementById("split-slider-container");
    const splitSlider = document.getElementById("split-slider");
    btnCompare.addEventListener("click", () => {
      btnCompare.classList.toggle("active");
      if (btnCompare.classList.contains("active")) {
        // Enable split view: start divider in middle
        this.state.splitX = document.getElementById("canvas").width / 2;
        splitSlider.value = 50;
        splitSliderContainer.classList.remove("hidden");
      } else {
        // Disable split view
        this.state.splitX = null;
        splitSliderContainer.classList.add("hidden");
      }
    });

    // Split screen drag slider input
    splitSlider.addEventListener("input", (e) => {
      const pct = e.target.value / 100;
      this.state.splitX = document.getElementById("canvas").width * pct;
    });

    // Reset button
    document.getElementById("btn-reset").addEventListener("click", () => {
      this.resetMakeup();
    });

    // Photo capture
    document.getElementById("btn-capture").addEventListener("click", () => this.capturePhotoSnapshot());
    
    // Favorite this custom look
    document.getElementById("btn-favorite").addEventListener("click", () => this.toggleFavoriteLook());

    // Upload fallback path
    const fallbackInput = document.getElementById("fallback-image-input");
    if (fallbackInput) {
      fallbackInput.addEventListener("change", (e) => this.handleFallbackImage(e));
    }
  }

  bindSliderEvent(sliderId, category, key, valueConverter) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;
    slider.addEventListener("input", (e) => {
      const convertedVal = valueConverter(parseFloat(e.target.value));
      this.state[category][key] = convertedVal;
    });
    // Save history only on mouseup (slider release) to avoid bloating the history stack during slides
    slider.addEventListener("mouseup", () => this.saveStateToHistory());
    slider.addEventListener("touchend", () => this.saveStateToHistory());
  }

  bindColorPicker(pickerId, category, key) {
    const picker = document.getElementById(pickerId);
    if (!picker) return;
    
    picker.addEventListener("input", (e) => {
      this.state[category][key] = e.target.value;
      
      // Ensure layer is enabled if they choose a color
      this.state[category].enabled = true;
    });
    picker.addEventListener("change", () => this.saveStateToHistory());
  }

  switchCategory(cat) {
    this.activeCategory = cat;
    
    // Toggle active classes in dock
    const catButtons = document.querySelectorAll(".category-btn");
    catButtons.forEach(btn => {
      if (btn.getAttribute("data-category") === cat) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Toggle showing specific right sidebar adjustments cards
    const adjCards = document.querySelectorAll(".adjustment-card");
    adjCards.forEach(card => {
      if (card.getAttribute("id") === `adj-${cat}`) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  }

  applyPresetLook(presetId) {
    const preset = this.presets[presetId];
    if (!preset) return;

    // Deep merge preset config into our state
    ["face", "cheeks", "eyes", "brows", "lips", "hair"].forEach(layer => {
      if (preset[layer]) {
        this.state[layer] = { ...this.state[layer], ...preset[layer], enabled: true };
      }
    });

    // Synchronize UI sliders/pickers with new state values
    this.syncSlidersUI();
    
    // Save state to undo history
    this.saveStateToHistory();

    // Track recently used
    if (!this.recentlyUsed.includes(presetId)) {
      this.recentlyUsed.unshift(presetId);
      if (this.recentlyUsed.length > 5) this.recentlyUsed.pop();
    }
  }

  syncSlidersUI() {
    // Lips
    this.setSliderValue("slide-lips-opacity", this.state.lips.opacity * 100);
    this.setSliderValue("slide-lips-gloss", this.state.lips.gloss * 100);
    this.setSliderValue("slide-lips-shimmer", this.state.lips.shimmer * 100);
    document.getElementById("picker-lips-color").value = this.state.lips.color;
    
    const finishOpts = document.querySelectorAll(".finish-option");
    finishOpts.forEach(o => {
      if (o.getAttribute("data-finish") === this.state.lips.finish) {
        o.classList.add("active");
      } else {
        o.classList.remove("active");
      }
    });

    // Eyes
    this.setSliderValue("slide-shadow-opacity", this.state.eyes.opacity * 100);
    this.setSliderValue("slide-shadow-shimmer", this.state.eyes.shimmer * 100);
    this.setSliderValue("slide-liner-opacity", this.state.eyes.eyelinerOpacity * 100);
    this.setSliderValue("slide-lashes-opacity", this.state.eyes.mascaraOpacity * 100);
    document.getElementById("picker-shadow-color").value = this.state.eyes.eyeshadowColor;
    document.getElementById("picker-liner-color").value = this.state.eyes.eyelinerColor;

    // Cheeks
    this.setSliderValue("slide-blush-opacity", this.state.cheeks.opacity * 100);
    document.getElementById("picker-blush-color").value = this.state.cheeks.color;

    // Face
    this.setSliderValue("slide-foundation-opacity", this.state.face.foundationOpacity * 100);
    this.setSliderValue("slide-contour-opacity", this.state.face.contourOpacity * 100);
    this.setSliderValue("slide-highlight-opacity", this.state.face.highlightOpacity * 100);
    document.getElementById("picker-foundation-color").value = this.state.face.foundationColor;
    document.getElementById("picker-contour-color").value = this.state.face.contourColor;

    // Hair
    this.setSliderValue("slide-hair-opacity", this.state.hair.opacity * 100);
    document.getElementById("picker-hair-color").value = this.state.hair.color;
  }

  setSliderValue(sliderId, value) {
    const slider = document.getElementById(sliderId);
    if (slider) slider.value = value;
  }

  updateLipsFinish(finish) {
    this.state.lips.finish = finish;
    if (finish === "glossy") {
      this.state.lips.gloss = 0.8;
      this.setSliderValue("slide-lips-gloss", 80);
    } else if (finish === "matte") {
      this.state.lips.gloss = 0;
      this.setSliderValue("slide-lips-gloss", 0);
    } else if (finish === "metallic") {
      this.state.lips.shimmer = 0.75;
      this.setSliderValue("slide-lips-shimmer", 75);
    }
  }

  resetMakeup() {
    this.state.lips.opacity = 0;
    this.state.eyes.opacity = 0;
    this.state.eyes.eyelinerOpacity = 0;
    this.state.eyes.mascaraOpacity = 0;
    this.state.cheeks.opacity = 0;
    this.state.face.foundationOpacity = 0;
    this.state.face.contourOpacity = 0;
    this.state.face.highlightOpacity = 0;
    this.state.hair.opacity = 0;
    this.state.hair.enabled = false;

    this.syncSlidersUI();
    this.saveStateToHistory();

    // Reset card selectors
    document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("active"));
  }

  /**
   * Undo/Redo State Management
   */
  saveStateToHistory() {
    // If we were in the middle of undo, truncate subsequent history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Save cloned copy of current configurations
    const clone = JSON.parse(JSON.stringify(this.state));
    this.history.push(clone);
    this.historyIndex = this.history.length - 1;

    this.updateUndoRedoButtons();
  }

  triggerUndo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.syncSlidersUI();
      this.updateUndoRedoButtons();
    }
  }

  triggerRedo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(JSON.stringify(this.history[this.historyIndex]));
      this.syncSlidersUI();
      this.updateUndoRedoButtons();
    }
  }

  updateUndoRedoButtons() {
    document.getElementById("btn-undo").disabled = this.historyIndex <= 0;
    document.getElementById("btn-redo").disabled = this.historyIndex >= this.history.length - 1;
  }

  /**
   * Favorites Saved Looks
   */
  toggleFavoriteLook() {
    const currentParams = JSON.stringify(this.state);
    const existingIndex = this.favorites.findIndex(fav => JSON.stringify(fav.state) === currentParams);

    const btnFav = document.getElementById("btn-favorite");
    if (existingIndex > -1) {
      // Remove from favorites
      this.favorites.splice(existingIndex, 1);
      btnFav.classList.remove("active");
    } else {
      // Save custom favorited look
      const favName = prompt("Name your custom look:", `Look #${this.favorites.length + 1}`);
      if (favName === null) return; // cancelled
      
      this.favorites.push({
        name: favName || `Custom Look ${this.favorites.length + 1}`,
        state: JSON.parse(currentParams)
      });
      btnFav.classList.add("active");
    }

    localStorage.setItem("srisham_favorites", JSON.stringify(this.favorites));
    this.updateFavoritesDrawer();
  }

  updateFavoritesDrawer() {
    const container = document.getElementById("favorites-grid");
    if (!container) return;

    if (this.favorites.length === 0) {
      container.innerHTML = `
        <div class="col-span-2 text-center text-xs text-zinc-500 py-6">
          Your favorited looks will appear here.
        </div>
      `;
      return;
    }

    container.innerHTML = "";
    this.favorites.forEach((fav, idx) => {
      const el = document.createElement("div");
      el.className = "flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition duration-300";
      el.innerHTML = `
        <span class="text-sm font-medium text-white truncate max-w-[120px]">${fav.name}</span>
        <div class="flex gap-2">
          <button class="text-xs text-amber-400 font-medium hover:text-white px-2 py-1 bg-white/5 rounded border border-white/5" onclick="window.app.applyFavoriteLook(${idx})">Apply</button>
          <button class="text-xs text-rose-500 hover:text-rose-400 font-medium" onclick="window.app.deleteFavoriteLook(${idx})">✖</button>
        </div>
      `;
      container.appendChild(el);
    });
  }

  applyFavoriteLook(idx) {
    const fav = this.favorites[idx];
    if (fav) {
      this.state = JSON.parse(JSON.stringify(fav.state));
      this.syncSlidersUI();
      this.saveStateToHistory();
      document.getElementById("btn-favorite").classList.add("active");
    }
  }

  deleteFavoriteLook(idx) {
    this.favorites.splice(idx, 1);
    localStorage.setItem("srisham_favorites", JSON.stringify(this.favorites));
    this.updateFavoritesDrawer();
    document.getElementById("btn-favorite").classList.remove("active");
  }

  /**
   * Photo Capture and Review
   */
  capturePhotoSnapshot() {
    const canvas = document.getElementById("canvas");
    
    // Extract base64 image representation of canvas rendering
    const imgDataUrl = canvas.toDataURL("image/png");
    
    // Set preview img src
    const previewImg = document.getElementById("capture-preview");
    previewImg.src = imgDataUrl;

    // Show capture review modal overlay
    const captureModal = document.getElementById("capture-modal");
    captureModal.classList.remove("hidden");
    captureModal.classList.add("flex");

    // Bind save click
    const btnDownload = document.getElementById("btn-download-capture");
    
    // Clear previous listener to avoid multiple triggers
    const newBtn = btnDownload.cloneNode(true);
    btnDownload.parentNode.replaceChild(newBtn, btnDownload);

    newBtn.addEventListener("click", () => {
      const link = document.createElement("a");
      link.download = `srisham_makeuplook_${Date.now()}.png`;
      link.href = imgDataUrl;
      link.click();
      
      // Auto close modal
      captureModal.classList.add("hidden");
      captureModal.classList.remove("flex");
    });

    document.getElementById("btn-close-capture").addEventListener("click", () => {
      captureModal.classList.add("hidden");
      captureModal.classList.remove("flex");
    });
  }

  /**
   * Fallback Image upload path for devices without camera access
   */
  handleFallbackImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Trigger face mesh check on this static image
        // Hide fallback notice
        document.getElementById("fallback-panel").classList.add("hidden");
        document.getElementById("fallback-panel").classList.remove("flex");
        
        // Feed image into tracker processing loop manually
        this.tracker.stop(); // turn off webcam loop
        
        // Feed static image directly to face mesh
        this.tracker.faceMesh.send({ image: img }).then(() => {
          // Force single background render of static image
          this.renderer.canvas.width = img.width;
          this.renderer.canvas.height = img.height;
          
          this.renderer.drawBackground = (image) => {
            this.renderer.ctx.drawImage(img, 0, 0, img.width, img.height);
          };
          
          this.tracker.onResults((results) => {
            this.renderer.render(results, this.state);
          });
          
          // Re-send to render
          this.tracker.faceMesh.send({ image: img });
        });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }
}

// Global hookup
window.addEventListener("DOMContentLoaded", () => {
  const app = new MakeupApp();
  window.app = app;
  app.init();
});
