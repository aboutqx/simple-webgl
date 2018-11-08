
precision mediump float;

uniform sampler2D equirectangularMap;
varying vec3 WorldPos;
varying vec2 vUv;

const vec2 invAtan = vec2(0.1591, 0.3183);
vec2 SampleSphericalMap(vec3 v)
{
    vec2 uv = vec2(atan(v.z, v.x), asin(v.y)); // [-PI/2,PI/2]
    uv *= invAtan; //[-.5,.5]
    uv += 0.5;
    return uv;
}

void main()
{
    vec2 uv = SampleSphericalMap(normalize(WorldPos));
    vec3 color = texture2D(equirectangularMap, uv).rgb;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(WorldPos,1.);
}