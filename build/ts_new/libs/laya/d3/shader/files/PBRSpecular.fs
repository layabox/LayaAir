#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 v_Texcoord0;
varying vec3 v_Normal;
varying vec3 v_Tangent;
varying vec3 v_Binormal;
varying vec3 v_ViewDir;
varying vec3 v_PositionWorld;

uniform vec3 u_AmbientColor;
uniform vec4 u_AlbedoColor;
uniform vec4 u_SpecularColor;

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif
#ifdef SPECULARTEXTURE
	uniform sampler2D u_SpecularTexture;
#endif
#ifdef NORMALTEXTURE
	uniform sampler2D u_NormalTexture;
	uniform float u_normalScale;
#endif
#ifdef PARALLAXTEXTURE
	uniform sampler2D u_ParallaxTexture;
	uniform float u_parallaxScale;
#endif
#ifdef OCCLUSIONTEXTURE
	uniform sampler2D u_OcclusionTexture;
	uniform float u_occlusionStrength;
#endif
#ifdef EMISSION
	#ifdef EMISSIONTEXTURE
		uniform sampler2D u_EmissionTexture;
	#endif
	uniform vec4 u_EmissionColor;
#endif
#ifdef REFLECTMAP
	uniform samplerCube u_ReflectTexture;
	uniform float u_ReflectIntensity;
#endif

uniform float u_AlphaTestValue;
uniform float u_metallic;
uniform float u_smoothness;
uniform float u_smoothnessScale;



#include "Lighting.glsl";
#include "PBRSpecularLighting.glsl"
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

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	uniform vec3 u_FogColor;
#endif

void main_castShadow()
{
	gl_FragColor=packDepth(v_posViewZ);
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		float alpha = texture2D(u_AlbedoTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}

void main_normal()
{	
	vec3 viewDir = normalize(v_ViewDir);
	
	vec2 uv0 = ParallaxOffset(viewDir);
	
	vec4 sg;
	vec4 albedoColor;
	#ifdef ALBEDOTEXTURE
		vec4 albedoTextureColor = texture2D(u_AlbedoTexture, uv0);
		albedoColor = albedoTextureColor * u_AlbedoColor;
		sg = SpecularGloss(albedoTextureColor.a, uv0);
	#else
		albedoColor = u_AlbedoColor;
		sg = SpecularGloss(1.0, uv0);
	#endif
	
	#ifdef ALPHATEST
		if(albedoColor.a < u_AlphaTestValue)
			discard;
	#endif
  
	vec3 normal = UnpackScaleNormal(uv0);
	
	LayaGI gi;
	gi.diffuse = u_AmbientColor * Occlusion(uv0).rgb;
	gi.specular = ReflectCubeMap(viewDir, normal);
	
	//float a = (sg.r+sg.g+sg.b) / 3.0;
  	float shadowValue = 1.0;
	#ifdef RECEIVESHADOW
		
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
	vec4 color = vec4(0.0);
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			color += PBRSpecularDiectionLight(albedoColor, sg.rgb, sg.a, normal, viewDir, u_DirectionLight, gi,shadowValue);
		#endif
	
		#ifdef POINTLIGHT
			color.a = 0.0;
			color += PBRSpecularPointLight(albedoColor, sg.rgb, sg.a, normal, viewDir, u_PointLight, v_PositionWorld, gi,shadowValue);
		#endif
		
		#ifdef SPOTLIGHT
			color.a = 0.0;
			color += PBRSpecularSpotLight(albedoColor, sg.rgb, sg.a, normal, viewDir, u_SpotLight, v_PositionWorld, gi,shadowValue);
		#endif
	#else
		#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				color.a = 0.0;
				color +=PBRSpecularDiectionLight(albedoColor, sg.rgb, sg.a, normal, viewDir, directionLight, gi,shadowValue);
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
					color.a = 0.0;
					color +=PBRSpecularPointLight(albedoColor, sg.rgb, sg.a, normal, viewDir, pointLight, v_PositionWorld, gi,shadowValue);
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					color.a = 0.0;
					color += PBRSpecularSpotLight(albedoColor, sg.rgb, sg.a, normal, viewDir, spotLight, v_PositionWorld, gi,shadowValue);
				}
			#endif
		#endif
	#endif
	
	#ifdef REFLECTMAP
	 	color += LayaAirSpecularReflect(albedoColor,sg.rgb,sg.a,gi);
	#endif

	#ifdef EMISSION
		vec4 emissionColor = u_EmissionColor;
		#ifdef EMISSIONTEXTURE
			emissionColor *=  texture2D(u_EmissionTexture, uv0);
		#endif
		color.rgb += emissionColor.rgb;
	#endif

	gl_FragColor = color;
	#ifdef FOG
		float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
		gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
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

