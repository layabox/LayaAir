#include "Lighting.glsl";

attribute vec4 a_Position;

attribute vec2 a_Texcoord0;

#ifdef GPU_INSTANCE
	attribute mat4 a_MvpMatrix;
#else
	uniform mat4 u_MvpMatrix;
#endif

attribute vec4 a_Color;
varying vec4 v_Color;
varying vec2 v_Texcoord0;

#ifdef TILINGOFFSET
	uniform vec4 u_TilingOffset;
#endif

#ifdef BONE
	const int c_MaxBoneCount = 24;
	attribute vec4 a_BoneIndices;
	attribute vec4 a_BoneWeights;
	uniform mat4 u_Bones[c_MaxBoneCount];
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
void main() {
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

	#ifdef TILINGOFFSET
		v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
	#else
		v_Texcoord0=a_Texcoord0;
	#endif

	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		v_Color = a_Color;
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}