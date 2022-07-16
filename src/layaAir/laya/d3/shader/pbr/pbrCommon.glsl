#if !defined(pbrCommon_lib)
    #define pbrCommon_lib

    // 精度
    #if !defined(GL_FRAGMENT_PRECISION_HIGH)
	#define MIN_PERCEPTUAL_ROUGHNESS 0.089
	#define MIN_ROUGHNESS		 0.007921
    #else
	#define MIN_PERCEPTUAL_ROUGHNESS 0.045
	#define MIN_ROUGHNESS		 0.002025
    #endif

    #define MIN_N_DOT_V 1e-4

// varying
varying vec3 v_PositionWS;
varying vec3 v_NormalWS;
varying vec3 v_ViewDir;

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
    #endif // NEEDTBN

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR

    vec3 viewDir;
    float NoV;
};

// todo 获取反射函数 位置
vec3 getReflectedVector(vec3 v, vec3 n)
{
    return reflect(-v, n);
}

#endif // pbrCommon_lib