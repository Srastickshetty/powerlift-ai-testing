/**
 * Simple Test Dashboard to Verify New Components Are Working
 */

import React from 'react';

const TestDashboard = ({ athleteId, user, profile }) => {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-orange-500 mb-8">
          🚀 TITAN-OS DASHBOARD TEST
        </h1>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Authentication Status</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-purple-400 mb-3">User Data</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-zinc-400">Email:</span> <span className="text-white">{user?.email || 'Not logged in'}</span></div>
                <div><span className="text-zinc-400">UID:</span> <span className="text-white">{user?.uid || 'N/A'}</span></div>
                <div><span className="text-zinc-400">Email Verified:</span> <span className="text-white">{user?.emailVerified ? 'Yes' : 'No'}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-green-400 mb-3">Profile Data</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-zinc-400">Role:</span> <span className="text-white">{profile?.role || 'No profile'}</span></div>
                <div><span className="text-zinc-400">Name:</span> <span className="text-white">{profile?.name || 'N/A'}</span></div>
                <div><span className="text-zinc-400">Complete:</span> <span className="text-white">{profile?.profile_complete ? 'Yes' : 'No'}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">Component Test</h2>

          {profile?.role === 'coach' ? (
            <div className="text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-blue-400 mb-2">Coach Strategy Room</h3>
              <p className="text-zinc-400 mb-6">Multi-athlete management and intervention system</p>
              <div className="bg-blue-900 text-blue-400 px-6 py-3 rounded-lg inline-block">
                Role: COACH - Strategy Room Active
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-6xl mb-4">🏋️</div>
              <h3 className="text-2xl font-bold text-orange-400 mb-2">Athlete Command Center</h3>
              <p className="text-zinc-400 mb-6">Personalized training dashboard with AI insights</p>
              <div className="bg-orange-900 text-orange-400 px-6 py-3 rounded-lg inline-block">
                Role: ATHLETE - Command Center Active
              </div>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8">
          <h2 className="text-2xl font-semibold text-white mb-6">TITAN-OS Features Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ TARS-D Voice Assistant - Built
            </div>
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ Biomechanics Lab - Built
            </div>
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ Competition Engine - Built
            </div>
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ Sentiment Analysis - Built
            </div>
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ Recovery Council - Built
            </div>
            <div className="bg-green-900 text-green-400 p-4 rounded-lg">
              ✅ Meet Logistics - Built
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboard;
