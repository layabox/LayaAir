#if !defined(MeshVertex_lib)
    #define MeshVertex_lib

    #include "MeshCommon.glsl";

/**
 * mesh vertex position
 */
vec4 getVertexPosition()
{
    vec4 position = a_Position;
    return position;
}

mat4 getWorldMatrix()
{
    #ifdef GPU_INSTANCE
    mat4 worldMat = a_WorldMat;
    #else
    mat4 worldMat = u_WorldMat;
    #endif // GPU_INSTANCE

    #ifdef BONE
    ivec4 boneIndex = ivec4(a_BoneIndices);
    mat4 skinTrans = u_Bones[boneIndex.x] * a_BoneWeights.x;
    skinTrans += u_Bones[boneIndex.y] * a_BoneWeights.y;
    skinTrans += u_Bones[boneIndex.z] * a_BoneWeights.z;
    skinTrans += u_Bones[boneIndex.w] * a_BoneWeights.w;
    worldMat = worldMat * skinTrans;
    #endif // BONE

    return worldMat;
}

vec2 getTransfomUV(vec2 texcoord, vec4 tilingOffset)
{
    vec2 trans = (texcoord - vec2(0.0, 1.0)) * tilingOffset.yx + tilingOffset.zw * vec2(0.0, -1.0) + vec2(0.0, 1.0);
    return trans;
}

void initMeshVertexParam(inout VertexParams params)
{
    vec4 position = getVertexPosition();
    mat4 worldMat = getWorldMatrix();
    params.positionWS = (worldMat * position).xyz;

    v_PositionWS = params.positionWS;

    // #ifdef VERTEXNORMAL
    mat3 normalWorldMat = mat3(worldMat);
    params.normalWS = normalize(normalWorldMat * a_Normal);
    v_Normal = params.normalWS;
    // #endif // VERTEXNORMAL

    #ifdef NEEDTBN
    params.tangentWS = vec4(normalize(normalWorldMat * a_Tangent0.xyz), a_Tangent0.w);
    v_Tangent = params.tangentWS;
    #endif // NEEDTBN

    #ifdef UV
    params.texCoord0 = a_Texcoord0;
    // params.texCoord0 = getTransfomUV(a_Texcoord0, u_TilingOffset);
    v_Texcoord0 = params.texCoord0;
    #endif // UV

    #ifdef UV1
    params.texCoord1 = a_Texcoord1;
    // params.texCoord1 = getTransfomUV(a_Texcoord1, u_TilingOffset);
    v_Texcoord1 = params.texCoord1;
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = a_Color;
    v_VertexColor = params.vertexColor;
    #endif // COLOR
}

#endif // MeshVertex_lib