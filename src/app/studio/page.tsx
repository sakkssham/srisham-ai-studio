'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw, 
  ChevronLeft, 
  SlidersHorizontal,
  Activity,
  User,
  Heart,
  Eye,
  Layers,
  Sparkle
} from 'lucide-react';
import Link from 'next/link';

import { useToast } from '@/components/ui/toast';
import { Button, IconButton } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Tabs } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { Dropdown } from '@/components/ui/dropdown';
import { FaceTracker, TrackerStatus } from '@/lib/studio/face-tracker';
import { CosmeticRenderer, StudioOptions } from '@/lib/studio/cosmetic-renderer';
import { FaceData } from '@/lib/studio/face-data';
import { Flex, Stack, Grid, Spacer } from '@/components/ui/layout-primitives';

// Preset configurations
const PRESETS = {
  natural: {
    face: { enabled: true, foundationColor: '#f5d6c3', foundationOpacity: 0.35, contourColor: '#6e564b', contourOpacity: 0.2, highlightColor: '#fff9f2', highlightOpacity: 0.3 },
    cheeks: { enabled: true, color: '#f092a4', opacity: 0.35 },
    eyes: { enabled: true, eyeshadowColor: '#d69fae', opacity: 0.2, shimmer: 0.1, eyelinerColor: '#2b2625', eyelinerOpacity: 0.2, mascaraColor: '#1a1817', mascaraOpacity: 0.4, lashLength: 1.0 },
    brows: { enabled: true, color: '#4a3f39', opacity: 0.3 },
    lips: { enabled: true, color: '#e07383', opacity: 0.4, finish: 'natural' as const, gloss: 0.3, shimmer: 0.0 },
    hair: { enabled: false, color: '#522b40', opacity: 0.0 }
  },
  dewy: {
    face: { enabled: true, foundationColor: '#f9dfcb', foundationOpacity: 0.4, contourColor: '#614d44', contourOpacity: 0.15, highlightColor: '#ffffff', highlightOpacity: 0.65 },
    cheeks: { enabled: true, color: '#ffb3c1', opacity: 0.45 },
    eyes: { enabled: true, eyeshadowColor: '#ffd1dc', opacity: 0.25, shimmer: 0.45, eyelinerColor: '#2c221e', eyelinerOpacity: 0.1, mascaraColor: '#0c0b0a', mascaraOpacity: 0.5, lashLength: 1.15 },
    brows: { enabled: true, color: '#3d3430', opacity: 0.25 },
    lips: { enabled: true, color: '#ff8a9a', opacity: 0.5, finish: 'glossy' as const, gloss: 0.75, shimmer: 0.1 },
    hair: { enabled: false, color: '#2b1b36', opacity: 0.0 }
  },
  sunset: {
    face: { enabled: true, foundationColor: '#edc4aa', foundationOpacity: 0.45, contourColor: '#5c4337', contourOpacity: 0.35, highlightColor: '#ffe5cc', highlightOpacity: 0.5 },
    cheeks: { enabled: true, color: '#e07a5f', opacity: 0.55 },
    eyes: { enabled: true, eyeshadowColor: '#b56576', opacity: 0.5, shimmer: 0.3, eyelinerColor: '#1f130b', eyelinerOpacity: 0.6, mascaraColor: '#050302', mascaraOpacity: 0.7, lashLength: 1.3 },
    brows: { enabled: true, color: '#302117', opacity: 0.45 },
    lips: { enabled: true, color: '#c3573c', opacity: 0.65, finish: 'satin' as const, gloss: 0.4, shimmer: 0.25 },
    hair: { enabled: false, color: '#8f331f', opacity: 0.0 }
  },
  goth: {
    face: { enabled: true, foundationColor: '#fcf6f0', foundationOpacity: 0.55, contourColor: '#4f3e37', contourOpacity: 0.45, highlightColor: '#e3f2fd', highlightOpacity: 0.3 },
    cheeks: { enabled: true, color: '#9b5de5', opacity: 0.2 },
    eyes: { enabled: true, eyeshadowColor: '#3d348b', opacity: 0.6, shimmer: 0.2, eyelinerColor: '#000000', eyelinerOpacity: 0.85, mascaraColor: '#000000', mascaraOpacity: 0.9, lashLength: 1.4 },
    brows: { enabled: true, color: '#120d0b', opacity: 0.65 },
    lips: { enabled: true, color: '#4a1525', opacity: 0.8, finish: 'matte' as const, gloss: 0.0, shimmer: 0.1 },
    hair: { enabled: true, color: '#1a0d24', opacity: 0.65 }
  },
  clear: {
    face: { enabled: false, foundationColor: '#f2c1a2', foundationOpacity: 0.0, contourColor: '#5a463b', contourOpacity: 0.0, highlightColor: '#ffffff', highlightOpacity: 0.0 },
    cheeks: { enabled: false, color: '#ff6b8b', opacity: 0.0 },
    eyes: { enabled: false, eyeshadowColor: '#a26b8b', opacity: 0.0, shimmer: 0.0, eyelinerColor: '#000000', eyelinerOpacity: 0.0, mascaraColor: '#000000', mascaraOpacity: 0.0, lashLength: 1.0 },
    brows: { enabled: false, color: '#4a3c31', opacity: 0.0 },
    lips: { enabled: false, color: '#e63946', opacity: 0.0, finish: 'natural' as const, gloss: 0.0, shimmer: 0.0 },
    hair: { enabled: false, color: '#800020', opacity: 0.0 }
  }
};

// Color pallets definitions
const COLORS = {
  lipshade: ['#e63946', '#d90429', '#ff5a5f', '#ff8a9a', '#c9184a', '#800f2f', '#ffb5a7', '#ff70a6', '#4a1525', '#c3573c'],
  eyeshadow: ['#a26b8b', '#3d348b', '#ffd1dc', '#ffd275', '#a8dadc', '#457b9d', '#e07a5f', '#b56576', '#f4a261', '#8338ec'],
  blush: ['#ff6b8b', '#ff8a9a', '#e07a5f', '#f4a261', '#ffb3c1', '#f092a4', '#d90429'],
  eyeliner: ['#000000', '#1c1b1a', '#4a3c31', '#1f3a52', '#36533d'],
  hair: ['#800020', '#1a0d24', '#8f331f', '#d4af37', '#e76f51', '#2a9d8f', '#457b9d']
};

export default function StudioPage() {
  const { toast } = useToast();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const trackerRef = useRef<FaceTracker | null>(null);
  const rendererRef = useRef<CosmeticRenderer | null>(null);

  // States
  const [isMediaPipeLoaded, setIsMediaPipeLoaded] = useState(false);
  const [trackerStatus, setTrackerStatus] = useState<TrackerStatus>({
    state: 'idle',
    message: 'Initializing local scripts...',
    fps: 0,
    isTrackingLocked: false
  });
  const [faceShape, setFaceShape] = useState<string>('Detecting...');
  const [qualityMode, setQualityMode] = useState<'battery' | 'balanced' | 'fidelity'>('fidelity');
  const [splitPosition, setSplitPosition] = useState<number | null>(null); // null means comparative split screen is inactive
  const [activeTab, setActiveTab] = useState<'lips' | 'eyes' | 'skin' | 'hair'>('lips');
  const [cameraActive, setCameraActive] = useState(false);
  
  // Shutter flash effect
  const [isFlashActive, setIsFlashActive] = useState(false);

  // Studio configuration options state
  const [options, setOptions] = useState<StudioOptions>({
    splitX: null,
    face: {
      enabled: false,
      foundationColor: '#f2c1a2',
      foundationOpacity: 0.0,
      contourColor: '#5a463b',
      contourOpacity: 0.0,
      highlightColor: '#ffffff',
      highlightOpacity: 0.0
    },
    cheeks: {
      enabled: false,
      color: '#ff6b8b',
      opacity: 0.0
    },
    eyes: {
      enabled: false,
      eyeshadowColor: '#a26b8b',
      opacity: 0.0,
      shimmer: 0.0,
      eyelinerColor: '#000000',
      eyelinerOpacity: 0.0,
      mascaraColor: '#000000',
      mascaraOpacity: 0.0,
      lashLength: 1.0
    },
    brows: {
      enabled: false,
      color: '#4a3c31',
      opacity: 0.0
    },
    lips: {
      enabled: false,
      color: '#e63946',
      opacity: 0.0,
      finish: 'natural',
      gloss: 0.0,
      shimmer: 0.0
    },
    hair: {
      enabled: false,
      color: '#800020',
      opacity: 0.0
    }
  });

  // Track dynamic canvas sizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const dpr = window.devicePixelRatio || 1;
        const rect = containerRef.current.getBoundingClientRect();
        
        let scale = 1;
        if (qualityMode === 'battery') scale = 0.65;
        if (qualityMode === 'balanced') scale = 0.85;

        canvasRef.current.width = rect.width * dpr * scale;
        canvasRef.current.height = rect.height * dpr * scale;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [qualityMode]);

  // Load script utility
  const loadScript = (src: string) => {
    return new Promise<void>((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.head.appendChild(script);
    });
  };

  // Load MediaPipe scripts on client side
  useEffect(() => {
    async function loadResources() {
      try {
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
        await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        setIsMediaPipeLoaded(true);
        setTrackerStatus(prev => ({
          ...prev,
          state: 'ready',
          message: 'Tracking scripts loaded.'
        }));
      } catch (err: any) {
        console.error(err);
        setTrackerStatus(prev => ({
          ...prev,
          state: 'error',
          message: `Failed to load tracking engine: ${err.message}`
        }));
        toast('MediaPipe initialization failed.', 'error');
      }
    }
    loadResources();
  }, [toast]);

  // Initialize trackers
  useEffect(() => {
    if (!isMediaPipeLoaded || !videoRef.current || !canvasRef.current) return;

    const tracker = new FaceTracker(videoRef.current);
    const renderer = new CosmeticRenderer(canvasRef.current);

    tracker.onStatus((status) => {
      setTrackerStatus(status);
    });

    tracker.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const shape = FaceData.detectFaceShape(results.multiFaceLandmarks[0]);
        setFaceShape(shape.toUpperCase());
      }
      
      // Update canvas renderer
      // Calculate split slider coordinates in canvas pixels if active
      let splitX: number | null = null;
      if (canvasRef.current && typeof splitPosition === 'number') {
        splitX = splitPosition * canvasRef.current.width;
      }

      renderer.render(results, {
        ...options,
        splitX
      });
    });

    trackerRef.current = tracker;
    rendererRef.current = renderer;

    tracker.initialize().then(() => {
      // Start camera automatically once initialized
      tracker.startCamera().then(() => {
        setCameraActive(true);
        toast('Camera streaming active.', 'success');
      }).catch(() => {
        setCameraActive(false);
        toast('Camera access denied.', 'error');
      });
    });

    return () => {
      tracker.stop();
      trackerRef.current = null;
      rendererRef.current = null;
    };
  }, [isMediaPipeLoaded, options, splitPosition, toast]);

  // Handle Preset updates
  const applyPreset = (presetName: keyof typeof PRESETS) => {
    const config = PRESETS[presetName];
    setOptions(prev => ({
      ...prev,
      face: { ...prev.face, ...config.face },
      cheeks: { ...prev.cheeks, ...config.cheeks },
      eyes: { ...prev.eyes, ...config.eyes },
      brows: { ...prev.brows, ...config.brows },
      lips: { ...prev.lips, ...config.lips },
      hair: { ...prev.hair, ...config.hair }
    }));
    toast(`Preset '${presetName.toUpperCase()}' applied.`, 'success');
  };

  // Toggle webcam source
  const handleToggleCamera = async () => {
    if (!trackerRef.current) return;
    
    if (cameraActive) {
      trackerRef.current.stop();
      setCameraActive(false);
      setFaceShape('Offline');
      toast('Camera feed deactivated.', 'info');
    } else {
      try {
        await trackerRef.current.startCamera();
        setCameraActive(true);
        toast('Camera feed activated.', 'success');
      } catch {
        toast('Failed to restart camera.', 'error');
      }
    }
  };

  // Capture canvas output trigger
  const handleCaptureSnapshot = () => {
    if (!canvasRef.current) return;
    
    // Trigger flash animation
    setIsFlashActive(true);
    setTimeout(() => setIsFlashActive(false), 150);

    try {
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `srisham_snapshot_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast('Snapshot captured and downloaded!', 'success');
    } catch (err) {
      console.error(err);
      toast('Snapshot failed to compile.', 'error');
    }
  };

  // Handle split mouse/touch movements
  const handleContainerPointerMove = (e: React.PointerEvent) => {
    if (splitPosition === null || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));
    setSplitPosition(pct);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#09090b] text-[#f4f4f5] overflow-hidden relative select-none">
      
      {/* Visual Camera Shutter Flash Overlay */}
      <AnimatePresence>
        {isFlashActive && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* 1. Header Bar */}
      <header className="h-16 border-b border-white/5 bg-[#121216]/65 backdrop-blur-xl px-6 flex justify-between items-center z-20 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" leftIcon={<ChevronLeft className="w-4 h-4" />} className="py-1.5 px-3 -ml-2 text-xs">
              Leave Studio
            </Button>
          </Link>
          <span className="font-serif text-lg font-bold tracking-wider text-white">SRISHAM Studio</span>
        </div>

        {/* Live Telemetry Display */}
        <Flex className="gap-6 text-xs text-zinc-400 font-semibold select-none hidden md:flex">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-accentGold" />
            <span>Face Lock: </span>
            <span className={trackerStatus.isTrackingLocked ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              {trackerStatus.isTrackingLocked ? "Calibrated" : "Searching..."}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono text-zinc-300">
              FPS: {trackerStatus.fps}
            </span>
            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded border border-white/5 font-mono text-zinc-300">
              Shape: {faceShape}
            </span>
          </div>
        </Flex>

        <div className="flex items-center gap-3">
          <Button variant="glass" className="py-2 px-4 text-xs" onClick={handleToggleCamera}>
            {cameraActive ? "Turn Cam Off" : "Turn Cam On"}
          </Button>
          <Button variant="gold" leftIcon={<Camera className="w-4 h-4" />} className="py-2 px-4 text-xs" onClick={handleCaptureSnapshot}>
            Snapshot
          </Button>
        </div>
      </header>

      {/* 2. Main Studio Panel */}
      <div className="flex-1 flex flex-row overflow-hidden relative">
        
        {/* Left Control Drawer */}
        <div className="w-80 md:w-85 border-r border-white/5 bg-[#121216]/50 backdrop-blur-2xl flex flex-col p-5 overflow-y-auto z-20 relative shrink-0">
          <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          
          <Tabs 
            tabs={[
              { id: 'lips', label: 'Lips' },
              { id: 'eyes', label: 'Eyes' },
              { id: 'skin', label: 'Skin' },
              { id: 'hair', label: 'Hair' }
            ]} 
            activeTab={activeTab} 
            onChange={(id) => setActiveTab(id as any)} 
          />

          <Spacer size={20} />

          {/* DYNAMIC CATEGORY PANEL */}
          <div className="flex-1">
            
            {/* LIPS PANEL */}
            {activeTab === 'lips' && (
              <Stack className="gap-5">
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2.5">Finish Styles</h4>
                  <Tabs
                    tabs={[
                      { id: 'natural', label: 'Natural' },
                      { id: 'matte', label: 'Matte' },
                      { id: 'glossy', label: 'Glossy' },
                      { id: 'metallic', label: 'Metallic' }
                    ]}
                    activeTab={options.lips.finish}
                    onChange={(val) => setOptions(prev => ({
                      ...prev,
                      lips: { ...prev.lips, finish: val as any, enabled: true }
                    }))}
                  />
                </div>

                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2.5">Palette Colors</h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {COLORS.lipshade.map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          lips: { ...prev.lips, color, enabled: true }
                        }))}
                        className={`h-9 w-full rounded-lg cursor-pointer transition-all duration-300 relative ${
                          options.lips.color === color && options.lips.enabled ? "ring-2 ring-white scale-108 shadow-md" : "hover:scale-105"
                        }`}
                      >
                        {options.lips.color === color && options.lips.enabled && (
                          <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Color Saturation Opacity" 
                  value={options.lips.opacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    lips: { ...prev.lips, opacity: val / 100, enabled: val > 0 }
                  }))} 
                />

                <Slider 
                  label="Specular Glossiness Intensity" 
                  value={options.lips.gloss * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    lips: { ...prev.lips, gloss: val / 100, enabled: true }
                  }))} 
                />

                <Slider 
                  label="Metallic/Shimmer Glaze" 
                  value={options.lips.shimmer * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    lips: { ...prev.lips, shimmer: val / 100, enabled: true }
                  }))} 
                />
              </Stack>
            )}

            {/* EYES PANEL */}
            {activeTab === 'eyes' && (
              <Stack className="gap-5">
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2.5">Eyeshadow Shade</h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {COLORS.eyeshadow.map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          eyes: { ...prev.eyes, eyeshadowColor: color, enabled: true }
                        }))}
                        className={`h-9 w-full rounded-lg cursor-pointer transition-all duration-300 relative ${
                          options.eyes.eyeshadowColor === color && options.eyes.enabled ? "ring-2 ring-white scale-108 shadow-md" : "hover:scale-105"
                        }`}
                      >
                        {options.eyes.eyeshadowColor === color && options.eyes.enabled && (
                          <span className="absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Eyeshadow Blend strength" 
                  value={options.eyes.opacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    eyes: { ...prev.eyes, opacity: val / 100, enabled: val > 0 }
                  }))} 
                />

                <Slider 
                  label="Eyeshadow Metallic Shimmer" 
                  value={options.eyes.shimmer * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    eyes: { ...prev.eyes, shimmer: val / 100, enabled: true }
                  }))} 
                />

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2.5">Eyeliner Color</h4>
                  <div className="flex gap-2.5">
                    {COLORS.eyeliner.map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          eyes: { ...prev.eyes, eyelinerColor: color, enabled: true }
                        }))}
                        className={`h-7 w-7 rounded-full cursor-pointer transition-all duration-300 relative ${
                          options.eyes.eyelinerColor === color && options.eyes.enabled ? "ring-2 ring-white scale-105" : "hover:scale-105"
                        }`}
                      >
                        {options.eyes.eyelinerColor === color && options.eyes.enabled && (
                          <span className="absolute inset-0 m-auto w-1 h-1 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Eyeliner Wing Thickness" 
                  value={options.eyes.eyelinerOpacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    eyes: { ...prev.eyes, eyelinerOpacity: val / 100, enabled: true }
                  }))} 
                />

                <div className="border-t border-white/5 pt-4">
                  <Slider 
                    label="Mascara Coat Density" 
                    value={options.eyes.mascaraOpacity * 100} 
                    onChange={(val) => setOptions(prev => ({
                      ...prev,
                      eyes: { ...prev.eyes, mascaraOpacity: val / 100, enabled: true }
                    }))} 
                  />
                </div>
              </Stack>
            )}

            {/* SKIN/FACE PANEL */}
            {activeTab === 'skin' && (
              <Stack className="gap-5">
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Skin Foundation Tone</h4>
                  <div className="flex gap-2">
                    {['#f9e3d6', '#f2d1b3', '#ebd0bd', '#e3c2ab', '#d6b297', '#ab8972'].map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          face: { ...prev.face, foundationColor: color, enabled: true }
                        }))}
                        className={`h-7 w-7 rounded-full cursor-pointer transition-all duration-300 relative ${
                          options.face.foundationColor === color && options.face.enabled ? "ring-2 ring-white scale-105" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Foundation Smooth Opacity" 
                  value={options.face.foundationOpacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    face: { ...prev.face, foundationOpacity: val / 100, enabled: val > 0 }
                  }))} 
                />

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Blush Shade</h4>
                  <div className="flex gap-2">
                    {COLORS.blush.map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          cheeks: { ...prev.cheeks, color, enabled: true }
                        }))}
                        className={`h-7 w-7 rounded-full cursor-pointer transition-all duration-300 relative ${
                          options.cheeks.color === color && options.cheeks.enabled ? "ring-2 ring-white scale-105" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Blush Cheekbone Opacity" 
                  value={options.cheeks.opacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    cheeks: { ...prev.cheeks, opacity: val / 100, enabled: val > 0 }
                  }))} 
                />

                <div className="border-t border-white/5 pt-4">
                  <Slider 
                    label="Contour Matte Shadows" 
                    value={options.face.contourOpacity * 100} 
                    onChange={(val) => setOptions(prev => ({
                      ...prev,
                      face: { ...prev.face, contourOpacity: val / 100, enabled: true }
                    }))} 
                  />
                </div>

                <Slider 
                  label="Highlight Luminous screen" 
                  value={options.face.highlightOpacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    face: { ...prev.face, highlightOpacity: val / 100, enabled: true }
                  }))} 
                />
              </Stack>
            )}

            {/* HAIR & BROWS PANEL */}
            {activeTab === 'hair' && (
              <Stack className="gap-5">
                <div>
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Hair Tint Color</h4>
                  <div className="grid grid-cols-5 gap-2.5">
                    {COLORS.hair.map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          hair: { ...prev.hair, color, enabled: true }
                        }))}
                        className={`h-9 w-full rounded-lg cursor-pointer transition-all duration-300 relative ${
                          options.hair.color === color && options.hair.enabled ? "ring-2 ring-white scale-108" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Hair Tint strength" 
                  value={options.hair.opacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    hair: { ...prev.hair, opacity: val / 100, enabled: val > 0 }
                  }))} 
                />

                <div className="border-t border-white/5 pt-4">
                  <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Eyebrow Shading Color</h4>
                  <div className="flex gap-2">
                    {['#120d0b', '#302117', '#4a3c31', '#6e5d50'].map((color) => (
                      <button
                        key={color}
                        style={{ backgroundColor: color }}
                        onClick={() => setOptions(prev => ({
                          ...prev,
                          brows: { ...prev.brows, color, enabled: true }
                        }))}
                        className={`h-7 w-7 rounded-full cursor-pointer transition-all duration-300 relative ${
                          options.brows.color === color && options.brows.enabled ? "ring-2 ring-white scale-105" : "hover:scale-105"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Slider 
                  label="Eyebrow Fill opacity" 
                  value={options.brows.opacity * 100} 
                  onChange={(val) => setOptions(prev => ({
                    ...prev,
                    brows: { ...prev.brows, opacity: val / 100, enabled: val > 0 }
                  }))} 
                />
              </Stack>
            )}

          </div>

          {/* Quick Clear Button */}
          <div className="border-t border-white/5 pt-4 mt-auto">
            <Button variant="glass" className="w-full text-xs text-zinc-400" leftIcon={<RotateCcw className="w-3.5 h-3.5" />} onClick={() => applyPreset('clear')}>
              Reset All Cosmetics
            </Button>
          </div>
        </div>

        {/* Center Live Preview Port */}
        <div 
          ref={containerRef}
          className="flex-1 bg-[#09090b] relative flex items-center justify-center overflow-hidden"
          onPointerMove={handleContainerPointerMove}
        >
          {/* Webcam Element (Hidden) */}
          <video
            ref={videoRef}
            className="hidden"
            playsInline
            muted
            autoPlay
          />

          {/* Render Output Canvas */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover scale-x-[-1]" /* Mirror locally for natural feed */
          />

          {/* Offline/Error Camera Overlay (only shown if access is explicitly denied or blocked) */}
          {(trackerStatus.state === 'camera_denied' || trackerStatus.state === 'error') && (
            <div className="absolute inset-0 bg-[#121216] flex flex-col justify-center items-center gap-4 z-10 p-6 text-center select-none">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/8 flex items-center justify-center">
                <Camera className="w-8 h-8 text-zinc-400" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white mb-1">Webcam Access Blocked</h3>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Please enable camera permissions in your browser address bar to calibrate the AR makeup studio.
                </p>
              </div>
              <Button variant="gold" onClick={handleToggleCamera} className="py-2.5 px-6 text-xs mt-2">
                Retry Permission
              </Button>
            </div>
          )}

          {/* Before/After Split Line Handle Grab Element */}
          {cameraActive && trackerStatus.isTrackingLocked && (
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white/25 hover:bg-white/50 cursor-ew-resize group z-10"
              style={{ 
                left: `${(splitPosition === null ? 0.5 : splitPosition) * 100}%`,
                transform: 'translateX(-50%)'
              }}
              onPointerDown={(e) => {
                // Initialize split positioning
                if (splitPosition === null) {
                  setSplitPosition(0.5);
                }
                const target = e.currentTarget;
                target.setPointerCapture(e.pointerId);
              }}
              onPointerUp={(e) => {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }}
            >
              {/* Tooltip labels */}
              <div className="absolute top-8 left-4 bg-black/65 border border-white/5 rounded px-2 py-0.5 text-[8px] font-bold text-white pointer-events-none select-none tracking-widest uppercase">
                Makeup
              </div>
              <div className="absolute top-8 right-4 bg-black/65 border border-white/5 rounded px-2 py-0.5 text-[8px] font-bold text-white pointer-events-none select-none tracking-widest uppercase">
                Original
              </div>

              {/* Central handle pull tab */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-white/40 bg-zinc-950/80 shadow-lg flex items-center justify-center pointer-events-none select-none transition group-hover:scale-110 group-hover:border-white">
                <SlidersHorizontal className="w-4 h-4 text-white rotate-90" />
              </div>
            </div>
          )}

          {/* Floating Navigation Dock (Center Bottom) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-[#121216]/65 border border-white/8 backdrop-blur-2xl px-5 py-3 rounded-2xl shadow-xl select-none pointer-events-auto">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-2">Quick Looks:</span>
            <Button variant="glass" className="py-1 px-3 text-[10px]" onClick={() => applyPreset('natural')}>Natural</Button>
            <Button variant="glass" className="py-1 px-3 text-[10px]" onClick={() => applyPreset('dewy')}>K-Dewy</Button>
            <Button variant="glass" className="py-1 px-3 text-[10px]" onClick={() => applyPreset('sunset')}>Sunset</Button>
            <Button variant="glass" className="py-1 px-3 text-[10px]" onClick={() => applyPreset('goth')}>Gothic</Button>
            
            <div className="h-4 w-[1px] bg-white/10 mx-1" />
            
            <Button 
              variant="glass" 
              className={`py-1 px-3 text-[10px] ${splitPosition !== null ? 'text-accentGold border-accentGold/40 bg-accentGold/5' : ''}`}
              onClick={() => {
                if (splitPosition === null) {
                  setSplitPosition(0.5);
                  toast('Split comparison slider activated.', 'info');
                } else {
                  setSplitPosition(null);
                  toast('Full face cosmetics rendering active.', 'info');
                }
              }}
            >
              {splitPosition !== null ? 'Full Mode' : 'Split View'}
            </Button>
          </div>
        </div>

        {/* Right Diagnostics Drawer */}
        <div className="w-80 md:w-85 border-l border-white/5 bg-[#121216]/50 backdrop-blur-2xl flex flex-col p-5 overflow-y-auto z-20 shrink-0 select-none">
          <span className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
          
          <Stack className="gap-6">
            <div>
              <h3 className="font-serif text-sm font-bold text-white mb-1 tracking-wide">Studio Calibration</h3>
              <p className="text-[10px] text-zinc-400">Manage viewport qualities and battery modes.</p>
            </div>

            <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Camera Source</span>
                <span className="text-white font-semibold">{cameraActive ? "Local Video Stream" : "Offline"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Tracking Rate</span>
                <span className="text-white font-mono font-semibold">{trackerStatus.fps} FPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Estimate Face Shape</span>
                <span className="text-accentGold font-bold">{faceShape}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-500">Secure Privacy</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Local-Only
                </span>
              </div>
            </div>

            <div>
              <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">Graphics Engine Preset</h4>
              <Tabs
                tabs={[
                  { id: 'battery', label: 'Battery' },
                  { id: 'balanced', label: 'Balanced' },
                  { id: 'fidelity', label: 'Fidelity' }
                ]}
                activeTab={qualityMode}
                onChange={(val) => {
                  setQualityMode(val as any);
                  toast(`Graphics quality mode updated to: ${val.toUpperCase()}`, 'info');
                }}
              />
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3">Iris Mesh Lock</h4>
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-bold text-white">Iris Tracking Refinement</span>
                  <span className="text-[9px] text-zinc-500">Aligns eye shadow vectors</span>
                </div>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <h4 className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-3">Adaptive Smooth Lock</h4>
              <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/5 bg-white/2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Smoothing Factor</span>
                  <span className="text-white font-mono font-semibold">Adaptive Euro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Dampening Level</span>
                  <span className="text-white font-mono font-semibold">EMA (Auto)</span>
                </div>
              </div>
            </div>
          </Stack>
        </div>

      </div>
    </div>
  );
}
