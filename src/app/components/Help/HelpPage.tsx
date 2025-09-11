'use client';

import { useState } from 'react';

interface HelpPageProps {
  onNavigate?: (page: string) => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "How do I upload a video for analysis?",
      answer: "Go to your Dashboard and click the 'Upload Video' button. Select your video file, choose the type of analytics you want to perform, and click 'Upload'. Your video will be processed automatically."
    },
    {
      id: 2,
      question: "What video formats are supported?",
      answer: "We support most common video formats including MP4, AVI, MOV, and WebM. For best results, we recommend using MP4 files with H.264 encoding."
    },
    {
      id: 3,
      question: "How long does video processing take?",
      answer: "Processing time depends on the length of your video and the type of analysis requested. Most videos under 5 minutes are processed within 1-2 minutes."
    },
    {
      id: 4,
      question: "Can I analyze videos from security cameras?",
      answer: "Yes! When our camera integration feature launches, you'll be able to connect IP cameras and CCTV systems directly. For now, you can upload recorded footage from any camera."
    },
    {
      id: 5,
      question: "Is my video data secure?",
      answer: "Absolutely. All videos are stored securely with encryption at rest and in transit. We never share your videos or analysis results with third parties."
    }
  ];

  const toggleFaq = (faqId: number) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-300 via-purple-500 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-purple-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-gradient-to-tr from-purple-300/30 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-bl from-purple-200/30 to-transparent rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header Section */}
        <div className="text-center mb-12 lg:mb-16">
        
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
            Help Center
          </h1>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Get help with VideoMetrics and learn how to make the most of our platform
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200/50 p-6 sm:p-8 lg:p-10 mb-8 lg:mb-12 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 lg:mb-8">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800 mb-2">
                Coming Soon - Full Help Center
              </h2>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 text-sm font-semibold rounded-full shadow-lg border border-purple-300/50 whitespace-nowrap">
              Under Development
            </span>
          </div>
          <p className="text-gray-700 mb-8 lg:mb-10 text-sm sm:text-base leading-relaxed">
            Our complete help center with tutorials, guides, and live support is coming soon
          </p>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-semibold text-purple-700">Development Progress</span>
              <span className="text-sm font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-full">75%</span>
            </div>
            <div className="w-full bg-purple-100 rounded-full h-4 shadow-inner overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 h-4 rounded-full transition-all duration-1000 ease-out shadow-lg relative overflow-hidden"
                style={{ width: '75%' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent transform translate-x-full animate-pulse" style={{ animationDuration: '2s' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200/50 p-6 sm:p-8 lg:p-10 mb-8 lg:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-8 lg:mb-10">
            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mr-0 sm:mr-6 mb-4 sm:mb-0 shadow-xl">
              <svg className="w-6 h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-800 mb-2">
                Frequently Asked Questions
              </h2>
              <p className="text-purple-600 text-sm sm:text-base">Find answers to common questions</p>
            </div>
          </div>

          <div className="space-y-4 lg:space-y-6">
            {faqs.map((faq, index) => (
              <div key={faq.id} className="group transform transition-all duration-300 hover:scale-102">
                <div className="border-2 border-purple-200/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-white to-purple-50/30 hover:border-purple-300">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-6 lg:p-8 hover:bg-purple-50/70 transition-all duration-300 flex items-center justify-between group"
                  >
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-4 sm:mr-6 flex-shrink-0 group-hover:from-purple-200 group-hover:to-purple-300 transition-colors duration-300">
                        <span className="text-purple-700 font-bold text-xs sm:text-sm">{index + 1}</span>
                      </div>
                      <span className="font-semibold text-purple-900 text-sm sm:text-base lg:text-lg pr-4 leading-tight">
                        {faq.question}
                      </span>
                    </div>
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-all duration-300 group-hover:scale-110">
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 text-purple-600 transition-transform duration-500 ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 border-t border-purple-200/80 bg-gradient-to-r from-purple-25 to-white animate-in slide-in-from-top-2 duration-300">
                      <div className="pt-4 sm:pt-6">
                        <div className="w-12 h-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full mb-4 sm:mb-6"></div>
                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Back to Dashboard Button */}
        <div className="text-center">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="inline-flex items-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-white/90 backdrop-blur-sm border-2 border-purple-300 rounded-2xl text-purple-700 hover:bg-purple-50 hover:border-purple-400 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl hover:scale-105 text-sm sm:text-base"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;