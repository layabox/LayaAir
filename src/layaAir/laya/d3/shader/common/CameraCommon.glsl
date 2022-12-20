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
uniform vec4 u_Viewport; // x, y, width, height
uniform vec3 u_CameraDirection;
uniform vec3 u_CameraUp;
uniform vec3 u_CameraPos;
    #endif // ENUNIFORMBLOCK

/*Depth or DepthNormal Uniform*/
uniform highp sampler2D u_CameraDepthTexture;
uniform vec4 u_ZBufferParams; //(1.0 - far / near, far / near, (near - far) / (near * far), 1 / near)
uniform mediump sampler2D u_CameraDepthNormalsTexture;
uniform mediump sampler2D u_CameraOpaqueTexture;

vec4 getPositionCS(in vec3 positionWS)
{
    return u_ViewProjection * vec4(positionWS, 1.0);
}

vec3 getViewDirection(in vec3 positionWS)
{
    return normalize(u_CameraPos - positionWS);
}

// 根据投影剧专重映射深度
vec4 remapPositionZ(vec4 position)
{
    position.z = position.z * 2.0 - position.w;
    return position;
}

#endif // CameraCommon_lib