#include "PBRFrag.glsl";

struct SurfaceInputs {
    vec3 diffuseColor;
    float alpha;
    float alphaTest;
    float metallic;
    float smoothness;
    float occlusion;
    vec3 emissionColor;
    float anisotropy;
};

void initSurface(inout Surface surface, const in SurfaceInputs inputs, const in PixelParams pixel)
{
    surface.alpha = inputs.alpha;

    vec3 baseColor = inputs.diffuseColor;
    float metallic = inputs.metallic;
    float perceptualRoughness = 1.0 - inputs.smoothness;
    float reflectance = 0.5;

    float dielectricSpecular = 0.16 * reflectance * reflectance;

    surface.diffuseColor = (1.0 - metallic) * baseColor;
    surface.perceptualRoughness = clamp(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;
    surface.f0 = baseColor * metallic + (dielectricSpecular * (1.0 - metallic));

    surface.occlusion = inputs.occlusion;

    surface.dfg = prefilteredDFG_LUT(surface.perceptualRoughness, pixel.NoV);

#ifdef ANISOTROPIC
    surface.anisotropy = inputs.anisotropy;
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

    vec3 surfaceColor = vec3(0.0);

    surfaceColor += PBRLighting(surface, pixel);

// todo emission calculate
#ifdef EMISSION
    surfaceColor += inputs.emissionColor;
#endif // EMISSION

    return vec4(surfaceColor, surface.alpha);
}
