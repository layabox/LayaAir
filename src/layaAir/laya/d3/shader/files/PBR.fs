#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#include "Lighting.glsl";
#include "BRDF02.glsl";
#include "PBRInput.glsl";


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
	vec2 uv;vec3 normal;vec3 binormal;vec3 tangent;vec3 normalWorld;vec3 eyeVec; vec3 posworld;
	#if defined(DIFFUSEMAP)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		uv = v_Texcoord0;
	#endif
	//FSSetup
	//LayaParallax计算TODO，目前先不考虑

	float alpha = alpha(uv);
	#ifdef ALPHATEST
		if(alpha<u_AlphaTestValue)
			discard;
	#endif

	LayaFragmentCommonData o;
	
	 //分流派TODO
	 o = metallicSetup(uv);
	
	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		tangent = v_Tangent;
		binormal = v_Binormal;
	#endif

	normal = v_Normal;
	normalWorld = perPixelWorldNormal(uv,normal,binormal,tangent);

	eyeVec = normalize(v_EyeVec);
	posworld = v_PositionWorld;
	 //unity在这儿还做了Alpha预乘
	 //LayaPreMultiplyAlpha
	//阴影TODO
	float occlusion = occlusion(uv);
	//GI间接光
	vec4 color = vec4(0.0);
	LayaGI gi =fragmentGI(o,eyeVec,occlusion,normalWorld);
	color = BRDF1_Laya_PBS_GI(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,gi);
	//下一步计算直接光
	
	float shadowValue = 1.0;
	 #ifdef RECEIVESHADOW
		#ifdef SHADOWMAP_PSSM3
			shadowValue = getShadowPSSM3(u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif
		#ifdef SHADOWMAP_PSSM2
			shadowValue = getShadowPSSM2(u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,v_PositionWorld,v_posViewZ,0.001);
		#endif 
		#ifdef SHADOWMAP_PSSM1
			shadowValue = getShadowPSSM1(u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.001);
		#endif
	#endif

	 #ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			LayaLight light = LayaAirBRDFDirectionLight(u_DirectionLight,shadowValue);
			 color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
	
		#ifdef POINTLIGHT
			LayaLight light = LayaAirBRDFPointLight(posworld,normalWorld,u_PointLight,shadowValue);
			color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
		
		#ifdef SPOTLIGHT
		    LayaLight light = LayaAirBRDFSpotLight(posworld,normalWorld,u_SpotLight,shadowValue);
			color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
		#endif
	#else
	 	#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				LayaLight light = LayaAirBRDFDirectionLight(directionLight,shadowValue);
			 	color+=BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
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
					LayaLight light = LayaAirBRDFPointLight(posworld,normalWorld,pointLight,shadowValue);
					color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaLight light = LayaAirBRDFSpotLight(posworld,normalWorld,u_SpotLight,shadowValue);
					color+= BRDF1_Laya_PBS_Light(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,normalWorld,eyeVec,light);
				}
			#endif
		#endif
	 #endif

	color.rgb += emission(uv);
	gl_FragColor = vec4(color.rgb,alpha);
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