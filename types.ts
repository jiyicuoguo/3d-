export interface OrbitConfig {
  particleCount: number;
  baseSpeed: number;
  baseRadius: number;
  colorTheme: 'cyan' | 'fire' | 'matrix' | 'spectrum';
  showTrails: boolean;
  perspective: number;
  particleImages: string[];
  planeRotation: { x: number; y: number; z: number };
}

export interface Particle {
  angle: number;
  speed: number;
  
  // Orbit Basis Vectors (pre-scaled by radius)
  // Position = u * cos(angle) + v * sin(angle)
  ux: number; uy: number; uz: number;
  vx: number; vy: number; vz: number;
  
  // Visuals
  size: number;
  color: string;
  imageIndex: number;
  
  // Real-time Screen Coordinates (for hit detection)
  screenX: number;
  screenY: number;
  scale: number;
}