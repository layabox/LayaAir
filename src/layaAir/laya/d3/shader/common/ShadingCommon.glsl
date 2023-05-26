#if !defined(ShadingCommon_lib)
    #define ShadingCommon_lib

// varying
varying vec3 v_PositionWS;
// todo
varying vec3 v_NormalWS;
varying vec3 v_TangentWS;
varying vec3 v_BiNormalWS;

    #ifdef UV
varying vec2 v_Texcoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
varying vec2 v_Texcoord1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
varying vec4 v_VertexColor;
    #endif // COLOR

// 记录顶点信息, 用于由vs向fs传递数据
struct PixelParams {
    vec3 positionWS;

    // todo
    vec3 normalWS;
    vec3 tangentWS;
    vec3 biNormalWS;
    mat3 TBN;

    #ifdef UV
    vec2 uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    vec2 uv1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR
};

#endif // ShadingCommon_lib