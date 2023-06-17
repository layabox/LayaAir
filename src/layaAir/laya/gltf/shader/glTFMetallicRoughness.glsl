#if !defined(glTFMetallicRoughness_lib)
    #define glTFMetallicRoughness_lib

    #include "ShadingFrag.glsl";

    #include "PBRFrag.glsl";

struct SurfaceInputs {
    vec3 diffuseColor;
    float alpha;
    float alphaTest;
    float metallic;
    float roughness;
    float occlusion;
    vec3 emissionColor;
    vec3 normalTS;
    float specular;

    // specular
    float specularFactor;
    vec3 specularColor;

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

    #ifdef IOR
    float ior;
    #endif // IOR

    #ifdef IRIDESCENCE
    float iridescence;
    float iridescenceIor;
    float iridescenceThickness;
    #endif // IRIDESCENCE

    #ifdef SHEEN
    vec3 sheenColor;
    float sheenRoughness;
    #endif // SHEEN

    #ifdef TRANSMISSION
    float transmission;

	#ifdef VOLUME
    float thickness;
    vec3 attenuationColor;
    float attenuationDistance;
	#endif // VOLUME

    #endif // TRANSMISSION
};

void initSurface(inout Surface surface, const in SurfaceInputs inputs, const in PixelParams pixel)
{
    surface.alpha = inputs.alpha;

    surface.normalTS = inputs.normalTS;

    vec3 baseColor = inputs.diffuseColor;
    float metallic = inputs.metallic;
    float perceptualRoughness = inputs.roughness;

    #ifdef IOR
    float ior = inputs.ior;
    surface.ior = ior;
    vec3 f0 = vec3(dielectricIorToF0(ior));
    #else // IOR
    vec3 f0 = vec3(dielectricSpecularToF0(inputs.specular));
    surface.ior = dielectricF0ToIor(f0.x);
    #endif // IOR

    // KHR_materials_specular
    f0 *= inputs.specularFactor * inputs.specularColor;

    surface.perceptualRoughness = max(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS);
    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;
    surface.diffuseColor = computeDiffuse(baseColor, metallic);
    surface.f0 = computeF0(f0, baseColor, metallic);
    surface.f90 = computeF90(surface.f0);

    surface.occlusion = inputs.occlusion;

    #ifdef EMISSION
    surface.emissionColor = inputs.emissionColor;
    #endif // EMISSION

    #ifdef IRIDESCENCE
    surface.iridescence = inputs.iridescence;
    surface.iridescenceIor = inputs.iridescenceIor;
    surface.iridescenceThickness = inputs.iridescenceThickness;
    #endif // IRIDESCENCE

    #ifdef SHEEN
    surface.sheenColor = inputs.sheenColor;
    surface.sheenPerceptualRoughness = max(inputs.sheenRoughness, MIN_PERCEPTUAL_ROUGHNESS);
    surface.sheenRoughness = pow2(surface.sheenPerceptualRoughness);
    #endif // SHEEN

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

    #ifdef TRANSMISSION
    surface.transmission = inputs.transmission;
	#ifdef VOLUME
    surface.thickness = inputs.thickness;
    surface.attenuationColor = inputs.attenuationColor;
    surface.attenuationDistance = inputs.attenuationDistance;
	#endif // VOLUME
    #endif // TRANSMISSION
}

vec4 glTFMetallicRoughness(const in SurfaceInputs inputs, in PixelParams pixel)
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

    return vec4(surfaceColor, surface.alpha);
}

#endif // glTFMetallicRoughness_lib