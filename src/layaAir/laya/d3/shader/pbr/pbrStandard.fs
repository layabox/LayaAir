#define SHADER_NAME PBRStandardFS

#include "Color.glsl";

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "PBRMetallicFrag.glsl"

void initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)
{

#ifdef UV
    vec2 uv = pixel.uv0;
#else // UV
    vec2 uv = vec2(0.0);
#endif // UV
    inputs.diffuseColor = u_AlbedoColor.rgb;
    inputs.alpha = u_AlbedoColor.a;
    inputs.alphaTest = u_AlphaTestValue;

#ifdef ALBEDOTEXTURE
    vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
    #ifdef Gamma_u_AlbedoTexture
    albedoSampler = gammaToLinear(albedoSampler);
    #endif // Gamma_u_AlbedoTexture

    inputs.diffuseColor *= albedoSampler.rgb;
    inputs.alpha *= albedoSampler.a;
#endif // ALBEDOTEXTURE

    inputs.metallic = u_Metallic;
    inputs.smoothness = u_Smoothness;

#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
    inputs.smoothness = u_SmoothnessScale;
    #ifdef ALBEDOTEXTURE
    inputs.smoothness *= albedoSampler.a;
    #endif // ALBEDOTEXTURE
#endif // SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA

#ifdef METALLICGLOSSTEXTURE

    vec4 metallicSampler = texture2D(u_MetallicGlossTexture, uv);
    #ifdef Gamma_u_MetallicGlossTexture
    metallicSampler = gammaToLinear(metallicSampler);
    #endif // Gamma_u_MetallicGlossTexture

    inputs.metallic = metallicSampler.x;
    inputs.smoothness = metallicSampler.w * u_SmoothnessScale;

    #ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
    inputs.smoothness = u_SmoothnessScale;
	#ifdef ALBEDOTEXTURE
    inputs.smoothness *= albedoSampler.a;
	#endif // ALBEDOTEXTURE
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

#ifdef EMISSION
    inputs.emissionColor = u_EmissionColor.rgb;
    #ifdef EMISSIONTEXTURE
    vec4 emissionSampler = texture2D(u_EmissionTexture, uv);
	#ifdef Gamma_u_EmissionTexture
    emissionSampler = gammaToLinear(emissionSampler);
	#endif // Gamma_u_EmissionTexture
    inputs.emissionColor *= emissionSampler.rgb;
    #endif // EMISSIONTEXTURE
#endif // EMISSION

#ifdef ANISOTROPIC
    inputs.anisotropy = u_Anisotropy;
#endif // ANISOTROPIC
}

void main()
{
    PixelParams pixel;
    getPixelParams(pixel);

    SurfaceInputs inputs;
    initSurfaceInputs(inputs, pixel);

    vec4 surfaceColor = PBR_Metallic_Flow(inputs, pixel);

    gl_FragColor = surfaceColor;
}