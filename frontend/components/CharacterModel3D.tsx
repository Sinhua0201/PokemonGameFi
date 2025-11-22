'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';

interface CharacterModel3DProps {
  characterId: number;
  autoRotate?: boolean;
  scale?: number;
}

function Character({ characterId, scale = 0.02 }: { characterId: number; scale?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    const loader = new FBXLoader();
    const basePath = `/character${characterId}`;
    const idleFile = characterId <= 4 ? 'Idle.fbx' : 'idling.fbx';

    loader.load(
      `${basePath}/${idleFile}`,
      (fbx) => {
        fbx.scale.setScalar(scale);

        // Center the model and move down
        const box = new THREE.Box3().setFromObject(fbx);
        const center = box.getCenter(new THREE.Vector3());
        fbx.position.x = -center.x;
        fbx.position.y = -box.min.y - 1.5; // Move down by 2.0 units
        fbx.position.z = -center.z;

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          `${basePath}/shaded.png`,
          (texture) => {
            fbx.traverse((child) => {
              if ((child as THREE.Mesh).isMesh) {
                const mesh = child as THREE.Mesh;
                mesh.material = new THREE.MeshStandardMaterial({
                  map: texture,
                  roughness: 0.7,
                  metalness: 0.1,
                });
                mesh.castShadow = true;
                mesh.receiveShadow = true;
              }
            });
          }
        );

        setModel(fbx);

        // Create animation mixer
        const newMixer = new THREE.AnimationMixer(fbx);
        setMixer(newMixer);

        if (fbx.animations && fbx.animations.length > 0) {
          const action = newMixer.clipAction(fbx.animations[0]);
          action.play();
        }
      }
    );

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [characterId, scale]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);
    
    // Gentle auto-rotation
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group ref={groupRef}>
      {model && <primitive object={model} />}
    </group>
  );
}

export function CharacterModel3D({ characterId, autoRotate = true, scale = 0.02 }: CharacterModel3DProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0.5, 4], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.5} />
        
        <Character characterId={characterId} scale={scale} />
        
        {!autoRotate && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        )}
      </Canvas>
    </div>
  );
}
