import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Sun, Moon, Compass, RefreshCw, Zap } from 'lucide-react';

// Time of Day theme definitions
interface TimeTheme {
  name: string;
  ambientColor: string;
  ambientIntensity: number;
  dirLightColor: string;
  dirLightIntensity: number;
  bgColor: string;
  fogColor: string;
}

const TIME_THEMES: Record<string, TimeTheme> = {
  sunrise: {
    name: 'Alabaster Dawn',
    ambientColor: '#FAF9F6',
    ambientIntensity: 0.65,
    dirLightColor: '#89CFF0',
    dirLightIntensity: 1.1,
    bgColor: 'from-[#0B0C10] to-[#121212]',
    fogColor: '#0B0C10',
  },
  midday: {
    name: 'Obsidian Midday',
    ambientColor: '#FAF9F6',
    ambientIntensity: 0.8,
    dirLightColor: '#89CFF0',
    dirLightIntensity: 1.4,
    bgColor: 'from-[#121212] to-[#1c1c1e]',
    fogColor: '#121212',
  },
  sunset: {
    name: 'Baby Blue Twilight',
    ambientColor: '#89CFF0',
    ambientIntensity: 0.5,
    dirLightColor: '#A2D9CE',
    dirLightIntensity: 1.2,
    bgColor: 'from-[#121212] to-[#0B0C10]',
    fogColor: '#0B0C10',
  },
  midnight: {
    name: 'Pharaoh Midnight',
    ambientColor: '#1e293b',
    ambientIntensity: 0.3,
    dirLightColor: '#89CFF0',
    dirLightIntensity: 0.6,
    bgColor: 'from-[#020204] to-[#0B0C10]',
    fogColor: '#020204',
  },
};

// 3D Pyramids Giza Plateau Component
function GizaPlateau({ 
  rotationSpeed, 
  activeLandmark, 
  morphProgress,
  mouse
}: { 
  rotationSpeed: number; 
  activeLandmark: string; 
  morphProgress: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>
}) {
  const groupRef = useRef<THREE.Group>(null);
  const beaconRef = useRef<THREE.PointLight>(null);
  const networkGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    // Kinetic mouse tilt (subtle magnetic pull) with elastic response
    const targetX = mouse.current.x * 0.4;
    const targetY = mouse.current.y * 0.3;

    if (groupRef.current) {
      // Auto-rotation combined with mouse tracking
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y, 
        targetX + state.clock.getElapsedTime() * rotationSpeed * 0.05, 
        0.05
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetY, 0.05);
    }

    if (networkGroupRef.current) {
      networkGroupRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
    }

    // Pulsing glowing beacon on the pyramid tip
    if (beaconRef.current) {
      beaconRef.current.intensity = (1.5 + Math.sin(state.clock.getElapsedTime() * 4) * 0.8) * (1 - morphProgress);
    }
  });

  // Calculate opacity levels based on scroll morph progress
  const solidOpacity = 1 - morphProgress;
  const networkOpacity = morphProgress;

  return (
    <group>
      {/* 1. Classic Ancient Egyptian Landforms (Visible when scrolled up) */}
      {solidOpacity > 0.01 && (
        <group ref={groupRef}>
          {activeLandmark === 'pyramids' ? (
            <group>
              {/* Great Pyramid - Matte Black */}
              <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
                <coneGeometry args={[1.8, 2.0, 4]} />
                <meshStandardMaterial
                  color="#1c1c1e"
                  roughness={0.8}
                  metalness={0.2}
                  flatShading
                  transparent
                  opacity={solidOpacity}
                />
              </mesh>
              {/* Metallic Baby Blue Capstone (Pyramidion) */}
              <mesh position={[0, 1.85, 0]}>
                <coneGeometry args={[0.18, 0.2, 4]} />
                <meshStandardMaterial
                  color="#89CFF0"
                  roughness={0.1}
                  metalness={0.9}
                  emissive="#89CFF0"
                  emissiveIntensity={0.6}
                  flatShading
                  transparent
                  opacity={solidOpacity}
                />
              </mesh>
              {/* Beacon light on top */}
              <pointLight
                ref={beaconRef}
                position={[0, 1.9, 0]}
                color="#89CFF0"
                distance={5}
                decay={2}
              />

              {/* Khafre Pyramid (Medium) - Matte Black */}
              <mesh position={[-1.6, 0.5, -1.2]} castShadow receiveShadow>
                <coneGeometry args={[1.3, 1.4, 4]} />
                <meshStandardMaterial
                  color="#121212"
                  roughness={0.85}
                  metalness={0.15}
                  flatShading
                  transparent
                  opacity={solidOpacity}
                />
              </mesh>

              {/* Menkaure Pyramid (Small) - Matte Black */}
              <mesh position={[1.4, 0.3, 1.2]} castShadow receiveShadow>
                <coneGeometry args={[0.9, 0.9, 4]} />
                <meshStandardMaterial
                  color="#2a2a2e"
                  roughness={0.9}
                  metalness={0.1}
                  flatShading
                  transparent
                  opacity={solidOpacity}
                />
              </mesh>
            </group>
          ) : (
            <group>
              {/* Egyptian Temple Obelisk - Matte Black and Metallic Baby Blue */}
              {/* Base Pedestal */}
              <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[1.0, 0.2, 1.0]} />
                <meshStandardMaterial color="#121212" roughness={0.9} flatShading transparent opacity={solidOpacity} />
              </mesh>
              <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.8, 0.3, 0.8]} />
                <meshStandardMaterial color="#1c1c1e" roughness={0.8} flatShading transparent opacity={solidOpacity} />
              </mesh>
              
              {/* Main Pillar Shaft */}
              <mesh position={[0, 1.4, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.36, 2.0, 0.36]} />
                <meshStandardMaterial color="#121212" roughness={0.8} metalness={0.1} flatShading transparent opacity={solidOpacity} />
              </mesh>

              {/* Metallic Baby Blue pyramid tip (pyramidion) */}
              <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <coneGeometry args={[0.26, 0.3, 4]} />
                <meshStandardMaterial
                  color="#89CFF0"
                  roughness={0.1}
                  metalness={0.9}
                  emissive="#89CFF0"
                  emissiveIntensity={0.8}
                  flatShading
                  transparent
                  opacity={solidOpacity}
                />
              </mesh>
              <pointLight
                ref={beaconRef}
                position={[0, 2.6, 0]}
                color="#89CFF0"
                distance={6}
                decay={2}
              />
            </group>
          )}
        </group>
      )}

      {/* 2. Futuristic Communication Nodes & Plexus (Visible when scrolled down) */}
      {networkOpacity > 0.01 && (
        <group ref={networkGroupRef} position={[0, 0.8, 0]}>
          {/* Outer glowing protective communication ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.0, 0.03, 8, 64]} />
            <meshBasicMaterial color="#89CFF0" transparent opacity={networkOpacity * 0.4} />
          </mesh>

          {/* Central Holographic Communication Node (The digital pyramidion core) */}
          <mesh position={[0, 0.2, 0]}>
            <octahedronGeometry args={[0.6]} />
            <meshStandardMaterial
              color="#89CFF0"
              wireframe
              roughness={0.1}
              metalness={1.0}
              emissive="#89CFF0"
              emissiveIntensity={1.2}
              transparent
              opacity={networkOpacity}
            />
          </mesh>

          {/* Connected floating nodes */}
          <group>
            {/* Node 1 */}
            <mesh position={[-1.5, 0.8, -0.5]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#10B981" transparent opacity={networkOpacity} />
            </mesh>
            <mesh position={[-1.5, 0.8, -0.5]}>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshBasicMaterial color="#10B981" wireframe transparent opacity={networkOpacity * 0.3} />
            </mesh>

            {/* Node 2 */}
            <mesh position={[1.5, -0.6, 0.8]}>
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshBasicMaterial color="#89CFF0" transparent opacity={networkOpacity} />
            </mesh>

            {/* Node 3 */}
            <mesh position={[-0.8, -0.8, 1.2]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshBasicMaterial color="#A2D9CE" transparent opacity={networkOpacity} />
            </mesh>

            {/* Node 4 */}
            <mesh position={[1.0, 1.0, -1.0]}>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshBasicMaterial color="#89CFF0" transparent opacity={networkOpacity} />
            </mesh>
          </group>

          {/* Node Connections / Lines */}
          <group>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.01, 2.0, 0.01]} />
              <meshBasicMaterial color="#89CFF0" transparent opacity={networkOpacity * 0.25} />
            </mesh>
            {/* Connecting lines from central node to outer nodes */}
            <mesh position={[-0.75, 0.4, -0.25]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[1.8, 0.008, 0.008]} />
              <meshBasicMaterial color="#10B981" transparent opacity={networkOpacity * 0.4} />
            </mesh>
            <mesh position={[0.75, -0.3, 0.4]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[1.6, 0.008, 0.008]} />
              <meshBasicMaterial color="#89CFF0" transparent opacity={networkOpacity * 0.4} />
            </mesh>
            <mesh position={[0.5, 0.5, -0.5]} rotation={[Math.PI / 4, 0, -Math.PI / 4]}>
              <boxGeometry args={[1.5, 0.008, 0.008]} />
              <meshBasicMaterial color="#A2D9CE" transparent opacity={networkOpacity * 0.4} />
            </mesh>
          </group>
        </group>
      )}

      {/* Modern Sand-Textured Grid Lines Helper */}
      <gridHelper args={[12, 12, '#89CFF0', '#222222']} position={[0, -0.05, 0]} />

      {/* Desert Matte Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial
          color="#121212"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={solidOpacity + 0.15}
        />
      </mesh>

      {/* Scattered Modern Minimalist Geometry Blocks */}
      <mesh position={[-2.2, 0.1, 1.8]} castShadow>
        <dodecahedronGeometry args={[0.22]} />
        <meshStandardMaterial 
          color="#1c1c1e" 
          roughness={0.8} 
          flatShading 
          transparent
          opacity={solidOpacity}
        />
      </mesh>
      <mesh position={[2.5, 0.05, -1.8]} castShadow>
        <dodecahedronGeometry args={[0.15]} />
        <meshStandardMaterial 
          color="#121212" 
          roughness={0.8} 
          flatShading 
          transparent
          opacity={solidOpacity}
        />
      </mesh>
      <mesh position={[-0.8, 0.05, 2.5]} castShadow>
        <dodecahedronGeometry args={[0.12]} />
        <meshStandardMaterial 
          color="#2a2a2e" 
          roughness={0.8} 
          flatShading 
          transparent
          opacity={solidOpacity}
        />
      </mesh>
    </group>
  );
}

// Camera orbit scroll trigger controller
function CameraController({ morphProgress }: { morphProgress: number }) {
  useFrame((state) => {
    // Orbit camera smoothly as morphProgress increases (scrolling down)
    const baseAngle = state.clock.getElapsedTime() * 0.05; // slow baseline rotate
    const scrollAngle = morphProgress * Math.PI * 0.8; // extra camera rotation on scroll
    const angle = baseAngle + scrollAngle;
    const radius = 4.2 + morphProgress * 1.5; // push camera out slightly when morphed
    
    // Smooth camera heights
    const targetHeight = 1.8 + morphProgress * 1.2;

    state.camera.position.x = Math.sin(angle) * radius;
    state.camera.position.z = Math.cos(angle) * radius;
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetHeight, 0.05);
    state.camera.lookAt(0, 0.8, 0);
  });
  return null;
}

export default function Egyptian3DCanvas() {
  const [timeMode, setTimeMode] = useState<keyof typeof TIME_THEMES>('sunrise');
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [activeLandmark, setActiveLandmark] = useState<'pyramids' | 'obelisk'>('pyramids');
  const [isRotating, setIsRotating] = useState<boolean>(true);
  const [morphProgress, setMorphProgress] = useState<number>(0);

  // Mouse position tracking ref
  const mouse = useRef({ x: 0, y: 0 });

  // Kinetic mouse movement listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Track window scroll to morph geometry
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? Math.min(scrollY / (maxScroll * 0.4), 1) : 0; // Morph finishes 40% down the page
      setMorphProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const theme = TIME_THEMES[timeMode];

  return (
    <div id="3d-hero-container" className="relative w-full h-[500px] md:h-[600px] rounded-3xl overflow-hidden border border-baby-blue/10 shadow-2xl shadow-black/5 bg-obsidian-black">
      {/* 3D Canvas Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgColor} transition-colors duration-1000 z-0`} />

      {/* Custom Overlay / Branding Text */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <span className="text-xs font-mono tracking-widest text-baby-blue uppercase flex items-center gap-1.5 bg-obsidian-black/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-baby-blue/20">
          <Zap className="w-3.5 h-3.5 text-baby-blue animate-pulse" />
          Interactive 3D VRI Infrastructure
        </span>
        <h3 className="text-xl font-bold text-alabaster font-sans tracking-tight mt-3">
          {theme.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
          Drag to rotate the viewpoint. Pinch or scroll to zoom in/out.
        </p>
      </div>

      {/* Floating control buttons */}
      <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-3">
        {/* Landmark Selector */}
        <div className="bg-obsidian-black/90 backdrop-blur-md p-1.5 rounded-xl border border-baby-blue/20 flex gap-1">
          <button
            id="landmark-pyramids"
            onClick={() => setActiveLandmark('pyramids')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              activeLandmark === 'pyramids'
                ? 'bg-baby-blue text-obsidian-black shadow-md shadow-baby-blue/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            Pyramids
          </button>
          <button
            id="landmark-obelisk"
            onClick={() => setActiveLandmark('obelisk')}
            className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all cursor-pointer ${
              activeLandmark === 'obelisk'
                ? 'bg-baby-blue text-obsidian-black shadow-md shadow-baby-blue/20 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/50'
            }`}
          >
            Obelisk
          </button>
        </div>

        {/* Time of Day Cycle Control */}
        <div className="bg-obsidian-black/90 backdrop-blur-md p-2 rounded-xl border border-baby-blue/20 flex items-center gap-2">
          <span className="text-[10px] font-mono text-baby-blue uppercase tracking-wider pl-1">
            Sky Cycle:
          </span>
          <div className="flex gap-1">
            {(Object.keys(TIME_THEMES) as Array<keyof typeof TIME_THEMES>).map((key) => {
              const isActive = timeMode === key;
              return (
                <button
                  id={`time-btn-${key}`}
                  key={key}
                  onClick={() => setTimeMode(key)}
                  title={TIME_THEMES[key].name}
                  className={`p-2 rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-baby-blue text-obsidian-black shadow-md font-bold'
                      : 'text-slate-400 hover:bg-slate-900/50 hover:text-white'
                  }`}
                >
                  {key === 'sunrise' && <Compass className="w-4 h-4" />}
                  {key === 'midday' && <Sun className="w-4 h-4" />}
                  {key === 'sunset' && <Sun className="w-4 h-4 text-baby-blue rotate-180" />}
                  {key === 'midnight' && <Moon className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rotation Engine Control on Left Bottom */}
      <div className="absolute bottom-6 left-6 z-10 bg-obsidian-black/90 backdrop-blur-md p-2.5 rounded-xl border border-baby-blue/20 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            id="toggle-rotation"
            onClick={() => setIsRotating(!isRotating)}
            className={`p-1.5 rounded-md text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              isRotating ? 'bg-baby-blue/20 text-baby-blue font-bold' : 'bg-slate-900/40 text-slate-400'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            {isRotating ? 'Auto Orbiting' : 'Paused'}
          </button>
        </div>
        {isRotating && (
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-mono text-baby-blue/70 uppercase tracking-widest">
              Orbit Speed: {rotationSpeed}x
            </span>
            <input
              id="rotation-speed-slider"
              type="range"
              min="0.2"
              max="3"
              step="0.2"
              value={rotationSpeed}
              onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
              className="w-28 h-1 bg-baby-blue/20 rounded-lg appearance-none cursor-pointer accent-baby-blue"
            />
          </div>
        )}
      </div>

      {/* React Three Fiber Canvas */}
      <Canvas
        id="egyptian-landmark-canvas"
        shadows
        camera={{ position: [0, 1.8, 4.2], fov: 45 }}
        className="w-full h-full z-1 pointer-events-auto"
      >
        {/* Ambient light styled with desert gold parameters */}
        <ambientLight color={theme.ambientColor} intensity={theme.ambientIntensity} />

        {/* Directional light acting as the solar sun */}
        <directionalLight
          castShadow
          position={[5, 4, 3]}
          color={theme.dirLightColor}
          intensity={theme.dirLightIntensity}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={15}
          shadow-camera-left={-4}
          shadow-camera-right={4}
          shadow-camera-top={4}
          shadow-camera-bottom={-4}
        />

        {/* Secondary soft colored light to fill shadows elegantly */}
        <pointLight position={[-4, 2, -3]} color="#55efe6" intensity={0.15} />

        {/* Orbit Camera Controller reacting to scroll */}
        <CameraController morphProgress={morphProgress} />

        {/* Floating elements inside a Drei Float wrapper to resemble sand storm elements or dust sparkles */}
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
          <GizaPlateau
            rotationSpeed={isRotating ? rotationSpeed : 0}
            activeLandmark={activeLandmark}
            morphProgress={morphProgress}
            mouse={mouse}
          />
        </Float>

        {/* Stellar Background Starfield in the Egyptian night sky */}
        <Stars radius={100} depth={50} count={timeMode === 'midnight' ? 1200 : 300} factor={4} saturation={0.5} fade speed={1} />

        {/* User Interactive Orbit Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent going underneath ground
          minDistance={2.5}
          maxDistance={7}
        />
      </Canvas>
    </div>
  );
}
