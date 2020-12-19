#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#include "Lighting.glsl";

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
uniform vec4 u_ProjectionParams;

//传入法线
varying vec4 depthNormals;


vec4 depthNormalsVertex()
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

	depthNormals.xyz = normalWS;
	vec4 positionCS = u_ViewProjection * positionWS;
	depthNormals.w = (positionCS.z * 2.0 - positionCS.w)*u_ProjectionParams.w;
	
    return positionCS;
}

void main()
{
	vec4 positionCS =  depthNormalsVertex();
	gl_Position=remapGLPositionZ(positionCS);
}