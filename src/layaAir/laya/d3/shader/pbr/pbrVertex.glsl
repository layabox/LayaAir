#if !defined(pbrVertex_lib)
    #define pbrVertex_lib

    #include "Math.glsl";

    #include "PBRCommon.glsl";

void initPixelParams(inout PixelParams params, in Vertex vertex)
{
    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    params.positionWS = pos.xyz / pos.w;
    v_PositionWS = params.positionWS;

    mat4 normalMat = transpose(inverse(worldMat));
    params.normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);
    v_NormalWS = params.normalWS;

    #ifdef NEEDTBN
	#ifdef TANGENT
    params.tangentWS = normalize((normalMat * vec4(a_Tangent0.xyz, 0.0)).xyz);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS) * sign(a_Tangent0.w));
	#else // TANGENT
    params.tangentWS = normalize((normalMat * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS));
	#endif // TANGENT
    v_TangentWS = params.tangentWS;
    v_BiNormalWS = params.biNormalWS;
    #endif // NEEDTBN

    #ifdef UV
    params.uv0 = transformUV(vertex.texCoord0, u_TilingOffset);
    v_Texcoord0 = params.uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = tranformLightMapUV(vertex.texCoord1, u_LightmapScaleOffset);
    v_Texcoord1 = params.uv1;
	#endif LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = a_Color;
    v_VertexColor = params.vertexColor;
    #endif // COLOR
}

#endif // pbrVertex_lib