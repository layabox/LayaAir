#define SHADER_NAME SkyBoxFS

#include "Color.glsl";

varying vec3 v_Texcoord;

const vec4 c_ColorSpace = vec4(4.59479380, 4.59479380, 4.59479380, 2.0);

void main()
{
    vec3 uv = v_Texcoord;
    vec4 cubeSampler = textureCube(u_CubeTexture, uv);
#ifdef Gamma_u_CubeTexture
    cubeSampler = gammaToLinear(cubeSampler);
#endif // Gamma_u_CubeTexture

    vec3 color = cubeSampler.rgb * u_TintColor.rgb * pow(u_Exposure, 2.2) * c_ColorSpace.rgb;

    gl_FragColor = vec4(color, 1.0);

    gl_FragColor = outputTransform(gl_FragColor);
}