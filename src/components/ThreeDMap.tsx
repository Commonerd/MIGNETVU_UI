import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Network, FilterOptions } from "../types"

const ThreeDMap: React.FC<{
  networks: Network[] | undefined
  filters: FilterOptions
  filteredNetworks: Network[]
  filteredTraces: any[]
  filteredEdges: any[]
  handleEdgeClick: (edgeId: number) => void
  handleNetworkEdgesToggle: (networkId: number) => void
}> = React.memo(
  ({
    networks,
    filters,
    filteredNetworks,
    filteredTraces,
    filteredEdges,
    handleEdgeClick,
    handleNetworkEdgesToggle,
  }) => {
    const mountRef = useRef<HTMLDivElement | null>(null)

    // 위도와 경도를 3D 좌표로 변환하는 함수
    const latLongToVector3 = (lat: number, lon: number, radius: number = 5) => {
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lon + 180) * (Math.PI / 180)

      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const y = radius * Math.cos(phi)
      const z = radius * Math.sin(phi) * Math.sin(theta)

      return new THREE.Vector3(x, y, z)
    }

    useEffect(() => {
      if (!mountRef.current) return

      // Scene, Camera, Renderer 설정
      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
      )
      const renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      mountRef.current.appendChild(renderer.domElement)

      // OrbitControls 설정
      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true
      controls.dampingFactor = 0.25
      controls.enableZoom = true

      // 지구본 생성
      const geometry = new THREE.SphereGeometry(5, 32, 32)
      const textureLoader = new THREE.TextureLoader()
      const texture = textureLoader.load("/texture/earth.jpg", () => {
        renderer.render(scene, camera)
      })
      const material = new THREE.MeshBasicMaterial({ map: texture })
      const sphere = new THREE.Mesh(geometry, material)
      scene.add(sphere)

      // 조명 추가
      const light = new THREE.AmbientLight(0xffffff, 0.5)
      scene.add(light)

      // 카메라 위치 설정
      camera.position.z = 15

      // 필터링된 네트워크 표시
      filteredNetworks.forEach((network) => {
        const position = latLongToVector3(
          network.latitude,
          network.longitude,
          5,
        )
        const geometry = new THREE.SphereGeometry(0.1, 16, 16)
        const material = new THREE.MeshBasicMaterial({ color: 0x0000ff })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        scene.add(marker)
      })

      // 필터링된 엣지 표시
      filteredEdges.forEach((edge) => {
        const start = latLongToVector3(edge.startLat, edge.startLon, 5)
        const end = latLongToVector3(edge.endLat, edge.endLon, 5)

        const curve = new THREE.CatmullRomCurve3([start, end])
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.02, 8, false)
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
        const tube = new THREE.Mesh(tubeGeometry, material)
        scene.add(tube)
      })

      // 애니메이션 함수
      const animate = () => {
        requestAnimationFrame(animate)
        controls.update()
        renderer.render(scene, camera)
      }

      animate()

      // Cleanup
      return () => {
        mountRef.current?.removeChild(renderer.domElement)
      }
    }, [filteredNetworks, filteredEdges, filteredTraces]) // 의존성 배열 확인

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
  },
)

export default ThreeDMap
