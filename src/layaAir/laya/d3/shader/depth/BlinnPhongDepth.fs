#define SHADER_NAME BlinnPhongDepthFS

#include "DepthFrag.glsl";
#include "Sprite3DFrag.glsl";

#ifdef ALPHATEST
varying vec2 v_AlphaTestUV;
varying float v_AlphaTestVertexAlpha;
#endif // ALPHATEST

void main()
{
#ifdef ALPHATEST
    float alpha = u_DiffuseColor.a * v_AlphaTestVertexAlpha;

    #ifdef DIFFUSEMAP
    vec2 uv = transformUV(v_AlphaTestUV, u_TilingOffset);
    alpha *= texture2D(u_DiffuseTexture, uv).a;
    #endif // DIFFUSEMAP

    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST

    gl_FragColor = getDepthColor();
}
