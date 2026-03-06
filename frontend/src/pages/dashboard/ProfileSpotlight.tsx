import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SpotlightProps {
  onDismiss: () => void;
}

export function ProfileSpotlight({ onDismiss }: SpotlightProps) {
  const [currentStep, setCurrentStep] = useState(0);

  // Configuration for each step
  // Adjust 'top' values to match your sidebar link positions (pixels)
  const steps = [
    {
      title: "AI Calibration (Vision)",
      description: "First, go to the AI Lab in the Write page. Upload a LinkedIn screenshot so Nova can 'see' your niche.",
      label: "Step 1",
      top: "top-[95px]", // Points to 'Write'
    },
    {
      title: "Professional Identity",
      description: "Now, set up your bio and social links in the Profile section to build your public portfolio.",
      label: "Step 2",
      top: "top-[240px]", // Points to 'Profile' (Adjust based on your sidebar)
    },
    {
      title: "Brand Kit Parameters",
      description: "Finally, go to Settings to define your mission. This ensures every post matches your voice perfectly.",
      label: "Step 3",
      top: "top-[286px]", // Points to 'Settings' (Adjust based on your sidebar)
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss(); // Final step calls the backend dismissal
    }
  };

  return (
    <div className={`fixed left-64 ${steps[currentStep].top} z-[100] pointer-events-none sm:block hidden transition-all duration-500 ease-in-out`}>
      
      {/* 1. The Bouncing Arrow */}
      <motion.div
        animate={{ x: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        className="absolute -left-12 top-10"
      >
        <ArrowLeft className="w-10 h-10 text-accent drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
      </motion.div>

      {/* 2. The Instruction Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep} // Important for exit/enter animation between steps
          initial={{ opacity: 0, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -20 }}
          className="pointer-events-auto w-72 bg-zinc-950 border-2 border-accent/30 rounded-3xl p-5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          <Sparkles className="absolute -right-2 -top-2 w-12 h-12 text-accent/10 rotate-12" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="bg-accent text-zinc-950 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter">
                  {steps[currentStep].label}
                </span>
                <h4 className="text-white font-bold text-[13px]">{steps[currentStep].title}</h4>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {currentStep + 1}/{steps.length}
              </span>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed mb-4">
              {steps[currentStep].description}
            </p>

            <Button
              onClick={handleNext}
              className="w-full bg-accent hover:bg-accent/90 text-zinc-900 font-bold h-9 rounded-xl text-xs gap-2"
            >
              {currentStep < steps.length - 1 ? (
                <>Next Step <ChevronRight className="w-4 h-4" /></>
              ) : (
                <>Finish & Explore <CheckCircle2 className="w-4 h-4" /></>
              )}
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex gap-1 justify-center mt-3">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1 rounded-full transition-all duration-300 ${i === currentStep ? 'w-4 bg-accent' : 'w-1 bg-zinc-700'}`} 
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}