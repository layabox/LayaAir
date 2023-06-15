#if !defined(ShadingVertex_lib)
    #define ShadingVertex_lib

    #include "ShadingCommon.glsl";

void sharePixelParams(const in PixelParams params)
{
    v_PositionWS = params.positionWS;

    v_NormalWS = params.normalWS;
    v_TangentWS = params.tangentWS;
    v_BiNormalWS = params.biNormalWS;

    #ifdef UV
    v_Texcoord0 = params.uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    v_Texcoord1 = params.uv1;
	#endif LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    v_VertexColor = params.vertexColor;
    #endif // COLOR
}

void shadingPixelParams(inout PixelParams params, in Vertex vertex)
{
    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    params.positionWS = pos.xyz / pos.w;

    mat3 normalMat = transpose(inverse(mat3(worldMat)));
    params.normalWS = normalize((normalMat * vertex.normalOS).xyz);

    #ifdef TANGENT
    params.tangentWS = normalize((normalMat * vertex.tangentOS.xyz).xyz);
    params.tangentWS *= u_WroldInvertFront.x;
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS) * sign(vertex.tangentOS.w));
    #else // TANGENT
    params.tangentWS = vec3(1.0, 0.0, 0.0);
    params.tangentWS *= u_WroldInvertFront.x;
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS));
    #endif // TANGENT

    #ifdef UV
    params.uv0 = vertex.texCoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = tranformLightMapUV(vertex.texCoord1, u_LightmapScaleOffset);
	#endif LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = vertex.vertexColor;
    #endif // COLOR
}

#endif // ShadingVertex_lib