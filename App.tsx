import React, { useState } from 'react';
import OrbitCanvas from './components/OrbitCanvas';
import Controls from './components/Controls';
import { OrbitConfig } from './types';
import { Play } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<OrbitConfig>({
    particleCount: 2000,
    baseSpeed: 1.0,
    baseRadius: 300,
    colorTheme: 'cyan',
    showTrails: true,
    perspective: 800,
    particleImages: [],
    planeRotation: { x: 0, y: 0, z: 0 }, // Default flat
  });

  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="relative w-full h-screen bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" />
        
        <div className="relative z-10 text-center space-y-6 max-w-lg p-8">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 tracking-tight">
                ORBITAL
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed">
                An interactive WebGL-style particle simulation running entirely on 2D Canvas.
                Experience the math of chaos and order.
            </p>
            <button 
                onClick={() => setStarted(true)}
                className="group relative inline-flex items-center gap-3 px-8 py-4 bg-slate-900 border border-slate-700 rounded-full text-cyan-400 font-bold tracking-wider hover:bg-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.4)] transition-all duration-300"
            >
                <span className="relative z-10">LAUNCH SIMULATION</span>
                <Play className="w-4 h-4 fill-current relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden text-slate-100 font-sans">
      <OrbitCanvas config={config} />
      
      {/* Overlay UI */}
      <Controls config={config} setConfig={setConfig} />

      {/* Footer Info */}
      <div className="absolute bottom-4 left-6 pointer-events-none opacity-50 text-xs">
        <p className="font-mono">REACT + CANVAS + TAILWIND</p>
      </div>
    </div>
  );
};

export default App;