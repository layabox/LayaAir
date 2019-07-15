#ifdef FSHIGHPRECISION
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

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif
#ifdef METALLICGLOSSTEXTURE
	uniform sampler2D u_MetallicGlossTexture;
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

uniform sampler2D u_RangeTexture;
//uniform sampler2D u_AngleTexture;
uniform mat4 u_PointLightMatrix;
//uniform mat4 u_SpotLightMatrix;

#include "PBRStandardLighting.glsl"
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

#ifdef DIRECTIONLIGHT
	uniform DirectionLight u_DirectionLight;
#endif
#ifdef POINTLIGHT
	uniform PointLight u_PointLight;
#endif
#ifdef SPOTLIGHT
	uniform SpotLight u_SpotLight;
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
	
	vec2 mg;
	vec4 albedoColor;
	#ifdef ALBEDOTEXTURE
		vec4 abledoTextureColor = texture2D(u_AlbedoTexture, uv0);
		albedoColor = abledoTextureColor * u_AlbedoColor;
		mg = MetallicGloss(abledoTextureColor.a, uv0);
	#else
		albedoColor = u_AlbedoColor;
		mg = MetallicGloss(1.0, uv0);
	#endif
	
	#ifdef ALPHATEST
		if(albedoColor.a < u_AlphaTestValue)
			discard;
	#endif
	
	vec3 normal = UnpackScaleNormal(uv0);
  
	LayaGI gi;
	gi.diffuse = u_AmbientColor * Occlusion(uv0).rgb;
	gi.specular = ReflectCubeMap(viewDir, normal);
  
	vec4 color = vec4(0.0);
	
	#ifdef DIRECTIONLIGHT
		color += PBRStandardDiectionLight(albedoColor, mg.r, mg.g, normal, viewDir, u_DirectionLight, gi);
	#endif
 
	#ifdef POINTLIGHT
		color.a = 0.0;
		color += PBRStandardPointLight(albedoColor, mg.r, mg.g, normal, viewDir, u_PointLight, v_PositionWorld, gi);
	#endif
	
	#ifdef SPOTLIGHT
		color.a = 0.0;
		color += PBRStandardSpotLight(albedoColor, mg.r, mg.g, normal, viewDir, u_SpotLight, v_PositionWorld, gi);
	#endif
	
	#ifdef EMISSION
		vec4 emissionColor = u_EmissionColor;
		#ifdef EMISSIONTEXTURE
			emissionColor *=  texture2D(u_EmissionTexture, uv0);
		#endif
		color.rgb += emissionColor.rgb;
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
		gl_FragColor = vec4(color.rgb * shadowValue, color.a);
	#else
		gl_FragColor = color;
	#endif
	
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