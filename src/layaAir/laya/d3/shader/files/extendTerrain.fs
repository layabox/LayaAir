#ifdef HIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)
	uniform vec3 u_CameraPos;
	varying vec3 v_Normal;
	varying vec3 v_PositionWorld;
#endif

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	uniform vec3 u_FogColor;
#endif


#ifdef DIRECTIONLIGHT
	uniform DirectionLight u_DirectionLight;
#endif

#ifdef POINTLIGHT
	uniform PointLight u_PointLight;
#endif

#ifdef SPOTLIGHT
	uniform SpotLight u_SpotLight;
#endif

#include "ShadowHelper.glsl"
#ifdef RECEIVESHADOW
	#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
	uniform mat4 u_lightShadowVP[4];
	#endif
	#ifdef SHADOWMAP_PSSM1 
	varying vec4 v_lightMVPPos;
	#endif
#endif
varying float v_posViewZ;

uniform vec3 u_AmbientColor;

uniform sampler2D u_SplatAlphaTexture;

uniform sampler2D u_DiffuseTexture1;
uniform sampler2D u_DiffuseTexture2;
uniform sampler2D u_DiffuseTexture3;
uniform sampler2D u_DiffuseTexture4;
uniform sampler2D u_DiffuseTexture5;

uniform vec4 u_DiffuseScaleOffset1;
uniform vec4 u_DiffuseScaleOffset2;
uniform vec4 u_DiffuseScaleOffset3;
uniform vec4 u_DiffuseScaleOffset4;
uniform vec4 u_DiffuseScaleOffset5;

varying vec2 v_Texcoord0;

#ifdef LIGHTMAP
	uniform sampler2D u_LightMap;
	varying vec2 v_LightMapUV;
#endif

void main()
{
	vec4 splatAlpha = vec4(1.0);
	#ifdef ExtendTerrain_DETAIL_NUM1
		splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScaleOffset1.xy);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r;
	#endif
	#ifdef ExtendTerrain_DETAIL_NUM2
		splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScaleOffset1.xy);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScaleOffset2.xy);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r + color2.xyz * (1.0 - splatAlpha.r);
	#endif
	#ifdef ExtendTerrain_DETAIL_NUM3
		splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScaleOffset1.xy);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScaleOffset2.xy);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScaleOffset3.xy);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * (1.0 - splatAlpha.r - splatAlpha.g);
	#endif
	#ifdef ExtendTerrain_DETAIL_NUM4
		splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScaleOffset1.xy);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScaleOffset2.xy);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScaleOffset3.xy);
		vec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScaleOffset4.xy);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b);
	#endif
	#ifdef ExtendTerrain_DETAIL_NUM5
		splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScaleOffset1.xy);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScaleOffset2.xy);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScaleOffset3.xy);
		vec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScaleOffset4.xy);
		vec4 color5 = texture2D(u_DiffuseTexture5, v_Texcoord0 * u_DiffuseScaleOffset5.xy);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * splatAlpha.a + color5.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b - splatAlpha.a);
	#endif
		gl_FragColor.w = splatAlpha.a;
		
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
    vec3 normal = v_Normal;
	vec3 dif, spe;
#endif

vec3 diffuse = vec3(0.0);
vec3 specular= vec3(0.0);
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(FOG)
	vec3 toEye;
	#ifdef FOG
		toEye=u_CameraPos-v_PositionWorld;
		float toEyeLength=length(toEye);
		toEye/=toEyeLength;
	#else
		toEye=normalize(u_CameraPos-v_PositionWorld);
	#endif
#endif

#ifdef DIRECTIONLIGHT
	LayaAirBlinnPhongDiectionLight(vec3(0.0), 1.0, normal, vec3(1.0), toEye,u_DirectionLight, dif, spe);
	diffuse+=dif;
	specular+=spe;
#endif
 
#ifdef POINTLIGHT
	LayaAirBlinnPhongPointLight(v_PositionWorld, vec3(0.0), 1.0, normal, vec3(1.0), toEye, u_PointLight, dif, spe);
	diffuse+=dif;
	specular+=spe;
#endif

#ifdef SPOTLIGHT
	LayaAirBlinnPhongSpotLight(v_PositionWorld, vec3(0.0), 1.0, normal, vec3(1.0), toEye, u_SpotLight, dif, spe);
	diffuse+=dif;
	specular+=spe;
#endif

vec3 globalDiffuse = u_AmbientColor;
#ifdef LIGHTMAP
	globalDiffuse += DecodeLightmap(texture2D(u_LightMap, v_LightMapUV));
#endif

#ifdef RECEIVESHADOW
	float shadowValue = 1.0;
	#ifdef SHADOWMAP_PSSM3
		shadowValue = getShadowPSSM3( u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
	#endif
	#ifdef SHADOWMAP_PSSM2
		shadowValue = getShadowPSSM2( u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
	#endif 
	#ifdef SHADOWMAP_PSSM1
		shadowValue = getShadowPSSM1( u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.001);
	#endif
	gl_FragColor = vec4(gl_FragColor.rgb * (globalDiffuse + diffuse) * shadowValue, gl_FragColor.a);
#else
	gl_FragColor = vec4(gl_FragColor.rgb * (globalDiffuse + diffuse), gl_FragColor.a);
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#ifdef RECEIVESHADOW
		gl_FragColor.rgb += specular * shadowValue;
	#else
		gl_FragColor.rgb += specular;
	#endif
#endif

#ifdef FOG
	float lerpFact=clamp((toEyeLength-u_FogStart)/u_FogRange,0.0,1.0);
	gl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);
#endif
}





