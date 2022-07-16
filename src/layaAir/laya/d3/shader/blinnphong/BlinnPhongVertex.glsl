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

    #ifdef NEEDTBN
    params.tangentWS = normalize((worldMat * vec4(a_Tangent0.xyz, 0.0)).xyz);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS) * sign(a_Tangent0.w));
    v_TangentWS = params.tangentWS;
    v_BiNormalWS = params.biNormalWS;
    #endif // NEEDTBN

    #ifdef UV
    params.uv0 = transformUV(vertex.texCoord0, u_TilingOffset);
    v_Texcoord0 = params.uv0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = transformUV(params.uv1, u_LightmapScaleOffset);
    v_Texcoord1 = params.uv1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = a_Color;
    v_VertexColor = params.vertexColor;
    #endif // COLOR

    params.viewDir = getViewDirection(params.positionWS);
    v_ViewDir = params.viewDir;
}

#endif // BlinnPhongVertex_lib