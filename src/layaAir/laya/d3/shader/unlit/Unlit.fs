
#define SHADER_NAME UnlitFS

#include "Scene.glsl";
#include "MeshFrag.glsl";
#include "SceneFog.glsl";

void main()
{
    VertexParams params;
    getMeshVertexParams(params);

    vec3 color = u_AlbedoColor.rgb;
    float alpha = u_AlbedoColor.a;
#ifdef ALBEDOTEXTURE
    vec4 albedoSampler = texture2D(u_AlbedoTexture, params.texCoord0);
    color *= albedoSampler.rgb;
    alpha *= albedoSampler.a;
#endif // ALBEDOTEXTURE

#ifdef ALPHATEST
    if (color.a < u_AlphaTestValue)
	discard;
#endif // ALPHATEST

#ifdef FOG
    color = scenUnlitFog(color);
#endif // FOG

    gl_FragColor = vec4(color, alpha);
}