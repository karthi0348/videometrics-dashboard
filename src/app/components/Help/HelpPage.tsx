'use client';

import { useState } from 'react';

interface HelpPageProps {
  onNavigate?: (page: string) => void;
}

const HelpPage: React.FC<HelpPageProps> = ({ onNavigate }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

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

  const toggleFaq = (faqId:any) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600">
            Get help with VideoMetrics and learn how to make the most of our platform
          </p>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Coming Soon - Full Help Center
            </h2>
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-sm font-medium rounded-full">
              Under Development
            </span>
          </div>
          <p className="text-gray-600 mb-6">
            Our complete help center with tutorials, guides, and live support is coming soon
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Development Progress</span>
              <span className="text-sm font-medium text-gray-700">75%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-teal-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: '75%' }}
              ></div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between"
                >
                  <span className="font-medium text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                      expandedFaq === faq.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === faq.id && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-gray-600 pt-3 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

  
        {/* Back to Dashboard Button */}
        <div className="text-center">
          <button
            onClick={() => onNavigate?.('dashboard')}
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium shadow-sm"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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