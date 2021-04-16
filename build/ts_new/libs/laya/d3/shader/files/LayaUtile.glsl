

//SimpleSkinnedMesh
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

