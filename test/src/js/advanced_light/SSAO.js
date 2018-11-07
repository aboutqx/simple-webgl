import Pipeline from '../PipeLine'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'
import vs from 'shaders/deferred_shading/finalQuad.vert'
import fs from 'shaders/deferred_shading/finalQuad.frag'
import gBufferVs from 'shaders/ssao/ssao_geometry.vert'
import gBufferFs from 'shaders/ssao/ssao_geometry.frag'
import fboVs from 'shaders/deferred_shading/fbo_debug.vert'
import fboFs from 'shaders/deferred_shading/fbo_debug.frag'



import {
  CubeData
} from '../Torus'
import {
  mat4
} from 'gl-matrix'
import Mesh from 'libs/Mesh'
import OBJLoader from 'libs/loaders/OBJLoader'
import MTLLoader from 'libs/loaders/MTLLoader'

const NR_LIGHTS = 32
const lightPositions = []
const lightColors = []
for (let i = 0; i < NR_LIGHTS; i++) {
  // calculate slightly random offsets
  let xPos = Math.random() * 33 - 16.0;
  let yPos = Math.random() * 10 - 2.0;
  let zPos = Math.random() * 20 - 4.0;
  lightPositions.push([xPos, yPos, zPos]);
  // lightPositions.push()
  // also calculate random color
  let rColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
  let gColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
  let bColor = (Math.random() / 2.0) + 0.5; // between 0.5 and 1.0
  lightColors.push([rColor, gColor, bColor]);
}

export default class SSAO extends Pipeline {
  count = 0
  constructor() {
    super()

  }
  init() {
    // use webgl2
    // gl.getExtension('OES_standard_derivatives')
    // gl.getExtension('OES_texture_float')
    // gl.getExtension('OES_texture_float_linear') // Even WebGL2 requires OES_texture_float_linear
    gl.getExtension("EXT_color_buffer_float")
    // gl.getExtension('OES_texture_half_float')
    gl.getExtension('OES_texture_half_float_linear')
    // gl.getExtension('EXT_shader_texture_lod')
    this.prg = this.compile(vs, fs)
    this.gBufferPrg = this.compile(gBufferVs, gBufferFs)
    this.fboPrg = this.compile(fboVs, fboFs)

  }
  async attrib() {
    let cube = new Mesh()
    cube.bufferData(CubeData, ['position', 'normal', 'texCoord'], [3, 3, 2])
    this.cube = cube

    let quad = new Mesh()
    let quadData = [
      -1.0, 1.0, 0.0, 0.0, 1.0,
      -1.0, -1.0, 0.0, 0.0, 0.0,
      1.0, 1.0, 0.0, 1.0, 1.0,
      1.0, -1.0, 0.0, 1.0, 0.0
    ]
    quad.bufferData(quadData, ['position', 'texCoord'], [3, 2])
    this.quad = quad

    const materials = await new MTLLoader('nanosuit.mtl', './assets/models/nanosuit').parse(getAssets.nanosuitMTL)
    this.nanosuit = new OBJLoader().parseObj(getAssets.nanosuit, materials)

  }
  prepare() {
    gl.clearColor(0., 0., 0., 1.);
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    //position, normal, AlbedoSpec(diffuse, specular indensity)
    this.mrt = framebufferMRT(canvas.width, canvas.height, ['16f', '16f', 'rgba'])


    // execute once
    this.camera.target = [0, -1., 0]
    this.camera.offset = [1, 3., 0]
    this.camera.radius = 18
  }
  uniform() {

    this.vMatrix = this.camera.viewMatrix
    this.pMatrix = mat4.identity(mat4.create())

    mat4.perspective(this.pMatrix, toRadian(60), canvas.clientWidth / canvas.clientHeight, .1, 100)

  }

  render() {

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.mrt.frameBuffer)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      this.gBufferPrg.use()

      if (this.nanosuit) { // loaded
        this.gBufferPrg.style({
          vMatrix: this.vMatrix,
          pMatrix: this.pMatrix
        })

        let mMatrix = mat4.identity(mat4.create())
        mat4.rotate(mMatrix, mMatrix, Math.PI / 2, [1, 0, 0])
        this.gBufferPrg.style({
          mMatrix
        })
        for (let i = 0; i < this.nanosuit.length; i++) {
          this.nanosuit[i].bind(this.gBufferPrg, ['position', 'normal', 'texCoord'])
          this.nanosuit[i].draw()
        }

      }

      this.cube.bind(this.gBufferPrg, ['position', 'normal', 'texCoord'])
      this.cube.draw()
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // gl.activeTexture(gl.TEXTURE0)
    // gl.bindTexture(gl.TEXTURE_2D, this.mrt.texture[1])
    // this.fboPrg.use()
    // this.fboPrg.style({
    //   fboAttachment: 0
    // })
    // this.quad.bind(this.fboPrg, ['position', 'texCoord'])
    // this.quad.draw(gl.TRIANGLE_STRIP)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.mrt.texture[0])
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, this.mrt.texture[1])
    gl.activeTexture(gl.TEXTURE2)
    gl.bindTexture(gl.TEXTURE_2D, this.mrt.texture[2])
    this.prg.use()
    this.prg.style({
      gPosition: 0,
      gNormal: 1,
      gAlbedoSpec: 2,
      viewPos: this.camera.cameraPos
    }, true)
    for (let i = 0; i < lightPositions.length; i++) {
      gl.uniform3fv(gl.getUniformLocation(this.prg.program, [`lights[${i}].Position`]), lightPositions[i])
      gl.uniform3fv(gl.getUniformLocation(this.prg.program, [`lights[${i}].Color`]), lightColors[i])

      gl.uniform1f(gl.getUniformLocation(this.prg.program, [`lights[${i}].Linear`]), .1)
      gl.uniform1f(gl.getUniformLocation(this.prg.program, [`lights[${i}].Quadratic`]), .6)

    }
    this.quad.bind(this.prg, ['position', 'texCoord'])
    this.quad.draw(gl.TRIANGLE_STRIP)


  }
}

function framebufferMRT(width, height, type) {
  let frameBuffer = gl.createFramebuffer()
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

  let fTexture = []
  const bufferList = []
  for (let i = 0; i < type.length; ++i) {
    fTexture[i] = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, fTexture[i])
    if (type[i] === '16f') {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null)
    } else {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0 + i, gl.TEXTURE_2D, fTexture[i], 0)
    bufferList.push(gl.COLOR_ATTACHMENT0 + i)
  }
  gl.drawBuffers(bufferList) // 指定渲染目标

  const depthRenderBuffer = gl.createRenderbuffer()
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer)
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH24_STENCIL8, width, height)
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer)

  const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
  if (status != gl.FRAMEBUFFER_COMPLETE) {
    console.log(`gl.checkFramebufferStatus() returned ${status.toString(16)}`);
  }

  gl.bindTexture(gl.TEXTURE_2D, null)
  gl.bindRenderbuffer(gl.RENDERBUFFER, null)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)

  return {
    frameBuffer: frameBuffer,
    depthBuffer: depthRenderBuffer,
    texture: fTexture
  }
}


