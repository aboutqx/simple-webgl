(window.webpackJsonp=window.webpackJsonp||[]).push([[7,22,28],{142:function(t,e){t.exports="// basic.vert\n\n#define SHADER_NAME BASIC_VERTEX\n\nprecision highp float;\n#define GLSLIFY 1\nattribute vec3 position;\nattribute vec2 texCoord;\nattribute vec3 normal;\n\nuniform mat4 uModelMatrix;\nuniform mat4 uViewMatrix;\nuniform mat4 uProjectionMatrix;\n\nvarying vec2 vTextureCoord;\nvarying vec3 vNormal;\n\nvoid main(void) {\n    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(position, 1.0);\n    vTextureCoord = texCoord;\n    vNormal = normal;\n}"},143:function(t,e){t.exports="// basic.frag\n\n#define SHADER_NAME BASIC_FRAGMENT\n\nprecision lowp float;\n#define GLSLIFY 1\nvarying vec2 vTextureCoord;\nuniform float time;\n// uniform sampler2D texture;\n\nvoid main(void) {\n    gl_FragColor = vec4(vTextureCoord, sin(time) * .5 + .5, 1.0);\n}"},17:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nin vec3 position;\nin vec2 texCoord;\n\nout vec2 TexCoords;\nvoid main(){\n  TexCoords = texCoord;\n  gl_Position = vec4(position, 1.);\n}\n"},28:function(t,e,i){"use strict";var r=i(0),a=i(14),n=i(12);i(144);const s=(t,e)=>{if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++)if(t[i]!==e[i])return!1;return!0},o=t=>{const e=t.split("\n");for(let t=0;t<e.length;t++)e[t]=`${t+1}: ${e[t]}`;return e.join("\n")},h=t=>t.slice?t.slice(0):new Float32Array(t),c=i(142),u=i(143),m={float:"uniform1f",vec2:"uniform2fv",vec3:"uniform3fv",vec4:"uniform4fv",int:"uniform1i",mat3:"uniformMatrix3fv",mat4:"uniformMatrix4fv"};class l{constructor(t=c,e=u,i){this.parameters=[],this._uniformTextures=[],this._varyings=i,t||(t=c),e||(e=c);const r=this._createShaderProgram(t,!0),a=this._createShaderProgram(e,!1);this._attachShaderProgram(r,a)}use(){this.bind()}bind(){r.c.useProgram(this.shaderProgram),r.a.useShader(this)}uniform(t,e,i){if("object"==typeof t)return void this.uniformObject(t);const a=m[e]||e;let n,o=!1,c=-1;for(let e=0;e<this.parameters.length;e++)if((n=this.parameters[e]).name===t){o=!0,c=e;break}let u=!1;if(o?(this.shaderProgram[t]=n.uniformLoc,u=n.isNumber):(u="uniform1i"===a||"uniform1f"===a,this.shaderProgram[t]=r.c.getUniformLocation(this.shaderProgram,t),u?this.parameters.push({name:t,type:a,value:i,uniformLoc:this.shaderProgram[t],isNumber:u}):this.parameters.push({name:t,type:a,value:h(i),uniformLoc:this.shaderProgram[t],isNumber:u}),c=this.parameters.length-1),this.parameters[c].uniformLoc)if(-1===a.indexOf("Matrix"))if(u){(this.parameters[c].value!==i||!o)&&(r.c[a](this.shaderProgram[t],i),this.parameters[c].value=i)}else s(this.parameters[c].value,i)&&o||(r.c[a](this.shaderProgram[t],i),this.parameters[c].value=h(i));else s(this.parameters[c].value,i)&&o||(r.c[a](this.shaderProgram[t],!1,i),this.parameters[c].value=h(i))}style(t){this.uniformObject(t)}uniformObject(t){for(const e in t)if(t[e]instanceof a.a||t[e]instanceof n.a){const i=t[e];let r=-1;this._uniformTextures.forEach((t,a)=>{t.name===e&&(r=a,t.texture=i)}),-1===r&&(r=this._uniformTextures.length,this._uniformTextures.push({name:e,texture:i})),this.uniform(e,"uniform1i",r),i.bind(r)}else{let i=t[e];const r=l.getUniformType(i);if(i.concat&&i[0].concat){let t=[];for(let e=0;e<i.length;e++)t=t.concat(i[e]);i=t}this.uniform(e,r,i)}}_createShaderProgram(t,e){const i=e?r.c.VERTEX_SHADER:r.c.FRAGMENT_SHADER,a=r.c.createShader(i);return r.c.shaderSource(a,t),r.c.compileShader(a),r.c.getShaderParameter(a,r.c.COMPILE_STATUS)?a:(console.warn("Error in Shader : ",r.c.getShaderInfoLog(a)),console.log(o(t)),null)}_attachShaderProgram(t,e){this.shaderProgram=r.c.createProgram(),r.c.attachShader(this.shaderProgram,t),r.c.attachShader(this.shaderProgram,e),r.c.deleteShader(t),r.c.deleteShader(e),this._varyings&&(console.log("Transform feedback setup : ",this._varyings),r.c.transformFeedbackVaryings(this.shaderProgram,this._varyings,r.c.SEPARATE_ATTRIBS)),r.c.linkProgram(this.shaderProgram)}}l.getUniformType=function(t){const e=function(t){return 9===t.length?"uniformMatrix3fv":16===t.length?"uniformMatrix4fv":`vec${t.length}`};return!!t.length?t[0].concat?e(t[0]):e(t):"float"},e.a=l},4:function(t,e){var i=0,r=3553;function a(t,e,i){return 9728|+t|+e<<8|+(e&&i)<<1}function n(t,e){return this._uid=i++,this.gl=t,this.id=this.gl.createTexture(),this.width=0,this.height=0,this.format=e||t.RGB,this.type=t.UNSIGNED_BYTE,this.img=null,t.bindTexture(r,this.id),this.setFilter(!0),this}n.prototype={fromImage:function(t){var e=this.gl;return this.img=t,this.width=t.width,this.height=t.height,e.bindTexture(r,this.id),e.texImage2D(r,0,this.format,this.format,this.type,t),this},fromData:function(t,e,i,a){var n=this.gl;return this.width=t,this.height=e,i=i||null,this.type=a||n.UNSIGNED_BYTE,n.bindTexture(r,this.id),window.useWebgl2?a===n.RGBA16F?n.texImage2D(n.TEXTURE_2D,0,this.type,t,e,0,this.format,n.HALF_FLOAT,i):a===n.RG32F||a===n.RGBA32F||a===n.RGB32F?n.texImage2D(n.TEXTURE_2D,0,this.type,t,e,0,this.format,n.FLOAT,i):n.texImage2D(r,0,this.format,t,e,0,this.format,this.type,i):n.texImage2D(r,0,this.format,t,e,0,this.format,this.type,i),this},bind:function(t){var e=this.gl;void 0!==t&&e.activeTexture(e.TEXTURE0+(0|t)),e.bindTexture(r,this.id)},dispose:function(){this.gl&&this.gl.deleteTexture(this.id),this.id=null,this.gl=null},setFilter:function(t,e,i){var n=this.gl,s=a(!!t,!!e,!!i);n.texParameteri(r,n.TEXTURE_MAG_FILTER,a(!!t,!1,!1)),n.texParameteri(r,n.TEXTURE_MIN_FILTER,s)},repeat:function(){this.wrap(this.gl.REPEAT)},clamp:function(){this.wrap(this.gl.CLAMP_TO_EDGE)},mirror:function(){this.wrap(this.gl.MIRRORED_REPEAT)},wrap:function(t){var e=this.gl;e.texParameteri(r,e.TEXTURE_WRAP_S,t),e.texParameteri(r,e.TEXTURE_WRAP_T,t)}},t.exports=n},49:function(t,e,i){"use strict";i.r(e),i.d(e,"default",function(){return F});var r=i(2),a=i(5),n=i(0),s=i(4),o=i.n(s),h=i(94),c=i.n(h),u=i(95),m=i.n(u),l=i(17),d=i.n(l),f=i(96),p=i.n(f),x=i(97),g=i.n(x),_=i(98),v=i.n(_),b=i(1),M=i(6),T=i(3);const E=1024,P=1024,R=[0,4,-1];let w=b.b.identity(b.b.create()),y=b.b.identity(b.b.create());class F extends a.default{constructor(){super(),Object(r.a)(this,"count",0)}init(){this.prg=this.compile(c.a,m.a),this.depthQuadPrg=this.compile(d.a,p.a),this.shadowPrg=this.compile(g.a,v.a),n.c.pixelStorei(n.c.UNPACK_FLIP_Y_WEBGL,!0)}attrib(){this.plane=new T.a,this.plane.bufferData([30,-1.01,30,1,0,-30,-1.01,30,0,0,-30,-1.01,-30,0,1,30,-1.01,30,1,0,-30,-1.01,-30,0,1,30,-1.01,-30,1,1],["position","texCoord"],[3,2]),this.cube=new T.a,this.cube.bufferData(M.CubeData,["position","normal","texCoord"],[3,3,2]),this.quad=new T.a,this.quad.bufferData(M.QuadData,["position","texCoord"],[3,2])}prepare(){let t=b.b.identity(b.b.create()),e=b.b.identity(b.b.create());this.tmpMatrix=b.b.identity(b.b.create());b.b.ortho(e,-25,25,-25,25,.1,18.5),b.b.lookAt(t,R,[0,0,0],[0,1,0]),b.b.multiply(this.tmpMatrix,e,t),n.c.enable(n.c.DEPTH_TEST),n.c.depthFunc(n.c.LESS),n.c.clearColor(.3,.3,.3,1),this.depthBuffer=function(t,e){const i=n.c.createFramebuffer(),r=n.c.createTexture();n.c.bindTexture(n.c.TEXTURE_2D,r),n.c.texImage2D(n.c.TEXTURE_2D,0,n.c.DEPTH_COMPONENT16,t,e,0,n.c.DEPTH_COMPONENT,n.c.UNSIGNED_SHORT,null),n.c.texParameteri(n.c.TEXTURE_2D,n.c.TEXTURE_MIN_FILTER,n.c.NEAREST),n.c.texParameteri(n.c.TEXTURE_2D,n.c.TEXTURE_MAG_FILTER,n.c.NEAREST),n.c.texParameteri(n.c.TEXTURE_2D,n.c.TEXTURE_WRAP_S,n.c.REPEAT),n.c.texParameteri(n.c.TEXTURE_2D,n.c.TEXTURE_WRAP_T,n.c.REPEAT);return n.c.bindFramebuffer(n.c.FRAMEBUFFER,i),n.c.framebufferTexture2D(n.c.FRAMEBUFFER,n.c.DEPTH_ATTACHMENT,n.c.TEXTURE_2D,r,0),n.c.drawBuffers([n.c.NONE]),n.c.readBuffer(n.c.NONE),n.c.bindFramebuffer(n.c.FRAMEBUFFER,null),{frameBuffer:i,depthTexture:r}}(E,P),this.camera.radius=11,this.wood=new o.a(n.c).fromImage(getAssets.wood),this.wood.bind(),this.wood.repeat()}uniform(){w=this.camera.viewMatrix}render(){n.c.viewport(0,0,E,P),n.c.bindFramebuffer(n.c.FRAMEBUFFER,this.depthBuffer.frameBuffer),n.c.clear(n.c.DEPTH_BUFFER_BIT),this.prg.use(),this.prg.style({lightSpaceMatrix:this.tmpMatrix}),this._renderScene(this.prg,["position"]),n.c.bindFramebuffer(n.c.FRAMEBUFFER,null),n.c.viewport(0,0,canvasWidth,canvasHeight),n.c.clear(n.c.COLOR_BUFFER_BIT|n.c.DEPTH_BUFFER_BIT),n.c.activeTexture(n.c.TEXTURE0),n.c.bindTexture(n.c.TEXTURE_2D,this.depthBuffer.depthTexture),this.wood.bind(1),this.shadowPrg.use(),this.shadowPrg.style({shadowMap:0,diffuseTexture:1,lightPos:R,viewPos:this.camera.position,mMatrix:this.mMatrix,pMatrix:y,vMatrix:w,lightSpaceMatrix:this.tmpMatrix}),this._renderScene(this.shadowPrg)}_renderScene(t,e){this.mMatrix=b.b.identity(b.b.create()),t.style({mMatrix:this.mMatrix}),this.plane.bind(t,e),this.plane.draw(),b.b.translate(this.mMatrix,this.mMatrix,[-1.2,0,5]),t.style({mMatrix:this.mMatrix}),this.cube.bind(t,e),this.cube.draw(),this.mMatrix=b.b.identity(b.b.create()),b.b.translate(this.mMatrix,this.mMatrix,[2,2,4]),t.style({mMatrix:this.mMatrix}),this.cube.bind(t,e),this.cube.draw(),this.mMatrix=b.b.identity(b.b.create()),b.b.translate(this.mMatrix,this.mMatrix,[-2.2,.4,1]),b.b.rotate(this.mMatrix,this.mMatrix,toRadian(30),[2,2,4]),t.style({mMatrix:this.mMatrix}),this.cube.bind(t,e),this.cube.draw()}}},5:function(t,e,i){"use strict";i.r(e);var r=i(2),a=i(28),n=i(1),s=i(0);const o=function(t,e,i){const r=e||{};return t.touches&&!i?(r.x=t.touches[0].pageX,r.y=t.touches[0].pageY):t.touches?t.touches&&i&&(r.x=t.touches[1].pageX,r.y=t.touches[1].pageY):(r.x=t.clientX,r.y=t.clientY),r},h=1e-4;class c{constructor(t=[0,0,0],e=[0,1,0]){Object(r.a)(this,"cameraPos",void 0),Object(r.a)(this,"up",void 0),Object(r.a)(this,"cameraFront",[0,0,-1]),Object(r.a)(this,"_mouse",{}),Object(r.a)(this,"_preMouse",{}),Object(r.a)(this,"_mousedown",!1),Object(r.a)(this,"_rx",0),Object(r.a)(this,"_ry",0),Object(r.a)(this,"_preRx",0),Object(r.a)(this,"_preRy",0),Object(r.a)(this,"_targetRx",0),Object(r.a)(this,"_targetRy",0),Object(r.a)(this,"_viewMatrix",n.b.identity(n.b.create())),Object(r.a)(this,"_width",s.b.width),Object(r.a)(this,"_height",s.b.height),Object(r.a)(this,"sensitivity",1),Object(r.a)(this,"target",[0,0,0]),Object(r.a)(this,"offset",[0,0,0]),Object(r.a)(this,"radius",5),Object(r.a)(this,"_targetRadius",5),Object(r.a)(this,"_updateWheel",!1),this.position=t,this.up=e,this.projMatrix=n.b.create(),n.b.perspective(this.projMatrix,Object(s.d)(45),s.b.clientWidth/s.b.clientHeight,.1,100),this._addEvents()}setProj(t,e,i){n.b.perspective(this.projMatrix,Object(s.d)(t),s.b.clientWidth/s.b.clientHeight,e,i)}_addEvents(){s.b.addEventListener("mousedown",t=>this._down(t)),s.b.addEventListener("mousemove",t=>this._move(t)),document.addEventListener("mouseup",t=>this._up(t)),s.b.addEventListener("mousewheel",t=>this._onWheel(t)),s.b.addEventListener("DOMMouseScroll",t=>this._onWheel(t))}_down(t){this._mousedown=!0,o(t,this._mouse),o(t,this._preMouse),this._preRx=this._targetRx,this._preRy=this._targetRy}_move(t){if(this._mousedown){o(t,this._mouse);let e=(this._mouse.x-this._preMouse.x)/this._width,i=(this._mouse.y-this._preMouse.y)/this._height;this._targetRx=this._preRx+e*Math.PI*2*this.sensitivity,this._targetRy=this._preRy+i*Math.PI*this.sensitivity}}_up(t){this._mousedown=!1}updateMatrix(){this._rx+=.1*(this._targetRx-this._rx),Math.abs(this._targetRx-this._rx)<h&&(this._rx=this._targetRx),this._ry+=.1*(this._targetRy-this._ry),Math.abs(this._targetRy-this._ry)<h&&(this._ry=this._targetRy),this._updateWheel&&(this.radius+=.1*(this._targetRadius-this.radius),Math.abs(this._targetRadius-this.radius)<h&&(this.radius=this._targetRadius)),this.position[1]=Math.sin(this._ry)*this.radius;let t=Math.abs(Math.cos(this._ry)*this.radius);this.position[0]=Math.cos(this._rx+.5*Math.PI)*t,this.position[2]=Math.sin(this._rx+.5*Math.PI)*t,this.position=[this.position[0]+this.offset[0],this.position[1]+this.offset[1],this.position[2]+this.offset[2]],n.b.lookAt(this._viewMatrix,this.position,this.target,this.up)}_onWheel(t){const e=t.wheelDelta,i=t.detail;let r=0;r=i?e?e/i/40*i>0?1:-1:-i/3:e/120,this._targetRadius=this.radius+1*-r,this._targetRadius<=1&&(this._targetRadius=1),this._updateWheel=!0}get viewMatrix(){return this._viewMatrix}set rx(t){this._targetRx=t}}var u=i(43);i.d(e,"default",function(){return m});class m{constructor(){Object(r.a)(this,"rotateQ",n.c.create()),Object(r.a)(this,"mousePos",{x:0,y:0}),Object(r.a)(this,"camera",new c),Object(r.a)(this,"pMatrix",n.b.identity(n.b.create())),Object(r.a)(this,"mvpMatrix",n.b.identity(n.b.create())),Object(r.a)(this,"tmpMatrix",n.b.identity(n.b.create())),Object(r.a)(this,"_params",{}),Object(r.a)(this,"gui",new u.a({width:300})),this.vMatrix=this.camera.viewMatrix,s.a.setCamera(this.camera),this.init(),this.attrib(),this.prepare(),this._setGUI(),this._animate=this.animate.bind(this),s.c.enable(s.c.DEPTH_TEST),s.c.depthFunc(s.c.LEQUAL),s.c.enable(s.c.CULL_FACE)}init(){}compile(t,e){return new a.a(t,e)}attrib(){}uniform(){}prepare(){}animate(){requestAnimationFrame(this._animate),this.camera.updateMatrix(),this.uniform(),this.render()}render(){}play(){this.animate()}_setGUI(){}addGUIParams(t){return Object.assign(this._params,t)}get params(){return this._params}set params(t){throw Error("Params has no setter,please use addGUIParams")}}},6:function(t,e,i){"use strict";i.r(e),i.d(e,"Torus",function(){return a}),i.d(e,"hsva",function(){return n}),i.d(e,"Sphere",function(){return s}),i.d(e,"plane",function(){return o}),i.d(e,"QuadData",function(){return h}),i.d(e,"TorusKnot",function(){return c}),i.d(e,"regularPolyhedron",function(){return u});var r=i(3);function a(t,e,i,a,s){let o,h=[],c=[],u=[],m=[],l=[];for(let r=0;r<=t;r++){let c=2*Math.PI/t*r,d=Math.cos(c),f=Math.sin(c);for(let c=0;c<=e;c++){l.push(c/e,r/t);let p=2*Math.PI/e*c,x=(d*i+a)*Math.cos(p),g=f*i,_=(d*i+a)*Math.sin(p);h.push(x,g,_),o=s||n(360/e*c,1,1,1),m.push(o[0],o[1],o[2],o[3]);let v=d*Math.cos(p),b=d*Math.sin(p);u.push(v,f,b)}}for(let i=0;i<t;i++)for(let t=0;t<e;t++){let r=(e+1)*i+t;c.push(r,r+e+1,r+1),c.push(r+e+1,r+e+2,r+1)}let d=new r.a;return d.bufferFlattenData(h,"position",3),d.bufferFlattenData(l,"texCoord",2),d.bufferFlattenData(m,"color",4),d.bufferIndex(c),d.bufferFlattenData(u,"normal",3),d}function n(t,e,i,r){if(e>1||i>1||r>1)return;let a=t%360,n=Math.floor(a/60),s=a/60-n,o=i*(1-e),h=i*(1-e*s),c=i*(1-e*(1-s)),u=[];if(!e>0&&!e<0)u.push(i,i,i,r);else{let t=[i,h,o,o,c,i],e=[c,i,i,h,o,o],a=[o,o,c,i,i,h];u.push(t[n],e[n],a[n],r)}return u}function s(t,e,i,r){for(var a=[],s=[],o=[],h=[],c=[],u=0;u<=t;u++)for(var m=Math.PI/t*u,l=Math.cos(m),d=Math.sin(m),f=0;f<=e;f++){var p=2*Math.PI/e*f,x=d*i*Math.cos(p),g=l*i,_=d*i*Math.sin(p),v=d*Math.cos(p),b=d*Math.sin(p);if(r)var M=r;else M=n(360/t*u,1,1,1);a.push(x,g,_),s.push(v,l,b),o.push(M[0],M[1],M[2],M[3]),h.push(1-1/e*f,1/t*u)}for(m=0,u=0;u<t;u++)for(f=0;f<e;f++)m=(e+1)*u+f,c.push(m,m+1,m+e+2),c.push(m,m+e+2,m+e+1);return{pos:a,normal:s,color:o,uv:h,index:c}}function o(t,e,i){const r=t/2,a=i/2;return[r,e,a,0,1,0,1,0,-r,e,-a,0,1,0,0,1,-r,e,a,0,1,0,0,0,r,e,a,0,1,0,1,0,r,e,-a,0,1,0,1,1,-r,e,-a,0,1,0,0,1]}const h=[-1,1,0,0,1,-1,-1,0,0,0,1,1,0,1,1,1,-1,0,1,0];function c(){}function u(){}},94:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nin vec3 position;\n\nuniform mat4 lightSpaceMatrix;\nuniform mat4 mMatrix;\n\nvoid main(void){\n    gl_Position = lightSpaceMatrix * mMatrix * vec4(position, 1.0);\n}\n"},95:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\n\n\nvoid main(){\n\n}\n"},96:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\nin vec2 TexCoords;\n\nuniform sampler2D depthMap;\nuniform float near_plane;\nuniform float far_plane;\n\n// required when using a perspective projection matrix\nfloat LinearizeDepth(float depth)\n{\n    float z = depth * 2.0 - 1.0; // Back to NDC\n    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));\n}\n\nvoid main()\n{\n    float depthValue = texture(depthMap, TexCoords).r;\n    // FragColor = vec4(vec3(LinearizeDepth(depthValue) / far_plane), 1.0); // perspective\n    FragColor = vec4(vec3(depthValue), 1.0); // orthographic\n}\n"},97:function(t,e){t.exports="#version 300 es\n#define GLSLIFY 1\nlayout (location = 0) in vec3 position;\nlayout (location = 1) in vec3 normal;\nlayout (location = 2) in vec2 texCoord;\n\n\nout vec3 FragPos;\nout  vec3 Normal;\nout  vec2 TexCoords;\nout vec4 FragPosLightSpace;\n\n\nuniform mat4 pMatrix;\nuniform mat4 vMatrix;\nuniform mat4 mMatrix;\nuniform mat4 lightSpaceMatrix;\n\nvoid main(){\n  gl_Position = pMatrix * vMatrix * mMatrix * vec4(position, 1.);\n  FragPos = vec3(mMatrix * vec4(position, 1.));\n  Normal = transpose(inverse(mat3(mMatrix))) * normal;\n  TexCoords = texCoord;\n  FragPosLightSpace = lightSpaceMatrix * vec4(FragPos, 1.); // 从lightPos视角看的坐标\n}\n"},98:function(t,e){t.exports="#version 300 es\nprecision mediump float;\n#define GLSLIFY 1\nout vec4 FragColor;\n\nin vec3 FragPos;\nin vec3 Normal;\nin vec2 TexCoords;\nin vec4 FragPosLightSpace;\n\n\nuniform sampler2D diffuseTexture;\nuniform sampler2D shadowMap;\nuniform vec3 lightPos;\nuniform vec3 viewPos;\n\nfloat ShadowCalculation(vec4 fragPosLightSpace, float bias){\n      // 执行透视除法\n    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;\n    // 变换到[0,1]的范围\n    projCoords = projCoords * 0.5 + 0.5;\n    // 取得最近点的深度(使用[0,1]范围下的fragPosLight当坐标)\n    float closestDepth = texture(shadowMap, projCoords.xy).r;\n    // 取得当前片元在光源视角下的深度\n    float currentDepth = projCoords.z;\n    // 检查当前片元是否在阴影中\n\n    float shadow = 0.0;\n    vec2 texelSize = vec2(1. / float(textureSize(shadowMap, 0).x));\n    for(int x = -1; x <= 1; ++x)\n    {\n        for(int y = -1; y <= 1; ++y)\n        {\n            float pcfDepth = texture(shadowMap, projCoords.xy + vec2(x, y) * texelSize).r;\n            shadow += currentDepth - bias > pcfDepth ? .7 : 0.0;\n        }\n    }\n    shadow /= 9.0;\n\n    if(projCoords.z > 1.0) shadow = 0.0;\n\n    return shadow;\n}\n\nvoid main(){\n    vec3 color = texture(diffuseTexture, TexCoords).rgb;\n    vec3 normal = normalize(Normal);\n    vec3 lightColor = vec3(2.0);\n    // Ambient\n    vec3 ambient = 0.15 * color;\n    // Diffuse\n    vec3 lightDir = normalize(lightPos - FragPos);\n    float diff = max(dot(lightDir, normal), 0.0);\n    vec3 diffuse = diff * lightColor;\n    // Specular\n    vec3 viewDir = normalize(viewPos - FragPos);\n    vec3 reflectDir = reflect(-lightDir, normal);\n    float spec = 0.0;\n    vec3 halfwayDir = normalize(lightDir + viewDir);\n    spec = pow(max(dot(normal, halfwayDir), 0.0), 64.0);\n    vec3 specular = spec * lightColor;\n    // 计算阴影\n    float bias = max(0.05 * (1.0 - dot(normal, lightDir)), 0.005);\n    float shadow = ShadowCalculation(FragPosLightSpace, bias);\n    vec3 lighting = (ambient + (1.0 - shadow) * (diffuse + specular)) * color;\n\n    FragColor = vec4(lighting, 1.0);\n}\n"}}]);