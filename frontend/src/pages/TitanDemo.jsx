/**
 * Standalone TITAN-OS Demo Page
 * No authentication, no routing complications - just pure features
 */

import React, { useState, useEffect } from 'react';

const TitanDemo = () => {
  const [systemStatus, setSystemStatus] = useState('checking...');
  const [agentData, setAgentData] = useState(null);
  const [activeFeature, setActiveFeature] = useState('overview');

  useEffect(() => {
    const checkTitanFeatures = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/agents/capabilities');
        const data = await response.json();
        
        if (data.success) {
          setSystemStatus('operational');
          setAgentData(data.capabilities);
        } else {
          setSystemStatus('error');
        }
      } catch (error) {
        setSystemStatus('offline');
        console.error('TITAN-OS check failed:', error);
      }
    };

    checkTitanFeatures();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
        <h2 className="text-2xl font-bold text-orange-500 mb-4">TITAN-OS System Status</h2>
        <div className={`inline-block px-4 py-2 rounded text-sm font-medium ${
          systemStatus === 'operational' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {systemStatus.toUpperCase()}
        </div>
      </div>

      {agentData && (
        <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
          <h2 className="text-2xl font-bold text-blue-400 mb-6">Active Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(agentData).map(([agent, status]) => (
              <div key={agent} className="bg-zinc-700 rounded p-4 border border-zinc-600">
                <h3 className="text-lg font-medium capitalize text-purple-400 mb-3">{agent.replace('_', ' ')}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-400 text-sm">Priority:</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      status.priority === 'critical' || status.priority === 'high' 
                        ? 'bg-red-900 text-red-400' 
                        : 'bg-green-900 text-green-400'
                    }`}>
                      {status.priority?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-sm">Capabilities:</span>
                    <ul className="list-disc list-inside ml-4 mt-1">
                      {status.capabilities?.map(cap => (
                        <li key={cap} className="text-zinc-300 text-xs">{cap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderBiomechanics = () => (
    <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
      <h2 className="text-2xl font-bold text-purple-400 mb-6">🎥 Biomechanics Laboratory</h2>
      <div className="space-y-4">
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-purple-300 mb-2">Video Analysis Features</h3>
          <ul className="list-disc list-inside ml-4 space-y-2 text-zinc-300">
            <li>Real-time skeleton overlay with YOLO-Pose</li>
            <li>Forward lean angle calculation</li>
            <li>Moment arm leakage detection</li>
            <li>Power leakage percentage analysis</li>
            <li>Bar path deviation tracking</li>
          </ul>
        </div>
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-purple-300 mb-2">Technical Specifications</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Pose Detection:</span>
              <span className="text-green-400"> YOLO-Pose</span>
            </div>
            <div>
              <span className="text-zinc-400">Frame Rate:</span>
              <span className="text-green-400"> 30 FPS</span>
            </div>
            <div>
              <span className="text-zinc-400">Accuracy:</span>
              <span className="text-green-400"> 95%+</span>
            </div>
            <div>
              <span className="text-zinc-400">Processing:</span>
              <span className="text-green-400"> Real-time</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
      <h2 className="text-2xl font-bold text-green-400 mb-6">🎤 Voice Processing System</h2>
      <div className="space-y-4">
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-green-300 mb-2">Voice Analysis Features</h3>
          <ul className="list-disc list-inside ml-4 space-y-2 text-zinc-300">
            <li>Real-time voice sentiment analysis</li>
            <li>Command processing and execution</li>
            <li>Volume level monitoring</li>
            <li>Audio waveform visualization</li>
            <li>System control through voice commands</li>
          </ul>
        </div>
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-green-300 mb-2">Supported Commands</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><span className="text-blue-400">"system status"</span> - Check system health</div>
            <div><span className="text-blue-400">"optimize program"</span> - Auto-adjust training</div>
            <div><span className="text-blue-400">"emergency stop"</span> - Halt all systems</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeetLogistics = () => (
    <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
      <h2 className="text-2xl font-bold text-red-400 mb-6">🏆 Meet Logistics War Room</h2>
      <div className="space-y-4">
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-red-300 mb-2">Competition Management</h3>
          <ul className="list-disc list-inside ml-4 space-y-2 text-zinc-300">
            <li>Live scoring and rank tracking</li>
            <li>Flight management and platform timing</li>
            <li>Powerlift-AI automated refereeing</li>
            <li>Attempt selection optimization</li>
            <li>Real-time placement impact analysis</li>
          </ul>
        </div>
        <div className="bg-zinc-700 rounded p-4">
          <h3 className="text-lg font-medium text-red-300 mb-2">War Room Features</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-400">Platforms:</span>
              <span className="text-green-400"> 3 simultaneous</span>
            </div>
            <div>
              <span className="text-zinc-400">Flight Tracking:</span>
              <span className="text-green-400"> Real-time</span>
            </div>
            <div>
              <span className="text-zinc-400">AI Refereeing:</span>
              <span className="text-green-400"> 95% accuracy</span>
            </div>
            <div>
              <span className="text-zinc-400">Response Time:</span>
              <span className="text-green-400"> 0.2s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">TITAN-OS DEMO</h1>
          <p className="text-zinc-400">God-Level Powerlifting Platform - Feature Showcase</p>
        </div>

        {/* Navigation */}
        <div className="bg-zinc-800 rounded border border-zinc-700 p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFeature('overview')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeFeature === 'overview' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              🏠 Overview
            </button>
            <button
              onClick={() => setActiveFeature('biomechanics')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeFeature === 'biomechanics' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              🎥 Biomechanics
            </button>
            <button
              onClick={() => setActiveFeature('voice')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeFeature === 'voice' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              🎤 Voice
            </button>
            <button
              onClick={() => setActiveFeature('meet_logistics')}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                activeFeature === 'meet_logistics' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              🏆 Meet Logistics
            </button>
          </div>
        </div>

        {/* Content */}
        {activeFeature === 'overview' && renderOverview()}
        {activeFeature === 'biomechanics' && renderBiomechanics()}
        {activeFeature === 'voice' && renderVoice()}
        {activeFeature === 'meet_logistics' && renderMeetLogistics()}

        {/* Footer */}
        <div className="mt-8 text-center text-zinc-500 text-sm">
          <p>TITAN-OS v2.0.0 - God-Level Powerlifting Platform</p>
          <p>Backend: http://localhost:5001 | Frontend: http://localhost:5173</p>
        </div>
      </div>
    </div>
  );
};

export default TitanDemo;
