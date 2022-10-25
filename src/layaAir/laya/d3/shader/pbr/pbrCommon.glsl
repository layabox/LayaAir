#if !defined(pbrCommon_lib)
    #define pbrCommon_lib

// varying
varying vec3 v_PositionWS;
varying vec3 v_NormalWS;

    #ifdef UV
varying vec2 v_Texcoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
varying vec2 v_Texcoord1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef NEEDTBN
varying vec3 v_TangentWS;
varying vec3 v_BiNormalWS;
    #endif // NEEDTBN

    #ifdef COLOR
varying vec4 v_VertexColor;
    #endif // COLOR

// 记录顶点信息, 用于由vs向fs传递数据
struct PixelParams {
    vec3 positionWS;
    vec3 normalWS;

    #ifdef UV
    vec2 uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    vec2 uv1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef NEEDTBN
    vec3 tangentWS;
    vec3 biNormalWS;

	#ifdef ANISOTROPIC
    float ToV;
    float BoV;
	#endif // ANISOTROPIC

    #endif // NEEDTBN

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR

    vec3 viewDir;
    float NoV;
};

#endif // pbrCommon_lib