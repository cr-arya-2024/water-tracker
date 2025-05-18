import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

// Update the component to accept props
const GlassModel = ({ className, onWaterLevelChange }) => {
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const glassRef = useRef(null)
  const frameId = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const splashParticlesRef = useRef(null)
  const [waterLevel, setWaterLevel] = useState(0) // Initial water level 3L
  const [splashActive, setSplashActive] = useState(false)

  // Add useEffect to notify parent component when water level changes
  useEffect(() => {
    if (onWaterLevelChange) {
      onWaterLevelChange(waterLevel);
    }
  }, [waterLevel, onWaterLevelChange]);

  // Function to handle water level increase with splash effect
  const increaseWater = () => {
    if (waterLevel < 5) { // Max capacity is 5L
      setWaterLevel(prev => prev + 1)
      // Create splash effect when water is added
      createSplashEffect()
    }
  }

  // Function to handle water level decrease
  const decreaseWater = () => {
    if (waterLevel > 0) {
      setWaterLevel(prev => prev - 1)
    }
  }

  // Function to create splash effect
  const createSplashEffect = () => {
    if (!sceneRef.current || !glassRef.current) return;
    
    // Remove any existing splash particles
    if (splashParticlesRef.current) {
      sceneRef.current.remove(splashParticlesRef.current)
    }
    
    // Create particle system for splash effect
    const particleCount = 150;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];
    
    // Position particles at the current water level
    const waterSurfaceY = -5 + (waterLevel / 5) * 10;
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within the glass cylinder at water level
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 2.5;
      
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = waterSurfaceY + Math.random() * 0.2; // At water surface
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
      
      // Add velocity vector for each particle
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.2,
        y: Math.random() * 0.3 + 0.1, // Upward velocity
        z: (Math.random() - 0.5) * 0.2
      });
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    // Create water droplet material
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.15,
      transparent: true,
      opacity: 0.8
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    sceneRef.current.add(particles);
    splashParticlesRef.current = {
      mesh: particles,
      velocities: particleVelocities,
      age: 0
    };
    
    setSplashActive(true);
  }

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1
    mountRef.current.appendChild(renderer.domElement)

    // Store references for use in other functions
    sceneRef.current = scene
    rendererRef.current = renderer
    cameraRef.current = camera

    // Glass material with black edges
    // Glass material with increased transparency
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.95,
      transparent: true,
      opacity: 0.3,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1,
      ior: 1.5,
      thickness: 0.5
    })

    // Tapered glass geometry (wider at top)
    const topRadius = 3.5
    const bottomRadius = 2.8
    const glassGeometry = new THREE.CylinderGeometry(topRadius, bottomRadius, 10, 64, 4, true)
    const glass = new THREE.Mesh(glassGeometry, glassMaterial)
    
    // Add black edges
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000, linewidth: 2 })
    const edges = new THREE.EdgesGeometry(glassGeometry)
    const edgeLines = new THREE.LineSegments(edges, edgeMaterial)
    glass.add(edgeLines)

    // Add water (3L)
    // Update water mesh based on water level
    const waterHeight = (waterLevel / 5) * 10 // Scale height based on 5L max capacity
    const waterGeometry = new THREE.CylinderGeometry(bottomRadius - 0.1, bottomRadius - 0.1, waterHeight, 64)
    
    // Calculate water color based on level
    const startColor = new THREE.Color(0x008B00) // Light blue
    const endColor = new THREE.Color(0x008B00) // Dark blue
    const waterColor = startColor.lerp(endColor, waterLevel / 5)
    
    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: waterColor,
      metalness: 0,
      roughness: 0.1,
      transmission: 0.4,
      transparent: true,
      opacity: 0.3,
      clearcoat: 0.3,
      clearcoatRoughness: 0.1
    })
    const water = new THREE.Mesh(waterGeometry, waterMaterial)
    water.position.y = -5 + (waterHeight / 2)
    glass.add(water)

    // Add base with larger bottom radius
    const baseGeometry = new THREE.CylinderGeometry(bottomRadius + 0.3, bottomRadius + 0.5, 0.5, 64)
    const metalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.4,
      roughness: 0.2
    })
    
    const base = new THREE.Mesh(baseGeometry, metalMaterial)
    base.position.y = -5
    glass.add(base)

    // Add volume markings
    const markingMaterial = new THREE.LineBasicMaterial({ color: 0x000000})
    
    for (let i = 1; i <= 5; i++) {
      // Create horizontal line for volume marking
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-3.6, -5 + (i * 2), 0),
        new THREE.Vector3(-3.2, -5 + (i * 2), 0)
      ])
      const line = new THREE.Line(lineGeometry, markingMaterial)
      glass.add(line)

      // Create sprite-based text label with larger size
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')
      canvas.width = 256
      canvas.height = 128
      context.font = 'Bold 96px Arial'
      context.fillStyle = 'black'
      context.textAlign = 'center'
      context.fillText(`${i}L`, 128, 96)

      const texture = new THREE.CanvasTexture(canvas)
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture })
      const sprite = new THREE.Sprite(spriteMaterial)
      
      sprite.position.set(-4.5, -5.2 + (i * 2), 0)
      sprite.scale.set(1.5, 0.75, 1)
      glass.add(sprite)
    }

    scene.add(glass)
    glassRef.current = glass

    // Enhanced lighting for better edge visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambientLight)

    const pointLight1 = new THREE.PointLight(0xffffff, 1)
    pointLight1.position.set(5, 8, 5)
    scene.add(pointLight1)

    const pointLight2 = new THREE.PointLight(0xffffff, 0.8)
    pointLight2.position.set(-5, -3, -5)
    scene.add(pointLight2)

    camera.position.z = 15
    camera.position.y = 2

    // Animation with splash effect
    const animate = () => {
      frameId.current = requestAnimationFrame(animate)
      
      // Animate splash particles if active
      if (splashActive && splashParticlesRef.current) {
        const { mesh, velocities, age } = splashParticlesRef.current
        const positions = mesh.geometry.attributes.position.array
        
        // Update each particle position based on its velocity
        for (let i = 0; i < velocities.length; i++) {
          const idx = i * 3
          
          // Apply velocity
          positions[idx] += velocities[i].x
          positions[idx + 1] += velocities[i].y
          positions[idx + 2] += velocities[i].z
          
          // Apply gravity to y velocity
          velocities[i].y -= 0.01
        }
        
        mesh.geometry.attributes.position.needsUpdate = true
        
        // Fade out particles over time
        mesh.material.opacity = Math.max(0, 0.8 - (splashParticlesRef.current.age * 0.02))
        splashParticlesRef.current.age += 1
        
        // Remove particles after animation completes
        if (splashParticlesRef.current.age > 40) {
          scene.remove(mesh)
          splashParticlesRef.current = null
          setSplashActive(false)
        }
      }
      
      renderer.render(scene, camera)
    }

    // Hover effect
    const handleMouseEnter = () => {
      if (glassRef.current) {
        glassRef.current.rotation.y = THREE.MathUtils.degToRad(30)
        glassRef.current.rotation.z = THREE.MathUtils.degToRad(60)
      }
    }

    const handleMouseLeave = () => {
      if (glassRef.current) {
        glassRef.current.rotation.y = 0
        glassRef.current.rotation.z = 0
      }
    }

    mountRef.current.addEventListener('mouseenter', handleMouseEnter)
    mountRef.current.addEventListener('mouseleave', handleMouseLeave)

    animate()

    // Cleanup
    return () => {
      mountRef.current?.removeEventListener('mouseenter', handleMouseEnter)
      mountRef.current?.removeEventListener('mouseleave', handleMouseLeave)
      cancelAnimationFrame(frameId.current)
      mountRef.current?.removeChild(renderer.domElement)
      scene.remove(glass)
      glassGeometry.dispose()
      baseGeometry.dispose()
      waterGeometry.dispose()
      edges.dispose()
      glassMaterial.dispose()
      waterMaterial.dispose()
      metalMaterial.dispose()
      edgeMaterial.dispose()
      if (splashParticlesRef.current) {
        scene.remove(splashParticlesRef.current.mesh)
        splashParticlesRef.current = null
      }
    }
  }, [waterLevel]) // Re-run effect when water level changes

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="absolute top-0 left-0" />
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex gap-4 mb-4">
        <button
          onClick={increaseWater}
          disabled={waterLevel >= 5}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
        >
          Add Water (+1L)
        </button>
        <button
          onClick={decreaseWater}
          disabled={waterLevel <= 0}
          className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50"
        >
          Remove Water (-1L)
        </button>
      </div>
    </div>
  )
}

export default GlassModel

// Update the volume markings logic
// Update the volume markings material
const volumeMarkings = [];
for (let i = 0; i <= 5; i += 0.5) {
  volumeMarkings.push(
    <mesh
      key={i}
      position={[0, i * 2.4 - 6, 0]}
      rotation={[Math.PI / 2, 0, 0]}
    >
      <ringGeometry args={[2.9, 3, 32]} />
      <meshBasicMaterial color={i % 1 === 0 ? 'black' : 'black'} />
    </mesh>
  );
}

const currentWaterLevel = 3; // Example current water level

// Render volume markings
const renderVolumeMarkings = () => {
  const markings = [];
  for (let i = 0; i <= 5; i += 0.5) { // Assuming markings from 0 to 5 liters
    markings.push(
      <div key={i} className={`volume-marking ${i === currentWaterLevel ? 'text-xl font-extrabold text-blue-500' : 'text-base font-normal text-gray-500'}`}>
        {i}L
      </div>
    );
  }
  return markings;
};

// Use renderVolumeMarkings in your component
<div className="volume-markings-container">
  {renderVolumeMarkings()}
</div>