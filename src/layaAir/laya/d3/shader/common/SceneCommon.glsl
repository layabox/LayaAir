#if !defined(SceneCommon_lib)
    #define SceneCommon_lib

    #ifdef ENUNIFORMBLOCK
uniform SceneUniformBlock
{
    // time
    float u_Time;
    vec4 u_FogParams;// x start,y range,z Density
    vec4 u_FogColor;
};
    #else // ENUNIFORMBLOCK
// time
uniform float u_Time;
uniform vec4 u_FogParams;//x start,y range,z Density
uniform vec4 u_FogColor;
    #endif // ENUNIFORMBLOCK
    //rotate SH IBL
uniform float u_GIRotate;

#endif // SceneCommon_lib