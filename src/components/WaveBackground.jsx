import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const WaveBackground = () => {
  const mountRef = useRef(null)
  const frameId = useRef(null)

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    mountRef.current.appendChild(renderer.domElement)

    // Create multiple wave layers with different colors
    const createWave = (colorA, colorB, positionY, speedFactor, amplitude) => {
      const geometry = new THREE.PlaneGeometry(100, 20, 50, 10) // Reduced height to 20
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          colorA: { value: new THREE.Color(colorA) },
          colorB: { value: new THREE.Color(colorB) },
          amplitude: { value: amplitude }
        },
        vertexShader: `
          uniform float time;
          uniform float amplitude;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            vUv = uv;
            
            // Create horizontal wave effect only (no vertical movement)
            float elevation = sin(position.x * 0.5 + time) * amplitude;
            
            vElevation = elevation;
            
            // Apply elevation to z-coordinate only
            vec3 newPosition = position;
            newPosition.z += elevation;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 colorA;
          uniform vec3 colorB;
          varying vec2 vUv;
          varying float vElevation;
          
          void main() {
            // Mix colors based on elevation
            vec3 color = mix(colorA, colorB, vElevation * 0.5 + 0.5);
            gl_FragColor = vec4(color, 0.7); // Added some transparency
          }
        `,
        side: THREE.DoubleSide,
        transparent: true
      })
      
      const wave = new THREE.Mesh(geometry, material)
      wave.rotation.x = -Math.PI / 2 // Rotate to be horizontal
      
      // Position at the bottom of the screen
      wave.position.y = positionY // Y position controls height from bottom
      wave.position.z = -20 // Push back in the scene
      
      scene.add(wave)
      
      return { geometry, material, wave, speedFactor }
    }
    
    // Create multiple wave layers with different colors and positions
    // All positioned at the bottom with different heights
    const waves = [
      createWave(0x0088ff, 0x4400ff, -40, 1.0, 0.5),  // Blue to purple (bottom)
      createWave(0x00ffaa, 0x0088ff, -38, 0.7, 0.3),    // Teal to blue (slightly above)
      createWave(0xff8800, 0xff0088, -36, 0.5, 0.2)     // Orange to pink (top layer)
    ]

    // Position camera to view the bottom area
    camera.position.z = 30
    camera.position.y = -20 // Move camera down to focus on bottom waves

    // Handle window resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      renderer.setSize(width, height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    
    window.addEventListener('resize', handleResize)

    // Animation loop
    const animate = () => {
      frameId.current = requestAnimationFrame(animate)
      
      // Update time uniform for each wave animation with different speeds
      // This only affects horizontal movement, not vertical
      waves.forEach(wave => {
        wave.material.uniforms.time.value += 0.01 * wave.speedFactor
      })
      
      renderer.render(scene, camera)
    }
    
    animate()

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId.current)
      window.removeEventListener('resize', handleResize)
      mountRef.current?.removeChild(renderer.domElement)
      
      // Dispose all geometries and materials
      waves.forEach(wave => {
        wave.geometry.dispose()
        wave.material.dispose()
      })
    }
  }, [])

  return <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />
}

export default WaveBackground