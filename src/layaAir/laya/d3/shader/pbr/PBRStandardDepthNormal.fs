#define SHADER_NAME PBRStandardDepthNormalFS

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

    vec3 normalWS = pixel.normalWS;

#ifdef NORMALTEXTURE
    #ifdef UV

    vec2 uv = transformUV(pixel.uv0, u_TilingOffset);
    vec3 normalSampler = texture2D(u_NormalTexture, uv).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    vec3 normalTS = normalScale(normalSampler, u_NormalScale);
    normalWS = normalize(pixel.TBN * normalTS);

    #endif // UV
#endif // NORMALTEXTURE

    vec4 positionCS = v_PositionCS;

    vec4 dephtNormal = encodeDepthNormal(positionCS, normalWS);

    gl_FragColor = dephtNormal;
}