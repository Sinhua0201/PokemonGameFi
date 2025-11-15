'use client'

import { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Sky, Environment, Text, Html } from '@react-three/drei'
import * as THREE from 'three'

interface Pokemon {
  id: string
  name: string
  position: [number, number, number]
  sprite: string
}

interface Explore3DSceneProps {
  onEncounter: (pokemon: any) => void
  onBack: () => void
}

// 地面组件
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#4ade80" />
    </mesh>
  )
}

// 树木组件
function Tree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* 树干 */}
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 2, 8]} />
        <meshStandardMaterial color="#8b4513" />
      </mesh>
      {/* 树冠 */}
      <mesh position={[0, 3, 0]} castShadow>
        <sphereGeometry args={[1.5, 8, 8]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
    </group>
  )
}

// 石头组件
function Rock({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <dodecahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial color="#6b7280" roughness={0.8} />
    </mesh>
  )
}

// 花朵组件
function Flower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial color="#f472b6" emissive="#f472b6" emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 8]} />
        <meshStandardMaterial color="#22c55e" />
      </mesh>
    </group>
  )
}

// 玩家角色
function Player({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group position={position}>
      {/* 身体 */}
      <mesh ref={meshRef} position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* 头部 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" />
      </mesh>
    </group>
  )
}

// Pokemon 精灵 - 使用 GIF 图片
function PokemonSprite({ pokemon, onClick }: { pokemon: Pokemon; onClick: () => void }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = pokemon.position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  return (
    <group ref={groupRef} position={pokemon.position}>
      {/* Pokemon GIF 图片 */}
      <Html
        center
        distanceFactor={10}
        style={{
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={onClick}
      >
        <img
          src={pokemon.sprite}
          alt={pokemon.name}
          className="pixelated"
          style={{
            width: '96px',
            height: '96px',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
          }}
        />
      </Html>
      
      {/* 发光底座 */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.8, 32]} />
        <meshBasicMaterial 
          color="#ef4444" 
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

// 3D 场景内容
function SceneContent({ 
  playerPos, 
  pokemons, 
  onPokemonClick 
}: { 
  playerPos: [number, number, number]
  pokemons: Pokemon[]
  onPokemonClick: (pokemon: Pokemon) => void
}) {
  return (
    <>
      {/* 光照 */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* 天空 */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />
      
      {/* 地面 */}
      <Ground />
      
      {/* 树木 */}
      <Tree position={[-5, 0, -5]} />
      <Tree position={[8, 0, -3]} />
      <Tree position={[-7, 0, 8]} />
      <Tree position={[5, 0, 10]} />
      <Tree position={[12, 0, 5]} />
      <Tree position={[-10, 0, -10]} />
      <Tree position={[15, 0, -8]} />
      <Tree position={[-12, 0, 12]} />
      <Tree position={[10, 0, 15]} />
      <Tree position={[-15, 0, 0]} />
      <Tree position={[0, 0, -15]} />
      <Tree position={[18, 0, 10]} />
      
      {/* 石头 */}
      <Rock position={[-3, 0.3, -2]} />
      <Rock position={[6, 0.3, 4]} />
      <Rock position={[-8, 0.3, 5]} />
      <Rock position={[11, 0.3, -6]} />
      <Rock position={[-4, 0.3, 12]} />
      <Rock position={[14, 0.3, 8]} />
      
      {/* 花朵 */}
      <Flower position={[-2, 0, 3]} />
      <Flower position={[4, 0, -1]} />
      <Flower position={[-6, 0, -4]} />
      <Flower position={[9, 0, 7]} />
      <Flower position={[-9, 0, 9]} />
      <Flower position={[13, 0, -2]} />
      <Flower position={[-11, 0, 6]} />
      <Flower position={[7, 0, 12]} />
      
      {/* 玩家 */}
      <Player position={playerPos} />
      
      {/* Pokemon */}
      {pokemons.map((pokemon) => (
        <PokemonSprite
          key={pokemon.id}
          pokemon={pokemon}
          onClick={() => onPokemonClick(pokemon)}
        />
      ))}
      
      {/* 相机控制 */}
      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2.5}
      />
    </>
  )
}

export default function Explore3DScene({ onEncounter, onBack }: Explore3DSceneProps) {
  const [playerPos, setPlayerPos] = useState<[number, number, number]>([0, 0, 0])
  const [pokemons, setPokemons] = useState<Pokemon[]>([])
  const [steps, setSteps] = useState(0)

  // 生成随机 Pokemon
  useEffect(() => {
    const generatePokemons = () => {
      const newPokemons: Pokemon[] = []
      const pokemonData = [
        { id: 25, name: '皮卡丘' },
        { id: 4, name: '小火龙' },
        { id: 7, name: '杰尼龟' },
        { id: 1, name: '妙蛙种子' },
        { id: 133, name: '伊布' },
        { id: 39, name: '胖丁' },
        { id: 54, name: '可达鸭' },
        { id: 150, name: '超梦' },
      ]
      
      for (let i = 0; i < 8; i++) {
        const data = pokemonData[i]
        newPokemons.push({
          id: `pokemon-${data.id}`,
          name: data.name,
          position: [
            (Math.random() - 0.5) * 30,
            1,
            (Math.random() - 0.5) * 30
          ],
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${data.id}.gif`
        })
      }
      
      setPokemons(newPokemons)
    }
    
    generatePokemons()
  }, [])

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 0.5
      
      setPlayerPos((prev) => {
        let [x, y, z] = prev
        
        switch (e.key.toLowerCase()) {
          case 'w':
          case 'arrowup':
            z -= speed
            break
          case 's':
          case 'arrowdown':
            z += speed
            break
          case 'a':
          case 'arrowleft':
            x -= speed
            break
          case 'd':
          case 'arrowright':
            x += speed
            break
        }
        
        // 限制移动范围
        x = Math.max(-15, Math.min(15, x))
        z = Math.max(-15, Math.min(15, z))
        
        return [x, y, z]
      })
      
      setSteps((prev) => prev + 1)
      
      // 随机遇敌
      if (Math.random() < 0.03) {
        const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)]
        if (randomPokemon) {
          const pokemonId = parseInt(randomPokemon.id.split('-')[1])
          onEncounter({
            id: pokemonId,
            name: randomPokemon.name,
            level: Math.floor(Math.random() * 20) + 5
          })
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [pokemons, onEncounter])

  const handlePokemonClick = (pokemon: Pokemon) => {
    const pokemonId = parseInt(pokemon.id.split('-')[1])
    onEncounter({
      id: pokemonId,
      name: pokemon.name,
      level: Math.floor(Math.random() * 20) + 5
    })
  }

  return (
    <div className="relative w-full h-screen">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 8, 12], fov: 60 }}
        className="bg-gradient-to-b from-sky-400 to-sky-200"
      >
        <SceneContent
          playerPos={playerPos}
          pokemons={pokemons}
          onPokemonClick={handlePokemonClick}
        />
      </Canvas>
      
      {/* UI 覆盖层 */}
      <div className="absolute top-4 left-4 bg-black/70 text-white p-4 rounded-lg">
        <div className="text-sm space-y-1">
          <div>🎮 使用 WASD 或方向键移动</div>
          <div>🖱️ 点击 Pokemon 遭遇战</div>
          <div>📍 步数: {steps}</div>
          <div>📍 位置: ({playerPos[0].toFixed(1)}, {playerPos[2].toFixed(1)})</div>
        </div>
      </div>
      
      {/* 返回按钮 */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onBack}
          className="game-button text-lg px-6 py-3"
        >
          🏠 返回游戏
        </button>
      </div>
      
      {/* Pokemon 列表 */}
      <div className="absolute bottom-4 left-4 bg-black/70 text-white p-4 rounded-lg max-w-xs">
        <div className="text-sm font-bold mb-2">附近的 Pokemon:</div>
        <div className="space-y-1 text-xs">
          {pokemons.map((pokemon) => (
            <div key={pokemon.id} className="flex items-center gap-2">
              <span className="text-red-400">●</span>
              <span>{pokemon.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
