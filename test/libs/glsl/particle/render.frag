#version 300 es
// render.frag

precision highp float;

in vec4 vColor;
out vec4 FragColor;

void main(void) {
	if(vColor.a <= 0.01) {
		discard;
	}
    FragColor = vColor;
}