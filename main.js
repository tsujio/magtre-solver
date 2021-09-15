import { blocks, targets } from "./data.js"
import { setUpCanvas, showBlocks, canvasResized, createImageURL } from "./draw.js"

const mainContainer = document.querySelector("#main-container")
const canvasContainer = document.querySelector("#canvas-container")
const canvas = document.querySelector("#canvas")
const targetList = document.querySelector("#target-list")
const sidebar = document.querySelector("#sidebar")
const sidebarOpenButton = document.querySelector("#sidebar-open-button")
const sidebarCloseButton = document.querySelector("#sidebar-close-button")
const solutionSelector = document.querySelector("#solution-selector")
const messageContainer = document.querySelector("#message")

let solutions = []
let worker

const resizeCanvas = () => {
  canvas.width = canvasContainer.clientWidth
  canvas.height = canvasContainer.clientHeight
  canvasResized(canvas)
}

window.addEventListener("resize", resizeCanvas)

sidebarCloseButton.addEventListener("click", () => {
  sidebar.classList.add("close")
  mainContainer.classList.add("full")
  setTimeout(resizeCanvas, 100)
})

sidebarOpenButton.addEventListener("click", () => {
  sidebar.classList.remove("close")
  mainContainer.classList.remove("full")
  setTimeout(resizeCanvas, 100)
})

solutionSelector.addEventListener("change", e => {
  const solution = solutions[parseInt(e.target.value)]
  showBlocks(solution.map(s => ({
    color: s.block.color,
    vecs: s.position,
  })))
})

const startSearch = target => {
  if (worker) {
    worker.terminate()
  }

  solutions = []
  solutionSelector.innerHTML = ""
  showBlocks([])

  messageContainer.textContent = "Searching solutions..."

  const start = new Date()
  console.log("started", start, target)

  worker = new Worker("./worker.js")
  worker.onerror = e => console.log(e)
  worker.onmessage = e => {
    switch (e.data.message) {
      case "found":
        const solution = e.data.solution

        console.log("found", (new Date() - start) / 1000, solution)

        solutions.push(solution)

        messageContainer.textContent = `Searching solutions... (${solutions.length} solution${solutions.length > 1 ? "s" : ""} found)`

        // Add to selector
        const o = document.createElement("option")
        o.textContent = solutions.length
        o.setAttribute("value", solutions.length - 1)
        solutionSelector.appendChild(o)

        if (solutions.length === 1) {
          showBlocks(solution.map(s => ({
            color: s.block.color,
            vecs: s.position,
          })))
        }

        break

      case "end":
        console.log("end")
        messageContainer.textContent = `${solutions.length} solution${solutions.length > 1 ? "s" : ""} found`
        break
    }
  }

  worker.postMessage([target, blocks.filter(b => target.blocks.includes(b.id))])
}

targets.forEach((t, i) => {
  const img = document.createElement("img")
  img.className = "target-image"
  img.src = createImageURL(t.vecs)
  img.addEventListener("click", () => {
    startSearch(t)
  })
  targetList.appendChild(img)
})

setUpCanvas(canvas)
resizeCanvas()
