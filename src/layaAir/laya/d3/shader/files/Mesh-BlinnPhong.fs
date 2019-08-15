#ifdef HIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";

uniform vec4 u_DiffuseColor;

#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
	varying vec4 v_Color;
#endif

#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif

#ifdef DIFFUSEMAP
	uniform sampler2D u_DiffuseTexture;
#endif


#if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))
	varying vec2 v_Texcoord0;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform sampler2D u_LightMap;
#endif

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	varying vec3 v_Position;
	varying vec3 v_Normal;
	varying vec3 v_ViewDir; 

	uniform vec3 u_MaterialSpecular;
	uniform float u_Shininess;

	uniform mat4 u_View;
	uniform vec4 u_ProjectionParams;
	uniform vec4 u_Viewport;

	uniform int u_DirationLightCount;
	uniform sampler2D u_LightBuffer;
	uniform sampler2D u_ClusterBuffer;
	#ifdef SPECULARMAP 
		uniform sampler2D u_SpecularTexture;
	#endif
	#ifdef NORMALMAP 
		uniform sampler2D u_NormalTexture;
		varying vec3 v_Tangent;
		varying vec3 v_Binormal;
	#endif
#endif

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	uniform vec3 u_FogColor;
#endif


uniform vec3 u_AmbientColor;

#if defined(POINTLIGHT)||defined(SPOTLIGHT)||defined(RECEIVESHADOW)
	varying vec3 v_PositionWorld;
#endif

#include "ShadowHelper.glsl"
varying float v_posViewZ;
#ifdef RECEIVESHADOW
	#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
		uniform mat4 u_lightShadowVP[4];
	#endif
	#ifdef SHADOWMAP_PSSM1 
		varying vec4 v_lightMVPPos;
	#endif
#endif

void main_castShadow()
{
	//gl_FragColor=vec4(v_posViewZ,0.0,0.0,1.0);
	gl_FragColor=packDepth(v_posViewZ);
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		float alpha = texture2D(u_DiffuseTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}
void main_normal()
{
	vec3 globalDiffuse=u_AmbientColor;
	#ifdef LIGHTMAP	
		globalDiffuse += DecodeLightmap(texture2D(u_LightMap, v_LightMapUV));
	#endif
	
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		vec3 normal;
		#if (defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&defined(NORMALMAP)
			vec3 normalMapSample = texture2D(u_NormalTexture, v_Texcoord0).rgb;
			normal = normalize(NormalSampleToWorldSpace(normalMapSample, v_Normal, v_Tangent,v_Binormal));
		#else
			normal = normalize(v_Normal);
		#endif
		vec3 viewDir= normalize(v_ViewDir);
	#endif
	
	vec4 mainColor=u_DiffuseColor;
	#ifdef DIFFUSEMAP
		vec4 difTexColor=texture2D(u_DiffuseTexture, v_Texcoord0);
		mainColor=mainColor*difTexColor;
	#endif 
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		mainColor=mainColor*v_Color;
	#endif 
    
	#ifdef ALPHATEST
		if(mainColor.a<u_AlphaTestValue)
			discard;
	#endif
  
	
	vec3 diffuse = vec3(0.0);
	vec3 specular= vec3(0.0);
	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		vec3 dif,spe;
		#ifdef SPECULARMAP
			vec3 gloss=texture2D(u_SpecularTexture, v_Texcoord0).rgb;
		#else
			#ifdef DIFFUSEMAP
				vec3 gloss=vec3(difTexColor.a);
			#else
				vec3 gloss=vec3(1.0);
			#endif
		#endif
	#endif

   
   //TODO:封装
	#ifdef DIRECTIONLIGHT
		for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
		{
			if(i >= u_DirationLightCount)
				break;
			DirectionLight directionLight = GetDirectionLight(u_LightBuffer,i);
			LayaAirBlinnPhongDiectionLight(u_MaterialSpecular,u_Shininess,normal,gloss,viewDir,directionLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		}
	#endif
 
  	ivec3 areaLightCount =getClusterInfo(u_ClusterBuffer,u_View,u_Viewport, v_Position,gl_FragCoord,u_ProjectionParams);
	#ifdef POINTLIGHT
		for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
		{
			if(i >= areaLightCount.x)
				break;
			int lightIndex = GetLightIndex(u_ClusterBuffer,areaLightCount.z,i);
      		PointLight pointLight = GetPointLight(u_LightBuffer,lightIndex);
			LayaAirBlinnPhongPointLight(v_PositionWorld,u_MaterialSpecular,u_Shininess,normal,gloss,viewDir,pointLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		}
	#endif

	#ifdef SPOTLIGHT
		for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
		{
			if(i >= areaLightCount.y)
				break;
			int lightIndex = GetLightIndex(u_ClusterBuffer,areaLightCount.z,areaLightCount.x+i);
      		SpotLight spotLight = GetSpotLight(u_LightBuffer,lightIndex);
			LayaAirBlinnPhongSpotLight(v_PositionWorld,u_MaterialSpecular,u_Shininess,normal,gloss,viewDir,spotLight,dif,spe);
			diffuse+=dif;
			specular+=spe;
		}
	#endif

	#ifdef RECEIVESHADOW
		float shadowValue = 1.0;
		#ifdef SHADOWMAP_PSSM3
			shadowValue = getShadowPSSM3(u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif
		#ifdef SHADOWMAP_PSSM2
			shadowValue = getShadowPSSM2(u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif 
		#ifdef SHADOWMAP_PSSM1
			shadowValue = getShadowPSSM1(u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.001);
		#endif
		gl_FragColor =vec4(mainColor.rgb*(globalDiffuse + diffuse*shadowValue),mainColor.a);
	#else
		gl_FragColor =vec4(mainColor.rgb*(globalDiffuse + diffuse),mainColor.a);
	#endif

	#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
		#ifdef RECEIVESHADOW
			gl_FragColor.rgb+=specular*shadowValue;
		#else
			gl_FragColor.rgb+=specular;
		#endif
	#endif
	  
	#ifdef FOG
		float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
		gl_FragColor.rgb=mix(gl_FragColor.rgb,u_FogColor,lerpFact);
	#endif
}

void main()
{
	#ifdef CASTSHADOW		
		main_castShadow();
	#else
		main_normal();
	#endif  
}

