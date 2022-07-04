#if !defined(SceneCommon_lib)
    #define SceneCommon_lib

    #ifdef ENUNIFORMBLOCK
uniform SceneUniformBlock
{
    // time
    float u_Time;
}
    #else // ENUNIFORMBLOCK
// time
uniform float u_Time;
    #endif // ENUNIFORMBLOCK

#endif // SceneCommon_lib