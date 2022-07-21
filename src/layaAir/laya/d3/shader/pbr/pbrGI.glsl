#if !defined(pbrGI_lib)
    #define pbrGI_lib

    // todo cpu 拼接？
    #define IBL_ROUGHNESS_LEVEL 4.0

// todo uniform 移动出去
uniform samplerCube u_IBLTex;
uniform sampler2D u_IBLDGF;

vec3 evaluateSpecularIBL(const in vec3 r, const in float perceptualRoughness)
{
    float lod = IBL_ROUGHNESS_LEVEL * perceptualRoughness;

    // todo 临时转换
    vec3 reflectDir = r * vec3(-1.0, 1.0, 1.0);

    return textureCubeLodEXT(u_IBLTex, reflectDir, lod).rgb;
}

vec2 prefilteredDFG_LUT(float coord, float NoV)
{
    return texture2DLodEXT(u_IBLDGF, vec2(NoV, 1.0 - coord), 0.0).rg;
}

vec3 evaluateIBL(const in Surface surface, const in PixelInfo pixel)
{
    float perceptualRoughness = surface.perceptualRoughness;

    vec3 r = getReflectedVector(pixel.viewDir, pixel.normalWS);

    float NoV = pixel.NoV;

    vec3 f0 = surface.f0;

    // Specular indirect
    vec3 indirectSpecular = evaluateSpecularIBL(r, perceptualRoughness);
    vec2 env = prefilteredDFG_LUT(perceptualRoughness, NoV);
    // todo f90 用 1.0 近似 f90
    float f90 = 1.0;
    vec3 specularColor = f0 * env.x + f90 * env.y;

    // Diffuse indirect
    vec3 n = pixel.normalWS;
    // todo 这个 / PI
    vec3 indirectDiffuse = max(diffuseIrradiance(n), 0.0) * 1.0 / PI;
    // vec3 indirectDiffuse = max(diffuseIrradiance(n), 0.0);

    vec3 diffuseColor = surface.diffuseColor;
    return diffuseColor * indirectDiffuse + indirectSpecular * specularColor;
}

vec3 PBRGI(const in Surface surface, const in PixelInfo pixel)
{
    #ifdef LIGHTMAP
	#ifdef UV1
    vec2 lightmapUV = pixel.uv1;
    vec3 bakedColor = getBakedLightmapColor(lightmapUV);
    return bakedColor * surface.diffuseColor;
	#endif // UV1
    #endif // LIGHTMAP

    return evaluateIBL(surface, pixel) * surface.occlusion;
    // #ifdef GI_AMBIENT_SH
    // #else // GI_AMBIENT_SH
    // return u_AmbientColor * surface.diffuseColor;
    // #endif // GI_AMBIENT_SH
}

#endif // pbrGI_lib