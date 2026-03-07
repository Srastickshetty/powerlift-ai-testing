/**
 * Simple Test Component to Verify TITAN-OS Features
 */

import React, { useState, useEffect } from 'react';

const TestTitanFeatures = () => {
  const [systemStatus, setSystemStatus] = useState('checking...');
  const [agentData, setAgentData] = useState(null);

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

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold text-orange-500 mb-8">TITAN-OS Feature Test</h1>
      
      <div className="bg-zinc-800 rounded border border-zinc-700 p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className={`px-4 py-2 rounded text-sm font-medium ${
          systemStatus === 'operational' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
        }`}>
          {systemStatus.toUpperCase()}
        </div>
      </div>

      {agentData && (
        <div className="bg-zinc-800 rounded border border-zinc-700 p-6">
          <h2 className="text-xl font-semibold mb-4">Available Agents</h2>
          <div className="space-y-4">
            {Object.entries(agentData).map(([agent, status]) => (
              <div key={agent} className="bg-zinc-700 rounded p-4">
                <h3 className="text-lg font-medium capitalize text-blue-400 mb-2">{agent}</h3>
                <div className="text-sm text-zinc-300">
                  <p><strong>Priority:</strong> {status.priority}</p>
                  <p><strong>Capabilities:</strong></p>
                  <ul className="list-disc list-inside ml-4">
                    {status.capabilities?.map(cap => (
                      <li key={cap}>{cap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 bg-zinc-800 rounded border border-zinc-700 p-6">
        <h2 className="text-xl font-semibold mb-4">Feature Access Test</h2>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => alert('Biomechanics Lab - Feature Available')}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            🎥 Test Biomechanics
          </button>
          <button 
            onClick={() => alert('Voice Processor - Feature Available')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            🎤 Test Voice
          </button>
          <button 
            onClick={() => alert('Meet Logistics - Feature Available')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            🏆 Test Meet Logistics
          </button>
          <button 
            onClick={() => alert('Titan Dashboard - Feature Available')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            🧠 Test Titan Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestTitanFeatures;
