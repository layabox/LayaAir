#if !defined(PBRMetallic_lib)
    #define PBRMetallic_lib

    #include "ShadingFrag.glsl";

    #include "PBRFrag.glsl";

    #ifdef LAYA_MRT
        // 通过通用 Material 加载的标准 PBR 也遵循默认全部输出；显式 None 由配置宏区分。
        #if !defined(GBUFFER_OUTPUTS_CONFIGURED)
            #define GBUFFER_NORMAL
            #define GBUFFER_ALBEDO
            #define GBUFFER_SURFACE
        #endif
        #include "GBuffer.glsl";
    #endif

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

    // default ior 1.5
    float ior = 1.5;
    surface.ior = 1.5;
    vec3 f0 = vec3(0.04, 0.04, 0.04);

    surface.perceptualRoughness = clamp(perceptualRoughness, MIN_PERCEPTUAL_ROUGHNESS, 1.0);
    surface.roughness = surface.perceptualRoughness * surface.perceptualRoughness;
    surface.diffuseColor = computeDiffuse(baseColor, metallic);
    surface.f0 = computeF0(f0, baseColor, metallic);
    surface.f90 = computeF90(surface.f0);

    surface.occlusion = inputs.occlusion;

    #ifdef EMISSION
    surface.emissionColor = inputs.emissionColor;
    #endif // EMISSION

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

    #ifdef LAYA_MRT
    // 复用实际着色法线与材质参数，包含法线贴图、细节法线和粗糙度限制。
    writeGBuffer(info.normalWS, inputs.diffuseColor, inputs.metallic, surface.perceptualRoughness, surface.occlusion);
    #endif

    vec3 surfaceColor = vec3(0.0);
    surfaceColor += PBRLighting(surface, info);

    return vec4(surfaceColor, surface.alpha);
}

#endif // PBRMetallic_lib
