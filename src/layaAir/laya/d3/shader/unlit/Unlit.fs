
#define SHADER_NAME UNLITFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#ifdef UV
varying vec2 v_Texcoord0;
#endif // UV

#ifdef COLOR
varying vec4 v_VertexColor;
#endif // COLOR

void main()
{
    vec3 color = u_AlbedoColor.rgb;
    float alpha = u_AlbedoColor.a;

#ifdef COLOR
    #ifdef ENABLEVERTEXCOLOR
    vec4 vertexColor = v_VertexColor;
    color *= vertexColor.rgb;
    alpha *= vertexColor.a;
    #endif // ENABLEVERTEXCOLOR
#endif // COLOR

#ifdef UV
    vec2 uv = v_Texcoord0;

    #ifdef ALBEDOTEXTURE
    vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);

	#ifdef Gamma_u_AlbedoTexture
    albedoSampler = gammaToLinear(albedoSampler);
	#endif // Gamma_u_AlbedoTexture

    color *= albedoSampler.rgb;
    alpha *= albedoSampler.a;
    #endif // ALBEDOTEXTURE
#endif // UV

#ifdef ALPHATEST
    if (alpha < u_AlphaTestValue)
	discard;
#endif // ALPHATEST

#ifdef FOG
    color = scenUnlitFog(color);
#endif // FOG

    gl_FragColor = vec4(color, alpha);
}