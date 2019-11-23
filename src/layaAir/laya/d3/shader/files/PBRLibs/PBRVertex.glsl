#if defined(INDIRECTLIGHT)
 uniform vec4 u_AmbientSHBr;
 uniform vec4 u_AmbientSHBg;
 uniform vec4 u_AmbientSHBb;
 uniform vec4 u_AmbientSHC;
 varying vec3 v_SHL2Color;
#endif
#if defined(INDIRECTLIGHT)
vec3 SHEvalLinearL2(vec4 normal)
{
	vec4 nenormal = vec4(-normal.x,normal.y,normal.z,1.0);
	vec3 x1;
	vec3 x2;
	// 4 of the quadratic (L2) polynomials
	vec4 vB = nenormal.xyzz * nenormal.yzzx;
	x1.r = dot(u_AmbientSHBr, vB);
	x1.g = dot(u_AmbientSHBg, vB);
	x1.b = dot(u_AmbientSHBb, vB);

	// Final (5th) quadratic (L2) polynomial
	float vC = normal.x*normal.x - normal.y*normal.y;
	x2 = u_AmbientSHC.rgb * vC;

	return x1 + x2;
}
#endif


void vertexForward()
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

	v_PositionWorld=(worldMat*position).xyz;

	#if defined(DIFFUSEMAP)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		#ifdef TILINGOFFSET
			v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
		#else
			v_Texcoord0=a_Texcoord0;
		#endif
	#endif

	v_EyeVec =u_CameraPos-v_PositionWorld;//will normalize per-pixel

	#ifdef LIGHTMAP
		v_LightMapUV=transformLightMapUV(a_Texcoord0,a_Texcoord1,u_LightmapScaleOffset);
	#endif



	mat3 worldInvMat;
	#ifdef BONE
		worldInvMat=inverse(mat3(worldMat*skinTransform));
	#else
		worldInvMat=inverse(mat3(worldMat));
	#endif
	v_Normal=a_Normal*worldInvMat;
	#ifdef INDIRECTLIGHT
		v_SHL2Color = SHEvalLinearL2(vec4(normalize(v_Normal),1.0));
	#endif

	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		v_Tangent=a_Tangent0.xyz*worldInvMat;
		v_Binormal=cross(v_Normal,v_Tangent)*a_Tangent0.w;
	#endif

	//TODO:缺高差图TODO
}