#if !defined(SceneCommon_lib)
    #define SceneCommon_lib

    #ifdef ENUNIFORMBLOCK
uniform Scene3D
{
    // time
    float u_Time;
    vec4 u_FogParams;// x start,y end,z Density,w FogMode
    vec4 u_FogColor;
    float u_GIRotate;
    int u_DirationLightCount;
};
    #else // ENUNIFORMBLOCK
// time
uniform float u_Time;
uniform vec4 u_FogParams;//x start,y end,z Density,w FogMode
uniform vec4 u_FogColor;
uniform float u_GIRotate;
uniform mediump int u_DirationLightCount;
    #endif // ENUNIFORMBLOCK
    //rotate SH IBL

#endif // SceneCommon_lib
