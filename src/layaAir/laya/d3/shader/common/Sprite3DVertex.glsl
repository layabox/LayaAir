#if !defined(Sprite3DVertex_lib)
    #define Sprite3DVertex_lib

    #include "Sprite3DCommon.glsl";

    #ifdef GPU_SCENE

struct GpuSceneNodeDraw
{
    vec4 worldRow0;
    vec4 worldRow1;
    vec4 worldRow2;
    vec4 worldParams;
};

readonly buffer GpuSceneNodeDrawBuffer
{
    GpuSceneNodeDraw gpuSceneNodeDraws[];
}
GpuSceneNodeDrawTable;

readonly buffer GpuSceneVisibleInstanceBuffer
{
    uvec2 gpuSceneVisibleInstances[];
}
GpuSceneVisibleInstanceTable;

readonly buffer GpuSceneNodeAuxBuffer
{
    vec4 gpuSceneNodeAux[];
}
GpuSceneNodeAuxTable;

GpuSceneNodeDraw getGpuSceneNodeDraw()
{
    uint visibleIndex = uint(gl_InstanceIndex);
    uint nodeIndex = GpuSceneVisibleInstanceTable.gpuSceneVisibleInstances[visibleIndex].x;
    return GpuSceneNodeDrawTable.gpuSceneNodeDraws[nodeIndex];
}

uint getGpuSceneDataRecordIndex()
{
    uint visibleIndex = uint(gl_InstanceIndex);
    return GpuSceneVisibleInstanceTable.gpuSceneVisibleInstances[visibleIndex].y;
}

vec4 getGpuSceneWorldParams()
{
    return getGpuSceneNodeDraw().worldParams;
}

vec4 getGpuSceneNodeAux()
{
    uint visibleIndex = uint(gl_InstanceIndex);
    uint nodeIndex = GpuSceneVisibleInstanceTable.gpuSceneVisibleInstances[visibleIndex].x;
    return GpuSceneNodeAuxTable.gpuSceneNodeAux[nodeIndex];
}

mat4 getGpuSceneWorldMatrix()
{
    GpuSceneNodeDraw node = getGpuSceneNodeDraw();
    return mat4(
        vec4(node.worldRow0.x, node.worldRow1.x, node.worldRow2.x, 0.0),
        vec4(node.worldRow0.y, node.worldRow1.y, node.worldRow2.y, 0.0),
        vec4(node.worldRow0.z, node.worldRow1.z, node.worldRow2.z, 0.0),
        vec4(node.worldRow0.w, node.worldRow1.w, node.worldRow2.w, 1.0));
}

    #endif // GPU_SCENE

    #ifdef BONE
// todo const int c_MaxBoneCount = 24

	#ifdef SIMPLEBONE
uniform vec4 u_SimpleAnimatorParams;
uniform sampler2D u_SimpleAnimatorTexture;
uniform float u_SimpleAnimatorTextureSize;
	    #include "BakedBoneMatrixSampler.glsl";

    #else
uniform mat4 u_Bones[24];
	#endif // SIMPLEBONE

    #endif // BONE

/**
 * world matrix
 */
mat4 getWorldMatrix()
{
    #ifdef GPU_SCENE
    mat4 worldMat = getGpuSceneWorldMatrix();
    #elif defined(GPU_INSTANCE)
    mat4 worldMat = a_WorldMat;
    #else
    mat4 worldMat = u_WorldMat;
    #endif // GPU_SCENE / GPU_INSTANCE

    #ifdef BONE

	#ifdef SIMPLEBONE

	    #ifdef GPU_INSTANCE
    float currentPixelPos = a_SimpleTextureParams.x + a_SimpleTextureParams.y;
	    #else // GPU_INSTANCE
    float currentPixelPos = u_SimpleAnimatorParams.x + u_SimpleAnimatorParams.y;
	    #endif // GPU_INSTANCE

    float offset = 1.0 / u_SimpleAnimatorTextureSize;
    mat4 skinTrans = loadBakedMatMatrix(currentPixelPos, a_BoneIndices.x, offset) * a_BoneWeights.x;
    skinTrans += loadBakedMatMatrix(currentPixelPos, a_BoneIndices.y, offset) * a_BoneWeights.y;
    skinTrans += loadBakedMatMatrix(currentPixelPos, a_BoneIndices.z, offset) * a_BoneWeights.z;
    skinTrans += loadBakedMatMatrix(currentPixelPos, a_BoneIndices.w, offset) * a_BoneWeights.w;
    worldMat = worldMat * skinTrans;

	#else // SIMPLEBONE

    ivec4 boneIndex = ivec4(a_BoneIndices);
    mat4 skinTrans = u_Bones[boneIndex.x] * a_BoneWeights.x;
    skinTrans += u_Bones[boneIndex.y] * a_BoneWeights.y;
    skinTrans += u_Bones[boneIndex.z] * a_BoneWeights.z;
    skinTrans += u_Bones[boneIndex.w] * a_BoneWeights.w;
    worldMat = worldMat * skinTrans;

	#endif // SIMPLEBONE

    #endif // BONE

    return worldMat;
}

vec2 getSimpleBoneCustomData(){
    vec2 custom;
   #ifdef BONE
    #ifdef SIMPLEBONE
    #ifdef GPU_INSTANCE
    custom=a_SimpleTextureParams.zw;
    #else// GPU_INSTANCE
    custom=u_SimpleAnimatorParams.zw;
    #endif// GPU_INSTANCE
    #endif// SIMPLEBONE
  #endif // BONE
    return custom;
}

#endif // Sprite3DVertex_lib
