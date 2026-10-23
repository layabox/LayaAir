#if !defined(MotionVectorVertex_lib)
    #define MotionVectorVertex_lib

    #include "MotionVectorCommon.glsl";

    #if defined(LAYA_MOTION_VECTOR_STATIC_MESH)
uniform mat4 u_TaaViewProjection;
uniform mat4 u_TaaPreviousViewProjection;

vec4 layaGetPositionCSWithMotion(vec3 positionWS)
{
    v_TaaCurrentClip = u_TaaViewProjection * vec4(positionWS, 1.0);
    v_TaaPreviousClip = u_TaaPreviousViewProjection * vec4(positionWS, 1.0);
    return getPositionCS(positionWS);
}

    // 标准投影入口自动附带静态网格的运动数据。
    #define getPositionCS(positionWS) layaGetPositionCSWithMotion(positionWS)
    #endif

#endif
