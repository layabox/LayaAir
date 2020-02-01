void vertexShadowCaster()
{
	#ifdef BONE
		mat4 skinTransform = u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
	#endif

	mat4 worldMat;
	#ifdef GPU_INSTANCE
		worldMat = a_WorldMat;
	#else
		worldMat = u_WorldMat;
	#endif

	vec4 positionWS;
	vec3 normalWS;
	#ifdef BONE
		positionWS = worldMat * skinTransform * a_Position;
		normalWS=normalize(a_Normal*inverseMat(mat3(worldMat*skinTransform)));//if no normalize will cause precision problem
	#else
		positionWS = worldMat * a_Position;
		normalWS=normalize(a_Normal*inverseMat(mat3(worldMat)));//if no normalize will cause precision problem
	#endif

	vec3 lightDir = normalize(u_DirectionLight.direction);
	positionWS.xyz=applyShadowBias(positionWS.xyz,normalWS,lightDir);

	positionCS = u_ViewProjection * positionWS;

	//positionCS.z = max(positionCS.z, positionCS.w * LAYA_NEAR_CLIP_VALUE);//
	
	//TODO没考虑UV动画呢
	#if defined(ALBEDOTEXTURE)&&defined(ALPHATEST)
		v_Texcoord0=a_Texcoord0;
	#endif
	gl_Position=remapGLPositionZ(positionCS);
}