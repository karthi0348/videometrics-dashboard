import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProcessedVideosPage from './ProcessedVideosPage'; // Assuming this is the correct path
import VideoMetricsPage from './pages/VideoMetricsPage'; // Assuming this is the correct path

function App() {
  return (
    <Router>
      <Routes>
        {/* The main processed videos page */}
        <Route path="/processed-videos" element={<ProcessedVideosPage />} />

        {/* The new metrics page. It will get the 'analyticsId' from the URL */}
        <Route path="/video-metrics/:analyticsId" element={<VideoMetricsPage isOpen={false} onClose={function (): void {
          throw new Error('Function not implemented.');
        } } analyticsId={null} apiService={null} mockMode={false} />} />
      </Routes>
    </Router>
  );
}

export default App;