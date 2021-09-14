export const blocks = [
  {
    id: "purple",
    color: 0x8a2be2,
    vecs: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
  },
  {
    id: "orange",
    color: 0xff8c00,
    vecs: [[0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]],
  },
  {
    id: "pink",
    color: 0xff69b4,
    vecs: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [0, 0, 1]],
  },
  {
    id: "blue",
    color: 0x87cefA,
    vecs: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 0, 1]],
  },
  {
    id: "green",
    color: 0xadff2f,
    vecs: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 1, 0]],
  },
  {
    id: "yellow",
    color: 0xffff00,
    vecs: [[0, 0, 0], [1, 0, 0], [0, 1, 0]],
  },
  {
    id: "red",
    color: 0xff0000,
    vecs: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [2, 0, 0]],
  },
]

const parseShape = s => {
  const vecs = []
  const lines = s.split("\n").filter(l => l.length > 0)
  const indent = Math.min(...lines.map(l => l.match(/^(\s*)/)[1].length))
  let z = 0
  let x = 0
  for (let line of lines) {
    if (line.match(/^\s*-+\s*$/)) {
      z++
      x = 0
      continue
    }
    line = line.substring(indent)
    for (let y = 0; y < line.length; y++) {
      if (line[y] !== " ") {
        vecs.push([x, y, z])
      }
    }
    x++
  }
  return vecs
}

export const targets = [
  {
    blocks: ["purple", "orange", "pink"],
    vecs: parseShape(`\
    ###
    ###
    ###
    ---
    #  
     # 
      #
    `),
  },
  {
    blocks: ["red", "pink", "yellow"],
    vecs: parseShape(`\
    ###
    ---
    ###
    ---
    # #
    ---
    ###
    `),
  },
  {
    blocks: ["blue", "orange", "red"],
    vecs: parseShape(`\
    ###
    ###
    ---
    ###
    ###
    `),
  },
  {
    blocks: ["red", "pink", "yellow"],
    vecs: parseShape(`\
    # #
    ###
    ###
    ---
       
       
    ###
    `),
  },
  {
    blocks: ["orange", "red", "pink"],
    vecs: parseShape(`\
    ####
    ####
    ----
        
    ####
    `),
  },
  {
    blocks: ["blue", "purple", "orange"],
    vecs: parseShape(`\
     ##
    ###
    ## 
    ---
      #
     ##
    ##
    `),
  },
  {
    blocks: ["green", "red", "pink", "yellow"],
    vecs: parseShape(`\
    #
    #
    #
    #
    #
    -
     
    #
    #
    #
    #
    -
     
     
    #
    #
    #
    -
     
     
     
    #
    #
    -
     
     
     
     
    #
    `),
  },
  {
    blocks: ["blue", "purple", "green", "pink"],
    vecs: parseShape(`\
    ####
    ####
    ----
    ####
    ####
    `),
  },
  {
    blocks: ["blue", "orange", "pink", "yellow"],
    vecs: parseShape(`\
    ###
    ###
    ###
    ---
       
    ###
    ###
    `),
  },
  {
    blocks: ["green", "red", "pink", "yellow"],
    vecs: parseShape(`\
    #####
    #####
    -----
         
    #####
    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: [],
    vecs: parseShape(`\

    `),
  },
  {
    blocks: ["blue", "purple", "orange", "green", "red", "pink", "yellow"],
    vecs: parseShape(`\
    ###
    ###
    ###
    ---
    ###
    ###
    ###
    ---
    ###
    ###
    ###
    `),
  },
]
