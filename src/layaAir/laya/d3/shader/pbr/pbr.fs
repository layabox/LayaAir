#define SHADER_NAME PBRFS

#include "Color.glsl";

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "PBRFrag.glsl";

#include "PBRGI.glsl";

// 材质输入参数
struct SurfaceInputs {
    vec3 diffuseColor;
    float alpha;
    float metallic;
    float roughness;
    float reflectance;
    float alphaTest;
};

void initSurfaceInputs(inout SurfaceInputs inputs, const in PixelParams pixel)
{
    vec2 uv = pixel.uv0;

    inputs.diffuseColor = u_DiffuseColor.rgb;
    inputs.alpha = u_DiffuseColor.a;
    inputs.alphaTest = u_AlphaTest;

#ifdef DIFFUSEMAP
    vec4 diffuseSampler = texture2D(u_DiffuseMap, uv);

    #ifdef Gamma_u_DiffuseMap
    diffuseSampler = gammaToLinear(diffuseSampler);
    #endif // Gamma_u_DiffuseMap

    inputs.diffuseColor *= diffuseSampler.rgb;
    inputs.alpha *= diffuseSampler.a;
#endif // DIFFUSEMAP

    inputs.metallic = u_Metallic;

    inputs.roughness = u_Roughness;

    inputs.reflectance = u_Reflectance;
}

void initSurface(inout Surface surface, const in SurfaceInputs inputs)
{
    surface.alpha = inputs.alpha;

    vec3 baseColor = inputs.diffuseColor;
    float metallic = inputs.metallic;
    float perceptualRoughness = inputs.roughness;
    float reflectance = inputs.reflectance;

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
    // init surface
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

    surfaceColor += evaluateIBL(surface, pixel);

    gl_FragColor = vec4(surfaceColor, surface.alpha);
}