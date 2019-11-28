void main_castShadow()
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
	
	//TODO没考虑UV动画呢
	#if defined(ALBEDOTEXTURE)&&defined(ALPHATEST)
		v_Texcoord0=a_Texcoord0;
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
	v_posViewZ = gl_Position.z;
}