import React, { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Network } from "../types"

const ThreeDMap: React.FC<{ networks: Network[] | undefined }> = ({
  networks,
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
    controls.enableDamping = true // 부드러운 감속 효과
    controls.dampingFactor = 0.25
    controls.enableZoom = true

    // 지구본 생성
    const geometry = new THREE.SphereGeometry(5, 32, 32)
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load("/texture/earth.jpg", () => {
      renderer.render(scene, camera) // 텍스처 로드 후 렌더링
    })
    const material = new THREE.MeshBasicMaterial({ map: texture })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // 조명 추가
    const light = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(light)

    // 카메라 위치 설정
    camera.position.z = 15

    // 네트워크 데이터를 기반으로 선 추가
    if (networks) {
      networks.forEach((network) => {
        // migration_traces 추가
        network.migration_traces.forEach((trace) => {
          if (
            network.latitude !== undefined &&
            network.longitude !== undefined &&
            trace.latitude !== undefined &&
            trace.longitude !== undefined
          ) {
            const start = latLongToVector3(
              network.latitude,
              network.longitude,
              5,
            )
            const end = latLongToVector3(trace.latitude, trace.longitude, 5)

            // 곡선 생성
            const mid = new THREE.Vector3(
              (start.x + end.x) / 2,
              (start.y + end.y) / 2 + 2, // 공중으로 붕 뜨는 효과를 위해 y 좌표를 증가시킴
              (start.z + end.z) / 2,
            )
            const curve = new THREE.CatmullRomCurve3([start, mid, end])

            const tubeGeometry = new THREE.TubeGeometry(
              curve,
              64,
              0.1,
              8,
              false,
            )
            const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
            const tube = new THREE.Mesh(tubeGeometry, material)
            scene.add(tube)
          }
        })

        // edges 추가
        network.edges.forEach((edge) => {
          const targetNetwork = networks.find((n) => n.id === edge.targetId)
          if (
            network.latitude !== undefined &&
            network.longitude !== undefined &&
            targetNetwork &&
            targetNetwork.latitude !== undefined &&
            targetNetwork.longitude !== undefined
          ) {
            const start = latLongToVector3(
              network.latitude,
              network.longitude,
              5,
            )
            const end = latLongToVector3(
              targetNetwork.latitude,
              targetNetwork.longitude,
              5,
            )

            // 곡선 생성
            const mid = new THREE.Vector3(
              (start.x + end.x) / 2,
              (start.y + end.y) / 2 + 2, // 공중으로 붕 뜨는 효과를 위해 y 좌표를 증가시킴
              (start.z + end.z) / 2,
            )
            const curve = new THREE.CatmullRomCurve3([start, mid, end])

            const tubeGeometry = new THREE.TubeGeometry(
              curve,
              64,
              0.1,
              8,
              false,
            )
            const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 })
            const tube = new THREE.Mesh(tubeGeometry, material)
            scene.add(tube)
          }
        })
      })
    }

    // 애니메이션 함수
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update() // 애니메이션 루프에서 컨트롤 업데이트
      renderer.render(scene, camera)
    }

    animate()

    // Cleanup
    return () => {
      mountRef.current?.removeChild(renderer.domElement)
    }
  }, [networks])

  return <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
}

export default ThreeDMap
