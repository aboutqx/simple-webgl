#version 300 es
precision mediump float;
out vec4 FragColor;

struct Material {
    sampler2D diffuse;
    sampler2D specular;
    float shininess;
};

struct Light {
    vec3 position;
    vec3 direction;

    vec3 ambient;
    vec3 diffuse;
    vec3 specular;

    float cutOff;
};

in vec3 FragPos;
in vec3 Normal;
in vec2 TexCoords;

uniform vec3 camPos;
uniform Material material;
uniform Light light;

void main()
{
  vec3 result;
  vec3 lightDir = normalize(light.position - FragPos);
  float theta = dot(lightDir, normalize(-light.direction));
  if(theta > light.cutOff)
  {
    // ambient
    vec3 ambient = light.ambient * texture(material.diffuse, TexCoords).rgb;

    // diffuse
    vec3 norm = normalize(Normal);

    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = light.diffuse * diff * texture(material.diffuse, TexCoords).rgb;

    // specular
    vec3 viewDir = normalize(camPos - FragPos);
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
    vec3 specular = light.specular * spec * texture(material.specular, TexCoords).rgb;

    result = ambient + diffuse + specular;
  }
  else {
    // 否则，使用环境光，让场景在聚光之外时不至于完全黑暗
    result = light.ambient * vec3(texture(material.diffuse, TexCoords));
  }

  FragColor = vec4(result, 1.0);
}
