#include "Lighting.glsl";
#include "Shadow.glsl";

attribute vec4 a_Position;

#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif

#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))||(defined(LIGHTMAP)&&defined(UV))
	attribute vec2 a_Texcoord0;
	varying vec2 v_Texcoord0;
#endif

#if defined(LIGHTMAP)&&defined(UV1)
	attribute vec2 a_Texcoord1;
#endif

#ifdef LIGHTMAP
	uniform vec4 u_LightmapScaleOffset;
	varying vec2 v_LightMapUV;
#endif

#ifdef COLOR
	attribute vec4 a_Color;
	varying vec4 v_Color;
#endif

#ifdef BONE
	const int c_MaxBoneCount = 24;
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	uniform mat4 u_Bones[c_MaxBoneCount];
#endif

attribute vec3 a_Normal;
varying vec3 v_Normal; 

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	uniform vec3 u_CameraPos;
	varying vec3 v_ViewDir; 
#endif

#if defined(NORMALMAP)
	attribute vec4 a_Tangent0;
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif

#ifdef GPU_INSTANCE
	attribute mat4 a_WorldMat;
#else
	uniform mat4 u_WorldMat;
#endif

#if defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)
	varying vec3 v_PositionWorld;
#endif

#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)
	varying vec4 v_ShadowCoord;
#endif

#ifdef CALCULATE_SPOTSHADOWS
	varying vec4 v_SpotShadowCoord;
#endif

#ifdef TILINGOFFSET
	uniform vec4 u_TilingOffset;
#endif

void main()
{
	vec4 position;
	#ifdef BONE
		mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		position=skinTransform*a_Position;
	#else
		position=a_Position;
	#endif
	#ifdef GPU_INSTANCE
		gl_Position = a_MvpMatrix * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif
	
	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif

	mat3 worldInvMat;
	#ifdef BONE
		worldInvMat=INVERSE_MAT(mat3(worldMat*skinTransform));
	#else
		worldInvMat=INVERSE_MAT(mat3(worldMat));
	#endif  
	v_Normal=normalize(a_Normal*worldInvMat);
	#if defined(NORMALMAP)
		v_Tangent=normalize(a_Tangent0.xyz*worldInvMat);
		v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;
	#endif

	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)
		vec3 positionWS=(worldMat*position).xyz;
		#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
			v_ViewDir = u_CameraPos-positionWS;
		#endif
		#if defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(CALCULATE_SHADOWS)&&defined(SHADOW_CASCADE))||defined(CALCULATE_SPOTSHADOWS)
			v_PositionWorld = positionWS;
		#endif
	#endif

	#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))
		#ifdef TILINGOFFSET
			v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
		#else
			v_Texcoord0=a_Texcoord0;
		#endif
	#endif

	#ifdef LIGHTMAP
		#ifdef UV1
			v_LightMapUV=vec2(a_Texcoord1.x,1.0-a_Texcoord1.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;
		#else
			v_LightMapUV=vec2(a_Texcoord0.x,1.0-a_Texcoord0.y)*u_LightmapScaleOffset.xy+u_LightmapScaleOffset.zw;
		#endif 
		v_LightMapUV.y=1.0-v_LightMapUV.y;
	#endif

	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color=a_Color;
	#endif

	#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)
		v_ShadowCoord =getShadowCoord(vec4(positionWS,1.0));
	#endif

	#ifdef CALCULATE_SPOTSHADOWS
		v_SpotShadowCoord = u_SpotViewProjectMatrix*vec4(positionWS,1.0);
	#endif

	gl_Position=remapGLPositionZ(gl_Position);
}