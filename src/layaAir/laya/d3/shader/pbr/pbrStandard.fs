#define SHADER_NAME PBRStandardFS

#include "Color.glsl";

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3D.glsl";

#include "PBRFrag.glsl";
#include "PBRGI.glsl";

struct SurfaceInputs {
    vec3 diffuseColor;
    float alpha;
    float alphaTest;
    float metallic;
    float smoothness;
    float occlusion;
    vec3 emissionColor;
};

void initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)
{
    vec2 uv = pixel.uv0;

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
}

void initSurface(inout Surface surface, const in SurfaceInputs inputs)
{
    surface.alpha = inputs.alpha;

    vec3 baseColor = inputs.diffuseColor;
    float metallic = inputs.metallic;
    float perceptualRoughness = 1.0 - inputs.smoothness;
    float reflectance = 0.5;

    surface.diffuseColor = (1.0 - metallic) * baseColor;
    surface.perceptualRoughness = clamp(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;
    surface.f0 = baseColor * metallic + (0.16 * reflectance * reflectance * (1.0 - metallic));
}

void main()
{
    PixelParams pixel;
    getPixelParams(pixel);

    SurfaceInputs inputs;
    initSurfaceInputs(inputs, pixel);

#ifdef ALPHATEST
    if (inputs.alpha < inputs.alphaTest)
	{
	    discard;
	}
#endif // ALPHATEST

    Surface surface;
    initSurface(surface, inputs);

    vec3 surfaceColor = vec3(0.0);

#if defined(LIGHTING)
    surfaceColor += PBRLighting(surface, pixel);
#endif // LIGHTING

    // GI
    // todo occlusion
    surfaceColor += PBRGI(surface, pixel) * inputs.occlusion;

// todo emission calculate
#ifdef EMISSION
    surfaceColor += inputs.emissionColor;
#endif // EMISSION

    gl_FragColor = vec4(surfaceColor, surface.alpha);
    // #ifdef NEEDTBN
    // gl_FragColor = vec4(vec3(inputs.occlusion), 1.0);
    // #endif // NEEDTBN
}