#include "Lighting.glsl";
#include "Shadow.glsl"

attribute vec4 a_Position;
attribute vec3 a_Normal;

#ifdef BONE
	const int c_MaxBoneCount = 24;
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	uniform mat4 u_Bones[c_MaxBoneCount];
#endif

#ifdef GPU_INSTANCE
	attribute mat4 a_WorldMat;
#else
	uniform mat4 u_WorldMat;
#endif

uniform mat4 u_ViewProjection;

#ifdef SHADOW
	uniform vec3 u_ShadowLightDirection;
#endif


vec4 shadowCasterVertex()
{
	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif
	
	#ifdef BONE
		mat4 skinTransform;
	 	#ifdef SIMPLEBONE
			float currentPixelPos;
			#ifdef GPU_INSTANCE
				currentPixelPos = a_SimpleTextureParams.x+a_SimpleTextureParams.y;
			#else
				currentPixelPos = u_SimpleAnimatorParams.x+u_SimpleAnimatorParams.y;
			#endif
			float offset = 1.0/u_SimpleAnimatorTextureSize;
			skinTransform =  loadMatFromTexture(currentPixelPos,int(a_BoneIndices.x),offset) * a_BoneWeights.x;
			skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.y),offset) * a_BoneWeights.y;
			skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.z),offset) * a_BoneWeights.z;
			skinTransform += loadMatFromTexture(currentPixelPos,int(a_BoneIndices.w),offset) * a_BoneWeights.w;
		#else
			skinTransform =  u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
			skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
			skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
			skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		#endif
		worldMat = worldMat * skinTransform;
	#endif

	vec4 positionWS = worldMat * a_Position;
	mat3 worldInvMat;
	#ifdef BONE
		worldInvMat=INVERSE_MAT(mat3(worldMat*skinTransform));
	#else
		worldInvMat=INVERSE_MAT(mat3(worldMat));
	#endif  

	vec3 normalWS = normalize(a_Normal*worldInvMat);//if no normalize will cause precision problem
	#ifdef SHADOW
		positionWS.xyz = applyShadowBias(positionWS.xyz,normalWS,u_ShadowLightDirection);
	#endif

	vec4 positionCS = u_ViewProjection * positionWS;
	#ifdef SHADOW_SPOT
		positionCS.z = positionCS.z-u_ShadowBias.x/positionCS.w;
	#endif
	positionCS.z = max(positionCS.z, 0.0);//min ndc z is 0.0
	
	// //TODO没考虑UV动画呢
	// #if defined(DIFFUSEMAP)&&defined(ALPHATEST)
	// 	v_Texcoord0=a_Texcoord0;
	// #endif
    return positionCS;
}
