#if !defined(SceneCommon_lib)
    #define SceneCommon_lib

    #ifdef ENUNIFORMBLOCK
uniform SceneUniformBlock
{
    // time
    float u_Time;
    float u_FogStart;
    float u_FogRange;
    vec3 u_FogColor;
};
    #else // ENUNIFORMBLOCK
// time
uniform float u_Time;
uniform float u_FogStart;
uniform float u_FogRange;
uniform vec3 u_FogColor;
    #endif // ENUNIFORMBLOCK

// todo 移动到 block 中 ？
uniform vec3 u_IblSH[9];

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

    #ifdef LIGHTMAP
uniform sampler2D u_LightMap;
vec3 getBakedLightmapColor(in vec2 lightmapUV)
{
    vec4 lightmapSampler = texture2D(u_LightMap, lightmapUV);
    return lightmapSampler.rgb * lightmapSampler.a * 5.0;
}
    #endif // LIGHTMAP

#endif // SceneCommon_lib