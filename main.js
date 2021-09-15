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
const loading = document.querySelector("#loading")

let solutions = []
let worker

const resizeCanvas = () => {
  canvas.width = canvasContainer.clientWidth
  canvas.height = canvasContainer.clientHeight
  canvasResized(canvas)
}

const openSidebar = () => {
  sidebar.classList.remove("close")
  mainContainer.classList.remove("full")
  setTimeout(resizeCanvas, 100)
  setTimeout(resizeCanvas, 150)
}

const closeSidebar = () => {
  sidebar.classList.add("close")
  mainContainer.classList.add("full")
  setTimeout(resizeCanvas, 100)
  setTimeout(resizeCanvas, 150)
}

sidebarCloseButton.addEventListener("click", closeSidebar)
sidebarOpenButton.addEventListener("click", openSidebar)

let touchStartX, touchEndX
sidebar.addEventListener("touchstart", e => {
  touchStartX = touchEndX = e.touches[0].pageX
})
sidebar.addEventListener("touchmove", e => {
  touchEndX = e.touches[0].pageX
})
sidebar.addEventListener("touchend", () => {
  if (touchEndX - touchStartX < -30) {
    closeSidebar()
  }
})

window.addEventListener("resize", resizeCanvas)

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
  solutionSelector.classList.remove("hidden")
  solutionSelector.innerHTML = ""
  showBlocks([])
  messageContainer.textContent = ""
  loading.classList.remove("hidden")

  const start = new Date()
  console.log("started", start, target)

  worker = new Worker("./worker.js")
  worker.onerror = e => console.log(e)
  worker.onmessage = e => {
    switch (e.data.message) {
      case "log":
        console.log(...e.data.body)
        break

      case "found":
        const solution = e.data.solution

        console.log("found", (new Date() - start) / 1000, solution)

        solutions.push(solution)

        messageContainer.textContent = `${solutions.length} solution${solutions.length > 1 ? "s" : ""} found`

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
        loading.classList.add("hidden")
        break
    }
  }

  worker.postMessage([target, blocks.filter(b => target.blocks.includes(b.id))])
}

const selectTarget = target => {
  if (target) {
    startSearch(target)
  }
}

window.addEventListener("popstate", () => {
  const targetId = new URL(window.location).searchParams.get("target")
  selectTarget(targetId === null ? null : targets[parseInt(targetId) - 1])
})

mainContainer.style.height = window.innerHeight + "px"
sidebar.style.height = window.innerHeight = "px"

targets.forEach((t, i) => {
  const img = document.createElement("img")
  img.className = "target-image"
  img.src = createImageURL(t.vecs)
  img.addEventListener("click", () => {
    const url = new URL(window.location)
    url.searchParams.set("target", i + 1)
    history.pushState({}, "", url)

    selectTarget(t)
  })
  targetList.appendChild(img)
})

setUpCanvas(canvas)
resizeCanvas()

const targetId = new URL(window.location).searchParams.get("target")
if (targetId) {
  selectTarget(targets[parseInt(targetId) - 1])
}
