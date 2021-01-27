#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
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

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			uniform DirectionLight u_DirectionLight;
		#endif
		#ifdef POINTLIGHT
			uniform PointLight u_PointLight;
		#endif
		#ifdef SPOTLIGHT
			uniform SpotLight u_SpotLight;
		#endif
	#else
		uniform mat4 u_View;
		uniform vec4 u_ProjectionParams;
		uniform vec4 u_Viewport;
		uniform int u_DirationLightCount;
		uniform sampler2D u_LightBuffer;
		uniform sampler2D u_LightClusterBuffer;
	#endif
#endif

#include "Shadow.glsl"
#if defined(CALCULATE_SHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
	varying vec4 v_ShadowCoord;
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

	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			LayaAirBlinnPhongDiectionLight(vec3(0.0),1.0,normal,vec3(1.0),toEye,u_DirectionLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		#endif
	
		#ifdef POINTLIGHT
			LayaAirBlinnPhongPointLight(v_PositionWorld,vec3(0.0),1.0,normal,vec3(1.0),toEye,u_PointLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		#endif

		#ifdef SPOTLIGHT
			LayaAirBlinnPhongSpotLight(v_PositionWorld,vec3(0.0),1.0,normal,vec3(1.0),toEye,u_SpotLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		#endif
	#else
		#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				LayaAirBlinnPhongDiectionLight(vec3(0.0),1.0,normal,vec3(1.0),toEye,directionLight,dif,spe);
				diffuse+=dif;
				specular+=spe;
			}
		#endif
		#if defined(POINTLIGHT)||defined(SPOTLIGHT)
			ivec4 clusterInfo =getClusterInfo(u_LightClusterBuffer,u_View,u_Viewport, v_PositionWorld,gl_FragCoord,u_ProjectionParams);
			#ifdef POINTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.x)//PointLightCount
						break;
					PointLight pointLight = getPointLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaAirBlinnPhongPointLight(v_PositionWorld,vec3(0.0),1.0,normal,vec3(1.0),toEye,pointLight,dif,spe);
					diffuse+=dif;
					specular+=spe;
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaAirBlinnPhongSpotLight(v_PositionWorld,vec3(0.0),1.0,normal,vec3(1.0),toEye	,spotLight,dif,spe);
					diffuse+=dif;
					specular+=spe;
				}
			#endif
		#endif
	#endif

vec3 globalDiffuse = u_AmbientColor;
#ifdef LIGHTMAP
	globalDiffuse += decodeHDR(texture2D(u_LightMap, v_LightMapUV),5.0);
#endif

#if defined(CALCULATE_SHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
	float shadowValue = shadowValue = sampleShadowmap(v_ShadowCoord);
	gl_FragColor = vec4(gl_FragColor.rgb * (globalDiffuse + diffuse) * shadowValue, gl_FragColor.a);
#else
	gl_FragColor = vec4(gl_FragColor.rgb * (globalDiffuse + diffuse), gl_FragColor.a);
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#if defined(CALCULATE_SHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
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





