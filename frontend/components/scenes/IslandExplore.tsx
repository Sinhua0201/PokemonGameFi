'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import * as THREE from 'three';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { db } from '@/lib/firebase';
import { doc, setDoc, onSnapshot, collection, query, where, serverTimestamp, getDoc, updateDoc, increment } from 'firebase/firestore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usePlayerPokemonNFT } from '@/hooks/usePlayerPokemonNFT';
import { useCapture } from '@/hooks/useCapture';
import { usePlayerEggs, useAddBattleSteps } from '@/hooks/useBreeding';
import { useAddExperience } from '@/hooks/usePokemonNFT';
import { BattleModal } from '@/components/BattleModal';
import { PokemonSelectionModal } from '@/components/PokemonSelectionModal';

interface Player {
  address: string;
  name: string;
  characterId: number;
  position: { x: number; y: number; z: number };
  rotation: number;
  lastUpdate: any;
}

interface WildPokemon {
  id: string;
  speciesId: number;
  name: string;
  position: { x: number; y: number; z: number };
  sprite: string;
  level: number;
}

// Island Model
function Island({ onClick, islandRef }: { onClick: (point: THREE.Vector3) => void; islandRef: React.MutableRefObject<THREE.Group | null> }) {
  const gltf = useLoader(GLTFLoader, '/assets/models/island.glb');

  useEffect(() => {
    if (gltf.scene) {
      islandRef.current = gltf.scene;
    }
  }, [gltf, islandRef]);

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // 确保材质正确显示颜色
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial;
            // 增强材质属性以显示更好的颜色
            material.metalness = 0.1;
            material.roughness = 0.8;
            // 如果材质有颜色，确保它被使用
            if (material.color) {
              material.color.multiplyScalar(1.2); // 稍微增强颜色亮度
            }
            material.needsUpdate = true;
          }
        }
      });
      console.log('🏝️ Island materials updated');
    }
  }, [gltf]);

  const handleClick = (event: any) => {
    event.stopPropagation();
    if (event.point) {
      onClick(event.point);
    }
  };

  return (
    <primitive
      object={gltf.scene}
      scale={5}
      position={[0, -2, 0]}
      onClick={handleClick}
    />
  );
}

// Battle Tower
function BattleTower({
  onEnter,
  playerPosition
}: {
  onEnter: () => void;
  playerPosition: [number, number, number];
}) {
  const gltf = useLoader(GLTFLoader, '/assets/models/battle.glb');
  const [showPrompt, setShowPrompt] = useState(false);
  const hasEnteredRef = useRef(false);
  const towerPosition = [35, 23, -30];

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
    }
  }, [gltf]);

  // Check distance to player
  useFrame(() => {
    const distance = Math.sqrt(
      Math.pow(playerPosition[0] - towerPosition[0], 2) +
      Math.pow(playerPosition[2] - towerPosition[2], 2)
    );

    const isNear = distance < 10;
    setShowPrompt(isNear);

    // Auto-enter when very close
    if (distance < 5 && !hasEnteredRef.current) {
      hasEnteredRef.current = true;
      onEnter();
    }
  });

  return (
    <group position={[towerPosition[0], towerPosition[1], towerPosition[2]]}>
      <primitive
        object={gltf.scene}
        scale={1.3}
      />
      {/* Battle Icon */}
      <Html position={[0, 12, 0]} center>
        <div className="transition-all">
          <div className="bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-lg animate-pulse">
            ⚔️ Battle
          </div>
          {showPrompt && (
            <div className="mt-1 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm text-center animate-bounce">
              Walk closer to enter!
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// Breeding Center
function BreedingCenter({
  onEnter,
  playerPosition
}: {
  onEnter: () => void;
  playerPosition: [number, number, number];
}) {
  const gltf = useLoader(GLTFLoader, '/assets/models/breeding.glb');
  const [showPrompt, setShowPrompt] = useState(false);
  const hasEnteredRef = useRef(false);
  const centerPosition = [-30, 2, 45]; // 移到右下方位置

  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });
    }
  }, [gltf]);

  // Check distance to player
  useFrame(() => {
    const distance = Math.sqrt(
      Math.pow(playerPosition[0] - centerPosition[0], 2) +
      Math.pow(playerPosition[2] - centerPosition[2], 2)
    );

    const isNear = distance < 10;
    setShowPrompt(isNear);

    // Auto-enter when very close
    if (distance < 5 && !hasEnteredRef.current) {
      hasEnteredRef.current = true;
      onEnter();
    }
  });

  return (
    <group position={[centerPosition[0], centerPosition[1], centerPosition[2]]}>
      <primitive
        object={gltf.scene}
        scale={0.1} // 缩小到原来的 1/10
      />
      {/* Breeding Icon */}
      <Html position={[0, 10, 0]} center>
        <div className="transition-all">
          <div className="bg-pink-500 text-white px-3 py-1.5 rounded-full shadow-lg font-bold text-lg animate-pulse">
            🥚 Breeding
          </div>
          {showPrompt && (
            <div className="mt-1 bg-yellow-500 text-black px-2 py-1 rounded font-bold text-sm text-center animate-bounce">
              Walk closer to enter!
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// Player Character
function PlayerCharacter({
  characterId,
  position,
  rotation,
  name,
  isCurrentPlayer
}: {
  characterId: number;
  position: [number, number, number];
  rotation: number;
  name: string;
  isCurrentPlayer: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Group | null>(null);
  const [mixer, setMixer] = useState<THREE.AnimationMixer | null>(null);
  const [walkAction, setWalkAction] = useState<THREE.AnimationAction | null>(null);
  const [loading, setLoading] = useState(true);
  const targetPosition = useRef(new THREE.Vector3(...position));
  const targetRotation = useRef(rotation);
  const isMoving = useRef(false);

  useEffect(() => {
    console.log(`🎮 Loading character ${characterId}...`);
    const loader = new FBXLoader();
    const basePath = `/character${characterId}`;
    const idleFile = characterId <= 4 ? 'Idle.fbx' : 'idling.fbx';
    const walkingFile = characterId <= 4 ? 'Walking.fbx' : 'walking.fbx';

    // Load idle model first
    loader.load(
      `${basePath}/${idleFile}`,
      (idleFbx) => {
        console.log(`✅ Character ${characterId} idle loaded`);
        idleFbx.scale.setScalar(0.03); // Much smaller

        // Center the model
        const box = new THREE.Box3().setFromObject(idleFbx);
        const center = box.getCenter(new THREE.Vector3());
        idleFbx.position.x = -center.x;
        idleFbx.position.y = -box.min.y;
        idleFbx.position.z = -center.z;

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(
          `${basePath}/shaded.png`,
          (texture) => {
            console.log(`🎨 Texture loaded for character ${characterId}`);
            idleFbx.traverse((child) => {
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
            setLoading(false);
          },
          undefined,
          (err) => {
            console.error(`❌ Texture error for character ${characterId}:`, err);
            setLoading(false);
          }
        );

        setModel(idleFbx);

        // Create mixer
        const newMixer = new THREE.AnimationMixer(idleFbx);
        setMixer(newMixer);

        // Load walking animation only
        loader.load(
          `${basePath}/${walkingFile}`,
          (walkingFbx) => {
            console.log(`🚶 Walking animation loaded for character ${characterId}`);
            if (walkingFbx.animations && walkingFbx.animations.length > 0) {
              const walk = newMixer.clipAction(walkingFbx.animations[0]);
              walk.setLoop(THREE.LoopRepeat, Infinity);
              setWalkAction(walk);
              console.log(`✅ Walk action ready for character ${characterId}`);
            }
          },
          undefined,
          (err) => console.error(`❌ Walking animation error:`, err)
        );
      },
      (progress) => {
        console.log(`⏳ Loading character ${characterId}: ${((progress.loaded / progress.total) * 100).toFixed(0)}%`);
      },
      (err) => {
        console.error(`❌ Failed to load character ${characterId}:`, err);
        setLoading(false);
      }
    );

    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [characterId]);

  useEffect(() => {
    targetPosition.current.set(...position);
    targetRotation.current = rotation;
  }, [position, rotation]);

  useFrame((state, delta) => {
    if (mixer) mixer.update(delta);

    if (groupRef.current) {
      // Check if character is moving
      const currentPos = groupRef.current.position;
      const distanceToTarget = currentPos.distanceTo(targetPosition.current);
      const shouldBeMoving = distanceToTarget > 0.5;

      // Simple: play walking animation when moving, pause when not moving
      if (shouldBeMoving !== isMoving.current) {
        isMoving.current = shouldBeMoving;

        if (shouldBeMoving && walkAction) {
          // Start walking - reset to beginning and play
          walkAction.reset();
          walkAction.setEffectiveTimeScale(1); // Ensure forward playback
          walkAction.setEffectiveWeight(1);
          walkAction.play();
        } else if (!shouldBeMoving && walkAction) {
          // Pause walking at current frame
          walkAction.paused = true;
        }
      } else if (shouldBeMoving && walkAction) {
        // Keep animation playing while moving
        walkAction.paused = false;
      }

      // Smooth interpolation
      const lerpSpeed = distanceToTarget > 5 ? 0.15 : 0.1;
      groupRef.current.position.lerp(targetPosition.current, lerpSpeed);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current,
        0.15
      );
    }
  });

  return (
    <group ref={groupRef}>
      {model && <primitive object={model} />}
      <Html position={[0, 8, 0]} center>
        <div className={`px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap ${isCurrentPlayer ? 'bg-yellow-500 text-black' : 'bg-white/90 text-black'
          }`}>
          {name}
        </div>
      </Html>
    </group>
  );
}

// Wild Pokemon Sprite
function WildPokemonSprite({
  pokemon,
  playerPosition
}: {
  pokemon: WildPokemon;
  playerPosition: [number, number, number];
}) {
  const spriteRef = useRef<THREE.Sprite>(null);
  const texture = useLoader(THREE.TextureLoader, pokemon.sprite);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasNearRef = useRef(false);

  useFrame(() => {
    if (spriteRef.current) {
      // Check distance to player
      const distance = Math.sqrt(
        Math.pow(playerPosition[0] - pokemon.position.x, 2) +
        Math.pow(playerPosition[2] - pokemon.position.z, 2)
      );

      const isNear = distance < 15;

      // Show prompt only when first entering range
      if (isNear && !wasNearRef.current) {
        setShowPrompt(true);

        // Clear existing timer
        if (promptTimerRef.current) {
          clearTimeout(promptTimerRef.current);
        }

        // Hide after 3 seconds
        promptTimerRef.current = setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      } else if (!isNear && wasNearRef.current) {
        // Reset when leaving range
        setShowPrompt(false);
        if (promptTimerRef.current) {
          clearTimeout(promptTimerRef.current);
        }
      }

      wasNearRef.current = isNear;

      // Bounce animation - 降低高度
      spriteRef.current.position.y = pokemon.position.y + 2 + Math.sin(Date.now() * 0.003) * 1;
    }
  });

  useEffect(() => {
    return () => {
      if (promptTimerRef.current) {
        clearTimeout(promptTimerRef.current);
      }
    };
  }, []);

  return (
    <group>
      <sprite
        ref={spriteRef}
        position={[pokemon.position.x, pokemon.position.y + 2, pokemon.position.z]}
        scale={[6, 6, 1]}
      >
        <spriteMaterial map={texture} transparent />
      </sprite>
      {showPrompt && (
        <Html position={[pokemon.position.x, pokemon.position.y + 5, pokemon.position.z]} center>
          <style jsx>{`
            .press-e-prompt {
              background: #ef4444;
              color: white;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
              animation: pulse 1s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }
          `}</style>
          <div className="press-e-prompt">
            Press E
          </div>
        </Html>
      )}
    </group>
  );
}

// Terrain Height Checker Component
function TerrainHeightChecker({ children, islandRef }: { children: React.ReactNode; islandRef: React.MutableRefObject<THREE.Group | null> }) {
  const raycaster = useRef(new THREE.Raycaster());

  const getTerrainHeight = useCallback((x: number, z: number): number => {
    if (!islandRef.current) return 0;

    // Cast ray downward from high above
    const origin = new THREE.Vector3(x, 100, z);
    const direction = new THREE.Vector3(0, -1, 0);
    raycaster.current.set(origin, direction);

    const intersects = raycaster.current.intersectObject(islandRef.current, true);

    if (intersects.length > 0) {
      return intersects[0].point.y;
    }

    return 0; // Default ground level
  }, [islandRef]);

  return <>{children}</>;
}

// Main Scene
function Scene({
  currentPlayer,
  otherPlayers,
  wildPokemon,
  onIslandClick,
  onBattleTowerEnter,
  onBreedingCenterEnter,
  islandRef,
}: {
  currentPlayer: Player | null;
  otherPlayers: Player[];
  wildPokemon: WildPokemon[];
  onIslandClick: (point: THREE.Vector3) => void;
  onBattleTowerEnter: () => void;
  onBreedingCenterEnter: () => void;
  islandRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const controlsRef = useRef<any>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const [cameraReady, setCameraReady] = useState(false);

  // Frame the island when it loads
  useEffect(() => {
    if (islandRef.current && cameraRef.current && controlsRef.current && !cameraReady) {
      const box = new THREE.Box3().setFromObject(islandRef.current);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());

      // Set controls target to island center
      controlsRef.current.target.copy(center);

      // Position camera at good viewing angle
      const distance = size * 0.8;
      cameraRef.current.position.set(
        center.x + distance * 0.5,
        center.y + distance * 0.7,
        center.z + distance * 0.5
      );

      cameraRef.current.updateProjectionMatrix();
      controlsRef.current.update();
      setCameraReady(true);

      console.log('📷 Camera framed island:', { center, size, distance });
    }
  }, [islandRef.current, cameraReady]);

  return (
    <>
      {/* Sky blue background */}
      <color attach="background" args={['#87CEEB']} />

      {/* Add fog for depth */}
      <fog attach="fog" args={['#87CEEB', 200, 600]} />

      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[100, 80, 100]}
        fov={60}
      />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={50}
        maxDistance={300}
        enablePan={true}
        enableRotate={true}
        enableZoom={true}
      />

      {/* 增强环境光 - 提供基础亮度 */}
      <ambientLight intensity={1.2} />

      {/* 主方向光 - 模拟太阳光 */}
      <directionalLight
        position={[50, 100, 50]}
        intensity={2.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
      />

      {/* 补充方向光 - 从另一侧照亮 */}
      <directionalLight
        position={[-50, 80, -50]}
        intensity={1.5}
      />

      {/* 半球光 - 天空和地面反射 */}
      <hemisphereLight args={['#87CEEB', '#5a8f5a', 1.2]} />

      {/* 顶部点光源 - 增加整体亮度 */}
      <pointLight position={[0, 100, 0]} intensity={1.0} distance={200} />

      {/* 岛屿中心点光源 */}
      <pointLight position={[0, 20, 0]} intensity={0.8} distance={150} />

      <Island onClick={onIslandClick} islandRef={islandRef} />

      <BattleTower
        onEnter={onBattleTowerEnter}
        playerPosition={currentPlayer ? [currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z] : [0, 0, 0]}
      />

      <BreedingCenter
        onEnter={onBreedingCenterEnter}
        playerPosition={currentPlayer ? [currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z] : [0, 0, 0]}
      />

      {currentPlayer && (
        <PlayerCharacter
          characterId={currentPlayer.characterId}
          position={[currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z]}
          rotation={currentPlayer.rotation}
          name={currentPlayer.name}
          isCurrentPlayer={true}
        />
      )}

      {otherPlayers.map((player) => (
        <PlayerCharacter
          key={player.address}
          characterId={player.characterId}
          position={[player.position.x, player.position.y, player.position.z]}
          rotation={player.rotation}
          name={player.name}
          isCurrentPlayer={false}
        />
      ))}

      {wildPokemon.map((pokemon) => (
        <WildPokemonSprite
          key={pokemon.id}
          pokemon={pokemon}
          playerPosition={currentPlayer ? [currentPlayer.position.x, currentPlayer.position.y, currentPlayer.position.z] : [0, 0, 0]}
        />
      ))}

      {/* No ground plane - floating island! */}
    </>
  );
}

// Main Component
export default function IslandExplore() {
  const router = useRouter();
  const account = useCurrentAccount();
  const { pokemon: playerPokemonList, loading: pokemonLoading } = usePlayerPokemonNFT();
  const { attemptCapture } = useCapture();
  const { eggs } = usePlayerEggs();
  const { addBattleSteps } = useAddBattleSteps();
  const { addExperience } = useAddExperience();

  // Debug: log player Pokemon
  useEffect(() => {
    console.log('🎮 Player Pokemon from blockchain:', playerPokemonList);
  }, [playerPokemonList]);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [otherPlayers, setOtherPlayers] = useState<Player[]>([]);
  const [wildPokemon, setWildPokemon] = useState<WildPokemon[]>([]);
  const [encounterPokemon, setEncounterPokemon] = useState<WildPokemon | null>(null);
  const [loading, setLoading] = useState(true);
  const [battleMode, setBattleMode] = useState<'select' | 'battle' | null>(null);
  const [selectedPokemon, setSelectedPokemon] = useState<any>(null);
  const [wildPokemonHP, setWildPokemonHP] = useState(100);
  const [playerPokemonHP, setPlayerPokemonHP] = useState(100);
  const [wildPokemonMaxHP, setWildPokemonMaxHP] = useState(100);
  const [playerPokemonMaxHP, setPlayerPokemonMaxHP] = useState(100);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showMoveSelection, setShowMoveSelection] = useState(false);

  // Get Pokemon moves based on type
  const getPokemonMoves = (pokemon: any) => {
    const types = pokemon.types || ['normal'];
    const primaryType = types[0].toLowerCase();

    const movesByType: Record<string, any[]> = {
      fire: [
        { name: 'Ember', power: 40, type: 'Fire' },
        { name: 'Flame Wheel', power: 60, type: 'Fire' },
        { name: 'Fire Blast', power: 110, type: 'Fire' },
        { name: 'Tackle', power: 35, type: 'Normal' },
      ],
      water: [
        { name: 'Water Gun', power: 40, type: 'Water' },
        { name: 'Bubble Beam', power: 65, type: 'Water' },
        { name: 'Hydro Pump', power: 110, type: 'Water' },
        { name: 'Tackle', power: 35, type: 'Normal' },
      ],
      grass: [
        { name: 'Vine Whip', power: 45, type: 'Grass' },
        { name: 'Razor Leaf', power: 55, type: 'Grass' },
        { name: 'Solar Beam', power: 120, type: 'Grass' },
        { name: 'Tackle', power: 35, type: 'Normal' },
      ],
      electric: [
        { name: 'Thunder Shock', power: 40, type: 'Electric' },
        { name: 'Thunderbolt', power: 90, type: 'Electric' },
        { name: 'Thunder', power: 110, type: 'Electric' },
        { name: 'Quick Attack', power: 40, type: 'Normal' },
      ],
      normal: [
        { name: 'Tackle', power: 35, type: 'Normal' },
        { name: 'Scratch', power: 40, type: 'Normal' },
        { name: 'Body Slam', power: 85, type: 'Normal' },
        { name: 'Hyper Beam', power: 150, type: 'Normal' },
      ],
    };

    return movesByType[primaryType] || movesByType.normal;
  };
  const keysPressed = useRef<Set<string>>(new Set());
  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const isMovingToTarget = useRef(false);
  const islandRef = useRef<THREE.Group | null>(null);
  const raycaster = useRef(new THREE.Raycaster());

  // Get terrain height at position
  const getTerrainHeight = useCallback((x: number, z: number): number => {
    if (!islandRef.current) return 0;

    const origin = new THREE.Vector3(x, 200, z);
    const direction = new THREE.Vector3(0, -1, 0);
    raycaster.current.set(origin, direction);

    const intersects = raycaster.current.intersectObject(islandRef.current, true);

    if (intersects.length > 0) {
      // Add small offset so character stands ON the surface
      return intersects[0].point.y + 0.5;
    }

    return 0;
  }, []);

  // Load player data
  useEffect(() => {
    if (!account?.address) return;

    const loadPlayerData = async () => {
      try {
        const trainerSnap = await getDoc(doc(db, 'trainers', account.address));
        if (trainerSnap.exists()) {
          const data = trainerSnap.data();
          setCurrentPlayer({
            address: account.address,
            name: data.name || 'Player',
            characterId: data.characterId || 1,
            position: { x: 0, y: 0, z: 0 },
            rotation: 0,
            lastUpdate: Date.now(),
          });
        }
      } catch (error) {
        console.error('Failed to load player:', error);
        toast.error('Failed to load player data');
      }
      setLoading(false);
    };

    loadPlayerData();
  }, [account]);

  // Sync player position
  useEffect(() => {
    if (!currentPlayer || !account?.address) return;

    console.log('📡 Starting position sync for:', currentPlayer.name);

    const interval = setInterval(async () => {
      try {
        await setDoc(doc(db, 'onlinePlayers', account.address), {
          address: account.address,
          name: currentPlayer.name,
          characterId: currentPlayer.characterId,
          position: currentPlayer.position,
          rotation: currentPlayer.rotation,
          lastUpdate: serverTimestamp(),
        }, { merge: true });

        // Log occasionally (every 10 syncs)
        if (Math.random() < 0.1) {
          console.log('📡 Position synced:', currentPlayer.position);
        }
      } catch (error) {
        console.error('❌ Failed to sync position:', error);
      }
    }, 1000); // Sync every second

    // Cleanup on unmount
    return () => {
      clearInterval(interval);
      // Mark player as offline
      setDoc(doc(db, 'onlinePlayers', account.address), {
        lastUpdate: serverTimestamp(),
      }, { merge: true }).catch(console.error);
      console.log('👋 Player going offline');
    };
  }, [currentPlayer, account]);

  // Listen to other players
  useEffect(() => {
    if (!account?.address) return;

    console.log('👥 Starting to listen for other players...');

    // Listen to ALL players in real-time (no time filter for now)
    const unsubscribe = onSnapshot(
      collection(db, 'onlinePlayers'),
      (snapshot) => {
        const players: Player[] = [];
        const now = Date.now();

        snapshot.forEach((doc) => {
          if (doc.id !== account.address) {
            const data = doc.data();

            // Only show players active in last 2 minutes
            const lastUpdate = data.lastUpdate?.toMillis?.() || 0;
            const timeSinceUpdate = now - lastUpdate;

            if (timeSinceUpdate < 2 * 60 * 1000) { // 2 minutes
              players.push({
                address: doc.id,
                name: data.name || 'Player',
                characterId: data.characterId || 1,
                position: data.position || { x: 0, y: 0, z: 0 },
                rotation: data.rotation || 0,
                lastUpdate: data.lastUpdate,
              });
              console.log(`✅ Found player: ${data.name} at`, data.position);
            }
          }
        });

        console.log(`👥 Total other players: ${players.length}`);
        setOtherPlayers(players);
      },
      (error) => {
        console.error('❌ Error listening to players:', error);
      }
    );

    return () => {
      console.log('👋 Stopped listening for other players');
      unsubscribe();
    };
  }, [account]);

  // Generate wild Pokemon (delayed until island loads)
  useEffect(() => {
    // Wait a bit for island to load
    const timer = setTimeout(() => {
      const generatePokemon = () => {
        const pokemon: WildPokemon[] = [];

        // Pokemon with rarity weights (higher = more common)
        const pokemonPool = [
          // Common (70% chance)
          { id: 1, weight: 10 },   // Bulbasaur
          { id: 4, weight: 10 },   // Charmander
          { id: 7, weight: 10 },   // Squirtle
          { id: 10, weight: 8 },   // Caterpie
          { id: 16, weight: 8 },   // Pidgey
          { id: 19, weight: 8 },   // Rattata
          { id: 43, weight: 7 },   // Oddish
          { id: 69, weight: 7 },   // Bellsprout

          // Uncommon (20% chance)
          { id: 25, weight: 5 },   // Pikachu
          { id: 133, weight: 4 },  // Eevee
          { id: 152, weight: 4 },  // Chikorita
          { id: 155, weight: 4 },  // Cyndaquil
          { id: 158, weight: 4 },  // Totodile
          { id: 252, weight: 3 },  // Treecko
          { id: 255, weight: 3 },  // Torchic
          { id: 258, weight: 3 },  // Mudkip

          // Rare (8% chance)
          { id: 147, weight: 2 },  // Dratini
          { id: 246, weight: 2 },  // Larvitar
          { id: 371, weight: 2 },  // Bagon

          // Very Rare (2% chance)
          { id: 131, weight: 0.5 }, // Lapras
          { id: 143, weight: 0.5 }, // Snorlax
          { id: 149, weight: 0.3 }, // Dragonite
        ];

        const totalWeight = pokemonPool.reduce((sum, p) => sum + p.weight, 0);
        const minDistance = 15;

        for (let i = 0; i < 10; i++) {
          // Weighted random selection
          let random = Math.random() * totalWeight;
          let speciesId = 1;

          for (const p of pokemonPool) {
            random -= p.weight;
            if (random <= 0) {
              speciesId = p.id;
              break;
            }
          }

          let x: number = 0, z: number = 0, y: number = 0;
          let attempts = 0;
          let validPosition = false;

          // Try to find a position that's not too close to other Pokemon
          while (!validPosition && attempts < 50) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 15 + Math.random() * 50;

            x = Math.cos(angle) * radius;
            z = Math.sin(angle) * radius;
            y = getTerrainHeight(x, z);

            // Check distance to all existing Pokemon
            validPosition = pokemon.every(p => {
              const dist = Math.sqrt(
                Math.pow(x - p.position.x, 2) +
                Math.pow(z - p.position.z, 2)
              );
              return dist >= minDistance;
            });

            attempts++;
          }

          if (validPosition) {
            pokemon.push({
              id: `wild-${i}`,
              speciesId,
              name: `Pokemon #${speciesId}`,
              level: Math.floor(Math.random() * 10) + 5,
              position: { x, y, z },
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`,
            });
          }
        }
        setWildPokemon(pokemon);
      };

      generatePokemon();
    }, 1000);

    return () => clearTimeout(timer);
  }, [getTerrainHeight]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());

      // E key for encounter
      if (e.key.toLowerCase() === 'e' && currentPlayer) {
        const nearbyPokemon = wildPokemon.find(p => {
          const distance = Math.sqrt(
            Math.pow(currentPlayer.position.x - p.position.x, 2) +
            Math.pow(currentPlayer.position.z - p.position.z, 2)
          );
          return distance < 15;
        });

        if (nearbyPokemon) {
          setEncounterPokemon(nearbyPokemon);
          setBattleMode('select');
          toast.success(`Wild ${nearbyPokemon.name} appeared!`);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentPlayer, wildPokemon]);

  // Handle island click for movement
  const handleIslandClick = useCallback((point: THREE.Vector3) => {
    if (!currentPlayer) return;

    // Use the actual clicked point's Y coordinate (it's already on the terrain)
    targetPosition.current = new THREE.Vector3(point.x, point.y, point.z);
    isMovingToTarget.current = true;

    console.log(`🎯 Moving to: ${point.x.toFixed(1)}, ${point.y.toFixed(1)}, ${point.z.toFixed(1)}`);
  }, [currentPlayer]);

  // Movement loop (keyboard + mouse click)
  useEffect(() => {
    if (!currentPlayer) return;

    const interval = setInterval(() => {
      const speed = 0.5; // Much slower movement
      const newPosition = { ...currentPlayer.position };
      let newRotation = currentPlayer.rotation;
      let moved = false;

      // Keyboard movement (cancels click movement)
      if (keysPressed.current.size > 0) {
        isMovingToTarget.current = false;
        targetPosition.current = null;

        // Try different rotation values to find the right one
        let moveX = 0;
        let moveZ = 0;

        if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
          moveZ -= 1;
        }
        if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
          moveZ += 1;
        }
        if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
          moveX -= 1;
        }
        if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
          moveX += 1;
        }

        if (moveX !== 0 || moveZ !== 0) {
          // Normalize
          const length = Math.sqrt(moveX * moveX + moveZ * moveZ);
          moveX = (moveX / length) * speed;
          moveZ = (moveZ / length) * speed;

          newPosition.x += moveX;
          newPosition.z += moveZ;

          // Same rotation calculation as mouse click
          newRotation = Math.atan2(moveX, moveZ);
          moved = true;
        }
      }
      // Mouse click movement
      else if (isMovingToTarget.current && targetPosition.current) {
        const dx = targetPosition.current.x - currentPlayer.position.x;
        const dz = targetPosition.current.z - currentPlayer.position.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        if (distance > 1) {
          // Move towards target
          const dirX = dx / distance;
          const dirZ = dz / distance;
          newPosition.x += dirX * speed;
          newPosition.z += dirZ * speed;

          // Calculate rotation to face movement direction (fixed)
          newRotation = Math.atan2(dirX, dirZ);
          moved = true;
        } else {
          // Reached target
          isMovingToTarget.current = false;
          targetPosition.current = null;
        }
      }

      // Boundary check
      const maxDistance = 80;
      const distance = Math.sqrt(newPosition.x ** 2 + newPosition.z ** 2);
      if (distance > maxDistance) {
        const scale = maxDistance / distance;
        newPosition.x *= scale;
        newPosition.z *= scale;
        isMovingToTarget.current = false;
        targetPosition.current = null;
      }

      if (moved) {
        // Get terrain height at new position
        const terrainHeight = getTerrainHeight(newPosition.x, newPosition.z);
        newPosition.y = terrainHeight > 0 ? terrainHeight : 0;

        setCurrentPlayer({
          ...currentPlayer,
          position: newPosition,
          rotation: newRotation,
        });
      }
    }, 50);

    return () => clearInterval(interval);
  }, [currentPlayer]);

  const handleBattle = async (pokemon: any) => {
    if (!encounterPokemon) return;

    setSelectedPokemon(pokemon);

    // Initialize HP
    const wildMaxHP = 30 + encounterPokemon.level * 3;
    const playerMaxHP = pokemon.stats?.hp || 50;

    setWildPokemonMaxHP(wildMaxHP);
    setPlayerPokemonMaxHP(playerMaxHP);
    setWildPokemonHP(wildMaxHP);
    setPlayerPokemonHP(playerMaxHP);
    setBattleLog([`${pokemon.name} vs Wild ${encounterPokemon.name}!`]);
    setShowMoveSelection(false);
    setBattleMode('battle');
  };

  const handleAttack = async (move: { name: string; power: number; type: string }) => {
    if (!selectedPokemon || !encounterPokemon || isAttacking) return;

    setIsAttacking(true);
    setShowMoveSelection(false);

    // Calculate damage with level having significant impact
    const playerLevel = selectedPokemon.level || 10;
    const playerAttack = (selectedPokemon.stats?.attack || 50) + playerLevel * 2;
    const wildDefense = (40 + encounterPokemon.level * 2);

    const baseDamage = ((2 * playerLevel / 5 + 2) * move.power * playerAttack / wildDefense / 50 + 2);
    const damage = Math.floor(baseDamage * (0.85 + Math.random() * 0.15));

    const newWildHP = Math.max(0, wildPokemonHP - damage);
    setWildPokemonHP(newWildHP);
    setBattleLog(prev => [...prev, `${selectedPokemon.name} used ${move.name}!`, `Dealt ${damage} damage!`]);

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (newWildHP === 0) {
      // Victory!
      const expGained = Math.floor(encounterPokemon.level * 50);
      setBattleLog(prev => [...prev, `Wild ${encounterPokemon.name} fainted!`, `Gained ${expGained} EXP!`]);

      // Save experience (Pokemon are on blockchain, but we can still track in Firebase for stats)
      if (account?.address) {
        try {
          await updateDoc(doc(db, 'pokemon', selectedPokemon.id), {
            experience: increment(expGained),
          });
        } catch (error) {
          console.error('Failed to save experience:', error);
        }
      }

      // Add experience to Pokemon on blockchain
      try {
        await addExperience(selectedPokemon.id, expGained);
        console.log(`✅ Added ${expGained} EXP to Pokemon ${selectedPokemon.id}`);
      } catch (error) {
        console.error(`Failed to add experience to Pokemon:`, error);
      }

      // Add battle steps to all eggs
      if (eggs && eggs.length > 0) {
        for (const egg of eggs) {
          try {
            await addBattleSteps(egg.id);
            console.log(`✅ Added battle steps to egg ${egg.id}`);
          } catch (error) {
            console.error(`Failed to add battle steps to egg ${egg.id}:`, error);
          }
        }
        toast.success(`Victory! Gained ${expGained} EXP! +1 step to ${eggs.length} egg(s)!`);
      } else {
        toast.success(`Victory! Gained ${expGained} EXP!`);
      }

      setTimeout(() => {
        setWildPokemon(prev => prev.filter(p => p.id !== encounterPokemon.id));
        setBattleMode(null);
        setEncounterPokemon(null);
        setSelectedPokemon(null);
        setBattleLog([]);
      }, 2000);
    } else {
      // Wild Pokemon counter-attacks
      const wildAttack = 40 + encounterPokemon.level * 2;
      const playerDefense = selectedPokemon.stats?.defense || 50;
      const counterDamage = Math.floor(
        ((2 * encounterPokemon.level / 5 + 2) * 50 * wildAttack / playerDefense / 50 + 2) *
        (0.85 + Math.random() * 0.15)
      );

      const newPlayerHP = Math.max(0, playerPokemonHP - counterDamage);
      setPlayerPokemonHP(newPlayerHP);
      setBattleLog(prev => [...prev, `Wild ${encounterPokemon.name} dealt ${counterDamage} damage!`]);

      if (newPlayerHP === 0) {
        setBattleLog(prev => [...prev, `${selectedPokemon.name} fainted!`]);
        toast.error('Your Pokemon fainted!');

        setTimeout(() => {
          setBattleMode(null);
          setEncounterPokemon(null);
          setSelectedPokemon(null);
          setBattleLog([]);
        }, 2000);
      }
    }

    setIsAttacking(false);
  };

  const handleCatch = async () => {
    if (!encounterPokemon || !account?.address) return;

    // Store wallet address for useCapture hook
    (window as any).__WALLET_ADDRESS__ = account.address;

    // Calculate capture rate based on current HP (if in battle)
    let hpPercentage = 1.0;
    if (battleMode === 'battle' && wildPokemonMaxHP > 0) {
      hpPercentage = wildPokemonHP / wildPokemonMaxHP;
    } else {
      hpPercentage = 1.0; // Full HP if catching without battle
    }

    // Base capture rate: 30% + bonus based on low HP (up to 60% bonus)
    const baseRate = 0.3;
    const hpBonus = (1 - hpPercentage) * 0.6;
    const successRate = baseRate + hpBonus;

    toast.loading('尝试捕获...', { id: 'capture' });

    try {
      // Use blockchain capture
      const result = await attemptCapture(
        {
          speciesId: encounterPokemon.speciesId,
          name: encounterPokemon.name,
          level: encounterPokemon.level,
          types: ['normal'], // Default type
        },
        successRate
      );

      if (result.success) {
        toast.success(`成功捕获了 ${encounterPokemon.name}! NFT 已铸造`, { id: 'capture' });

        // Remove caught Pokemon from map
        setWildPokemon(prev => prev.filter(p => p.id !== encounterPokemon.id));

        // Add to battle log if in battle
        if (battleMode === 'battle') {
          setBattleLog(prev => [...prev, `成功捕获了 ${encounterPokemon.name}!`]);
        }

        // Close battle/selection after short delay
        setTimeout(() => {
          setBattleMode(null);
          setEncounterPokemon(null);
          setSelectedPokemon(null);
          setBattleLog([]);
        }, 2000);
      } else {
        const message = `${encounterPokemon.name} 挣脱了！`;
        toast.error(message, { id: 'capture' });

        if (battleMode === 'battle') {
          setBattleLog(prev => [...prev, message]);
        }
      }
    } catch (error) {
      console.error('Failed to capture:', error);
      toast.error('捕获失败，请重试', { id: 'capture' });

      if (battleMode === 'battle') {
        setBattleLog(prev => [...prev, '捕获失败！']);
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 to-purple-900">
        <div className="text-white text-2xl">Loading Island...</div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      <Canvas shadows gl={{ antialias: true }}>
        <Scene
          currentPlayer={currentPlayer}
          otherPlayers={otherPlayers}
          wildPokemon={wildPokemon}
          onIslandClick={handleIslandClick}
          onBattleTowerEnter={() => router.push('/battle')}
          onBreedingCenterEnter={() => router.push('/breeding')}
          islandRef={islandRef}
        />
      </Canvas>

      {/* UI Overlays */}
      <style jsx>{`
        .info-panel {
          position: absolute;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(10px);
          color: white;
          padding: 15px;
          border-radius: 12px;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .info-panel h3 {
          font-weight: bold;
          font-size: 18px;
          margin: 0 0 10px 0;
        }

        .info-panel p {
          font-size: 14px;
          margin: 0 0 5px 0;
        }

        .top-left {
          top: 16px;
          left: 16px;
        }

        .bottom-left {
          bottom: 16px;
          left: 16px;
        }
      `}</style>

      <div className="info-panel top-left">
        <h3>{currentPlayer?.name}</h3>
        <p>🌍 Players Online: {otherPlayers.length + 1}</p>
        <p>🎮 Pokemon: {playerPokemonList.length}</p>
      </div>

      <div className="info-panel bottom-left">
        <h3>🎮 Controls</h3>
        <p>🖱️ Click Island: Move to location</p>
        <p>⌨️ WASD / Arrows: Move</p>
        <p>E: Interact with Pokemon</p>
        <p>🖱️ Drag: Rotate Camera</p>
        <p>🖱️ Scroll: Zoom</p>
      </div>

      {/* Battle Modal */}
      {battleMode === 'battle' && encounterPokemon && selectedPokemon && (
        <BattleModal
          wildPokemon={encounterPokemon}
          playerPokemon={selectedPokemon}
          wildHP={wildPokemonHP}
          wildMaxHP={wildPokemonMaxHP}
          playerHP={playerPokemonHP}
          playerMaxHP={playerPokemonMaxHP}
          battleLog={battleLog}
          moves={getPokemonMoves(selectedPokemon)}
          isAttacking={isAttacking}
          onAttack={handleAttack}
          onCatch={handleCatch}
          onFlee={() => {
            setBattleMode(null);
            setEncounterPokemon(null);
            setSelectedPokemon(null);
            setBattleLog([]);
            setShowMoveSelection(false);
          }}
        />
      )}

      {/* Pokemon Selection Modal */}
      {battleMode === 'select' && encounterPokemon && (
        <PokemonSelectionModal
          wildPokemon={encounterPokemon}
          playerPokemonList={playerPokemonList}
          onSelectPokemon={handleBattle}
          onCatch={handleCatch}
          onFlee={() => {
            setBattleMode(null);
            setEncounterPokemon(null);
          }}
        />
      )}
    </div>
  );
}
