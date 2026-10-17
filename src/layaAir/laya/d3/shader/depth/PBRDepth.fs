#define SHADER_NAME PBRDepthFS

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

    #ifdef ALBEDOTEXTURE
    #ifdef UV
    vec2 uv = transformUV(v_AlphaTestUV, u_TilingOffset);
    #else // UV
    vec2 uv = vec2(0.0);
    #endif // UV
    alpha *= texture2D(u_AlbedoTexture, uv).a;
    #endif // ALBEDOTEXTURE

    if (alpha < u_AlphaTestValue)
        discard;
    #endif // ALPHATEST

    gl_FragColor = getDepthColor();
}
