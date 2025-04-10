#if !defined(Sprite3DCommon_lib)
    #define Sprite3DCommon_lib

uniform mat4 u_WorldMat;

uniform vec4 u_WorldInvertFront; // x: invert front face,yzw NodeCustomData

    #ifdef GPU_INSTANCE

	#define WorldInvertFront a_WorldInvertFront.x
    #define NodeCustomData0 a_WorldInvertFront.y
    #define NodeCustomData1 a_WorldInvertFront.z
    #define NodeCustomData2 a_WorldInvertFront.w

    #else // GPU_INSTANCE

	#define WorldInvertFront u_WorldInvertFront.x
    #define NodeCustomData0 u_WorldInvertFront.y
    #define NodeCustomData1 u_WorldInvertFront.z
    #define NodeCustomData2 u_WorldInvertFront.w

    #endif // GPU_INSTANCE

vec2 tranformLightMapUV(in vec2 texcoord, in vec4 tilingOffset)
{
    vec2 lightMapUV = vec2(texcoord.x, 1.0 - texcoord.y) * tilingOffset.xy + tilingOffset.zw;
    lightMapUV.y = 1.0 - lightMapUV.y;
    return lightMapUV;
}

vec2 transformUV(in vec2 texcoord, in vec4 tilingOffset)
{
    vec2 uv = texcoord * tilingOffset.xy + tilingOffset.zw * vec2(1.0, -1.0) + vec2(0.0, 1.0 - tilingOffset.y);
    return uv;
}

#endif // Sprite3DCommon_lib