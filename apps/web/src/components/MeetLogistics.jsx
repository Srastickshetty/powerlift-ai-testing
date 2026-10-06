/**
 * TITAN-OS Meet Logistics War Room
 * Real-time competition management and scoring
 */

import React, { useState, useEffect } from 'react';
import { Trophy, Users, Clock, BarChart3, Zap, Target, Calendar, Shield, AlertTriangle } from 'lucide-react';

const MeetLogistics = () => {
  const [meetData, setMeetData] = useState(null);
  const [currentLifters, setCurrentLifters] = useState([]);
  const [activePlatform, setActivePlatform] = useState(1);
  const [flightStatus, setFlightStatus] = useState('preparing');
  const [scores, setScores] = useState({});

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      // Update flight status
      setFlightStatus(prev => {
        if (prev === 'preparing') return 'boarding';
        if (prev === 'boarding') return 'lifting';
        return prev;
      });
      
      // Update current lifters
      setCurrentLifters([
        { id: 1, name: 'John Doe', weightClass: '83kg', flight: 'A', platform: 1, status: 'completed' },
        { id: 2, name: 'Jane Smith', weightClass: '72kg', flight: 'A', platform: 2, status: 'lifting' },
        { id: 3, name: 'Mike Johnson', weightClass: '93kg', flight: 'A', platform: 3, status: 'waiting' },
        { id: 4, name: 'Sarah Wilson', weightClass: '63kg', flight: 'B', platform: 1, status: 'completed' }
      ]);
      
      // Update scores
      setScores(prev => ({
        ...prev,
        'lifter_1': { squat: 250, bench: 180, deadlift: 280, total: 710 },
        'lifter_2': { squat: 220, bench: 160, deadlift: 240, total: 620 },
        'lifter_3': { squat: 280, bench: 200, deadlift: 310, total: 790 }
      }));
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePlatformSwitch = (platformId) => {
    setActivePlatform(platformId);
  };

  const renderLifterCard = (lifter) => (
    <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">{lifter.name}</h4>
        <span className="text-xs text-zinc-500">{lifter.weightClass}</span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div>
          <span className="text-zinc-500">Flight:</span>
          <span className="text-white font-mono">{lifter.flight}</span>
        </div>
        <div>
          <span className="text-zinc-500">Platform:</span>
          <span className="text-white font-mono">{lifter.platform}</span>
        </div>
        <div>
          <span className="text-zinc-500">Status:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            lifter.status === 'lifting' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
          }`}>
            {lifter.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            Meet Logistics War Room
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight Management */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
              <h3 className="text-lg font-semibold mb-4">Flight Control</h3>
              
              {/* Platform Selector */}
              <div className="flex gap-2 mb-4">
                {[1, 2, 3].map(platform => (
                  <button
                    key={platform}
                    onClick={() => handlePlatformSwitch(platform)}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
                      activePlatform === platform 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                    }`}
                  >
                    Platform {platform}
                  </button>
                ))}
              </div>
              
              {/* Flight Status */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Flight Status</h4>
                <div className={`px-3 py-2 rounded text-sm font-medium ${
                  flightStatus === 'lifting' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'
                }`}>
                  {flightStatus.toUpperCase()}
                </div>
              </div>
              
              {/* Current Lifters */}
              <div>
                <h4 className="text-sm font-medium mb-2">Current Lifters</h4>
                <div className="space-y-2">
                  {currentLifters.map(lifter => renderLifterCard(lifter))}
                </div>
              </div>
            </div>
          </div>

          {/* Live Scoring */}
          <div className="bg-zinc-800 rounded border border-zinc-700 p-4">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Live Scoring
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.entries(scores).map(([lifterId, score]) => (
                <div key={lifterId} className="bg-zinc-700 rounded p-3">
                  <h4 className="text-sm font-medium mb-2">Lifter {lifterId}</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-zinc-500">Squat:</span>
                      <span className="text-white font-mono">{score.squat}kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Bench:</span>
                      <span className="text-white font-mono">{score.bench}kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Deadlift:</span>
                      <span className="text-white font-mono">{score.deadlift}kg</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Total:</span>
                      <span className="text-green-400 font-bold">{score.squat + score.bench + score.deadlift}kg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetLogistics;
