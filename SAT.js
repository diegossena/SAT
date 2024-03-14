/**
 * SQRT(x^2 + y^2)
 * @param {number[]} vector
 */
function vec2_magnitude(vector) {
  return Math.sqrt(vector[0] * vector[0] + vector[1] * vector[1])
}
/**
 * @param {number[]} vector
 */
function vec2_normalize(vector) {
  const magnitude = vec2_magnitude(vector)
  return [
    vector[0] * 1 / magnitude,
    vector[1] * 1 / magnitude,
  ]
}
/**
 * @param {number[]} vector
 */
function vec2_perp(vector) {
  return [-vector[1], vector[0]]
}
/**
 * @param {number[]} v1 
 * @param {number[]} v2 
 */
function vec2_dot(v1, v2) {
  return v1[0] * v2[0] + v1[1] * v2[1]
}
/**
 * @param {number[]} v1 
 * @param {number[]} v2 
 */
function vec2_sub(v1, v2) {
  return [v1[0] - v2[0], v1[1] - v2[1]]
}
class Polygon {
  /**
   * @param {number[][]} vertices 
   * @param {CanvasRenderingContext2D} ctx
   */
  constructor(vertices, ctx) {
    this.vertices = vertices
    this.ctx = ctx
  }
  draw() {
    this.ctx.beginPath()
    this.ctx.moveTo(...this.vertices[0])
    for (let i = 1; i < this.vertices.length; i++) {
      this.ctx.lineTo(...this.vertices[i])
    }
    this.ctx.fill()
  }
  /**
   * @param {number} x 
   * @param {number} y
   */
  move(x, y) {
    for (let i = 0; i < this.vertices.length; i++) {
      this.vertices[i][0] += x
      this.vertices[i][1] += y
    }
  }
}
/**
 * @param {Polygon} polygon
 * @param {number[]} axis
 */
function polygon_project(polygon, axis) {
  let min = vec2_dot(axis, polygon.vertices[0])
  let max = min
  for (let i = 1; i < polygon.vertices.length; i++) {
    const vert = polygon.vertices[i]
    const dot = vec2_dot(axis, vert)
    min = Math.min(min, dot)
    max = Math.max(max, dot)
  }
  return [min, max]
}
/**
 * @param {Polygon} polygon
 */
function polygon_axes(polygon) {
  return polygon.vertices.map((p1, i, vertices) => {
    const p2 = vertices[(i + 1) % vertices.length]
    const edge = vec2_sub(p2, p1)
    return vec2_normalize(vec2_perp(edge))
  })
}
/**
 * Minimum Translation Vector
 * @param {Polygon} polygon_a
 * @param {Polygon} polygon_b
 */
function sat_mtv(polygon_a, polygon_b) {
  let overlap = Number.MAX_VALUE
  let distance = 0
  let smallest = []
  for (const axis of polygon_axes(polygon_a)) {
    const p1 = polygon_project(polygon_a, axis)
    const p2 = polygon_project(polygon_b, axis)
    if ((p1[0] - p2[1] >= 0) || (p2[0] - p1[1] >= 0)) {
      // there is a gap - bail
      return null;
    }
    const min_distance = p2[1] - p1[0]
    const min_distance_abs = Math.abs(min_distance)
    if (min_distance_abs < overlap) {
      overlap = min_distance_abs
      distance = min_distance
      smallest = axis;
    }
    // if (overlap_result > 0) {
    //   console.log('a', axis, overlap_result)
    //   if (overlap_result < overlap) {
    //     overlap = overlap_result
    //     smallest = axis
    //   }
    // } else {
    //   return null
    // }
  }
  for (const axis of polygon_axes(polygon_b)) {
    const p1 = polygon_project(polygon_a, axis)
    const p2 = polygon_project(polygon_b, axis)
    if ((p1[0] - p2[1] > 0) || (p2[0] - p1[1] > 0)) {
      // there is a gap - bail
      return null;
    }
    const min_distance = (p1[1] - p2[0]) * -1
    const min_distance_abs = Math.abs(min_distance)
    if (min_distance_abs < overlap) {
      overlap = min_distance_abs
      distance = min_distance
      smallest = axis;
    }
  }
  console.log(overlap, smallest)
  return { distance, smallest }
}


window.onload = () => {
  const canvas = document.getElementsByTagName('canvas')[0]
  if (canvas.getContext) {
    var ctx = canvas.getContext("2d");
    const square = new Polygon([[0, 0], [40, 0], [40, 40], [0, 40]], ctx)
    const triangle = new Polygon([[0, 0], [30, 0], [0, 30]], ctx)
    triangle.move(100, 100)
    square.draw()
    triangle.draw()
    window.onkeydown = event => {
      ctx.reset()
      switch (event.key) {
        case 'ArrowUp':
          square.move(0, -1)
          break
        case 'ArrowDown':
          square.move(0, 1)
          break
        case 'ArrowLeft':
          square.move(-1, 0)
          break
        case 'ArrowRight':
          square.move(1, 0)
          break
      }
      const collision = sat_mtv(square, triangle)
      if (collision) {
        console.log('collision', collision?.smallest)
        square.move(
          collision.smallest[0] * collision.distance,
          collision.smallest[1] * collision.distance
        )
        ctx.fillStyle = ''
      }
      square.draw()
      triangle.draw()
      ctx.fillStyle = ''
    }
  }
}