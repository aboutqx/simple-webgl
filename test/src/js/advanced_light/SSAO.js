import Pipeline from '../PipeLine'
import {
  gl,
  canvas,
  toRadian
} from 'libs/GlTools'

import gBufferVs from 'shaders/ssao/ssao_geometry.vert'
import gBufferFs from 'shaders/ssao/ssao_geometry.frag'
import ssaoVs from 'shaders/deferred_shading/finalQuad.vert'
import ssaoFs from 'shaders/ssao/ssao.frag'
import ssaoBlurFs from 'shaders/ssao/ssao_blur.frag'
import ssaoLightingFs from 'shaders/ssao/ssao_lighting.frag'

import {
  CubeData, QuadData
} from '../Torus'
import {
  mat4
} from 'gl-matrix'
import Mesh from 'libs/Mesh'
import OBJLoader from 'libs/loaders/OBJLoader'
import MTLLoader from 'libs/loaders/MTLLoader'


const lightPositions = [0 ,-1, 0]
const lightColors = [.2, .2, .7]


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
    this.gBufferPrg = this.compile(gBufferVs, gBufferFs)
    this.ssaoPrg = this.compile(ssaoVs, ssaoFs)
    this.blurPrg = this.compile(ssaoVs, ssaoBlurFs)
    this.prg = this.compile(ssaoVs, ssaoLightingFs)
  }
  async attrib() {
    let cube = new Mesh()
    cube.bufferData(CubeData, ['position', 'normal', 'texCoord'], [3, 3, 2])
    this.cube = cube

    let quad = new Mesh()

    quad.bufferData(QuadData, ['position', 'texCoord'], [3, 2])
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
    this.camera.offset = [0, 0., 0]
    this.camera.radius = 3
    this.camera.rx = -1.5
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
      this.gBufferPrg.style({
        vMatrix: this.vMatrix,
        pMatrix: this.pMatrix
      })
      if (this.nanosuit) { // loaded
        let mMatrix = mat4.identity(mat4.create())
        mat4.translate(mMatrix, mMatrix, [0, -3, 1.8])
        mat4.scale(mMatrix, mMatrix, [.4, .4, .4])
        mat4.rotate(mMatrix, mMatrix, -Math.PI / 2 +.06 , [1, 0, 0])

        this.gBufferPrg.style({
          mMatrix,
          invertedNormals: 0
        })
        for (let i = 0; i < this.nanosuit.length; i++) {
          this.nanosuit[i].bind(this.gBufferPrg, ['position', 'normal', 'texCoord'])
          this.nanosuit[i].draw()
        }
      }

      let mMatrix = mat4.identity(mat4.create())
      mat4.scale(mMatrix, mMatrix,[7, 4, 7])
      this.gBufferPrg.style({
        mMatrix,
        invertedNormals: 1
      })
      this.cube.bind(this.gBufferPrg, ['position', 'normal', 'texCoord'])
      this.cube.draw()
    gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

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
      viewPos: this.camera.cameraPos,
      'lights.Position': lightPositions,
      'lights.Color': lightColors,
      'lights.Linear': .09,
      'lights.Quadratic': .032
    })

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
/*
  // 几何处理阶段: 渲染到G缓冲中
  glBindFramebuffer(GL_FRAMEBUFFER, gBuffer);
  [...]
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  // 使用G缓冲渲染SSAO纹理
  glBindFramebuffer(GL_FRAMEBUFFER, ssaoFBO);
  glClear(GL_COLOR_BUFFER_BIT);
  shaderSSAO.Use();
  glActiveTexture(GL_TEXTURE0);
  glBindTexture(GL_TEXTURE_2D, gPositionDepth);
  glActiveTexture(GL_TEXTURE1);
  glBindTexture(GL_TEXTURE_2D, gNormal);
  glActiveTexture(GL_TEXTURE2);
  glBindTexture(GL_TEXTURE_2D, noiseTexture);
  SendKernelSamplesToShader();
  glUniformMatrix4fv(projLocation, 1, GL_FALSE, glm::value_ptr(projection));
  RenderQuad();
  glBindFramebuffer(GL_FRAMEBUFFER, 0);

  // 光照处理阶段: 渲染场景光照
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);
  shaderLightingPass.Use();
  [...]
  glActiveTexture(GL_TEXTURE3);
  glBindTexture(GL_TEXTURE_2D, ssaoColorBuffer);
  [...]
  RenderQuad();
*/