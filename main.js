import { blocks, targets } from "./data.js"
import { setUpCanvas, showBlocks, canvasResized, createImageURL } from "./draw.js"

const canvasContainer = document.querySelector("#canvas-container")
const canvas = document.querySelector("#canvas")
const targetList = document.querySelector("#target-list")
const sidebar = document.querySelector("#sidebar")
const sidebarOpenButton = document.querySelector("#sidebar-open-button")
const sidebarCloseButton = document.querySelector("#sidebar-close-button")

const resizeCanvas = () => {
  const container = document.querySelector("#canvas-container")
  canvas.width = container.clientWidth
  canvas.height = container.clientHeight
  canvasResized(canvas)
}

window.addEventListener("resize", resizeCanvas)

targets.forEach((t, i) => {
  const img = document.createElement("img")
  img.className = "target-image"
  img.src = createImageURL(t.vecs)
  img.addEventListener("click", () => {
    startSearch(t)
  })
  targetList.appendChild(img)
})

sidebarCloseButton.addEventListener("click", () => {
  sidebar.classList.add("close")
  canvasContainer.classList.add("full")
  setTimeout(resizeCanvas, 100)
})

sidebarOpenButton.addEventListener("click", () => {
  sidebar.classList.remove("close")
  canvasContainer.classList.remove("full")
  setTimeout(resizeCanvas, 100)
})

setUpCanvas(canvas)
resizeCanvas()

let worker
const startSearch = target => {
  if (worker) {
    worker.terminate()
  }

  solutions.splice(0)
  selector.innerHTML = ""

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

        // Add to selector
        const o = document.createElement("option")
        o.textContent = solutions.length - 1
        o.setAttribute("value", solutions.length - 1)
        selector.appendChild(o)

        if (solutions.length === 1) {
          showBlocks(solution.map(s => ({
            color: s.block.color,
            vecs: s.position,
          })))
        }

        break

      case "end":
        console.log("end")
        break
    }
  }

  worker.postMessage([target, blocks.filter(b => target.blocks.includes(b.id))])
}

// Solution selector
const solutions = []
const selector = document.querySelector("#solusions")
selector.addEventListener("change", e => {
  const solution = solutions[parseInt(e.target.value)]
  showBlocks(solution.map(s => ({
    color: s.block.color,
    vecs: s.position,
  })))
})
