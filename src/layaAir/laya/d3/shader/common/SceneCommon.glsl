#if !defined(SceneCommon_lib)
    #define SceneCommon_lib

    #ifdef ENUNIFORMBLOCK
uniform SceneUniformBlock
{
    // time
    float u_Time;
    float u_FogStart;
    float u_FogRange;
    vec4 u_FogColor;
};
    #else // ENUNIFORMBLOCK
// time
uniform float u_Time;
uniform float u_FogStart;
uniform float u_FogRange;
uniform vec4 u_FogColor;
    #endif // ENUNIFORMBLOCK

    #ifdef LIGHTMAP
uniform sampler2D u_LightMap;
vec3 getBakedLightmapColor(in vec2 lightmapUV)
{
    vec4 lightmapSampler = texture2D(u_LightMap, lightmapUV);
	// todo lightmap rgbm encode color space
	#ifdef Gamma_u_LightMap
    lightmapSampler = gammaToLinear(lightmapSampler);
	#endif // Gamma_u_LightMap
    return decodeRGBM(lightmapSampler, 5.0);
}
    #endif // LIGHTMAP

#endif // SceneCommon_lib