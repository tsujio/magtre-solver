import { blocks, targets } from "./data.js"
import { setUpGraphics, setBlocksFloating, setBlocksStatic, canvasResized, createImageURL } from "./draw.js"

const smallWindowWidthThreshold = 1000

const mainContainer = document.querySelector("#main-container")
const canvasContainer = document.querySelector("#canvas-container")
const canvas = document.querySelector("#canvas")
const title = document.querySelector("#title")
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

title.addEventListener("click", () => {
  const url = new URL(window.location)
  url.search = ""
  document.location = url.toString()
})

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
  setBlocksStatic(solution.map(s => ({
    id: s.block.id,
    rotations: s.rotations,
    shift: s.shift,
  })), {complete: 60})
})

const updateSolutionSelectorItems = () => {
  let i = solutionSelector.querySelectorAll("option").length
  while (i < solutions.length) {
    const o = document.createElement("option")
    o.textContent = i + 1
    o.setAttribute("value", i)
    solutionSelector.appendChild(o)
    i++
  }
}

solutionSelector.addEventListener("click", updateSolutionSelectorItems)

const startSearch = target => {
  if (worker) {
    worker.terminate()
  }

  solutions = []
  solutionSelector.classList.remove("hidden")
  solutionSelector.innerHTML = ""
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

        if (solutions.length === 1) {
          updateSolutionSelectorItems()

          setBlocksStatic(solution.map(s => ({
            id: s.block.id,
            rotations: s.rotations,
            shift: s.shift,
          })), {complete: 60})
        }

        break

      case "end":
        console.log("end")
        loading.classList.add("hidden")
        break
    }
  }

  const targetBlocks = blocks.filter(b => target.blocks.includes(b.id))
  worker.postMessage([target, targetBlocks])
  setBlocksFloating(targetBlocks.map(b => b.id))
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

setUpGraphics(canvas, blocks)
resizeCanvas()

const targetId = new URL(window.location).searchParams.get("target")
if (targetId) {
  selectTarget(targets[parseInt(targetId) - 1])
}
