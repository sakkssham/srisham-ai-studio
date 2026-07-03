'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  SlidersHorizontal, 
  History, 
  Heart, 
  Sun, 
  Moon, 
  ChevronRight, 
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Settings,
  HelpCircle
} from 'lucide-react';

import { useTheme } from '@/context/theme-context';
import { useToast } from '@/components/ui/toast';
import { Button, IconButton } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Dropdown } from '@/components/ui/dropdown';
import { Tabs } from '@/components/ui/tabs';
import { Tooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { FloatingPanel } from '@/components/ui/floating-panel';
import { ModalDialog } from '@/components/ui/modal-dialog';
import { Stack, Flex, Grid, Spacer } from '@/components/ui/layout-primitives';

export default function LandingPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Onboarding & Modal States
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isFloatingPanelOpen, setIsFloatingPanelOpen] = useState(false);
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState('');

  // Design System Demo States
  const [inputValue, setInputValue] = useState('');
  const [sliderValue, setSliderValue] = useState(45);
  const [dropdownValue, setDropdownValue] = useState('');
  const [activeTab, setActiveTab] = useState('matte');
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  const finishTabs = [
    { id: 'natural', label: 'Natural' },
    { id: 'matte', label: 'Matte' },
    { id: 'satin', label: 'Satin' },
    { id: 'glossy', label: 'Glossy' },
    { id: 'metallic', label: 'Metallic' }
  ];

  const ageOptions = [
    { value: 'under_18', label: 'Under 18' },
    { value: '18_30', label: '18 - 30' },
    { value: '31_50', label: '31 - 50' },
    { value: 'over_50', label: 'Over 50' }
  ];

  const handleStartExperience = () => {
    toast("Initializing Onboarding Flow...", "info");
    setIsOnboardingOpen(true);
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOnboardingOpen(false);
    // Show privacy policy next
    setIsPrivacyOpen(true);
  };

  const handleAcceptPrivacy = () => {
    setIsPrivacyOpen(false);
    toast(`Welcome to SRISHAM, ${name || 'Guest'}! Calibration models ready.`, "success");
    router.push('/studio');
  };

  const handleTriggerSkeletonLoad = () => {
    setIsLoadingDemo(true);
    setTimeout(() => {
      setIsLoadingDemo(false);
      toast("Data loaded successfully!", "success");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b] dark:bg-[#09090b] text-[#f4f4f5] transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <header className="fixed top-6 left-6 right-6 h-16 bg-white/3 dark:bg-white/3 border border-white/5 dark:border-white/5 backdrop-blur-xl rounded-2xl flex justify-between items-center px-6 z-40 select-none shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
        <div className="flex items-center gap-2">
          <span className="font-serif text-xl font-bold tracking-wider text-white">SRISHAM</span>
          <span className="text-[7px] tracking-[0.25em] font-bold text-accentGold border border-accentGold/30 px-1 rounded-sm ml-1.5">AI</span>
        </div>
        
        <div className="flex items-center gap-4">
          <a href="#playground" className="text-xs font-semibold text-zinc-400 hover:text-white transition duration-300">Design System</a>
          <IconButton 
            icon={theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />} 
            onClick={toggleTheme}
            variant="glass"
            title="Toggle Light/Dark Theme"
          />
          <Button variant="gold" className="py-2 px-4 text-xs" onClick={handleStartExperience}>
            Start Studio
          </Button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-24 pb-12 overflow-hidden bg-radial-gradient">
        {/* Parallax glass floating background ornaments */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-10 w-48 h-48 rounded-full bg-accentGold/5 blur-3xl pointer-events-none" 
        />
        <motion.div 
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-1/4 right-10 w-64 h-64 rounded-full bg-accentRose/5 blur-3xl pointer-events-none" 
        />
        
        {/* Apple style visual glass cards behind text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 z-0">
          <div className="w-[800px] h-[400px] border border-white/5 bg-white/2 rounded-full blur-2xl"></div>
        </div>

        <div className="max-w-4xl text-center flex flex-col items-center gap-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/8 rounded-full text-[10px] font-bold tracking-wider text-accentGold uppercase mb-2 select-none"
          >
            <Sparkles className="w-3.5 h-3.5 text-accentGold animate-pulse" />
            Next-Gen Real-Time AR Rendering
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]"
          >
            The Future of <br />
            <span className="bg-gradient-to-r from-white via-accentGold to-accentGold/70 bg-clip-text text-transparent">
              Pure Cosmetics.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-sm md:text-lg text-zinc-400 max-w-xl leading-relaxed"
          >
            Virtual makeup rendered with physics-accurate light transport, White Balance calibration, and zero-latency landmark lock. Beautiful. Local. Private.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row gap-4 mt-6 w-full sm:w-auto"
          >
            <Button variant="gold" rightIcon={<ArrowRight className="w-4 h-4" />} className="px-8 py-4 text-sm" onClick={handleStartExperience}>
              Start Experience
            </Button>
            <Button variant="glass" className="px-8 py-4 text-sm" onClick={() => {
              const el = document.getElementById('playground');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}>
              Explore Playground
            </Button>
          </motion.div>
        </div>

        {/* Floating cards showcasing values */}
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 relative z-10 px-4">
          <Card className="p-6 border border-white/5 bg-zinc-900/35" blurLevel="md">
            <CardHeader className="p-0 mb-3 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accentGold/10 flex items-center justify-center border border-accentGold/30">
                <ShieldCheck className="w-5 h-5 text-accentGold" />
              </div>
              <CardTitle className="text-sm font-bold text-white tracking-wide">Privacy Centric</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-zinc-400 leading-relaxed">
              All facial landmarks tracking and shader compositing run client-side on your device. We never record or store your face coordinates.
            </CardContent>
          </Card>

          <Card className="p-6 border border-white/5 bg-zinc-900/35" blurLevel="md">
            <CardHeader className="p-0 mb-3 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accentRose/10 flex items-center justify-center border border-accentRose/30">
                <SlidersHorizontal className="w-5 h-5 text-accentRose" />
              </div>
              <CardTitle className="text-sm font-bold text-white tracking-wide">Physically Grounded</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-zinc-400 leading-relaxed">
              Lipstick specular reflections and eyeshadow shimmers adapt dynamically to estimated light sources and facial depth normals.
            </CardContent>
          </Card>

          <Card className="p-6 border border-white/5 bg-zinc-900/35" blurLevel="md">
            <CardHeader className="p-0 mb-3 flex flex-row items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                <Sparkles className="w-5 h-5 text-zinc-300" />
              </div>
              <CardTitle className="text-sm font-bold text-white tracking-wide">Apple-Grade Fluidity</CardTitle>
            </CardHeader>
            <CardContent className="p-0 text-xs text-zinc-400 leading-relaxed">
              Spring-physics transitions, adaptive tracking loops, and lightweight WASM delegates yield interactive 60 FPS on any modern device.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Interactive Design System Playground */}
      <section id="playground" className="py-24 px-6 max-w-6xl w-full mx-auto select-none">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-white mb-3">
            Design System Playground
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-accentGold font-bold mb-4">Liquid Glass Component Showcase</p>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Test and interact with every reusable component in our catalog. Fully responsive, color-theme synchronized, and built to the highest accessibility standards.
          </p>
        </div>

        <Grid cols={{ sm: 1, md: 2 }} className="gap-8">
          
          {/* Card A: Buttons & Navigation Tabs */}
          <Card className="p-6 border border-white/5 flex flex-col gap-6" blurLevel="xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Buttons & Segmented Tabs</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Demonstrates click bounce springs and layout transition pills.</p>
            </div>
            
            <Stack className="gap-4">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Tabs / Segmented Control</span>
                <Tabs 
                  tabs={finishTabs} 
                  activeTab={activeTab} 
                  onChange={(id) => {
                    setActiveTab(id);
                    toast(`Lip finish updated: ${id.toUpperCase()}`, "info");
                  }} 
                />
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Button Variations</span>
                <Flex className="flex-wrap gap-3">
                  <Button variant="primary" onClick={() => toast("Primary Button Triggered", "info")}>
                    Primary
                  </Button>
                  <Button variant="glass" onClick={() => toast("Glass Button Triggered", "info")}>
                    Glass Panel
                  </Button>
                  <Button variant="gold" onClick={() => toast("Luxury Gold Button Triggered", "success")}>
                    Gold Leaf
                  </Button>
                  <Button variant="ghost" onClick={() => toast("Ghost Button Triggered", "info")}>
                    Ghost
                  </Button>
                </Flex>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase">Icon Buttons & Tooltips</span>
                <Flex className="gap-4">
                  <Tooltip content="Reset settings">
                    <IconButton icon={<History className="w-4 h-4" />} variant="glass" onClick={() => toast("Reset history stack", "success")} />
                  </Tooltip>
                  
                  <Tooltip content="Like look" position="right">
                    <IconButton icon={<Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />} variant="glass" onClick={() => toast("Look added to favorites", "success")} />
                  </Tooltip>

                  <Tooltip content="Start camera feed" position="bottom">
                    <IconButton icon={<Camera className="w-4 h-4 text-emerald-400" />} variant="gold" onClick={() => toast("Camera initializing...", "info")} />
                  </Tooltip>
                </Flex>
              </div>
            </Stack>
          </Card>

          {/* Card B: Sliders & Text Inputs */}
          <Card className="p-6 border border-white/5 flex flex-col gap-6" blurLevel="xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Sliders & Form Inputs</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Range tracks highlighted dynamically. Input forms support state verification.</p>
            </div>
            
            <Stack className="gap-5">
              <Input 
                label="Custom Makeup Preset Title" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="e.g. Soft Peach Velvet" 
              />

              <Dropdown 
                label="Target Age Group Gating"
                options={ageOptions}
                value={dropdownValue}
                onChange={(val) => {
                  setDropdownValue(val);
                  toast(`Filter category set to: ${val}`, "info");
                }}
                placeholder="Choose age range"
              />

              <Slider 
                label="Cosmetic Saturation strength"
                value={sliderValue}
                onChange={(val) => setSliderValue(val)}
                min={0}
                max={100}
                displayValue={`${Math.round(sliderValue)}%`}
              />
            </Stack>
          </Card>

          {/* Card C: Skeleton Shimmers & Async States */}
          <Card className="p-6 border border-white/5 flex flex-col gap-5" blurLevel="xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Pulse Skeleton Shimmer</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Preloads geometry blocks while waiting for API returns.</p>
            </div>

            <Stack className="gap-4">
              <Button onClick={handleTriggerSkeletonLoad} isLoading={isLoadingDemo} variant="glass" className="w-full">
                {isLoadingDemo ? "Triggering..." : "Simulate Loading Skeleton (2s)"}
              </Button>

              <div className="bg-white/3 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 min-h-[140px]">
                {isLoadingDemo ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <Skeleton variant="circular" className="w-10 h-10" />
                      <div className="flex-1 flex flex-col gap-2">
                        <Skeleton variant="rectangular" className="h-4 w-1/2" />
                        <Skeleton variant="rectangular" className="h-3 w-1/3" />
                      </div>
                    </div>
                    <Skeleton variant="rectangular" className="h-16 w-full" />
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accentGold/20 flex items-center justify-center border border-accentGold/30">
                        <Sparkles className="w-5 h-5 text-accentGold" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">Diagnostics Complete</h4>
                        <p className="text-[10px] text-zinc-500">Auto-calibration finished</p>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-400 bg-white/2 p-3 rounded-xl border border-white/5 leading-relaxed">
                      Skin tone: #E8C39E (Warm). Recommended preset matches: Korean Dewy & Soft Glam.
                    </div>
                  </div>
                )}
              </div>
            </Stack>
          </Card>

          {/* Card D: Interactive Toast Alerts, Floating Panels & Dialog Modals */}
          <Card className="p-6 border border-white/5 flex flex-col gap-5" blurLevel="xl">
            <div className="border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Notifications & Floating Portals</h3>
              <p className="text-[10px] text-zinc-500 mt-1">Triggers modal sheets and animated toasts.</p>
            </div>

            <Stack className="gap-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">Toast Alert Types</span>
              <Flex className="gap-3 flex-wrap">
                <Button variant="glass" className="py-2.5 px-4 text-xs text-emerald-400" onClick={() => toast("Action executed successfully!", "success")}>
                  Success Toast
                </Button>
                <Button variant="glass" className="py-2.5 px-4 text-xs text-red-400" onClick={() => toast("Failed to connect device.", "error")}>
                  Error Toast
                </Button>
                <Button variant="glass" className="py-2.5 px-4 text-xs text-zinc-300" onClick={() => toast("Camera calibrating...", "info")}>
                  Info Toast
                </Button>
              </Flex>

              <span className="text-[10px] text-zinc-500 font-semibold uppercase mt-3">Side Panels & Dialogs</span>
              <Flex className="gap-3">
                <Button variant="primary" className="flex-1 py-3 text-xs" onClick={() => setIsFloatingPanelOpen(true)}>
                  Open Side Panel
                </Button>
                <Button variant="gold" className="flex-1 py-3 text-xs" onClick={handleStartExperience}>
                  Open Onboarding Modal
                </Button>
              </Flex>
            </Stack>
          </Card>

        </Grid>
      </section>

      {/* 4. Footer */}
      <footer className="mt-auto border-t border-white/5 py-8 px-6 text-center select-none bg-[#09090b]">
        <p className="text-xs text-zinc-500">&copy; {new Date().getFullYear()} SRISHAM Virtual Makeup Studio. Locally processed. GDPR compliant.</p>
      </footer>

      {/* 5. ONBOARDING MODAL DIALOG */}
      <ModalDialog 
        isOpen={isOnboardingOpen} 
        onClose={() => setIsOnboardingOpen(false)}
        title="Welcome to SRISHAM Studio"
        size="md"
      >
        <form onSubmit={handleOnboardingSubmit} className="flex flex-col gap-5 mt-2">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Please enter your preferences to allow our AI recommend colors suited for your skin undertone.
          </p>
          <Input 
            label="First Name" 
            placeholder="Jane" 
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Dropdown 
            label="Age Range"
            options={ageOptions}
            value={ageRange}
            onChange={(val) => setAgeRange(val)}
            placeholder="Select range"
          />
          <Button variant="gold" type="submit" className="w-full mt-2">
            Proceed
          </Button>
        </form>
      </ModalDialog>

      {/* 6. PRIVACY CONSENT MODAL DIALOG */}
      <ModalDialog
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        title="Privacy Consent"
        size="md"
      >
        <div className="flex flex-col gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Local-First Processing</h4>
              <p className="text-[10px] text-zinc-500">Zero Server Data Transit</p>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            We use **MediaPipe client-side Face Mesh** to track facial landmarks. All camera images remain entirely on your local graphics processor. No raw video feed or biometric signatures are ever transmitted, stored, or synced to any cloud backend.
          </p>
          <div className="bg-white/3 border border-white/5 rounded-xl p-3 flex flex-col gap-1.5 text-[10px] text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Full compliance with biometric privacy guidelines</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Revocable permission states from browser lock settings</span>
            </div>
          </div>
          <Button variant="gold" onClick={handleAcceptPrivacy} className="w-full mt-2">
            I Consent & Accept
          </Button>
        </div>
      </ModalDialog>

      {/* 7. FLOATING SIDE PANEL */}
      <FloatingPanel
        isOpen={isFloatingPanelOpen}
        onClose={() => setIsFloatingPanelOpen(false)}
        title="Studio Options"
        side="left"
      >
        <Stack className="gap-5 select-none mt-2">
          <div>
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Graphics Rendering Quality</h4>
            <Tabs 
              tabs={[
                { id: 'low', label: 'Battery Saver' },
                { id: 'mid', label: 'Balanced' },
                { id: 'high', label: 'High Fidelity' }
              ]} 
              activeTab="high" 
              onChange={(id) => toast(`Quality mode updated: ${id.toUpperCase()}`, "info")}
            />
          </div>

          <div className="border-t border-white/5 pt-4">
            <h4 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Webcam Diagnostics</h4>
            <div className="bg-white/2 rounded-xl p-3 border border-white/5 flex flex-col gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Camera Source</span>
                <span className="text-white font-semibold">Mock Session (Idle)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Track Rate</span>
                <span className="text-white font-semibold">60Hz stable</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Precision Lock</span>
                <span className="text-emerald-400 font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          <Button variant="glass" onClick={() => setIsFloatingPanelOpen(false)} className="w-full mt-4">
            Close Panel
          </Button>
        </Stack>
      </FloatingPanel>

    </div>
  );
}
