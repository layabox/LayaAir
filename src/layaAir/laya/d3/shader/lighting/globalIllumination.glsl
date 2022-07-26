#if !defined(globalIllumination_lib)
    #define globalIllumination_lib

    #ifdef GI_IBL

uniform vec3 u_IblSH[9];

	#define IBL_ROUGHNESS_LEVEL 4.0
uniform samplerCube u_IBLTex;

// todo 格式
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

vec3 specularIrradiance(in vec3 r, in float perceptualRoughness)
{
    float lod = IBL_ROUGHNESS_LEVEL * perceptualRoughness;

    // todo 临时转换
    vec3 reflectDir = r * vec3(-1.0, 1.0, 1.0);

    // todo float 编码 ?
    return textureCubeLodEXT(u_IBLTex, reflectDir, lod).rgb;
}

    #endif // GI_IBL

    #ifdef GI_LEGACYIBL

uniform vec4 u_AmbientSHAr;
uniform vec4 u_AmbientSHAg;
uniform vec4 u_AmbientSHAb;
uniform vec4 u_AmbientSHBr;
uniform vec4 u_AmbientSHBg;
uniform vec4 u_AmbientSHBb;
uniform vec4 u_AmbientSHC;

	#define LAYA_SPECCUBE_LOD_STEPS 6.0
uniform samplerCube u_ReflectTexture;
uniform vec4 u_ReflectCubeHDRParams;

vec3 shEvalLinearL0L1(in vec4 normal)
{
    vec3 x;
    x.r = dot(u_AmbientSHAr, normal);
    x.g = dot(u_AmbientSHAg, normal);
    x.b = dot(u_AmbientSHAb, normal);
    return x;
}

vec3 shEvalLinearL2(in vec4 normal)
{
    vec3 x1, x2;
    // 4 of the quadratic (L2) polynomials
    vec4 vB = normal.xyzz * normal.yzzx;
    x1.r = dot(u_AmbientSHBr, vB);
    x1.g = dot(u_AmbientSHBg, vB);
    x1.b = dot(u_AmbientSHBb, vB);

    // Final (5th) quadratic (L2) polynomial
    float vC = normal.x * normal.x - normal.y * normal.y;
    x2 = u_AmbientSHC.rgb * vC;

    return x1 + x2;
}

vec3 diffuseIrradiance(in vec3 normalWS)
{
    // todo -x 坐标转换
    vec4 normal = vec4(-normalWS.x, normalWS.yz, 1.0);
    vec3 ambientContrib = shEvalLinearL0L1(normal);
    ambientContrib += shEvalLinearL2(normal);
    vec3 ambient = max(vec3(0.0), ambientContrib);

    return ambient;
}

vec3 specularIrradiance(in vec3 r, in float perceptualRoughness)
{
    float roughness = perceptualRoughness * (1.7 - 0.7 * perceptualRoughness);
    // todo 临时转换
    r *= vec3(-1.0, 1.0, 1.0);
    float lod = roughness * LAYA_SPECCUBE_LOD_STEPS;
    vec4 rgbm = textureCubeLodEXT(u_ReflectTexture, r, lod);
    float range = u_ReflectCubeHDRParams.x;
    vec3 color = decodeRGBM(rgbm, range);
    color = gammaToLinear(color);
    return color;
}

    #endif // GI_LEGACYIBL

    #ifndef GI_IBL
	#ifndef GI_LEGACYIBL

uniform vec4 u_AmbientColor;

vec3 diffuseIrradiance(in vec3 normalWS)
{
    return u_AmbientColor.rgb;
}

vec3 specularIrradiance(in vec3 r, in float perceptualRoughness)
{
    // todo
    return u_AmbientColor.rgb;
}

	#endif // GI_LEGACYIBL
    #endif // GI_IBL

#endif // globalIllumination_lib