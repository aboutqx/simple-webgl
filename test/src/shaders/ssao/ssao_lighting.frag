#version 300 es
precision mediump float;

out vec4 outColor;

in vec2 TexCoords;

uniform sampler2D gPosition;
uniform sampler2D gNormal;
uniform sampler2D gAlbedoSpec;

struct Light {
    vec3 Position;
    vec3 Color;

    float Linear;
    float Quadratic;
};
uniform Light lights;
uniform vec3 viewPos;

void main() {
    vec3 FragPos = texture(gPosition, TexCoords).rgb;
    vec3 Normal = texture(gNormal, TexCoords).rgb;
    vec3 Diffuse = texture(gAlbedoSpec, TexCoords).rgb;
    float Specular = texture(gAlbedoSpec, TexCoords).a;

    // then calculate lighting as usual
    vec3 lighting  = Diffuse * .1; // hard-coded ambient component
    vec3 viewDir  = normalize(viewPos - FragPos);


    // diffuse
    vec3 lightDir = normalize(lights.Position - FragPos);
    vec3 diffuse = max(dot(Normal, lightDir), 0.0) * Diffuse * lights.Color;
    // specular
    vec3 halfwayDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(Normal, halfwayDir), 0.0), 16.0);
    vec3 specular = lights.Color * spec * Specular;
    // attenuation
    float distance = length(lights.Position - FragPos);
    float attenuation = 1.0 / (1.0 + lights.Linear * distance + lights.Quadratic * distance * distance);
    diffuse *= attenuation;
    specular *= attenuation;
    lighting += diffuse + specular;

    outColor = vec4(lighting, 1.0);
}
