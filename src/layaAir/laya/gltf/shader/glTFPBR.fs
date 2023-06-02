#define SHADER_NAME glTFPBRFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "glTFMetallicRoughness.glsl";

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

#ifdef BASECOLORMAP
    vec2 baseColorUV = uv;
    #ifdef BASECOLORMAP_TRANSFORM
    baseColorUV = (u_BaseColorMapTransform * vec3(baseColorUV, 1.0)).xy;
    #endif // BASECOLORMAP_TRANSFORM
    vec4 baseColorSampler = texture2D(u_BaseColorTexture, baseColorUV);
    #ifdef Gamma_u_BaseColorTexture
    baseColorSampler = gammaToLinear(baseColorSampler);
    #endif // u_BaseColorTexture_Gamma
    inputs.diffuseColor *= baseColorSampler.rgb;
    inputs.alpha *= baseColorSampler.a;
#endif // BASECOLORMAP

    inputs.metallic = u_MetallicFactor;
    float roughness = u_RoughnessFactor;
#ifdef METALLICROUGHNESSMAP
    vec2 metallicUV = uv;
    #ifdef METALLICROUGHNESSMAP_TRANSFORM
    metallicUV = (u_MetallicRoughnessMapTransform * vec3(metallicUV, 1.0)).xy;
    #endif METALLICROUGHNESSMAP_TRANSFORM
    vec4 metallicRoughnessSampler = texture2D(u_MetallicRoughnessTexture, metallicUV);
    inputs.metallic *= metallicRoughnessSampler.b;
    roughness *= metallicRoughnessSampler.g;
#endif // METALLICROUGHNESSMAP
    inputs.roughness = roughness;

    float occlusion = 1.0;
#ifdef OCCLUSIONMAP
    vec2 occlusionUV = uv;
    #ifdef OCCLUSIONMAP_TRANSFORM
    occlusionUV = (u_OcclusionMapTransform * vec3(occlusionUV, 1.0)).xy;
    #endif // OCCLUSIONMAP_TRANSFORM
    vec4 occlusionSampler = texture2D(u_OcclusionTexture, occlusionUV);
    #ifdef Gamma_u_OcclusionTexture
    occlusionSampler = gammaToLinear(occlusionSampler);
    #endif // Gamma_u_OcclusionTexture
    occlusion = occlusionSampler.r;
#endif // OCCLUSIONMAP
    inputs.occlusion = (1.0 - u_OcclusionStrength) + occlusion * u_OcclusionStrength;

    inputs.emissionColor = u_EmissionFactor * u_EmissionStrength;
#ifdef EMISSIONMAP
    vec2 emissionUV = uv;
    #ifdef EMISSIONMAP_TRANSFORM
    emissionUV = (u_EmissionMapTransform * vec3(emissionUV, 1.0)).xy;
    #endif // EMISSIONMAP_TRANSFORM
    vec4 emissionSampler = texture2D(u_EmissionTexture, emissionUV);
    #ifdef Gamma_u_EmissionTexture
    emissionSampler = gammaToLinear(emissionSampler);
    #endif // Gamma_u_EmissionTexture
    inputs.emissionColor *= emissionSampler.rgb;
#endif // EMISSIONMAP

    inputs.normalTS = vec3(0.0, 0.0, 1.0);
#ifdef NORMALMAP
    vec2 normalUV = uv;
    #ifdef NORMALMAP_TRANSFORM
    normalUV = (u_NormalMapTransform * vec3(normalUV, 1.0)).xy;
    #endif // NORMALMAP_TRANSFORM
    vec3 normalSampler = texture2D(u_NormalTexture, normalUV).xyz;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    inputs.normalTS = normalScale(normalSampler, u_NormalScale);
#endif // NORMALMAP

#ifdef IOR
    inputs.ior = u_Ior;
#endif // IOR

#ifdef IRIDESCENCE
    float iridescenceFactor = u_IridescenceFactor;
    #ifdef IRIDESCENCEMAP
    vec2 iridescenceUV = uv;
	#ifdef IRIDESCENCEMAP_TRANSFORM
    iridescenceUV = (u_IridescenceMapTransform * vec3(iridescenceUV, 1.0)).xy;
	#endif // IRIDESCENCEMAP_TRANSFORM
    vec4 iridescenceSampler = texture2D(u_IridescenceTexture, iridescenceUV);
    iridescenceFactor *= iridescenceSampler.r;
    #endif // IRIDESCENCEMAP
    float iridescenceThickness = u_IridescenceThicknessMaximum;
    #ifdef IRIDESCENCE_THICKNESSMAP
    vec2 iridescenceThicknessUV = uv;
	#ifdef IRIDESCENCE_THICKNESSMAP_TRANSFORM
    iridescenceThicknessUV = (u_IridescenceThicknessMapTransform, vec3(iridescenceThicknessUV, 1.0)).xy;
	#endif // IRIDESCENCE_THICKNESSMAP_TRANSFORM
    vec4 iridescenceThicknessSampler = texture2D(u_IridescenceThicknessTexture, iridescenceThicknessUV);
    iridescenceThickness = mix(u_IridescenceThicknessMinimum, u_IridescenceThicknessMaximum, iridescenceThicknessSampler.g);
    #endif // IRIDESCENCE_THICKNESSMAP
    inputs.iridescence = iridescenceFactor;
    inputs.iridescenceIor = u_IridescenceIor;
    inputs.iridescenceThickness = iridescenceThickness;
#endif // IRIDESCENCE

#ifdef CLEARCOAT
    inputs.clearCoat = u_ClearCoatFactor;
    inputs.clearCoatRoughness = u_ClearCoatRoughness;

    #ifdef CLEARCOATMAP
    vec2 clearCoatUV = uv;
	#ifdef CLEARCOATMAP_TRANSFORM
    clearCoatUV = (u_ClearCoatMapTransform * vec3(clearCoatUV, 1.0)).xy;
	#endif // CLEARCOATMAP_TRANSFORM
    vec4 clearCoatSampler = texture2D(u_ClearCoatTexture, clearCoatUV);
    inputs.clearCoat *= clearCoatSampler.r;
    #endif // CLEARCOATMAP

    #ifdef CLEARCOAT_ROUGHNESSMAP
    vec2 clearCoatRoughnessUV = uv;
	#ifdef CLEARCOAT_ROUGHNESSMAP_TRANSFORM
    clearCoatRoughnessUV = (u_ClearCoatRoughnessMapTransform * vec3(uv, 1.0)).xy;
	#endif // CLEARCOAT_ROUGHNESSMAP_TRANSFORM
    vec4 clearcoatSampleRoughness = texture2D(u_ClearCoatRoughnessTexture, clearCoatRoughnessUV);
    inputs.clearCoatRoughness *= clearcoatSampleRoughness.g;
    #endif // CLEARCOAT_ROUGHNESSMAP

    #ifdef CLEARCOAT_NORMAL
    vec2 clearCoatNormalUV = uv;
	#ifdef CLEARCOAT_NORMALMAP_TRANSFORM
    clearCoatNormalUV = (u_ClearCoatNormalMapTransform * vec3(clearCoatNormalUV, 1.0)).xy;
	#endif // CLEARCOAT_NORMALMAP_TRANSFORM
    vec3 clearCoatNormalSampler = texture2D(u_ClearCoatNormalTexture, clearCoatNormalUV).rgb;
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
    vec3 anisotropyUV = uv;
	#ifdef ANISOTROPYMAP_TRANSFORM
    anisotropyUV = (u_AnisotropyMapTransform * vec3(anisotropyUV, 1.0)).xy;
	#endif // ANISOTROPYMAP_TRANSFORM
    vec3 anisotropySampler = texture2D(u_AnisotropyTexture, anisotropyUV).rgb;

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

    vec4 surfaceColor = glTFMetallicRoughness(inputs, pixel);

#ifdef FOG
    surfaceColor.rgb = sceneLitFog(surfaceColor.rgb);
#endif // FOG

    gl_FragColor = surfaceColor;

    //     // debug
    //     Surface surface;
    //     initSurface(surface, inputs, pixel);

    //     PixelInfo info;
    //     getPixelInfo(info, pixel, surface);

    //     vec3 debug = vec3(0.0);
    // #ifdef CLEARCOAT
    //     // debug = vec3(info.iridescenceFresnel);
    //     #ifdef CLEARCOAT_NORMAL
    //     debug = vec3(surface.clearCoatNormalTS * 0.5 + 0.5);
    //     #endif // CLEARCOAT_NORMAL
    //     // debug = vec3(surface.clearCoatRoughness);
    //     // debug = vec3(surface.clearCoat);
    // #endif // CLEARCOAT

    //     debug = gammaToLinear(debug);
    //     gl_FragColor = vec4(debug, 1.0);
}