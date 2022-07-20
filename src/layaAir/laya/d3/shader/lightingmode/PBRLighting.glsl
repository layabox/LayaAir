#if !defined(PBRLighting_lib)
    #define PBRLighting_lib

    #include "Math.glsl";

    #include "Lighting.glsl";

    // 精度
    #if !defined(GL_FRAGMENT_PRECISION_HIGH)
	#define MIN_PERCEPTUAL_ROUGHNESS 0.089
	#define MIN_ROUGHNESS		 0.007921
    #else
	#define MIN_PERCEPTUAL_ROUGHNESS 0.045
	#define MIN_ROUGHNESS		 0.002025
    #endif

    #define MIN_N_DOT_V 1e-4

    #include "BRDF.glsl";

struct PixelInfo {
    vec3 normalWS;
    vec3 viewDir;
    float NoV;
};

struct Surface {
    vec3 diffuseColor;
    float alpha;
    vec3 f0;
    float roughness;
    float perceptualRoughness;
    float occlusion;
};

struct LightParams {
    vec3 h;
    float NoL;
    float NoH;
    float LoH;
};

// 获取反射向量
vec3 getReflectedVector(vec3 v, vec3 n)
{
    return reflect(-v, n);
}

void initLightParams(inout LightParams params, const in PixelInfo pixel, const in Light light)
{
    vec3 l = normalize(-light.dir);
    vec3 v = pixel.viewDir;
    vec3 n = pixel.normalWS;

    vec3 h = SafeNormalize(v + l);
    params.h = h;
    params.NoL = saturate(dot(n, l));
    params.NoH = saturate(dot(n, h));
    params.LoH = saturate(dot(l, h));
}

vec3 diffuseLobe(in Surface surface)
{
    return surface.diffuseColor * diffuse();
}

vec3 specularLobe(const in Surface surface, const in PixelInfo pixel, const in LightParams lightParams)
{
    float roughness = surface.roughness;
    float D = distribution(roughness, lightParams.NoH, lightParams.h, pixel.normalWS);
    float V = visibility(roughness, pixel.NoV, lightParams.NoL);
    vec3 F = fresnel(surface.f0, lightParams.LoH);

    return (D * V) * F;
}

vec3 PBRLighting(const in Surface surface, const in PixelInfo pixel, const in Light light)
{
    LightParams lightParams;
    initLightParams(lightParams, pixel, light);

    vec3 Fd = diffuseLobe(surface);

    vec3 Fr = specularLobe(surface, pixel, lightParams);

    return (Fd + Fr) * light.color * lightParams.NoL;
}

    // gi
    #include "PBRGI.glsl";

#endif // PBRLighting_lib