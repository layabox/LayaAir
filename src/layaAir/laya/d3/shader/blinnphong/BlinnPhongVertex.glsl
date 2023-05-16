#if !defined(BlinnPhongVertex_lib)
    #define BlinnPhongVertex_lib

    #include "BlinnPhongCommon.glsl";

void initPixelParams(inout PixelParams params, in Vertex vertex)
{
    mat4 worldMat = getWorldMatrix();
    params.positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;
    v_PositionWS = params.positionWS;

    params.normalWS = normalize((worldMat * vec4(vertex.normalOS, 0.0)).xyz);
    v_NormalWS = params.normalWS;

    #ifdef TANGENT
    params.tangentWS = normalize((worldMat * vec4(vertex.tangentOS.xyz, 0.0)).xyz);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS) * sign(vertex.tangentOS.w));
    #else // TANGENT
    params.tangentWS = vec3(1.0, 0.0, 0.0);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS));
    #endif // TANGENT
    v_TangentWS = params.tangentWS;
    v_BiNormalWS = params.biNormalWS;

    #ifdef UV
    params.uv0 = vertex.texCoord0;
    v_Texcoord0 = params.uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = tranformLightMapUV(vertex.texCoord1, u_LightmapScaleOffset);
    v_Texcoord1 = params.uv1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = a_Color;
    v_VertexColor = params.vertexColor;
    #endif // COLOR
}

#endif // BlinnPhongVertex_lib