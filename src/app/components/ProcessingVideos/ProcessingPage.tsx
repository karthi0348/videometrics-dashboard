'use client';

import { useState, useEffect } from 'react';

interface ProcessingPageProps {
  onBack: () => void;
  videoName?: string;
  profileName?: string;
}

const ProcessingPage: React.FC<ProcessingPageProps> = ({ 
  onBack, 
  videoName = "test.mp4", 
  profileName = "profile22" 
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const steps = [
    { name: "Initializing", description: "Setting up processing environment" },
    { name: "Video Analysis", description: "Analyzing video content and structure" },
    { name: "AI Processing", description: "Running AI-driven analytics" },
    { name: "Generating Results", description: "Compiling analysis results" },
    { name: "Complete", description: "Processing finished successfully" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(timer);
          return 100;
        }
        
        // Update current step based on progress
        const newStep = Math.floor((prev + 2) / 25);
        setCurrentStep(Math.min(newStep, steps.length - 2));
        
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Processing Video</h1>
                <p className="text-gray-600">Processing {videoName} with {profileName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isComplete ? (
                <div className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Complete</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="font-medium">Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Progress Section */}
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {isComplete ? "Processing Complete!" : `Step ${currentStep + 1} of ${steps.length - 1}`}
              </h2>
              <p className="text-gray-600">{steps[currentStep]?.description}</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-teal-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4">
              {steps.slice(0, -1).map((step, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStep ? 'bg-green-100 text-green-600' :
                    index === currentStep ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {index < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-medium ${
                      index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {step.name}
                    </h3>
                    <p className={`text-sm ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                  </div>
                  {index === currentStep && !isComplete && (
                    <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Video Info */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">Processing Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Video:</span>
                  <span className="ml-2 font-medium text-gray-900">{videoName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Profile:</span>
                  <span className="ml-2 font-medium text-gray-900">{profileName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Started:</span>
                  <span className="ml-2 font-medium text-gray-900">{new Date().toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${isComplete ? 'text-green-600' : 'text-blue-600'}`}>
                    {isComplete ? 'Complete' : 'Processing'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center gap-4">
              {isComplete ? (
                <>
                  <button 
                    onClick={onBack}
                    className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back to Videos
                  </button>
                  <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg font-medium hover:from-teal-600 hover:to-blue-600 transition-all duration-200">
                    View Results
                  </button>
                </>
              ) : (
                <button 
                  onClick={onBack}
                  className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel Processing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingPage;