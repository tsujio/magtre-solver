const colors = [0x8a2be2, 0xff8c00, 0xff69b4, 0x87cefA, 0xadff2f, 0xffff00, 0xff0000]

const blocks = [
  [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
  [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1]],
  [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 0, 1]],
  [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]],
  [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
  [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0]],
]

const targets = {}

targets[7] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 2, 0], [1, 2, 0], [2, 2, 0],
  [0, 0, 1], [1, 0, 1], [2, 0, 1],
  [0, 1, 1], [1, 1, 1], [2, 1, 1],
  [0, 2, 1], [1, 2, 1], [2, 2, 1],
  [0, 0, 2], [1, 0, 2], [2, 0, 2],
  [0, 1, 2], [1, 1, 2], [2, 1, 2],
  [0, 2, 2], [1, 2, 2], [2, 2, 2],
]

targets[6] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 2, 0], [1, 2, 0], [2, 2, 0],
  [0, 0, 1], [1, 0, 1], [2, 0, 1],
  [0, 1, 1], [1, 1, 1],
  [0, 2, 1], [1, 2, 1], [2, 2, 1],
  [0, 0, 2], [1, 0, 2],
  [0, 1, 2], [1, 1, 2],
  [0, 2, 2], [1, 2, 2],
]

targets[5] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 2, 0], [1, 2, 0], [2, 2, 0],
  [0, 0, 1], [2, 0, 1],
  [0, 1, 1], [1, 1, 1],
  [0, 2, 1], [1, 2, 1], [2, 2, 1],
  [0, 0, 2],
  [0, 1, 2],
  [0, 2, 2], [1, 2, 2],
]

targets[4] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 2, 0], [1, 2, 0], [2, 2, 0],
  [0, 0, 1], [2, 0, 1],
  [1, 1, 1],
  [1, 2, 1], [2, 2, 1],
  [0, 2, 2], [1, 2, 2],
]

targets[3] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 2, 0], [1, 2, 0], [2, 2, 0],
  [0, 0, 1], [0, 2, 1],
  [2, 2, 1],
]

targets[2] = [
  [0, 0, 0], [1, 0, 0], [2, 0, 0],
  [0, 1, 0], [1, 1, 0], [2, 1, 0],
  [0, 0, 1], [2, 0, 1],
]

targets[1] = [
  [0, 0, 0], [1, 0, 0],
  [1, 1, 0],
  [1, 1, 1],
]

targets[0] = [
]

const target = targets[blocks.length]

import * as THREE from "./three.js/build/three.module.js"
import { TrackballControls } from "./three.js/examples/jsm/controls/TrackballControls.js"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 10
const light = new THREE.DirectionalLight()
camera.add(light)
scene.add(camera)
const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
const controls = new TrackballControls(camera, renderer.domElement)
const geometry = new THREE.BoxGeometry()
const animate = () => {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()

let obj
const showSolution = solution => {
  if (obj) {
    scene.remove(obj)
  }
  obj = new THREE.Object3D()
  solution.forEach((b, i) => {
    const material = new THREE.MeshLambertMaterial({color: colors[i]})
    for (const v of b.position) {
      const box = new THREE.Mesh(geometry, material)
      box.position.set(v[0], v[1], v[2])
      obj.add(box)
    }
  })
  scene.add(obj)
}

// Solution selector
const solutions = []
const selector = document.querySelector("#solusions")
selector.addEventListener("change", e => {
  const solution = solutions[parseInt(e.target.value)]
  showSolution(solution)
})

// Start worker
const start = new Date()
const worker = new Worker("./worker.js")
worker.onerror = e => console.log(e)
worker.postMessage([target, blocks])
worker.onmessage = e => {
  const solution = e.data

  console.log("found", (new Date() - start) / 1000, solution)

  solutions.push(solution)

  // Add to selector
  const o = document.createElement("option")
  o.textContent = solutions.length - 1
  o.setAttribute("value", solutions.length - 1)
  selector.appendChild(o) 

  if (solutions.length === 1) {
    showSolution(solution)
  }
}
