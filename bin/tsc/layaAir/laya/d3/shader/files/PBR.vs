
uniform mat4 modelMatrix;
//uniform mat4 modelViewMatrix;
//uniform mat4 projectionMatrix;
uniform mat4 u_View;
uniform mat4 u_Project;
uniform mat4 mvp;
//uniform mat4 viewMatrix;
uniform vec3 cameraPosition;

attribute vec3 a_position;
attribute vec3 a_normal;
#ifdef HAS_TANGENT
attribute vec3 tangent;
attribute vec3 binormal;
#endif
attribute vec2 uv;
#ifdef BONE
attribute vec4 a_BoneIndices;
attribute vec4 a_BoneWeights;
const int c_MaxBoneCount = 24;
uniform mat4 u_Bones[c_MaxBoneCount];
#endif

varying vec2 vUv;
varying vec3 vWorldNorm;
varying vec4 vViewPos;
varying vec4 vWorldPos;
varying vec3 vLightDir;
varying vec3 vViewDir;
#ifdef HAS_TANGENT
varying vec3 vWorldTangent;
varying vec3 vWorldBinormal;
#endif

#ifdef RECEIVESHADOW
varying float v_posViewZ;
  #ifdef SHADOWMAP_PSSM1 
  varying vec4 v_lightMVPPos;
  uniform mat4 u_lightShadowVP[4];
  #endif
#endif

void main() {
	#ifdef BONE
		mat4 skinTransform=mat4(0.0);
		skinTransform += u_Bones[int(a_BoneIndices.x)] * a_BoneWeights.x;
		skinTransform += u_Bones[int(a_BoneIndices.y)] * a_BoneWeights.y;
		skinTransform += u_Bones[int(a_BoneIndices.z)] * a_BoneWeights.z;
		skinTransform += u_Bones[int(a_BoneIndices.w)] * a_BoneWeights.w;
		gl_Position = mvp*skinTransform*vec4(a_position,1.);
		mat4 modelMat = modelMatrix*skinTransform;
	#else
		gl_Position = mvp*vec4(a_position,1.);
		mat4 modelMat = modelMatrix;
	#endif	
		vWorldPos = modelMat*vec4(a_position,1.);

	#ifdef CASTSHADOW 
		#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
			vUv = uv;
		#endif	
	#else
		vUv = uv;
		vWorldNorm = normalize((modelMat*vec4(a_normal,0.0)).xyz);
		#ifdef HAS_TANGENT
		vWorldTangent = normalize((modelMat*vec4(tangent,0.0)).xyz);
		vWorldBinormal = normalize((modelMat*vec4(binormal,0.0)).xyz);
		#endif
		
		vViewDir = (vWorldPos.xyz-cameraPosition);//这个不能normalize。否则无法线性差值了
	#ifdef RECEIVESHADOW
		v_posViewZ = gl_Position.z;
		#ifdef SHADOWMAP_PSSM1 
			v_lightMVPPos = u_lightShadowVP[0] * vWorldPos;
		#endif
	#endif	
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}
