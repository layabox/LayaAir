#include "LayaComInput.glsl";
#include "Lighting.glsl";

attribute vec4 a_Position;
attribute vec2 a_Texcoord;
attribute vec3 a_Normal;

uniform mat4 u_MvpMatrix;

varying vec2 v_Texcoord;
varying vec3 v_Normal;

#ifdef BONE
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	const int c_MaxBoneCount = 24;
	uniform mat4 u_Bones[c_MaxBoneCount];
#endif

#if defined(DIRECTIONLIGHT)
varying vec3 v_PositionWorld;
#endif

void main()
{
	#ifdef BONE
		mat4 skinTransform=mat4(0.0);
		skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		vec4 position = skinTransform * a_Position;
		gl_Position=u_MvpMatrix * position;
		mat3 worldMat=mat3(u_WorldMat * skinTransform);
	#else
		gl_Position=u_MvpMatrix * a_Position;
		mat3 worldMat=mat3(u_WorldMat);
	#endif
	
	v_Texcoord=a_Texcoord;
	v_Normal=worldMat*a_Normal;
	
	#if defined(DIRECTIONLIGHT)
		#ifdef BONE
			v_PositionWorld=(u_WorldMat*position).xyz;
		#else
			v_PositionWorld=(u_WorldMat*a_Position).xyz;
		#endif
	#endif

	gl_Position.xyz=remapGLPositionZ(gl_Position).xyz + normalize(v_Normal) * 0.002;	
	
}