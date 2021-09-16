import * as THREE from "./three.js/build/three.module.js"
import { TrackballControls } from "./three.js/examples/jsm/controls/TrackballControls.js"
import { RoundedBoxGeometry } from "./three.js/examples/jsm/geometries/RoundedBoxGeometry.js"

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
scene.add(camera)

const light = new THREE.DirectionalLight()
camera.add(light)

const boxGeometry = new RoundedBoxGeometry(1, 1, 1, 1)

const container = new THREE.Object3D()

const blockObjects = {}

let renderer
let controls

const setCameraAtNormalPosition = () => {
  controls.reset()
  camera.position.set(-7, -7, 7)
  camera.up.set(1, 1, 0)
  camera.lookAt(0, 0, 0)
}

export const setUpGraphics = (canvas, blocks) => {
  renderer = new THREE.WebGLRenderer({canvas: canvas})
  renderer.setSize(canvas.width, canvas.height)
  controls = new TrackballControls(camera, renderer.domElement)

  blocks.forEach(b => {
    const material = new THREE.MeshLambertMaterial({color: b.color})
    const blk = new THREE.Object3D()
    for (const v of b.vecs) {
      const box = new THREE.Mesh(boxGeometry, material)
      box.position.set(...v)
      blk.add(box)
    }

    const blockContainer = new THREE.Object3D()
    blockContainer.add(blk)

    blockObjects[b.id] = {
      object: blk,
      container: blockContainer,
      updateFunc: null,
    }

    container.add(blockContainer)
  })

  setBlocksFloating(blocks.map(b => b.id))

  scene.add(container)

  setCameraAtNormalPosition()

  const animate = () => {
    requestAnimationFrame(animate)
    controls.update()

    for (const [id, block] of Object.entries(blockObjects)) {
      if (block.updateFunc) {
        block.updateFunc()
      }
    }

    renderer.render(scene, camera)
  }
  animate()
}

export const setBlocksFloating = blockIds => {
  for (const [id, block] of Object.entries(blockObjects)) {
    const r = 3 + 3 * Math.random()
    const rotationAxis = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
    const position = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).setLength(r)
    const shift = position.sub(block.object.position)

    let i = 0
    const delay = 60
    block.updateFunc = () => {
      if (i <= delay) {
        block.object.position.add(shift.clone().divideScalar(delay))
        i++
      }

      block.container.rotateOnWorldAxis(rotationAxis, 0.01)
      block.object.rotateOnWorldAxis(rotationAxis, 0.01)
    }

    container.remove(block.container)
    if (blockIds.includes(id)) {
      container.add(block.container)
    }
  }
}

export const setBlocksStatic = (blockPlacements, delay) => {
  // Collect placement parameters
  const placementParameters = {}
  for (const [id, block] of Object.entries(blockObjects)) {
    container.remove(block.container)
    const p = blockPlacements.find(p => p.id === id)
    if (p) {
      container.add(block.container)

      const shiftTarget = new THREE.Vector3(...p.shift)
      const rotationTarget = new THREE.Vector3()
      let order = ""
      p.rotations.forEach(r => {
        if (r[0] === "x") { order = "X" + order; rotationTarget.x = r[1] * Math.PI / 2 }
        if (r[0] === "y") { order = "Y" + order; rotationTarget.y = r[1] * Math.PI / 2 }
        if (r[0] === "z") { order = "Z" + order; rotationTarget.z = r[1] * Math.PI / 2 }
      })

      placementParameters[id] = {
        before: {
          containerPosition: block.container.position.clone(),
          containerRotation: block.container.rotation.clone(),
          objectPosition: block.object.position.clone(),
          objectRotation: block.object.rotation.clone(),
        },
        after: {
          containerPosition: new THREE.Vector3(),
          containerRotation: new THREE.Euler(),
          objectPosition: shiftTarget,
          objectRotation: new THREE.Euler().setFromVector3(rotationTarget, order),
        },
      }
    }
  }

  // Compute container position to set
  for (const [id, p] of Object.entries(placementParameters)) {
    const block = blockObjects[id]
    block.container.position.copy(p.after.containerPosition)
    block.container.rotation.copy(p.after.containerRotation)
    block.object.position.copy(p.after.objectPosition)
    block.object.rotation.copy(p.after.objectRotation)
  }
  const containerPositionTargetDelta = new THREE.Box3().setFromObject(container).getCenter(new THREE.Vector3())

  for (const [id, p] of Object.entries(placementParameters)) {
    // Revert positions and rotations
    const block = blockObjects[id]
    block.container.position.copy(p.before.containerPosition)
    block.container.rotation.copy(p.before.containerRotation)
    block.object.position.copy(p.before.objectPosition)
    block.object.rotation.copy(p.before.objectRotation)

    // Set updateFunc
    let i = 0
    const shift = p.after.objectPosition.clone().sub(block.object.position)
    const rotation = p.after.objectRotation.toVector3().clone().sub(block.object.rotation.toVector3())
    block.updateFunc = () => {
      if (i <= delay.complete) {
        block.container.position.setLength(block.container.position.length() / 2)
        const crv = block.container.rotation.toVector3()
        block.container.rotation.setFromVector3(crv.setLength(crv.length() / 2))

        block.object.position.add(shift.clone().divideScalar(delay.complete))
        const brv = block.object.rotation.toVector3()
        block.object.rotation.setFromVector3(brv.add(rotation.clone().divideScalar(delay.complete)), p.after.objectRotation.order)

        if (id === Object.keys(placementParameters).sort()[0]) {
          container.position.sub(containerPositionTargetDelta.clone().divideScalar(delay.complete))
        }

        if (i === delay.complete) {
          block.container.position.copy(p.after.containerPosition)
          block.container.rotation.copy(p.after.containerRotation)
          block.object.position.copy(p.after.objectPosition)
          block.object.rotation.copy(p.after.objectRotation)
        }

        i++
      }
    }
  }

  setCameraAtNormalPosition()
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
