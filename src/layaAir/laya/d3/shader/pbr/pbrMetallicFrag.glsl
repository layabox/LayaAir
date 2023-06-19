#if !defined(PBRMetallic_lib)
    #define PBRMetallic_lib

    #include "ShadingFrag.glsl";

    #include "PBRFrag.glsl";

struct SurfaceInputs {
    vec3 diffuseColor;
    float alpha;
    float alphaTest;
    float metallic;
    float smoothness;
    float occlusion;
    vec3 emissionColor;
    vec3 normalTS;

    #ifdef CLEARCOAT
    float clearCoat;
    float clearCoatRoughness;
	#ifdef CLEARCOAT_NORMAL
    vec3 clearCoatNormalTS;
	#endif // CLEARCOAT_NORMAL
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    float anisotropy;
    vec2 anisotropyDirection;
    #endif // ANISOTROPIC
};

void initSurface(inout Surface surface, const in SurfaceInputs inputs, const in PixelParams pixel)
{
    surface.alpha = inputs.alpha;

    surface.normalTS = inputs.normalTS;

    vec3 baseColor = inputs.diffuseColor;
    float metallic = inputs.metallic;
    float perceptualRoughness = 1.0 - inputs.smoothness;

    float ior = 1.5;
    vec3 f0 = vec3(pow2((ior - 1.0) / (ior + 1.0)));

    surface.perceptualRoughness = clamp(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;
    surface.diffuseColor = (1.0 - metallic) * baseColor;
    surface.f0 = mix(f0, baseColor, metallic);

    surface.occlusion = inputs.occlusion;

    #ifdef CLEARCOAT
    surface.clearCoat = inputs.clearCoat;
    surface.clearCoatPerceptualRoughness = clamp(inputs.clearCoatRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
    surface.clearCoatRoughness = surface.clearCoatPerceptualRoughness * surface.clearCoatPerceptualRoughness;
	#ifdef CLEARCOAT_NORMAL
    surface.clearCoatNormalTS = inputs.clearCoatNormalTS;
	#endif // CLEARCOAT_NORMAL
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    surface.anisotropy = inputs.anisotropy;
    surface.anisotropyDirection = inputs.anisotropyDirection;
    #endif // ANISOTROPIC
}

vec4 PBR_Metallic_Flow(const in SurfaceInputs inputs, in PixelParams pixel)
{
    #ifdef ALPHATEST
    if (inputs.alpha < inputs.alphaTest)
	{
	    discard;
	}
    #endif // ALPHATEST

    Surface surface;
    initSurface(surface, inputs, pixel);

    PixelInfo info;
    getPixelInfo(info, pixel, surface);

    vec3 surfaceColor = vec3(0.0);
    surfaceColor += PBRLighting(surface, info);

    // todo emission calculate
    #ifdef EMISSION
    surfaceColor += inputs.emissionColor;
    #endif // EMISSION

    return vec4(surfaceColor, surface.alpha);
}

#endif // PBRMetallic_lib
