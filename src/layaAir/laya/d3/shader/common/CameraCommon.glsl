#if !defined(CameraCommon_lib)
    #define CameraCommon_lib

    #ifdef ENUNIFORMBLOCK

uniform BaseCamera
{
    vec3 u_CameraPos;
    mat4 u_View;
    mat4 u_Projection;
    mat4 u_ViewProjection;
    vec3 u_CameraDirection;
    vec3 u_CameraUp;
    vec4 u_Viewport;
    vec4 u_ProjectionParams;
    vec4 u_OpaqueTextureParams;
    vec4 u_ZBufferParams;
};
    #else
uniform vec3 u_CameraPos;
uniform mat4 u_View;
uniform mat4 u_Projection;
uniform mat4 u_ViewProjection;
uniform vec3 u_CameraDirection;
uniform vec3 u_CameraUp;
uniform vec4 u_Viewport;
uniform vec4 u_ProjectionParams;
uniform vec4 u_OpaqueTextureParams;
uniform vec4 u_ZBufferParams;
    #endif // ENUNIFORMBLOCK

uniform sampler2D u_CameraDepthTexture;
uniform sampler2D u_CameraDepthNormalsTexture;
uniform sampler2D u_CameraOpaqueTexture;


vec4 getPositionCS(in vec3 positionWS)
{
    return u_ViewProjection * vec4(positionWS, 1.0);
}

vec3 getViewDirection(in vec3 positionWS)
{
    return normalize(u_CameraPos - positionWS);
}

// 根据投影矩阵重映射深度
vec4 remapPositionZ(vec4 position)
{
    #ifdef BLITSCREEN_INVERTY
    position.y = -position.y;
    #endif

    #ifdef REMAP_Z
    position.z = position.z * 2.0 - position.w;
    #endif
    return position;
}

#endif // CameraCommon_lib