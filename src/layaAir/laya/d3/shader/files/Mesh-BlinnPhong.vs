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

#ifdef SIMPLEBONE
	#ifdef GPU_INSTANCE
		attribute vec4 a_SimpleTextureParams;
	#else
		uniform vec4 u_SimpleAnimatorParams;
	#endif
	uniform sampler2D u_SimpleAnimatorTexture;

	uniform float u_SimpleAnimatorTextureSize; 
#endif


#ifdef SIMPLEBONE
mat4 loadMatFromTexture(float FramePos,int boneIndices,float offset)
{
	vec2 uv;
	float PixelPos = FramePos+float(boneIndices)*4.0;
	float halfOffset = offset * 0.5;
	float uvoffset = PixelPos/u_SimpleAnimatorTextureSize;
	uv.y = floor(uvoffset)*offset+halfOffset;
	uv.x = mod(float(PixelPos),u_SimpleAnimatorTextureSize)*offset+halfOffset;
	vec4 mat0row = texture2D(u_SimpleAnimatorTexture,uv);
	uv.x+=offset;
	vec4 mat1row = texture2D(u_SimpleAnimatorTexture,uv);
	uv.x+=offset;
	vec4 mat2row = texture2D(u_SimpleAnimatorTexture,uv);
	uv.x+=offset;
	vec4 mat3row = texture2D(u_SimpleAnimatorTexture,uv);
	mat4 m =mat4(mat0row.x,mat0row.y,mat0row.z,mat0row.w,
			  mat1row.x,mat1row.y,mat1row.z,mat1row.w,
			  mat2row.x,mat2row.y,mat2row.z,mat2row.w,
			  mat3row.x,mat3row.y,mat3row.z,mat3row.w);
	return m;
}
#endif

void main()
{
	vec4 position;
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