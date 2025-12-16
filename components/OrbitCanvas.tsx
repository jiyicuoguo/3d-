import React, { useRef, useEffect, useCallback, useState } from 'react';
import { OrbitConfig, Particle } from '../types';
import { X, ZoomIn } from 'lucide-react';

interface OrbitCanvasProps {
  config: OrbitConfig;
}

const OrbitCanvas: React.FC<OrbitCanvasProps> = ({ config }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // State for the selected particle (Fullscreen view)
  const [selectedParticle, setSelectedParticle] = useState<Particle | null>(null);

  // Camera State
  const cameraRef = useRef({ 
    rotX: 0, 
    rotY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastMouseX: 0,
    lastMouseY: 0
  });

  // Load images when config changes
  useEffect(() => {
    if (config.particleImages.length > 0) {
        const loadedImages: HTMLImageElement[] = [];
        config.particleImages.forEach(src => {
            const img = new Image();
            img.src = src;
            loadedImages.push(img);
        });
        imagesRef.current = loadedImages;
    } else {
        imagesRef.current = [];
    }
  }, [config.particleImages]);

  // Helper to generate colors based on theme
  const getThemeColor = useCallback((theme: OrbitConfig['colorTheme'], progress: number) => {
    switch (theme) {
      case 'fire':
        return `hsl(${30 + progress * 40}, 100%, ${50 + progress * 30}%)`;
      case 'matrix':
        return `hsl(${120}, 100%, ${30 + progress * 50}%)`;
      case 'spectrum':
        return `hsl(${progress * 360}, 80%, 60%)`;
      case 'cyan':
      default:
        return `hsl(${180 + progress * 60}, 100%, ${60 + progress * 20}%)`;
    }
  }, []);

  // Initialize Particles (3D Spherical Orbits)
  const initParticles = useCallback(() => {
    const p: Particle[] = [];
    const imageCount = config.particleImages.length;
    const coreCount = Math.floor(config.particleCount * 0.35); 

    for (let i = 0; i < config.particleCount; i++) {
      const isCore = i < coreCount;
      
      let radius: number;
      let speed: number;
      let size: number;

      if (isCore) {
        radius = Math.cbrt(Math.random()) * 80; 
        speed = (config.baseSpeed * 0.05) * (Math.random() > 0.5 ? 1 : -1); 
        size = Math.random() * 1.5 + 0.5;
      } else {
        const rRatio = Math.pow(Math.random(), 0.5); 
        radius = 80 + rRatio * config.baseRadius;
        speed = (config.baseSpeed * 0.03) / (0.2 + rRatio) * (Math.random() > 0.5 ? 1 : -1);
        size = Math.random() * 2 + 0.5;
      }

      // 3D Orientation
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const ax = Math.sin(phi) * Math.cos(theta);
      const ay = Math.sin(phi) * Math.sin(theta);
      const az = Math.cos(phi);

      let tempX = 1, tempY = 0, tempZ = 0;
      if (Math.abs(ax) > 0.9) { tempX = 0; tempY = 1; tempZ = 0; }

      let ux = ay * tempZ - az * tempY;
      let uy = az * tempX - ax * tempZ;
      let uz = ax * tempY - ay * tempX;
      const uLen = Math.sqrt(ux*ux + uy*uy + uz*uz);
      ux /= uLen; uy /= uLen; uz /= uLen;

      let vx = ay * uz - az * uy;
      let vy = az * ux - ax * uz;
      let vz = ax * uy - ay * ux;
      const vLen = Math.sqrt(vx*vx + vy*vy + vz*vz);
      vx /= vLen; vy /= vLen; vz /= vLen;

      ux *= radius; uy *= radius; uz *= radius;
      vx *= radius; vy *= radius; vz *= radius;
      
      p.push({
        angle: Math.random() * Math.PI * 2,
        speed,
        ux, uy, uz,
        vx, vy, vz,
        size,
        color: getThemeColor(config.colorTheme, isCore ? 0 : (radius - 80) / config.baseRadius),
        imageIndex: imageCount > 0 ? Math.floor(Math.random() * imageCount) : 0,
        screenX: 0,
        screenY: 0,
        scale: 0
      });
    }
    particlesRef.current = p;
  }, [config.particleCount, config.baseRadius, config.baseSpeed, config.colorTheme, getThemeColor, config.particleImages]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    initParticles();
    return () => window.removeEventListener('resize', handleResize);
  }, [initParticles]);

  const rotateX = (y: number, z: number, angle: number) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { y: y * c - z * s, z: y * s + z * c };
  };
  const rotateY = (x: number, z: number, angle: number) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x: x * c - z * s, z: x * s + z * c };
  };
  const rotateZ = (x: number, y: number, angle: number) => {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return { x: x * c - y * s, y: x * s + y * c };
  };

  // Animation Loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;

    if (config.showTrails) {
      ctx.fillStyle = 'rgba(2, 6, 23, 0.2)'; 
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    const tiltX = (config.planeRotation.x * Math.PI) / 180;
    const tiltY = (config.planeRotation.y * Math.PI) / 180;
    const tiltZ = (config.planeRotation.z * Math.PI) / 180;

    const currentImages = imagesRef.current;
    const hasImages = currentImages.length > 0;

    particlesRef.current.forEach((p) => {
      p.angle += p.speed;

      const c = Math.cos(p.angle);
      const s = Math.sin(p.angle);

      // 1. Calculate 3D position
      let x = p.ux * c + p.vx * s;
      let y = p.uy * c + p.vy * s;
      let z = p.uz * c + p.vz * s;

      // 2. Apply Global Rotation
      const rz = rotateZ(x, y, tiltZ);
      x = rz.x; y = rz.y;
      const rx = rotateX(y, z, tiltX);
      y = rx.y; z = rx.z;
      const ry = rotateY(x, z, tiltY);
      x = ry.x; z = ry.z;

      // 3. Apply Camera Rotation
      const camY = rotateY(x, z, cameraRef.current.rotY);
      x = camY.x; z = camY.z;
      const camX = rotateX(y, z, cameraRef.current.rotX);
      y = camX.y; z = camX.z;

      // 4. Projection
      const scale = config.perspective / (config.perspective + z);
      const screenX = cx + x * scale;
      const screenY = cy + y * scale;

      // Update particle state for hit detection
      p.screenX = screenX;
      p.screenY = screenY;
      p.scale = scale;

      // Draw
      if (scale > 0) {
        const alpha = Math.min(1, Math.max(0.1, scale * scale));
        ctx.globalAlpha = alpha;

        if (hasImages) {
            const img = currentImages[p.imageIndex % currentImages.length];
            if (img && img.complete) {
                const renderSize = p.size * scale * 8; 
                ctx.drawImage(img, screenX - renderSize / 2, screenY - renderSize / 2, renderSize, renderSize);
            } else {
                ctx.beginPath();
                ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }
        } else {
            ctx.beginPath();
            ctx.arc(screenX, screenY, p.size * scale, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        
        ctx.globalAlpha = 1.0;
      }
    });

    // Core Glow
    const glowScale = config.perspective / (config.perspective + 0);
    const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120 * glowScale);
    glowGradient.addColorStop(0, config.colorTheme === 'fire' ? 'rgba(255,100,0,0.4)' : 
                               config.colorTheme === 'matrix' ? 'rgba(0,255,100,0.3)' :
                               config.colorTheme === 'spectrum' ? 'rgba(255,255,255,0.3)' :
                               'rgba(0,200,255,0.3)');
    glowGradient.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(cx, cy, 120 * glowScale, 0, Math.PI * 2);
    ctx.fill();

    requestRef.current = requestAnimationFrame(animate);
  }, [config.showTrails, config.perspective, config.colorTheme, config.planeRotation]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  // Interaction Handlers
  const handleStart = (x: number, y: number) => {
    cameraRef.current.isDragging = true;
    cameraRef.current.startX = x;
    cameraRef.current.startY = y;
    cameraRef.current.lastMouseX = x;
    cameraRef.current.lastMouseY = y;
  };

  const handleMove = (x: number, y: number) => {
    if (cameraRef.current.isDragging) {
        const deltaX = x - cameraRef.current.lastMouseX;
        const deltaY = y - cameraRef.current.lastMouseY;
        cameraRef.current.rotY += deltaX * 0.005; 
        cameraRef.current.rotX -= deltaY * 0.005;
        cameraRef.current.lastMouseX = x;
        cameraRef.current.lastMouseY = y;
    }
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    cameraRef.current.isDragging = false;
    
    // Calculate drag distance to distinguish click vs drag
    let clientX, clientY;
    if ('changedTouches' in e) {
        clientX = e.changedTouches[0].clientX;
        clientY = e.changedTouches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const dist = Math.hypot(clientX - cameraRef.current.startX, clientY - cameraRef.current.startY);

    // It's a click if moved less than 5 pixels
    if (dist < 5) {
        handleHitDetection(clientX, clientY);
    }
  };

  const handleHitDetection = (clickX: number, clickY: number) => {
    let hitParticle: Particle | null = null;
    let maxScale = -Infinity;

    // Tolerance radius for clicking (larger for better UX)
    const baseHitRadius = 20; 

    particlesRef.current.forEach(p => {
        // Only check particles that are in front of camera (positive scale)
        if (p.scale > 0) {
            const dx = p.screenX - clickX;
            const dy = p.screenY - clickY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            
            // Allow clicking slightly outside the visual particle
            const hitThreshold = Math.max(baseHitRadius, p.size * p.scale * 10);

            if (dist < hitThreshold) {
                // If multiple hits, pick the one closest to camera (largest scale)
                if (p.scale > maxScale) {
                    maxScale = p.scale;
                    hitParticle = p;
                }
            }
        }
    });

    if (hitParticle) {
        setSelectedParticle(hitParticle);
    }
  };

  // Helper to get image source for overlay
  const getSelectedImageSrc = () => {
    if (!selectedParticle) return null;
    if (config.particleImages.length === 0) return null;
    return config.particleImages[selectedParticle.imageIndex % config.particleImages.length];
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={() => cameraRef.current.isDragging = false}
        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={handleEnd}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Fullscreen Overlay */}
      {selectedParticle && (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setSelectedParticle(null)}
        >
            <div 
                className="relative flex flex-col items-center justify-center p-8 max-w-2xl w-full mx-4"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
            >
                <button 
                    onClick={() => setSelectedParticle(null)}
                    className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full hover:bg-slate-700 transition-colors"
                >
                    <X className="w-8 h-8" />
                </button>

                <div className="relative group">
                    {config.particleImages.length > 0 ? (
                        <div className="relative rounded-2xl overflow-hidden shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] border border-slate-700/50 bg-slate-900/50">
                             <img 
                                src={getSelectedImageSrc() || ''} 
                                alt="Particle Detail" 
                                className="max-h-[70vh] w-auto object-contain animate-in zoom-in-95 duration-300"
                            />
                        </div>
                    ) : (
                        <div 
                            className="w-64 h-64 rounded-full animate-pulse shadow-[0_0_100px_rgba(255,255,255,0.2)]"
                            style={{ 
                                backgroundColor: selectedParticle.color,
                                boxShadow: `0 0 80px ${selectedParticle.color}`
                            }}
                        />
                    )}
                </div>

                <div className="mt-8 text-center space-y-2">
                    <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Particle Details
                    </h3>
                    <div className="flex gap-4 justify-center text-sm text-slate-400 font-mono">
                        <span>Speed: {selectedParticle.speed.toFixed(4)}</span>
                        <span>Orbit Radius: {(Math.hypot(selectedParticle.ux, selectedParticle.uy, selectedParticle.uz)).toFixed(0)}</span>
                    </div>
                    <p className="text-slate-500 text-sm mt-2">Click anywhere to close</p>
                </div>
            </div>
        </div>
      )}
    </>
  );
};

export default OrbitCanvas;