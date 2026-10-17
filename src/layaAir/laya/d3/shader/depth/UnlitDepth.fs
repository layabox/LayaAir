#define SHADER_NAME UnlitDepthFS

#include "DepthFrag.glsl";
#include "Sprite3DFrag.glsl";

#ifdef ALPHATEST
varying vec2 v_AlphaTestUV;
varying float v_AlphaTestVertexAlpha;
#endif // ALPHATEST

void main()
{
#ifdef ALPHATEST
    float alpha = u_AlbedoColor.a * v_AlphaTestVertexAlpha;

    #if defined(UV) && defined(ALBEDOTEXTURE)
    vec2 uv = transformUV(v_AlphaTestUV, u_TilingOffset);
    alpha *= texture2D(u_AlbedoTexture, uv).a;
    #endif // UV && ALBEDOTEXTURE

    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST

    gl_FragColor = getDepthColor();
}
