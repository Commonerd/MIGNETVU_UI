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

    // 두 점 사이의 곡선을 생성하여 지구본 표면을 따라가는 함수
    const createCurveOnSurface = (
      start: THREE.Vector3,
      end: THREE.Vector3,
      radius: number = 5,
    ) => {
      const elevatedStart = new THREE.Vector3()
        .copy(start)
        .normalize()
        .multiplyScalar(radius * 1)

      const midPoint = new THREE.Vector3()
        .addVectors(start, end)
        .multiplyScalar(0.5)
        .normalize()
        .multiplyScalar(radius * 1.05) // 곡선 높이를 낮춤

      return new THREE.CatmullRomCurve3([elevatedStart, midPoint, end])
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

      // 카메라 초기 위치 설정 (동아시아 중심)
      const initialLat = 35 // 동아시아 중심 위도
      const initialLon = 120 // 동아시아 중심 경도
      const initialPosition = latLongToVector3(initialLat, initialLon, 15) // 카메라 거리 15
      camera.position.set(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z,
      )
      camera.lookAt(0, 0, 0) // 지구본 중심을 바라보도록 설정

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

      // 필터링된 네트워크 표시
      filteredNetworks.forEach((network) => {
        const position = latLongToVector3(
          network.latitude,
          network.longitude,
          5,
        )
        const geometry = new THREE.SphereGeometry(0.03, 16, 16) // 노드 크기를 줄임
        const material = new THREE.MeshBasicMaterial({
          color: network.type === "Migrant" ? 0xff0000 : 0x0000ff, // 이민자면 빨간색, 단체면 파란색
        })
        const marker = new THREE.Mesh(geometry, material)
        marker.position.copy(position)
        scene.add(marker)
      })

      // 필터링된 엣지 표시
      filteredEdges.forEach((edge) => {
        const start = latLongToVector3(edge.startLat, edge.startLon, 5)
        const end = latLongToVector3(edge.endLat, edge.endLon, 5)

        // 곡선 생성
        const curve = createCurveOnSurface(start, end)
        const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.01, 8, false) // 선 굵기를 약간 늘림
        const material = new THREE.MeshBasicMaterial({ color: 0xffa500 }) // 더 선명한 주황색
        const tube = new THREE.Mesh(tubeGeometry, material)
        scene.add(tube)

        // 화살표를 선의 중간중간에 배치
        const arrowCount = 3 // 화살표 개수
        for (let i = 1; i <= arrowCount; i++) {
          const t = i / (arrowCount + 1) // 화살표 위치 비율
          const midPoint = curve.getPoint(t) // 곡선의 특정 지점
          const tangent = curve.getTangent(t).normalize() // 곡선의 특정 지점에서의 방향 벡터
          const arrowLength = 0.2 // 화살표 길이
          const arrowHelper = new THREE.ArrowHelper(
            tangent,
            midPoint,
            arrowLength,
            0xffff00,
          ) // 노란색 화살표
          scene.add(arrowHelper)
        }
      })

      // 마이그레이션 트레이스 렌더링
      filteredTraces.forEach((trace, index) => {
        if (index < filteredTraces.length - 1) {
          const start = latLongToVector3(trace.latitude, trace.longitude, 5)
          const end = latLongToVector3(
            filteredTraces[index + 1].latitude,
            filteredTraces[index + 1].longitude,
            5,
          )

          // 곡선 생성
          const curve = createCurveOnSurface(start, end)

          // 일반 선 스타일 적용
          const tubeGeometry = new THREE.TubeGeometry(curve, 64, 0.01, 8, false) // 선 굵기를 약간 늘림
          const material = new THREE.MeshBasicMaterial({ color: 0xffa500 }) // 더 선명한 주황색
          const tube = new THREE.Mesh(tubeGeometry, material)
          scene.add(tube)

          // 화살표를 선의 중간중간에 배치
          const arrowCount = 3 // 화살표 개수
          for (let i = 1; i <= arrowCount; i++) {
            const t = i / (arrowCount + 1) // 화살표 위치 비율
            const midPoint = curve.getPoint(t) // 곡선의 특정 지점
            const tangent = curve.getTangent(t).normalize() // 곡선의 특정 지점에서의 방향 벡터
            const arrowLength = 0.2 // 화살표 길이
            const arrowHelper = new THREE.ArrowHelper(
              tangent,
              midPoint,
              arrowLength,
              0xffff00,
            ) // 노란색 화살표
            scene.add(arrowHelper)
          }
        }
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
    }, [filteredNetworks, filteredEdges, filteredTraces])

    return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
  },
)

export default ThreeDMap
