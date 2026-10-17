#define SHADER_NAME glTFPBRDepthNormalFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "ShadingFrag.glsl";

#include "DepthNormalFrag.glsl";

varying vec4 v_PositionCS;

void main()
{
    PixelParams pixel;
    getPixelParams(pixel);

#ifdef ALPHATEST
    float alpha = u_BaseColorFactor.w;
    #if defined(COLOR) && defined(ENABLEVERTEXCOLOR)
    alpha *= pixel.vertexColor.a;
    #endif // COLOR && ENABLEVERTEXCOLOR

    #ifdef BASECOLORMAP
    vec2 baseColorUV = vec2(0.0);
    #ifdef UV
    baseColorUV = pixel.uv0;
    #endif // UV
    #ifdef BASECOLORMAP_TRANSFORM
    baseColorUV = (u_BaseColorMapTransform * vec3(baseColorUV, 1.0)).xy;
    #endif // BASECOLORMAP_TRANSFORM
    alpha *= texture2D(u_BaseColorTexture, baseColorUV).a;
    #endif // BASECOLORMAP

    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST

    vec3 normalWS = pixel.normalWS;

#ifdef NORMALMAP
    #ifdef UV

    vec2 uv = pixel.uv0;

    vec3 normalSampler = texture2D(u_NormalTexture, uv).xyz;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    vec3 normalTS = normalScale(normalSampler, u_NormalScale);
    normalWS = normalize(pixel.TBN * normalTS);

    #endif UV
#endif // NORMALMAP

    vec4 positionCS = v_PositionCS;

    vec4 dephtNormal = encodeDepthNormal(positionCS, normalWS);

    gl_FragColor = dephtNormal;
}
