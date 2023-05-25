#define SHADER_NAME PBRStandardFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "PBRMetallicFrag.glsl";

#if defined(DETAILTEXTURE) || defined(DETAILNORMAL)
varying vec2 v_DetailUV;
    #define ColorSpaceDouble vec3(4.59479380, 4.59479380, 4.59479380);
vec3 BlendNormals(vec3 n1, vec3 n2)
{
    return normalize(vec3(n1.xy + n2.xy, n1.z * n2.z));
}
#endif // DETAILTEXTURE || DETAILNORMAL

void initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)
{
#ifdef UV
    vec2 uv = transformUV(pixel.uv0, u_TilingOffset);
#else // UV
    vec2 uv = vec2(0.0);
#endif // UV

    inputs.diffuseColor = u_AlbedoColor.rgb;
    inputs.alpha = u_AlbedoColor.a;

#ifdef COLOR
    #ifdef ENABLEVERTEXCOLOR
    inputs.diffuseColor *= pixel.vertexColor.xyz;
    inputs.alpha *= pixel.vertexColor.a;
    #endif // ENABLEVERTEXCOLOR
#endif // COLOR

    inputs.alphaTest = u_AlphaTestValue;

#ifdef ALBEDOTEXTURE
    vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
    #ifdef Gamma_u_AlbedoTexture
    albedoSampler = gammaToLinear(albedoSampler);
    #endif // Gamma_u_AlbedoTexture
    inputs.diffuseColor *= albedoSampler.rgb;
    inputs.alpha *= albedoSampler.a;
#endif // ALBEDOTEXTURE

// Detail Albedo
#ifdef DETAILTEXTURE
    vec3 detailSampler = texture2D(u_DetailAlbedoTexture, v_DetailUV).rgb;
    #ifdef Gamma_u_DetailAlbedoTexture
    detailSampler = gammaToLinear(detailSampler);
    #endif // Gamma_u_DetailAlbedoTexture
    detailSampler *= ColorSpaceDouble;
    inputs.diffuseColor *= detailSampler;
#endif

    inputs.normalTS = vec3(0.0, 0.0, 1.0);
#ifdef NORMALTEXTURE
    vec3 normalSampler = texture2D(u_NormalTexture, uv).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    inputs.normalTS = normalScale(normalSampler, u_NormalScale);
#endif

#ifdef DETAILNORMAL
    vec3 detailnormalSampler = texture2D(u_DetailNormalTexture, v_DetailUV).rgb;
    detailnormalSampler = normalize(detailnormalSampler * 2.0 - 1.0);
    detailnormalSampler.y *= -1.0;
    detailnormalSampler = normalScale(detailnormalSampler, u_DetailNormalScale);
    inputs.normalTS = BlendNormals(inputs.normalTS, detailnormalSampler);
#endif

    inputs.metallic = u_Metallic;
    inputs.smoothness = u_Smoothness;

#ifdef METALLICGLOSSTEXTURE

    vec4 metallicSampler = texture2D(u_MetallicGlossTexture, uv);
    #ifdef Gamma_u_MetallicGlossTexture
    metallicSampler = gammaToLinear(metallicSampler);
    #endif // Gamma_u_MetallicGlossTexture

    inputs.metallic = metallicSampler.x;

    #ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
	#ifdef ALBEDOTEXTURE
    inputs.smoothness = (albedoSampler.a * u_Smoothness);
	#endif // ALBEDOTEXTURE
    #else // SMOOTHNESSSOURCE_METALLICTEXTURE_ALPHA
    inputs.smoothness = (metallicSampler.a * u_Smoothness);
    #endif // SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA

#endif // METALLICGLOSSTEXTURE

    inputs.occlusion = 1.0;
#ifdef OCCLUSIONTEXTURE
    vec4 occlusionSampler = texture2D(u_OcclusionTexture, uv);
    #ifdef Gamma_u_OcclusionTexture
    occlusionSampler = gammaToLinear(occlusionSampler);
    #endif // Gamma_u_OcclusionTexture

    float occlusion = occlusionSampler.g;
    inputs.occlusion = (1.0 - u_OcclusionStrength) + occlusion * u_OcclusionStrength;
#endif // OCCLUSIONTEXTURE

    inputs.emissionColor = vec3(0.0);
#ifdef EMISSION
    inputs.emissionColor = u_EmissionColor.rgb * u_EmissionIntensity;
    #ifdef EMISSIONTEXTURE
    vec4 emissionSampler = texture2D(u_EmissionTexture, uv);
	#ifdef Gamma_u_EmissionTexture
    emissionSampler = gammaToLinear(emissionSampler);
	#endif // Gamma_u_EmissionTexture
    inputs.emissionColor *= emissionSampler.rgb;
    #endif // EMISSIONTEXTURE
#endif // EMISSION

#ifdef CLEARCOAT
    inputs.clearCoat = u_ClearCoatFactor;
    inputs.clearCoatRoughness = u_ClearCoatRoughness;

    #ifdef CLEARCOATMAP
    // todo
    // linear tex no need gamma
    vec4 clearCoatSampler = texture2D(u_ClearCoatTexture, uv);
    inputs.clearCoat *= clearCoatSampler.r;
    #endif // CLEARCOATMAP

    #ifdef CLEARCOAT_ROUGHNESSMAP
    // todo
    // linear tex no need gamma
    vec4 clearcoatSampleRoughness = texture2D(u_ClearCoatRoughnessTexture, uv);
    inputs.clearCoatRoughness *= clearcoatSampleRoughness.g;
    #endif // CLEARCOAT_ROUGHNESSMAP

    #ifdef CLEARCOAT_NORMAL
    vec3 clearCoatNormalSampler = texture2D(u_ClearCoatNormalTexture, uv).rgb;
    clearCoatNormalSampler = normalize(clearCoatNormalSampler * 2.0 - 1.0);
    clearCoatNormalSampler.y *= -1.0;
    inputs.clearCoatNormalTS = clearCoatNormalSampler;
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
}