import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";

export default function OnboardingTour({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Timeline",
      description: "Timeline is a simple, private planner for organizing your week and tracking tasks. Let's take a quick look at the features.",
    },
    {
      title: "Dashboard",
      description: "The dashboard gives you a clean overview of your day, showing what is happening now, what is coming up next, and your immediate reminders.",
    },
    {
      title: "Weekly & Daily Schedule",
      description: "Plan your weekly schedule using the calendar view. You can drag and drop items to reschedule them, and click any item to edit or delete it.",
    },
    {
      title: "Task Reminders",
      description: "Create one-time or repeating reminders for tasks. Get notified via browser notifications or in-app alerts before they are due.",
    },
    {
      title: "Backup & Device Sync",
      description: "All data is saved locally to your browser. Use the export and import controls under Settings > Data Transfer to manually back up or sync data across your devices.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl flex flex-col justify-between min-h-[220px]">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-teal-400">
              <HelpCircle size={16} />
              <span className="text-xs font-semibold uppercase tracking-wider">App Guide</span>
            </div>
            <button onClick={onClose} className="p-1 rounded-md text-neutral-500 hover:text-neutral-200 transition-colors">
              <X size={16} />
            </button>
          </div>

          <h2 className="text-lg font-semibold text-neutral-100">{steps[currentStep].title}</h2>
          <p className="text-sm text-neutral-400 mt-2 leading-relaxed">{steps[currentStep].description}</p>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-800">
          <button 
            onClick={onClose} 
            className="text-xs text-neutral-500 hover:text-neutral-300 font-medium"
          >
            Skip Guide
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-xs text-neutral-500">
              {currentStep + 1} of {steps.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={currentStep === 0}
                onClick={handlePrev}
                className="p-1 rounded border border-neutral-800 hover:border-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-300 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                className="p-1 rounded bg-teal-500 text-neutral-950 hover:bg-teal-400 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
