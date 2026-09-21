#define SHADER_NAME glTFDepthFS

#include "DepthFrag.glsl";

#ifdef ALPHATEST
varying vec2 v_AlphaTestUV;
varying float v_AlphaTestVertexAlpha;
#endif // ALPHATEST

void main()
{
#ifdef ALPHATEST
    float alpha = u_BaseColorFactor.w * v_AlphaTestVertexAlpha;

    #ifdef BASECOLORMAP
    vec2 baseColorUV = v_AlphaTestUV;
        #ifdef BASECOLORMAP_TRANSFORM
    baseColorUV = (u_BaseColorMapTransform * vec3(baseColorUV, 1.0)).xy;
        #endif // BASECOLORMAP_TRANSFORM
    alpha *= texture2D(u_BaseColorTexture, baseColorUV).a;
    #endif // BASECOLORMAP

    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST

    gl_FragColor = getDepthColor();
}
