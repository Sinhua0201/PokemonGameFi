'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import { Suspense } from 'react';

function IslandModel() {
  const gltf = useGLTF('/assets/models/island.glb');
  
  console.log('Island model loaded:', gltf);
  console.log('Scene children:', gltf.scene.children);
  
  return (
    <primitive 
      object={gltf.scene} 
      scale={5} 
      position={[0, 0, 0]}
    />
  );
}

export default function TestIslandPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#87CEEB' }}>
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 50, 100]} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
        />
        
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[50, 50, 25]}
          intensity={1}
          castShadow
        />
        <hemisphereLight args={['#ffffff', '#ffffff', 1.0]} />
        
        <Suspense fallback={null}>
          <IslandModel />
        </Suspense>
        
        <gridHelper args={[200, 20]} position={[0, -2, 0]} />
      </Canvas>
      
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>Island Model Test</h2>
        <p style={{ margin: '5px 0' }}>✅ Model path: /assets/models/island.glb</p>
        <p style={{ margin: '5px 0' }}>🎮 Controls:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>Left click + drag: Rotate</li>
          <li>Right click + drag: Pan</li>
          <li>Scroll: Zoom</li>
        </ul>
        <p style={{ margin: '10px 0 5px 0', fontSize: '12px', color: '#aaa' }}>
          Check browser console for model details
        </p>
      </div>
    </div>
  );
}
