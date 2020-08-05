attribute vec4 a_Position;

#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
	attribute mat4 a_WorldMat;
#else
	uniform mat4 u_MvpMatrix;
	uniform mat4 u_WorldMat;
#endif

#ifdef BONE
	const int c_MaxBoneCount = 24;
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	uniform mat4 u_Bones[c_MaxBoneCount];
#endif

attribute vec3 a_Normal;
varying vec3 v_Normal; 

#if defined(NORMALTEXTURE)||defined(PARALLAXTEXTURE)
	attribute vec4 a_Tangent0;
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
    #ifdef PARALLAXTEXTURE
	    varying vec3 v_ViewDirForParallax;
    #endif
#endif

#if defined(ALBEDOTEXTURE)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)||(defined(LIGHTMAP)&&defined(UV))
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

uniform vec3 u_CameraPos;
varying vec3 v_EyeVec;
varying vec3 v_PositionWorld;
varying float v_posViewZ;

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