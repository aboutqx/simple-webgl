import Pipeline from '../PipeLine'
import Mesh from 'libs/Mesh'
import Texture from 'libs/glTexture'

import vs from 'shaders/normal_map/normal_map.vert'
import fs from 'shaders/normal_map/normal_map.frag'

import {
  mat4, vec3, vec2
} from 'gl-matrix'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

let vMatrix = mat4.identity(mat4.create())
let pMatrix = mat4.identity(mat4.create())

// http://ogldev.atspace.co.uk/www/tutorial26/tutorial26.html
// Gramm-Schmid 正交可将从fragment里被光栅化，不再正交与normal的tangent重新正交化
// https://zh.wikipedia.org/wiki/%E6%A0%BC%E6%8B%89%E5%A7%86-%E6%96%BD%E5%AF%86%E7%89%B9%E6%AD%A3%E4%BA%A4%E5%8C%96
// 和cemra的lookat一样，将基坐标乘以切线空间的normal得到贴图方向的normal，乘法基于scalar project得到三个方向的向量
// normalmap是当前平面方向的微调，所以得到平面或者叫贴图的normal就行
// 比如一个朝向y+方向的面，得到的normal还是垂直表面的，normalmap上不经过转化，是指向z的，蓝色的，计算后，应该是以表面normal为基准的分量
// 即指向y+的，只是有些微调
/* eg.
  let T = vec3.fromValues(0, .3, 1)
  let N = vec3.fromValues(0, 1, 0)
  console.log(vec3.subtract(T, T, vec3.scale(N, N, vec3.dot(T, N))))
  施密特正交后是[0, 0, 1]，与N垂直
  按照想法，normalmap上的（0，0，1）与N（0，1，0）经过TBN乘法得到的还是（0，1，0）
  TBN乘法项与摄像机XYZ单位向量相同 http: //ogldev.atspace.co.uk/www/tutorial13/tutorial13.html
  因此，normalmap切线空间的（0，0，1）只在z轴，即N上有投影，得到的与N相同（0，1，0）
  mat4[T,B,N,1] * [0,0,1,1] = [0,1,0,1] （N = [0,1,0]）
  世界空间坐标系 * 切线空间坐标 = 世界空间坐标 ＜（＾－＾）＞

*/
const caculateTBN = (N) => {
  const leftTop = vec3.fromValues(-1., 0, -1.)
  const leftBottom = vec3.fromValues(-1, 0, 1)
  const rightBootm = vec3.fromValues(1, 0, 1)
  const rightTop = vec3.fromValues(1, 0, -1)

  const uv1 = vec2.fromValues(0, 1)
  const uv2 = vec2.fromValues(0, 0)
  const uv3 = vec2.fromValues(1, 0)
  const uv4 = vec2.fromValues(1, 1)

  const nm = vec3.fromValues(0.0, 1.0, 0.0)

  const edge1 = vec3.create()
  const edge2 = vec3.create()
  const deltaUV1 = vec2.create()
  const deltaUV2 = vec2.create()

  // triangle 1
  // ----------
  vec3.subtract(edge1, leftBottom, leftTop)
  vec3.subtract(edge2, rightBootm, leftTop)

  vec2.subtract(deltaUV1, uv2, uv1)
  vec2.subtract(deltaUV2, uv3, uv1)

  let f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1])

  const tangent1 = vec3.create()
  const bitangent1 = vec3.create()
  const tangent2 = vec3.create()
  const bitangent2 = vec3.create()


  tangent1[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0])
  tangent1[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1])
  tangent1[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2])
  vec3.normalize(tangent1, tangent1)

  bitangent1[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0])
  bitangent1[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1])
  bitangent1[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2])
  vec3.normalize(bitangent1, bitangent1)

  // triangle 2
  // ----------
  vec3.subtract(edge1, rightBootm, leftTop)
  vec3.subtract(edge2, rightTop, leftTop)
  vec2.subtract(deltaUV1, uv3, uv1)
  vec2.subtract(deltaUV2, uv4, uv1)

  f = 1.0 / (deltaUV1[0] * deltaUV2[1] - deltaUV2[0] * deltaUV1[1])

  tangent2[0] = f * (deltaUV2[1] * edge1[0] - deltaUV1[1] * edge2[0])
  tangent2[1] = f * (deltaUV2[1] * edge1[1] - deltaUV1[1] * edge2[1])
  tangent2[2] = f * (deltaUV2[1] * edge1[2] - deltaUV1[1] * edge2[2])
  vec3.normalize(tangent2, tangent2)


  bitangent2[0] = f * (-deltaUV2[0] * edge1[0] + deltaUV1[0] * edge2[0])
  bitangent2[1] = f * (-deltaUV2[0] * edge1[1] + deltaUV1[0] * edge2[1])
  bitangent2[2] = f * (-deltaUV2[0] * edge1[2] + deltaUV1[0] * edge2[2])
  vec3.normalize(bitangent2, bitangent2)

  const quadVertices = [
    // positions            // normal         // texcoords  // tangent                          // bitangent
    leftTop[0], leftTop[1], leftTop[2], nm[0], nm[1], nm[2], uv1[0], uv1[1], tangent1[0], tangent1[1], tangent1[2], bitangent1[0], bitangent1[1], bitangent1[2],
    leftBottom[0], leftBottom[1], leftBottom[2], nm[0], nm[1], nm[2], uv2[0], uv2[1], tangent1[0], tangent1[1], tangent1[2], bitangent1[0], bitangent1[1], bitangent1[2],
    rightBootm[0], rightBootm[1], rightBootm[2], nm[0], nm[1], nm[2], uv3[0], uv3[1], tangent1[0], tangent1[1], tangent1[2], bitangent1[0], bitangent1[1], bitangent1[2],

    leftTop[0], leftTop[1], leftTop[2], nm[0], nm[1], nm[2], uv1[0], uv1[1], tangent2[0], tangent2[1], tangent2[2], bitangent2[0], bitangent2[1], bitangent2[2],
    rightBootm[0], rightBootm[1], rightBootm[2], nm[0], nm[1], nm[2], uv3[0], uv3[1], tangent2[0], tangent2[1], tangent2[2], bitangent2[0], bitangent2[1], bitangent2[2],
    rightTop[0], rightTop[1], rightTop[2], nm[0], nm[1], nm[2], uv4[0], uv4[1], tangent2[0], tangent2[1], tangent2[2], bitangent2[0], bitangent2[1], bitangent2[2]
  ]
  return quadVertices
}
const lightPos = [0, 3 ,0]
export default class NormalMap extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    this.prg = this.compile(vs, fs)
  }
  attrib() {
    const quadVertices = caculateTBN()
    this.quad = new Mesh()
    this.quad.bufferData(quadVertices, ['position', 'normal', 'texCoord', 'tangent', 'bitangent'], [3,3,2,3,3])

  }
  prepare() {
    this.camera.offset = [0, 2, 0]
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clearColor(0.3, 0.3, .3, 1.0)
    gl.clearDepth(1.0)

    const brickwall = new Texture(gl).fromImage(getAssets.brickwall)
    const brickwallNormal = new Texture(gl).fromImage(getAssets.brickwallNormal)
    brickwall.bind(0)
    brickwallNormal.bind(1)
  }
  uniform() {

    vMatrix = this.camera.viewMatrix
    mat4.perspective(pMatrix, toRadian(60), canvas.clientWidth / canvas.clientHeight, .1, 100)


    let mMatrix = mat4.identity(mat4.create())
    mat4.scale(mMatrix, mMatrix, [1.8, 1.8, 1.8])
    this.prg.use()
    this.prg.style({
      mMatrix,
      vMatrix,
      pMatrix,
      viewPos: this.camera.cameraPos,
      lightPos,
      diffuseMap: 0,
      normalMap: 1
    })
  }
  render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    this.quad.bind(this.prg, ['position', 'normal', 'texCoord', 'tangent'])
    this.quad.draw()

  }
}