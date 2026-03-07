/**
 * TITAN-OS Biomechanics Laboratory
 * Video analysis with real-time skeleton overlay
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Play, Eye, Activity, AlertTriangle } from 'lucide-react';

const BiomechanicsLab = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (videoFile && isAnalyzing) {
      analyzeVideo();
    }
  }, [videoFile, isAnalyzing]);

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('athleteId', 'demo_athlete');
      
      const response = await fetch('http://localhost:5001/api/agents/biomechanics/analyze', {
        method: 'POST',
        body: formData
      });
      
      const results = await response.json();
      
      if (results.success) {
        setAnalysisResults(results.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setVideoFile(file);
      
      // Create video URL for preview
      const videoUrl = URL.createObjectURL(file);
      if (videoRef.current) {
        videoRef.current.src = videoUrl;
      }
    }
  };

  const startRecording = () => {
    if (videoRef.current) {
      const stream = videoRef.current.captureStream();
      setIsRecording(true);
      
      // Send frames to backend for analysis
      const processFrame = () => {
        // Capture frame and send to analysis
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(async (blob) => {
          const frameData = new FormData();
          frameData.append('frame', blob);
          frameData.append('athleteId', 'demo_athlete');
          
          try {
            await fetch('http://localhost:5001/api/agents/biomechanics/analyze-frame', {
              method: 'POST',
              body: frameData
            });
          } catch (error) {
            console.error('Frame analysis failed:', error);
          }
        });
      };
      
      // Process frames at 30fps
      const interval = setInterval(processFrame, 1000 / 30);
      
      // Store interval for cleanup
      videoRef.current.dataset.recordingInterval = interval;
    }
  };

  const stopRecording = () => {
    if (videoRef.current && videoRef.current.dataset.recordingInterval) {
      clearInterval(videoRef.current.dataset.recordingInterval);
      delete videoRef.current.dataset.recordingInterval;
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-purple-400 mb-4 flex items-center gap-2">
            <Eye className="w-6 h-6" />
            Biomechanics Laboratory
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Video Upload */}
            <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Video Analysis</h3>
              
              {!videoFile ? (
                <div className="border-2 border-dashed border-zinc-600 rounded p-8 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-4 text-zinc-400" />
                  <p className="text-sm text-zinc-400 mb-4">Upload video for real-time analysis</p>
                  <input 
                    type="file" 
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="mb-4">
                    <video 
                      ref={videoRef}
                      controls
                      className="w-full rounded border border-zinc-600"
                    />
                  </div>
                  
                  {/* Analysis Controls */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => analyzeVideo()}
                      disabled={isAnalyzing}
                      className="flex-1 bg-purple-600 text-white px-4 py-2 rounded font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {isAnalyzing ? (
                        <>
                          <Activity className="w-4 h-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Analyze Video
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
                        isRecording 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {isRecording ? (
                        <>
                          <AlertTriangle className="w-4 h-4" />
                          Stop Analysis
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" />
                          Start Real-Time Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Analysis Results */}
            {analysisResults && (
              <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
                <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-500">Forward Lean:</span>
                    <span className={analysisResults.forwardLean > 10 ? 'text-red-400' : 'text-green-400'}>
                      {analysisResults.forwardLean}°
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Moment Arm:</span>
                    <span className={analysisResults.momentArm > 15 ? 'text-red-400' : 'text-green-400'}>
                      {analysisResults.momentArm}cm
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Power Leakage:</span>
                    <span className={analysisResults.powerLeakage > 20 ? 'text-red-400' : 'text-green-400'}>
                      {analysisResults.powerLeakage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Bar Path Deviation:</span>
                    <span className={analysisResults.barPathDeviation > 5 ? 'text-red-400' : 'text-green-400'}>
                      {analysisResults.barPathDeviation}cm
                    </span>
                  </div>
                </div>
                
                {/* Skeleton Overlay Canvas */}
                <div className="mt-4 relative">
                  <canvas 
                    ref={canvasRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{ mixBlendMode: 'screen' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiomechanicsLab;
