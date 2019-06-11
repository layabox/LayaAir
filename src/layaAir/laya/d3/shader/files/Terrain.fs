#ifdef HIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	uniform vec3 u_MaterialDiffuse;
	uniform vec4 u_MaterialSpecular;
	uniform vec3 u_CameraPos;
	varying vec3 v_Normal;
	varying vec3 v_PositionWorld;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(LIGHTMAP)
	uniform vec3 u_MaterialAmbient;
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

uniform vec3 u_AmbientColor;

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


uniform sampler2D u_SplatAlphaTexture;
uniform sampler2D u_NormalTexture;
uniform sampler2D u_DiffuseTexture1;
uniform sampler2D u_DiffuseTexture2;
uniform sampler2D u_DiffuseTexture3;
uniform sampler2D u_DiffuseTexture4;
uniform vec2 u_DiffuseScale1;
uniform vec2 u_DiffuseScale2;
uniform vec2 u_DiffuseScale3;
uniform vec2 u_DiffuseScale4;
varying vec2 v_Texcoord0;
varying vec2 v_Texcoord1;

#ifdef LIGHTMAP
	uniform sampler2D u_LightMap;
	varying vec2 v_LightMapUV;
#endif

void main()
{
	#ifdef DETAIL_NUM1
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord1/u_DiffuseScale1);
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		gl_FragColor.xyz = color1.xyz;
		gl_FragColor.w = splatAlpha.a;
	#endif
	#ifdef DETAIL_NUM2
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord1/u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord1/u_DiffuseScale2);
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		gl_FragColor.xyz = color1.xyz * (1.0-splatAlpha.r) + color2.xyz * splatAlpha.r;
		gl_FragColor.w = splatAlpha.a;
	#endif
	#ifdef DETAIL_NUM3
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord1/u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord1/u_DiffuseScale2);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord1/u_DiffuseScale3);
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		gl_FragColor.xyz = color1.xyz * (1.0-(splatAlpha.r+splatAlpha.g)) + color2.xyz * splatAlpha.r + color3.xyz * splatAlpha.g;
		gl_FragColor.w = splatAlpha.a;
	#endif
	#ifdef DETAIL_NUM4
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord1/u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord1/u_DiffuseScale2);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord1/u_DiffuseScale3);
		vec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord1/u_DiffuseScale4);
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		gl_FragColor.xyz = color1.xyz * (1.0-(splatAlpha.r+splatAlpha.g+splatAlpha.b))+ color2.xyz * splatAlpha.r + color3.xyz * splatAlpha.g + color4.xyz * splatAlpha.b;
		gl_FragColor.w = splatAlpha.a;
	#endif
	
		
#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
    vec3 normal = texture2D(u_NormalTexture,v_Normal.xy).xyz;
	normal = normal*2.0 - vec3(1.0);
	vec3 diffuse = vec3(0.0);
	vec3 ambient = vec3(0.0);
	vec3 specular= vec3(0.0);
	vec3 dif, amb, spe;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
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
	computeDirectionLight(u_MaterialDiffuse,u_MaterialAmbient,u_MaterialSpecular,u_DirectionLight,u_AmbientColor,normal,toEye, dif, amb, spe);
	diffuse+=dif;
	ambient+=amb;
	specular+=spe;
#endif
 
#ifdef POINTLIGHT
	computePointLight(u_MaterialDiffuse,u_MaterialAmbient,u_MaterialSpecular,u_PointLight,u_AmbientColor,v_PositionWorld,normal,toEye, dif, amb, spe);
	diffuse+=dif;
	ambient+=amb;
	specular+=spe;
#endif

#ifdef SPOTLIGHT
	ComputeSpotLight(u_MaterialDiffuse,u_MaterialAmbient,u_MaterialSpecular,u_SpotLight,u_AmbientColor,v_PositionWorld,normal,toEye, dif, amb, spe);
	diffuse+=dif;
	ambient+=amb;
	specular+=spe;
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
#endif

vec3 globalDiffuse=u_AmbientColor;
#ifdef LIGHTMAP
	float exponent = texture2D(u_LightMap, v_LightMapUV).a;
	vec3 finalDiffuse = texture2D(u_LightMap, v_LightMapUV).rgb;
	float ratio = pow(2.0, exponent * 255.0 - (128.0 + 8.0));
	finalDiffuse = finalDiffuse * 255.0 * ratio;	
	globalDiffuse += pow(finalDiffuse, vec3(1.0/2.2));
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		gl_FragColor.rgb=gl_FragColor.rgb*globalDiffuse;
	#else
		#if defined(RECEIVESHADOW)		
			gl_FragColor.rgb=gl_FragColor.rgb*(globalDiffuse * shadowValue);
			//vec3 tColor= u_MaterialAmbient + texture2D(u_LightMap, v_LightMapUV).rgb * shadowValue + mix(vec3(0.15,0.15,0.15),vec3(0.0),shadowValue);
			//gl_FragColor.rgb*=tColor;
		#else
			gl_FragColor.rgb=gl_FragColor.rgb*(globalDiffuse);
		#endif
	#endif
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#ifdef RECEIVESHADOW
		gl_FragColor =vec4( gl_FragColor.rgb*(ambient + diffuse*shadowValue) + specular * shadowValue,gl_FragColor.a);
	#else
		gl_FragColor =vec4( gl_FragColor.rgb*(ambient + diffuse) + specular, gl_FragColor.a);
	#endif
#endif


	#ifdef FOG
		float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
		#ifdef ADDTIVEFOG
			gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(0.0,0.0,0.0),lerpFact);
		#else
			gl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);
		#endif
	#endif
}

