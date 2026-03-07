/**
 * TARS-D Voice Assistant - Real-time Voice-to-Action System
 * Production-grade voice processing with WebSocket integration
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, Brain, Zap, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const TARSVoiceAssistant = ({ onCommand, isActive = true }) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [volume, setVolume] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [lastCommand, setLastCommand] = useState('');
  const [systemStatus, setSystemStatus] = useState('ready');
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [websocket, setWebsocket] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const animationFrameRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:5001/api/titan-os/voice/websocket');
    
    ws.onopen = () => {
      setSystemStatus('connected');
      console.log('TARS-D WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleVoiceResponse(data);
    };
    
    ws.onerror = () => {
      setSystemStatus('error');
      toast.error('TARS-D connection lost');
    };
    
    ws.onclose = () => {
      setSystemStatus('disconnected');
    };
    
    setWebsocket(ws);
    
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  // Initialize audio context
  const initializeAudio = async () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 256;
      
      setAudioContext(context);
      setAnalyser(analyserNode);
      
      return context;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      toast.error('Microphone access denied');
      return null;
    }
  };

  // Start voice recognition
  const startListening = async () => {
    if (!isActive) return;
    
    try {
      const context = audioContext || await initializeAudio();
      if (!context) return;
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };
      
      recorder.start(100); // Collect data every 100ms
      setIsListening(true);
      setSystemStatus('listening');
      
      // Start volume monitoring
      monitorVolume();
      
      toast.success('TARS-D listening...');
      
    } catch (error) {
      console.error('Failed to start listening:', error);
      toast.error('Failed to access microphone');
    }
  };

  // Stop voice recognition
  const stopListening = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsListening(false);
      setIsProcessing(true);
      setSystemStatus('processing');
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  // Monitor audio volume
  const monitorVolume = useCallback(() => {
    if (!analyser || !isListening) return;
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setVolume(average / 255);
    
    animationFrameRef.current = requestAnimationFrame(monitorVolume);
  }, [analyser, isListening]);

  // Process audio and send to backend
  const processAudio = async (audioBlob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      const response = await fetch('http://localhost:5001/api/titan-os/voice/process', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTranscript(result.transcript);
        setLastCommand(result.command);
        executeCommand(result.command, result.intent);
      } else {
        toast.error('Voice processing failed');
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
      setSystemStatus('ready');
    }
  };

  // Execute voice commands
  const executeCommand = (command, intent) => {
    const commands = {
      'system_status': () => {
        toast.success('System Status: All systems operational');
        onCommand?.({ type: 'system_status', data: { status: 'operational' } });
      },
      'optimize_program': () => {
        toast.success('Program optimization initiated');
        onCommand?.({ type: 'optimize_program', data: { status: 'initiated' } });
      },
      'emergency_stop': () => {
        toast.error('Emergency stop activated');
        onCommand?.({ type: 'emergency_stop', data: { status: 'activated' } });
      },
      'start_workout': () => {
        toast.success('Workout session started');
        onCommand?.({ type: 'start_workout', data: { status: 'started' } });
      },
      'analyze_form': () => {
        toast.info('Form analysis mode activated');
        onCommand?.({ type: 'analyze_form', data: { status: 'activated' } });
      },
      'recovery_mode': () => {
        toast.success('Recovery protocol activated');
        onCommand?.({ type: 'recovery_mode', data: { status: 'activated' } });
      }
    };
    
    const commandFunc = commands[intent];
    if (commandFunc) {
      commandFunc();
    } else {
      toast.info(`Command received: "${command}"`);
      onCommand?.({ type: 'unknown_command', data: { command, intent } });
    }
  };

  // Handle voice responses from WebSocket
  const handleVoiceResponse = (data) => {
    if (data.type === 'transcript') {
      setTranscript(data.text);
    } else if (data.type === 'command') {
      executeCommand(data.command, data.intent);
    } else if (data.type === 'response') {
      toast.success(data.message);
    }
  };

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">TARS-D Voice Assistant</h3>
            <p className="text-sm text-zinc-400">Real-time voice command processing</p>
          </div>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            systemStatus === 'connected' ? 'bg-green-500' :
            systemStatus === 'listening' ? 'bg-red-500 animate-pulse' :
            systemStatus === 'processing' ? 'bg-yellow-500' :
            systemStatus === 'error' ? 'bg-red-500' :
            'bg-zinc-500'
          }`} />
          <span className="text-xs text-zinc-400 capitalize">{systemStatus}</span>
        </div>
      </div>

      {/* Voice Visualization */}
      <div className="bg-zinc-800 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-center h-24">
          {isListening && (
            <div className="flex items-center gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-gradient-to-t from-purple-600 to-blue-600 rounded-full"
                  style={{
                    height: `${Math.random() * 60 + 20}px`,
                    animationDelay: `${i * 0.05}s`
                  }}
                  animate={{
                    height: [20, 40 + volume * 40, 20],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    delay: i * 0.05,
                  }}
                />
              ))}
            </div>
          )}
          
          {!isListening && !isProcessing && (
            <div className="text-center">
              <Volume2 className="w-12 h-12 text-zinc-600 mx-auto mb-2" />
              <p className="text-sm text-zinc-500">Click microphone to start</p>
            </div>
          )}
          
          {isProcessing && (
            <div className="text-center">
              <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-2 animate-pulse" />
              <p className="text-sm text-zinc-500">Processing command...</p>
            </div>
          )}
        </div>
      </div>

      {/* Transcript Display */}
      <AnimatePresence>
        {transcript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-zinc-800 rounded-lg p-3 mb-4"
          >
            <p className="text-sm text-zinc-300">"{transcript}"</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Last Command */}
      {lastCommand && (
        <div className="bg-zinc-800 rounded-lg p-3 mb-4">
          <p className="text-xs text-zinc-500 mb-1">Last Command:</p>
          <p className="text-sm text-green-400">{lastCommand}</p>
        </div>
      )}

      {/* Control Button */}
      <button
        onClick={toggleListening}
        disabled={!isActive || systemStatus === 'error'}
        className={`w-full py-4 rounded-xl font-medium transition-all transform active:scale-95 ${
          isListening 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
        } ${!isActive || systemStatus === 'error' ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center justify-center gap-3">
          {isListening ? (
            <>
              <MicOff className="w-5 h-5" />
              <span>Stop Listening</span>
            </>
          ) : (
            <>
              <Mic className="w-5 h-5" />
              <span>Start Voice Command</span>
            </>
          )}
        </div>
      </button>

      {/* Available Commands */}
      <div className="mt-4 text-xs text-zinc-500">
        <p className="font-medium mb-2">Available Commands:</p>
        <div className="grid grid-cols-2 gap-1">
          <div>"System status"</div>
          <div>"Optimize program"</div>
          <div>"Start workout"</div>
          <div>"Analyze form"</div>
          <div>"Recovery mode"</div>
          <div>"Emergency stop"</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TARSVoiceAssistant;
