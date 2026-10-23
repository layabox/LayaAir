#if !defined(MotionVectorFrag_lib)
    #define MotionVectorFrag_lib

    #include "MotionVectorCommon.glsl";

    #if defined(LAYA_MOTION_VECTOR_OUTPUT)
layout(location = 4) out highp vec4 laya_MotionVector;
        #define LAYA_MRT_POST_MAIN_HOOK writeMotionVector
        #if defined(LAYA_MOTION_VECTOR_STATIC_MESH)
uniform vec4 u_TaaMotionParams;
        #endif

// A 通道标记有效性；不支持历史形变的网格写 0。
void writeMotionVector()
{
    laya_MotionVector = vec4(0.0);
        #if defined(LAYA_MOTION_VECTOR_STATIC_MESH)
    // 裁剪坐标无效时丢弃历史颜色。
    laya_MotionVector = vec4(2.0, 2.0, 0.0, 1.0);
    if (v_TaaCurrentClip.w > 0.00001 && v_TaaPreviousClip.w > 0.00001) {
        // 透视插值后再除以 w。
        vec2 currentNDC = v_TaaCurrentClip.xy / v_TaaCurrentClip.w;
        vec2 previousNDC = v_TaaPreviousClip.xy / v_TaaPreviousClip.w;
        vec2 velocity = (currentNDC - previousNDC) * vec2(0.5, 0.5 * u_TaaMotionParams.x);
        if (all(lessThan(abs(velocity), vec2(65504.0))))
            laya_MotionVector = vec4(velocity, 0.0, 1.0);
    }
        #endif
}
    #endif

#endif
