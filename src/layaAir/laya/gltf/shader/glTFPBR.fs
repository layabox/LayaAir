#define SHADER_NAME glTFPBRFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "PBRMetallicFrag.glsl";

void initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)
{
    vec2 uv = vec2(0.0);
#ifdef UV
    uv = pixel.uv0;
#endif //

    // render state
    inputs.alphaTest = u_AlphaTestValue;

    // surface
    inputs.diffuseColor = u_BaseColorFactor.xyz;
    inputs.alpha = u_BaseColorFactor.w;

#ifdef COLOR
    #ifdef ENABLEVERTEXCOLOR
    inputs.diffuseColor *= pixel.vertexColor.xyz;
    inputs.alpha *= pixel.vertexColor.a;
    #endif // ENABLEVERTEXCOLOR
#endif // COLOR

#ifdef BASECOLORMAP
    vec4 baseColorSampler = texture2D(u_BaseColorTexture, uv);
#ifdef Gamma_u_BaseColorTexture
    baseColorSampler = gammaToLinear(baseColorSampler);
#endif // u_BaseColorTexture_Gamma
    inputs.diffuseColor *= baseColorSampler.rgb;
    inputs.alpha *= baseColorSampler.a;
#endif // BASECOLORMAP

    inputs.metallic = u_MetallicFactor;
    float roughness = u_RoughnessFactor;
#ifdef METALLICROUGHNESSMAP
    vec4 metallicRoughnessSampler = texture2D(u_MetallicRoughnessTexture, uv);
    inputs.metallic *= metallicRoughnessSampler.b;
    roughness *= metallicRoughnessSampler.g;
#endif // METALLICROUGHNESSMAP
    inputs.smoothness = 1.0 - roughness;

    float occlusion = 1.0;
#ifdef OCCLUSIONMAP
    vec4 occlusionSampler = texture2D(u_OcclusionTexture, uv);
    #ifdef Gamma_u_OcclusionTexture
    occlusionSampler = gammaToLinear(occlusionSampler);
    #endif // Gamma_u_OcclusionTexture
    occlusion = occlusionSampler.r;
#endif // OCCLUSIONMAP
    inputs.occlusion = (1.0 - u_OcclusionStrength) + occlusion * u_OcclusionStrength;

    inputs.emissionColor = u_EmissionFactor * u_EmissionStrength;
#ifdef EMISSIONMAP
    vec4 emissionSampler = texture2D(u_EmissionTexture, uv);
    #ifdef Gamma_u_EmissionTexture
    emissionSampler = gammaToLinear(emissionSampler);
    #endif // Gamma_u_EmissionTexture
    inputs.emissionColor *= emissionSampler.rgb;
#endif // EMISSIONMAP

    inputs.normalTS = vec3(0.0, 0.0, 1.0);
#ifdef NORMALMAP
    vec3 normalSampler = texture2D(u_NormalTexture, uv).xyz;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    inputs.normalTS = normalScale(normalSampler, u_NormalScale);
#endif // NORMALMAP

#ifdef CLEARCOAT
    inputs.clearCoat = u_ClearCoatFactor;
    inputs.clearCoatRoughness = u_ClearCoatRoughness;

    #ifdef CLEARCOATMAP
    vec4 clearCoatSampler = texture2D(u_ClearCoatTexture, uv);
    inputs.clearCoat *= clearCoatSampler.r;
    #endif // CLEARCOATMAP

    #ifdef CLEARCOAT_ROUGHNESSMAP
    vec4 clearcoatSampleRoughness = texture2D(u_ClearCoatRoughnessTexture, uv);
    inputs.clearCoatRoughness *= clearcoatSampleRoughness.g;
    #endif // CLEARCOAT_ROUGHNESSMAP

    #ifdef CLEARCOAT_NORMAL
    vec3 clearCoatNormalSampler = texture2D(u_ClearCoatNormalTexture, uv).rgb;
    clearCoatNormalSampler = normalize(clearCoatNormalSampler * 2.0 - 1.0);
    clearCoatNormalSampler.y *= -1.0;
    // todo scale
    inputs.clearCoatNormalTS = normalScale(clearCoatNormalSampler, u_ClearCoatNormalScale);
    #endif // CLEARCOAT_NORMAL
#endif // CLEARCOAT

#ifdef ANISOTROPIC
    inputs.anisotropy = u_AnisotropyStrength;
    vec2 direction = vec2(1.0, 0.0);

    #ifdef ANISOTROPYMAP
    vec3 anisotropySampler = texture2D(u_AnisotropyTexture, uv).rgb;

    inputs.anisotropy *= anisotropySampler.b;
    direction = anisotropySampler.xy * 2.0 - 1.0;
    #endif // ANISOTROPYMAP

    vec2 anisotropyRotation = vec2(cos(u_AnisotropyRotation), sin(u_AnisotropyRotation));
    mat2 rotationMatrix = mat2(anisotropyRotation.x, anisotropyRotation.y, -anisotropyRotation.y, anisotropyRotation.x);
    inputs.anisotropyDirection = rotationMatrix * direction;

#endif // ANISOTROPIC
}

void main()
{
    PixelParams pixel;
    getPixelParams(pixel);

    SurfaceInputs inputs;
    initSurfaceInputs(inputs, pixel);

    vec4 surfaceColor = PBR_Metallic_Flow(inputs, pixel);

#ifdef FOG
    surfaceColor.rgb = sceneLitFog(surfaceColor.rgb);
#endif // FOG

    gl_FragColor = surfaceColor;

    // // debug
    // Surface surface;
    // initSurface(surface, inputs, pixel);

    // // PixelInfo info;
    // // getPixelInfo(info, pixel, surface);

    // vec3 debug = vec3(0.0);

    // debug = vec3(1.0 - inputs.smoothness);

    // debug = gammaToLinear(debug);
    // gl_FragColor = vec4(debug, 1.0);
}