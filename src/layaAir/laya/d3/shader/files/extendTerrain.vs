#include "Lighting.glsl";

attribute vec4 a_Position;
attribute vec2 a_Texcoord0;

uniform mat4 u_MvpMatrix;

varying vec2 v_Texcoord0;

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(LIGHTMAP)
	attribute vec3 a_Normal;
	varying vec3 v_Normal;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)||(defined(RECEIVESHADOW)&&defined(SHADOWMAP_PSSM1))
	uniform mat4 u_WorldMat;
	varying vec3 v_PositionWorld;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform vec4 u_LightmapScaleOffset;
#endif

#ifdef RECEIVESHADOW
	varying float v_posViewZ;
	#ifdef SHADOWMAP_PSSM1 
		varying vec4 v_lightMVPPos;
		uniform mat4 u_lightShadowVP[4];
	#endif
#endif

void main()
{
	gl_Position = u_MvpMatrix * a_Position;
  
	v_Texcoord0 = a_Texcoord0;
  
	#ifdef LIGHTMAP
		v_LightMapUV = vec2(a_Texcoord0.x, 1.0 - a_Texcoord0.y) * u_LightmapScaleOffset.xy + u_LightmapScaleOffset.zw;
		v_LightMapUV.y = 1.0 - v_LightMapUV.y;
	#endif
  
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		v_Normal = a_Normal;
	#endif

	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)||(defined(RECEIVESHADOW)&&defined(SHADOWMAP_PSSM1))
		v_PositionWorld=(u_WorldMat*a_Position).xyz;
	#endif

	#ifdef RECEIVESHADOW
		v_posViewZ = gl_Position.w;
		#ifdef SHADOWMAP_PSSM1
			v_lightMVPPos = u_lightShadowVP[0] * vec4(v_PositionWorld,1.0);
		#endif
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}