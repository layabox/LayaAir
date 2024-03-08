#if!defined(Sprite3DVertex_lib)
#define Sprite3DVertex_lib

#include "Sprite3DCommon.glsl";

#ifdef BONE
// todo const int c_MaxBoneCount = 24
uniform mat4 u_Bones[24];

#ifdef SIMPLEBONE
uniform vec4 u_SimpleAnimatorParams;
uniform sampler2D u_SimpleAnimatorTexture;
uniform float u_SimpleAnimatorTextureSize;
#include "BakedBoneMatrixSampler.glsl";

#endif// SIMPLEBONE

#endif// BONE

/**
* world matrix
*/
mat4 getWorldMatrix()
{
    #ifdef GPU_INSTANCE
    mat4 worldMat=a_WorldMat;
    #else
    mat4 worldMat=u_WorldMat;
    #endif// GPU_INSTANCE
    
    #ifdef BONE
    
    #ifdef SIMPLEBONE
    
    #ifdef GPU_INSTANCE
    float currentPixelPos=a_SimpleTextureParams.x+a_SimpleTextureParams.y;
    #else// GPU_INSTANCE
    float currentPixelPos=u_SimpleAnimatorParams.x+u_SimpleAnimatorParams.y;
    #endif// GPU_INSTANCE
    
    float offset=1./u_SimpleAnimatorTextureSize;
    mat4 skinTrans=loadBakedMatMatrix(currentPixelPos,a_BoneIndices.x,offset)*a_BoneWeights.x;
    skinTrans+=loadBakedMatMatrix(currentPixelPos,a_BoneIndices.y,offset)*a_BoneWeights.y;
    skinTrans+=loadBakedMatMatrix(currentPixelPos,a_BoneIndices.z,offset)*a_BoneWeights.z;
    skinTrans+=loadBakedMatMatrix(currentPixelPos,a_BoneIndices.w,offset)*a_BoneWeights.w;
    worldMat=worldMat*skinTrans;
    
    #else// SIMPLEBONE
    
    ivec4 boneIndex=ivec4(a_BoneIndices);
    mat4 skinTrans=u_Bones[boneIndex.x]*a_BoneWeights.x;
    skinTrans+=u_Bones[boneIndex.y]*a_BoneWeights.y;
    skinTrans+=u_Bones[boneIndex.z]*a_BoneWeights.z;
    skinTrans+=u_Bones[boneIndex.w]*a_BoneWeights.w;
    worldMat=worldMat*skinTrans;
    
    #endif// SIMPLEBONE
    
    #endif// BONE
    
    return worldMat;
}

vec2 getCustomData(){
    vec2 custom;
    #ifdef SIMPLEBONE
    #ifdef GPU_INSTANCE
    custom=a_SimpleTextureParams.zw;
    #else// GPU_INSTANCE
    custom=u_SimpleAnimatorParams.zw;
    #endif// GPU_INSTANCE
    #endif// SIMPLEBONE
    return custom;
}

#endif// Sprite3DVertex_lib