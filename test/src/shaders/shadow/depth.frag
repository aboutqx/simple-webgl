#version 300 es
precision mediump float;
in   vec2 vTexCoord;
out vec4 outColor;
uniform sampler2D texture;
uniform float lod;

float near = 0.1;
float far  = 100.0;

float LinearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near * far) / (far + near - z * (far - near));
}

void main(void){
    float depth = LinearizeDepth(gl_FragCoord.z) / far; // 为了演示除以 far
    outColor = vec4(vec3(depth), 1.0);
}