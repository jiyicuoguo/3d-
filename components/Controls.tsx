import React, { useState } from 'react';
import { OrbitConfig } from '../types';
import { Settings, RefreshCw, Eye, EyeOff, Palette, Upload, Image as ImageIcon, X, Trash2, MousePointer2, ChevronRight, Compass } from 'lucide-react';

interface ControlsProps {
  config: OrbitConfig;
  setConfig: React.Dispatch<React.SetStateAction<OrbitConfig>>;
}

const Controls: React.FC<ControlsProps> = ({ config, setConfig }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleChange = <K extends keyof OrbitConfig>(key: K, value: OrbitConfig[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRotationChange = (axis: 'x' | 'y' | 'z', value: number) => {
      setConfig(prev => ({
          ...prev,
          planeRotation: {
              ...prev.planeRotation,
              [axis]: value
          }
      }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      let processed = 0;
      
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
          }
          processed++;
          if (processed === files.length) {
             // Add new images to existing list
             handleChange('particleImages', [...config.particleImages, ...newImages]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = config.particleImages.filter((_, i) => i !== index);
    handleChange('particleImages', newImages);
  };

  const clearAllImages = () => {
      handleChange('particleImages', []);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="absolute top-4 right-4 p-3 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-full text-cyan-400 shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)] hover:bg-slate-800 hover:scale-110 hover:shadow-[0_0_25px_-5px_rgba(34,211,238,0.5)] transition-all z-50 group"
        title="Open Controls"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="absolute top-4 right-4 w-72 bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 shadow-2xl text-slate-100 transition-all hover:bg-slate-900/80 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent z-50 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-6 border-b border-slate-700/50 pb-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="font-bold text-lg tracking-wide bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Orbit Controls
          </h2>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-full transition-colors"
          title="Close Panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-5">
        {/* Count Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Particles</span>
            <span>{config.particleCount}</span>
          </div>
          <input
            type="range"
            min="100"
            max="10000"
            step="100"
            value={config.particleCount}
            onChange={(e) => handleChange('particleCount', parseInt(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Radius Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Radius Spread</span>
            <span>{config.baseRadius}px</span>
          </div>
          <input
            type="range"
            min="50"
            max="1000"
            step="50"
            value={config.baseRadius}
            onChange={(e) => handleChange('baseRadius', parseInt(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Speed Slider */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Orbital Speed</span>
            <span>{config.baseSpeed.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={config.baseSpeed}
            onChange={(e) => handleChange('baseSpeed', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
        </div>

        {/* Plane Rotation Controls */}
        <div className="space-y-3 pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
                <Compass className="w-3 h-3"/> Global Rotation
            </span>
            <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] w-4 text-slate-500">X</span>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={config.planeRotation.x}
                        onChange={(e) => handleRotationChange('x', parseInt(e.target.value))}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] w-4 text-slate-500">Y</span>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={config.planeRotation.y}
                        onChange={(e) => handleRotationChange('y', parseInt(e.target.value))}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[10px] w-4 text-slate-500">Z</span>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={config.planeRotation.z}
                        onChange={(e) => handleRotationChange('z', parseInt(e.target.value))}
                        className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                 </div>
            </div>
        </div>

        {/* Toggles Row */}
        <div className="flex items-center justify-between pt-2">
           <button
            onClick={() => handleChange('showTrails', !config.showTrails)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              config.showTrails 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                : 'bg-slate-800 text-slate-400 border border-transparent'
            }`}
          >
            {config.showTrails ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
            Trails
          </button>
        </div>

        {/* Custom Particle Images */}
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
            <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ImageIcon className="w-3 h-3"/> Custom Particles
                </span>
                {config.particleImages.length > 0 && (
                    <button 
                        onClick={clearAllImages}
                        className="text-[10px] text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                )}
            </div>

            {config.particleImages.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                    {config.particleImages.map((imgSrc, idx) => (
                        <div key={idx} className="relative group aspect-square bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                            <img src={imgSrc} alt={`particle-${idx}`} className="w-full h-full object-contain p-1" />
                            <button 
                                onClick={() => removeImage(idx)}
                                className="absolute top-0 right-0 bg-red-500/80 text-white p-0.5 rounded-bl-md opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            <label className="flex items-center justify-center gap-2 w-full h-9 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg cursor-pointer transition-all text-xs text-slate-300">
                <Upload className="w-3 h-3" />
                <span>Add Images</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            </label>
        </div>

        {/* Themes Grid */}
        <div className="space-y-2 pt-2 border-t border-slate-700/50">
            <span className="text-xs text-slate-400 flex items-center gap-1">
                <Palette className="w-3 h-3"/> Theme
            </span>
            <div className="grid grid-cols-4 gap-2">
                {(['cyan', 'fire', 'matrix', 'spectrum'] as const).map(theme => (
                    <button
                        key={theme}
                        onClick={() => handleChange('colorTheme', theme)}
                        className={`h-8 rounded-md transition-transform hover:scale-105 border-2 ${
                            config.colorTheme === theme ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={{
                            background: 
                                theme === 'cyan' ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' :
                                theme === 'fire' ? 'linear-gradient(135deg, #f97316, #ef4444)' :
                                theme === 'matrix' ? 'linear-gradient(135deg, #22c55e, #14532d)' :
                                'linear-gradient(135deg, #a855f7, #ec4899)'
                        }}
                        title={theme}
                    />
                ))}
            </div>
        </div>
      </div>
      
      <div className="mt-6 text-[10px] text-slate-500 text-center flex items-center justify-center gap-2">
        <MousePointer2 className="w-3 h-3" />
        Left click & drag to rotate view
      </div>
    </div>
  );
};

export default Controls;