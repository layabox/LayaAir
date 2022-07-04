#if !defined(MeshFrag_lib)
    #define MeshFrag_lib

    #include "MeshCommon.glsl";

void getMeshVertexParams(inout VertexParams params)
{
    params.positionWS = v_PositionWS;

    #ifdef VERTEXNORMAL
    params.normalWS = normalize(v_Normal);
    #endif VERTEXNORMAL

    #ifdef UV
    params.texCoord0 = v_Texcoord0;
    #endif // UV

    #ifdef UV1
    params.texCoord1 = v_Texcoord1;
    #endif // UV1

    #ifdef NEEDTBN
    params.tangentWS = v_Tangent;
    params.biNormalWS = normalize(cross(v_Normal, v_Tangent.xyz) * sign(v_Tangent.w));
    #endif

    #ifdef COLOR
    params.vertexColor = v_VertexColor;
    #endif
}

#endif // MeshFrag_lib