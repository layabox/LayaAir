#define SHADER_NAME SkyBoxFS

#include "Color.glsl";

varying vec3 v_Texcoord;

void main()
{
    vec2 uv = v_Texcoord;
    vec4 cubeSampler = textureCube(u_CubeTexture, uv);
#ifdef Gamma_u_CubeTexture
    cubeSampler = gammaToLinear(cubeSampler);
#endif // Gamma_u_CubeTexture

    vec3 color = cubeSampler.rgb * u_TintColor.rgb * u_Exposure * 2.0;

    gl_FragColor = vec4(color, 1.0);
}