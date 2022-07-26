#if !defined(pbrGI_lib)
    #define pbrGI_lib

    #include "globalIllumination.glsl";

    // todo cpu 拼接？
    #define IBL_ROUGHNESS_LEVEL 4.0

// todo uniform 移动出去
uniform sampler2D u_IBLDGF;

vec2 prefilteredDFG_LUT(float coord, float NoV)
{
    return texture2DLodEXT(u_IBLDGF, vec2(NoV, 1.0 - coord), 0.0).rg;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo info)
{
    vec3 indirect = vec3(0.0);

    #ifdef LIGHTMAP

	#ifdef UV1
    vec2 lightmapUV = info.lightmapUV;
    vec3 bakedColor = getBakedLightmapColor(lightmapUV);
    // todo  surface.diffuseColor ？
    indirect = bakedColor * surface.diffuseColor;
	#endif // UV1

    #else
    // diffuse
    vec3 n = info.normalWS;
    vec3 Fd = diffuseIrradiance(n) * surface.diffuseColor;

    // specular
    float perceptualRoughness = surface.perceptualRoughness;
    float NoV = info.NoV;
    vec2 env = prefilteredDFG_LUT(perceptualRoughness, NoV);
    vec3 f0 = surface.f0;
    // todo f90 用 1.0 近似 f90
    float f90 = 1.0;
    vec3 specularColor = f0 * env.x + f90 * env.y;

    vec3 r = getReflectedVector(info.viewDir, info.normalWS);
    vec3 indirectSpecular = specularIrradiance(r, perceptualRoughness);

    vec3 Fr = indirectSpecular * specularColor;
    indirect = Fd + Fr;
    #endif // LIGHTMAP

    return indirect;
}

#endif // pbrGI_lib