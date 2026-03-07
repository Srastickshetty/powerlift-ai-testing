/**
 * TITAN-OS Voice Processor
 * Real-time voice analysis and command processing
 */

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Bot, Volume2 } from 'lucide-react';

const VoiceProcessor = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandResponse, setCommandResponse] = useState('');
  const [volumeLevel, setVolumeLevel] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  useEffect(() => {
    return () => {
      // Cleanup audio resources
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      mediaRecorderRef.current = mediaRecorder;
      
      // Connect microphone to analyser
      microphone.connect(analyser);
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      mediaRecorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const audioBlob = event.data;
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Send to backend for processing
          try {
            const formData = new FormData();
            formData.append('audio', audioBlob);
            formData.append('athleteId', 'demo_athlete');
            
            const response = await fetch('http://localhost:5001/api/agents/voice/analyze', {
              method: 'POST',
              body: formData
            });
            
            const result = await response.json();
            if (result.success && result.data.command) {
              setCommandResponse(result.data.command);
            }
          } catch (error) {
            console.error('Voice processing failed:', error);
          }
        }
      };
      
      mediaRecorder.onstop = () => {
        setIsListening(false);
      };
      
      mediaRecorder.start();
      setIsListening(true);
      
      // Monitor volume levels
      const checkVolume = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          
          const average = sum / dataArray.length;
          const volume = Math.sqrt(average / 128);
          setVolumeLevel(volume);
        }
        
        requestAnimationFrame(checkVolume);
      };
      
      const volumeInterval = setInterval(checkVolume, 100);
      
      // Cleanup function
      return () => {
        clearInterval(volumeInterval);
      };
    } catch (error) {
      console.error('Microphone access denied:', error);
      setCommandResponse('Microphone access required for voice commands');
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendCommand = async (command) => {
    try {
      const response = await fetch('http://localhost:5001/api/agents/voice/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command,
          athleteId: 'demo_athlete',
          context: 'titan_os'
        })
      });
      
      const result = await response.json();
      if (result.success) {
        setCommandResponse(result.message);
      }
    } catch (error) {
      console.error('Command failed:', error);
    }
  };

  return (
    <div className="bg-black text-white p-6 rounded-lg border border-zinc-700">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center justify-center gap-2">
            <Bot className="w-8 h-8" />
            Voice Processor
          </h2>
          <p className="text-zinc-400 mb-6">Real-time voice analysis and command processing</p>
        </div>
        
        {/* Voice Level Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative">
            <Volume2 className="w-12 h-12 text-zinc-600" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-zinc-400">{Math.round(volumeLevel * 100)}%</span>
            </div>
          </div>
        </div>
        
        {/* Control Buttons */}
        <div className="flex gap-4">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`flex-1 px-4 py-3 rounded font-medium transition-colors ${
              isListening 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isListening ? (
              <>
                <Mic className="w-4 h-4" />
                Stop Listening
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start Listening
              </>
            )}
          </button>
          
          <button
            onClick={() => sendCommand('system_status')}
            className="flex-1 px-4 py-3 bg-zinc-700 text-zinc-300 rounded font-medium hover:bg-zinc-600 transition-colors"
          >
            <Send className="w-4 h-4" />
            System Status
          </button>
        </div>
        
        {/* Transcript Display */}
        {transcript && (
          <div className="mt-6 p-4 bg-zinc-800 rounded border border-zinc-700">
            <h3 className="text-sm font-semibold mb-2">Voice Transcript</h3>
            <p className="text-zinc-300">{transcript}</p>
          </div>
        )}
        
        {/* Command Response */}
        {commandResponse && (
          <div className="mt-6 p-4 bg-green-900 rounded border border-green-700">
            <h3 className="text-sm font-semibold mb-2 text-green-400">TITAN-AI Response</h3>
            <p className="text-green-300">{commandResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceProcessor;
