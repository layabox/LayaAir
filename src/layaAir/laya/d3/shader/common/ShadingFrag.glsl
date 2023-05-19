#if !defined(ShadingFrag_lib)
    #define ShadingFrag_lib

    #include "ShadingCommon.glsl";

void getPixelParams(inout PixelParams params)
{
    params.positionWS = v_PositionWS;

    params.normalWS = normalize(v_NormalWS);
    params.tangentWS = normalize(v_TangentWS);
    params.biNormalWS = normalize(v_BiNormalWS);

    params.TBN = mat3(params.tangentWS, params.biNormalWS, params.normalWS);

    #ifdef UV
    params.uv0 = v_Texcoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = v_Texcoord1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = v_VertexColor;
    #endif // COLOR
}

#endif // ShadingFrag_lib