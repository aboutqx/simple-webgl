import Pipeline from '../PipeLine'
import fs from 'shaders/bloom/bloom.frag'
import blurFs from 'shaders/bloom/blur.frag'
import finalFs from 'shaders/bloom/bloom_final.frag'
import {
    mat4
} from 'gl-matrix'
import {
    gl,
    GlTools,
    canvas
} from 'libs/GlTools'
import Geom from 'libs/Geom'
import { bigTriangleVert } from 'CustomShaders'
import FrameBuffer from 'libs/FrameBuffer'
import FboPingPong from 'libs/FboPingPong'

export default class Bloom extends Pipeline {
    _frame = 0
    constructor() {
        super()
    }
    init() {
        GlTools.applyHdrExtension()
        this.prg = this.basicVert(fs)
        this.blurPrg = this.compile(bigTriangleVert, blurFs)
        this.finalPrg = this.compile(bigTriangleVert, finalFs)
    }
    attrib() {
        this.statue = Geom.cube(1, 1, 2, gl.LINES)
        this.quad = Geom.bigTriangle()
        this.glow = Geom.cube(.007, .007, .063)
    }
    prepare() {
        GlTools.srcBlend()

        this.orbital.radius = 3.5
        this.fbo = new FrameBuffer(canvas.width, canvas.height, { hdr: true }, 2)
        this.textures = this.fbo.textures

        this.pingpongFbo = new FboPingPong(128, 128, { hdr: true })

    }
    _setGUI() {
        this.addGUIParams({
            texOffsetScale: 1,
            blurPassCount: 20,
            lightScale: 1,
            uAlpha: .5
        })
        this.gui.add(this.params, 'texOffsetScale', 0, 4).step(.02)
        this.gui.add(this.params, 'blurPassCount', 1, 40).step(1)
        this.gui.add(this.params, 'lightScale', .1, 10).step(.1)
        this.gui.add(this.params, 'uAlpha', 0, 1.0).step(.1)
    }
    uniform() {

    }

    _renderScene() {
        const mMatrix = mat4.create()
        // mat4.rotateY(mMatrix, mMatrix, .3)
        let a = [10, 20, 10]
        let b = a.map(x => x * this.params.lightScale)
        this.prg.use()
        this.prg.style({
            mMatrix,
            'lights[0].Position': [1.5, 0, 0],
            'lights[0].Color': b,
            'lights[1].Position': [-1.5, 0, 0],
            'lights[1].Color': b,
            'lights[2].Position': [0, 1.5, -2],
            'lights[2].Color': b,
            'lights[3].Position': [0, 0, 2.],
            'lights[3].Color': [10, 20, 10],
            'lights[4].Position': [0, -1.5, 0.],
            'lights[4].Color': [10, 20, 10],
            baseColor: [0., 0.3, 0.3],
            uAlpha: this.params.uAlpha
        })
        GlTools.draw(this.statue)
        this._perFrame()
    }

    _perFrame() {
        const pos = [[.5,.5,-1], [.5,.5,1]]
        const framesPerPos = 100 / pos.length // toal 100frame
        const interpolation = []
        const percentFrame = this._frame % 100 / 100
        for(let i = 0; i < 3; i++) {
            interpolation[i] = (pos[1][i] - pos[0][i]) * percentFrame + pos[0][i]
        }
        const mMatrix = mat4.create()
        mat4.translate(mMatrix, mMatrix, interpolation)
        this.prg.style({
            mMatrix,
            baseColor: [.8, .8, .1],
            'lights[0].Color': [0, 0, 0],
            'lights[1].Color': [0, 0, 0],
            'lights[2].Color': [0, 0, 0],
            'lights[3].Color': [0, 0, 0],
        })
        GlTools.draw(this.glow)

        this._frame++
    }

    render() {

        this.fbo.bind()
        GlTools.clear(0, 0, 0)
        gl.cullFace(gl.FRONT)
        this._renderScene()
        gl.cullFace(gl.BACK)
        this._renderScene()

        this.fbo.unbind()


        this.blurPrg.use()
        let horizontal = true, amount = this.params.blurPassCount
        for (let i = 0; i < amount; i++) {
            this.pingpongFbo.write.bind()
            this.blurPrg.style({
                image: i == 0 ? this.textures[1] : this.pingpongFbo.read.textures[0],
                horizontal,
                texOffsetScale: this.params.texOffsetScale
            })

            GlTools.draw(this.quad)
            horizontal = !horizontal;
            this.pingpongFbo.swap()
        }
        this.pingpongFbo.write.unbind()

        GlTools.clear(0, 0, 0)
        this.finalPrg.use()
        this.finalPrg.style({
            scene: this.textures[0],
            bloomBlur: this.pingpongFbo.read.textures[0],
            bloom: true,
            exposure: .1
        })

        GlTools.draw(this.quad)

    }
}


