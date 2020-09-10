#include "Lighting.glsl";

attribute vec4 a_Position;
attribute vec2 a_Texcoord0;

uniform mat4 u_MvpMatrix;

varying vec2 v_Texcoord0;

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(LIGHTMAP)
	attribute vec3 a_Normal;
	varying vec3 v_Normal;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)||(defined(CALCULATE_SHADOWS)&&defined(SHADOWMAP_PSSM1))
	uniform mat4 u_WorldMat;
	varying vec3 v_PositionWorld;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform vec4 u_LightmapScaleOffset;
#endif

#if defined(CALCULATE_SHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
	varying vec4 v_ShadowCoord;
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

	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)||(defined(CALCULATE_SHADOWS)&&defined(SHADOWMAP_PSSM1))
		v_PositionWorld=(u_WorldMat*a_Position).xyz;
	#endif

	#if defined(CALCULATE_SHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
		v_ShadowCoord = getShadowCoord(vec4(v_PositionWorld));
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}