import * as THREE from "./three.js/build/three.module.js"
import { TrackballControls } from "./three.js/examples/jsm/controls/TrackballControls.js"
import { RoundedBoxGeometry } from "./three.js/examples/jsm/geometries/RoundedBoxGeometry.js"

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
scene.add(camera)

const light = new THREE.DirectionalLight()
camera.add(light)

const boxGeometry = new RoundedBoxGeometry(1, 1, 1, 1)

let renderer
let controls

export const setUpCanvas = (canvas) => {
  renderer = new THREE.WebGLRenderer({canvas: canvas})
  renderer.setSize(canvas.width, canvas.height)
  controls = new TrackballControls(camera, renderer.domElement)

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()
    renderer.render(scene, camera)
  }
  animate()
}

let container
export const showBlocks = blocks => {
  if (container) {
    scene.remove(container)
    for (const c of container.children) {
      c.material.dispose()
    }
  }
  container = new THREE.Object3D()
  blocks.forEach(b => {
    const material = new THREE.MeshLambertMaterial({color: b.color})
    for (const v of b.vecs) {
      const box = new THREE.Mesh(boxGeometry, material)
      box.position.set(...v)
      container.add(box)
    }
  })

  const c = new THREE.Box3().setFromObject(container).getCenter(new THREE.Vector3())
  container.position.set(-c.x, -c.y, -c.z)

  scene.add(container)

  controls.reset()
  camera.position.set(-7, -7, 7)
  camera.up.set(1, 1, 0)
  camera.lookAt(0, 0, 0)
}

export const canvasResized = canvas => {
  camera.aspect = canvas.width / canvas.height
  camera.updateProjectionMatrix()
  renderer.setSize(canvas.width, canvas.height)
}

export const createImageURL = (() => {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(75, 400 / 300, 0.1, 1000)
  camera.position.set(-4, -4, 4)
  camera.up.set(1, 1, 0)
  camera.lookAt(0, 0, 0)
  scene.add(camera)
  const light = new THREE.DirectionalLight()
  camera.add(light)
  const renderer = new THREE.WebGLRenderer()
  renderer.setSize(400, 300)
  const material = new THREE.MeshLambertMaterial()

  let container
  return vecs => {
    if (container) {
      scene.remove(container)
    }
    container = new THREE.Object3D()
    vecs.forEach(v => {
      const box = new THREE.Mesh(boxGeometry, material)
      box.position.set(...v)
      container.add(box)
    })
    const c = new THREE.Box3().setFromObject(container).getCenter(new THREE.Vector3())
    container.position.set(-c.x, -c.y, -c.z)
    scene.add(container)
    renderer.render(scene, camera)
    return renderer.domElement.toDataURL()
  }
})()
