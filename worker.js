const zip = (v1, v2) =>
  v1.map((v1i, i) => [v1i, v2[i]])

const vecip = (v1, v2) =>
  zip(v1, v2).map(([v1i, v2i]) => v1i * v2i).reduce((p, c) => p + c, 0)

const vecadd = (v1, v2) =>
  zip(v1, v2).map(([v1i, v2i]) => v1i + v2i)

const vecsub = (v1, v2) =>
  zip(v1, v2).map(([v1i, v2i]) => v1i - v2i)

const veceq = (v1, v2) =>
  v1.length === v2.length && zip(v1, v2).every(([v1i, v2i]) => v1i === v2i)

const prod = (A, v) =>
  A.map(Ai => vecip(Ai, v))

const rotate0 = vec2d =>
  vec2d

const rotate90 = vec2d =>
  prod([[0, -1], [1, 0]], vec2d)

const rotate180 = vec2d =>
  prod([[-1, 0], [0, -1]], vec2d)

const rotate270 = vec2d =>
  prod([[0, 1], [-1, 0]], vec2d)

const rotate = {
  0: rotate0,
  1: rotate90,
  2: rotate180,
  3: rotate270,
}

const rotateX = (vecs, n) =>
  vecs.map(vec3d => {
    let yz = rotate[n]([vec3d[1], vec3d[2]])
    return [vec3d[0], yz[0], yz[1]]
  })

const rotateY = (vecs, n) =>
  vecs.map(vec3d => {
    let zx = rotate[n]([vec3d[2], vec3d[0]])
    return [zx[1], vec3d[1], zx[0]]
  })

const rotateZ = (vecs, n) =>
  vecs.map(vec3d => {
    let xy = rotate[n]([vec3d[0], vec3d[1]])
    return [xy[0], xy[1], vec3d[2]]
  })

const blockeq = (b1, b2) =>
  b1.length === b2.length && b1.every(v1 => b2.some(v2 => veceq(v1, v2)))

const blocksub = (b1, b2) =>
  b1.filter(v1 =>
    b2.every(v2 => !veceq(v1, v2))
  )

const blocktranseq = (b1, b2) => {
  const v1 = b1[0]
  for (const v2 of b2) {
    const d = vecsub(v2, v1)
    const b = b1.map(v => vecadd(v, d))
    if (blockeq(b, b2)) {
      return true
    }
  }
  return false
}

const doesSmallerOrderExist = (vertices, threshold) => {
  const areConnected = (v1, v2) =>
    v1.map((v1i, i) => Math.abs(v1i - v2[i])).reduce((p, c) => p + c, 0) === 1

  const componentsAreConnected = (c1, c2) =>
    c1.some(v1 => c2.some(v2 => areConnected(v1, v2)))

  const mergeComponents = (c1, c2) => {
    const c = []
    for (const v of [...c1, ...c2]) {
      if (c.every(w => !veceq(v, w))) {
        c.push(v)
      }
    }
    return c
  }

  const addToSet = (c, cc) => {
    if (cc.every(cmp => !blockeq(c, cmp))) {
      cc.push(c)
    }
  }

  let cc = vertices.map(v => [v])
  while (cc.length > 1) {
    const next = []
    for (const c1 of cc) {
      let found = false
      let c = [...c1]
      for (const c2 of cc) {
        if (blockeq(c1, c2)) {
          continue
        }
        if (componentsAreConnected(c1, c2)) {
          c = mergeComponents(c, c2)
          found = true
        }
      }
      if (!found) {
        return Math.min(...cc.map(c => c.length)) < threshold
      }
      addToSet(c, next)
    }
    cc = next
  }
  return Math.min(...cc.map(c => c.length)) < threshold
}

const resolve = (target, blocks, solution, callback) => {
  if (blocks.length <= 0) {
    callback(solution)
    return
  }

  const rotationCache = []
  const solutions = []
  for (const r1 of [rotateX, rotateY, rotateZ]) {
    for (const n1 of [0, 1, 2, 3]) {
      for (const r2 of [rotateX, rotateY, rotateZ]) {
        for (const n2 of [0, 1, 2, 3]) {
          for (const r3 of [rotateX, rotateY, rotateZ]) {
            for (const n3 of [0, 1, 2, 3]) {
              if (r1 === r2 || r2 === r3 || r3 === r1) {
                continue
              }
              const b = blocks[0]
              const rb = r3(r2(r1(b, n1), n2), n3)
              if (rotationCache.some(c => blocktranseq(c, rb))) {
                continue
              }
              rotationCache.push(rb)

              for (const p of target) {
                const tb = rb.map(v => vecadd(v, p))
                const next = blocksub(target, tb)

                if (target.length - next.length !== tb.length) {
                  continue
                }

                const minOrder = Math.min(...blocks.slice(1).map(b => b.length))
                if (doesSmallerOrderExist(next, minOrder)) {
                  continue
                }

                resolve(next, blocks.slice(1), [...solution, {
                  block: b,
                  r1: r1,
                  n1: n1,
                  r2: r2,
                  n2: n2,
                  r3: r3,
                  n3: n3,
                  p: p,
                }], callback)
              }
            }
          }
        }
      }
    }
  }
}

onmessage = e => {
  const [target, blocks] = e.data
  resolve(target, blocks, [], solution => {
    postMessage(solution.map(b => ({position: b.r3(b.r2(b.r1(b.block, b.n1), b.n2), b.n3).map(v => vecadd(v, b.p))})))
  })
}
