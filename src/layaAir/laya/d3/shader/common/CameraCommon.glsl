#if !defined(CameraCommon_lib)
    #define CameraCommon_lib

    #ifdef ENUNIFORMBLOCK

uniform CameraUniformBlock
{
    mat4 u_View;
    mat4 u_Projection;
    mat4 u_ViewProjection;
    vec4 u_ProjectionParams; // x: near, y: far, z: invert, w: 1/far
    vec4 u_Viewport; // x,y,width,height
    vec3 u_CameraDirection;
    vec3 u_CameraUp;
    vec3 u_CameraPos;
};
    #else
uniform mat4 u_View;
uniform mat4 u_Projection;
uniform mat4 u_ViewProjection;
uniform vec4 u_ProjectionParams; // x: near, y: far, z: invert, w: 1/far
uniform vec4 u_Viewport; // x,y,width,height
uniform vec3 u_CameraDirection;
uniform vec3 u_CameraUp;
uniform vec3 u_CameraPos;
    #endif // ENUNIFORMBLOCK

#endif // CameraCommon_lib