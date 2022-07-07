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

#endif // SceneCommon_lib