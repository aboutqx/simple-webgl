#version 300 es
in vec3 position;
in vec2 texCoord;
uniform   mat4 mMatrix;
uniform   mat4 vpMatrix;

out vec3 WorldPos;
out vec2 vUv;
void main(void){
  vec4 pos       = mMatrix * vec4(position, 1.0);
	gl_Position    = vpMatrix * pos;

  WorldPos = pos.xyz;
  vUv = texCoord;
}