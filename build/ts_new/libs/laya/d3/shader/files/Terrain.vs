attribute vec4 a_Position;

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(LIGHTMAP)
	attribute vec3 a_Normal;
	varying vec3 v_Normal;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(RECEIVESHADOW)&&defined(SHADOWMAP_PSSM1))
	uniform mat4 u_WorldMat;
	varying vec3 v_PositionWorld;
#endif

varying float v_posViewZ;
#ifdef RECEIVESHADOW
  #ifdef SHADOWMAP_PSSM1 
  varying vec4 v_lightMVPPos;
  uniform mat4 u_lightShadowVP[4];
  #endif
#endif

#ifdef LIGHTMAP
	uniform vec4 u_LightmapScaleOffset;
	varying vec2 v_LightMapUV;
#endif

attribute vec2 a_Texcoord0;
attribute vec2 a_Texcoord1;
varying vec2 v_Texcoord0;
varying vec2 v_Texcoord1;
uniform mat4 u_MvpMatrix;

void main()
{
	gl_Position = u_MvpMatrix * a_Position;
	v_Texcoord0=a_Texcoord0;
	v_Texcoord1=a_Texcoord1;
	
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		v_Normal=a_Normal;
	#endif

	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||(defined(RECEIVESHADOW)&&defined(SHADOWMAP_PSSM1))
		v_PositionWorld=(u_WorldMat*a_Position).xyz;
	#endif

	#ifdef LIGHTMAP
		//这个地方使用a_Normal 并不是真的代表normal，其实凑巧法线图的uv正好是符合 light_Map的UV
		//v_LightMapUV=vec2(a_Normal.x*u_LightmapScaleOffset.x+u_LightmapScaleOffset.z,(a_Normal.y-1.0)*u_LightmapScaleOffset.y+u_LightmapScaleOffset.w);
		v_LightMapUV=vec2(a_Normal.x,1.0 - a_Normal.y) * u_LightmapScaleOffset.xy + u_LightmapScaleOffset.zw;
		v_LightMapUV.y=1.0-v_LightMapUV.y;
	#endif

	#ifdef RECEIVESHADOW
		v_posViewZ = gl_Position.w;
		#ifdef SHADOWMAP_PSSM1
			v_lightMVPPos = u_lightShadowVP[0] * vec4(v_PositionWorld,1.0);
		#endif
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}