import { blocks, targets } from "./data.js"
import { setUpCanvas, showBlocks, canvasResized, createImageURL } from "./draw.js"

const smallWindowWidthThreshold = 1000

const mainContainer = document.querySelector("#main-container")
const canvasContainer = document.querySelector("#canvas-container")
const canvas = document.querySelector("#canvas")
const targetList = document.querySelector("#target-list")
const targetListItemTemplate = document.querySelector("#tmpl-target-list-item")
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
  if (touchEndX - touchStartX < -50) {
    closeSidebar()
  }
})

window.addEventListener("resize", resizeCanvas)

solutionSelector.addEventListener("change", e => {
  const solution = solutions[parseInt(e.target.value)]
  showBlocks(solution.map(s => ({
    color: s.block.color,
    vecs: s.vecs,
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

        messageContainer.textContent = `${solutions.length} pattern${solutions.length > 1 ? "s" : ""} found`

        // Add to selector
        const o = document.createElement("option")
        o.textContent = solutions.length
        o.setAttribute("value", solutions.length - 1)
        solutionSelector.appendChild(o)

        if (solutions.length === 1) {
          showBlocks(solution.map(s => ({
            color: s.block.color,
            vecs: s.vecs,
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
  targetList.querySelectorAll(".target-list-item").forEach(elm => {
    elm.classList.remove("active")
  })

  if (window.innerWidth < smallWindowWidthThreshold) {
    closeSidebar()
  }

  if (target) {
    targetList.querySelector(`.target-list-item[data-target-id='${target.id}']`).classList.add("active")

    startSearch(target)
  }
}

window.addEventListener("popstate", () => {
  const targetId = new URL(window.location).searchParams.get("target")
  selectTarget(targetId === null ? null : targets[parseInt(targetId) - 1])
})

mainContainer.style.height = window.innerHeight + "px"
sidebar.style.height = window.innerHeight = "px"

targets.forEach(t => {
  const node = targetListItemTemplate.content.cloneNode(true)

  const img = node.querySelector(".target-image")
  img.src = createImageURL(t.vecs)

  const tn = node.querySelector(".target-number")
  tn.textContent = (n => n > 9 ? n : "0" + n)(t.id)

  const item = node.querySelector(".target-list-item")
  item.setAttribute("data-target-id", t.id)
  item.addEventListener("click", () => {
    const url = new URL(window.location)
    url.searchParams.set("target", t.id)
    history.pushState({}, "", url)

    selectTarget(t)
  })

  targetList.appendChild(node)
})

setUpCanvas(canvas)
resizeCanvas()

const targetId = new URL(window.location).searchParams.get("target")
if (targetId) {
  selectTarget(targets[parseInt(targetId) - 1])
}
