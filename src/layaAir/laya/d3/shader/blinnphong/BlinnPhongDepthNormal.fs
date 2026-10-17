#define SHADER_NAME BlinnPhongDephtNormalFS

#include "Color.glsl";

#include "Scene.glsl";

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
    float alpha = u_DiffuseColor.a;
    #if defined(COLOR) && defined(ENABLEVERTEXCOLOR)
    alpha *= pixel.vertexColor.a;
    #endif // COLOR && ENABLEVERTEXCOLOR

    #ifdef DIFFUSEMAP
    #ifdef UV
    vec2 alphaUV = transformUV(pixel.uv0, u_TilingOffset);
    #else // UV
    vec2 alphaUV = vec2(0.0);
    #endif // UV
    alpha *= texture2D(u_DiffuseTexture, alphaUV).a;
    #endif // DIFFUSEMAP

    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST

    vec3 normalWS = pixel.normalWS;

#ifdef NORMALMAP
    #ifdef UV

    vec2 uv = transformUV(pixel.uv0, u_TilingOffset);
    vec3 normalSampler = texture2D(u_NormalTexture, uv).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    vec3 normalTS = normalSampler;
    normalWS = normalize(pixel.TBN * normalTS);

    #endif // UV
#endif // NORMALMAP

    vec4 positionCS = v_PositionCS;

    vec4 dephtNormal = encodeDepthNormal(positionCS, normalWS);

    gl_FragColor = dephtNormal;
}
