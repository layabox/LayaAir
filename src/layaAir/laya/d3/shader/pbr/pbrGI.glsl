#if !defined(pbrGI_lib)
    #define pbrGI_lib

    // todo cpu 拼接？
    #define IBL_ROUGHNESS_LEVEL 4.0

// todo uniform 移动出去
uniform samplerCube u_IBLTex;
uniform sampler2D u_IBLDGF;
uniform vec3 u_IblSH[9];

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

vec3 diffuseIrradiance(in vec3 normal)
{
    // todo cmeng 生成的数据问题， 临时转换下
    vec3 n = normal * vec3(-1.0, 1.0, 1.0);
    return max(
	u_IblSH[0]
	    + u_IblSH[1] * n.y
	    + u_IblSH[2] * n.z
	    + u_IblSH[3] * n.x
	    + u_IblSH[4] * (n.y * n.x)
	    + u_IblSH[5] * (n.y * n.z)
	    + u_IblSH[6] * (3.0 * n.z * n.z - 1.0)
	    + u_IblSH[7] * (n.z * n.x)
	    + u_IblSH[8] * (n.x * n.x - n.y * n.y),
	0.0);
}

vec3 evaluateIBL(const in Surface surface, const in PixelParams pixel)
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
    // vec3 indirectDiffuse = max(diffuseIrradiance(n), 0.0) * 1.0 / PI;
    vec3 indirectDiffuse = max(diffuseIrradiance(n), 0.0);

    vec3 diffuseColor = surface.diffuseColor;
    return diffuseColor * indirectDiffuse + indirectSpecular * specularColor;
}

#endif // pbrGI_lib