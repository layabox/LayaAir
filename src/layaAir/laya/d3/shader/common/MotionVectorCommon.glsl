#if !defined(MotionVectorCommon_lib)
    #define MotionVectorCommon_lib

    #if defined(MOTION_VECTOR_OUTPUT) && defined(LAYA_MRT)
        #define LAYA_MOTION_VECTOR_OUTPUT
        #if !defined(BONE) && !defined(GPU_INSTANCE)
            #define LAYA_MOTION_VECTOR_STATIC_MESH
varying highp vec4 v_TaaCurrentClip;
varying highp vec4 v_TaaPreviousClip;
        #endif
    #endif

#endif
