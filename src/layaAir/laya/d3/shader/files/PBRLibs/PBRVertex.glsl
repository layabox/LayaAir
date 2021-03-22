vec2 transformLightMapUV(in vec2 texcoord,in vec4 lightmapScaleOffset)
{
	vec2 lightMapUV=vec2(texcoord.x,1.0-texcoord.y)*lightmapScaleOffset.xy+lightmapScaleOffset.zw;
	lightMapUV.y=1.0-lightMapUV.y;
	return lightMapUV; 
}

void vertexForward()
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

	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif

	#ifdef GPU_INSTANCE
		gl_Position = u_ViewProjection * worldMat * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif

	

	v_PositionWorld=(worldMat*position).xyz;

	#if defined(ALBEDOTEXTURE)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
	#endif

	v_EyeVec =u_CameraPos-v_PositionWorld;//will normalize per-pixel

	#ifdef LIGHTMAP
		vec2 texcoord;
		#ifdef UV1
			texcoord=a_Texcoord1;
		#else
			texcoord=a_Texcoord0;
		#endif
		v_LightMapUV=transformLightMapUV(texcoord,u_LightmapScaleOffset);
	#endif

	mat3 worldInvMat;
	#ifdef BONE
		worldInvMat=INVERSE_MAT(mat3(worldMat*skinTransform));
	#else
		worldInvMat=INVERSE_MAT(mat3(worldMat));
	#endif

	v_Normal=normalize(a_Normal*worldInvMat);//if no normalize will cause precision problem.

	#ifdef NORMALTEXTURE
		v_Tangent=normalize(a_Tangent0.xyz*worldInvMat);
		v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;
	#endif

	#ifdef PARALLAXTEXTURE
		vec3 binormal = cross(a_Normal, a_Tangent0.xyz)*a_Tangent0.w;
		mat3 objectTBN = mat3(a_Tangent0.xyz, binormal, a_Normal);
		v_ViewDirForParallax =(u_CameraPos*worldInvMat-position.xyz)*objectTBN;
	#endif

	#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)
		v_ShadowCoord = getShadowCoord(vec4(v_PositionWorld,1.0));
	#endif

	#if defined(CALCULATE_SPOTSHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
		v_SpotShadowCoord = u_SpotViewProjectMatrix*vec4(v_PositionWorld,1.0);
	#endif
}