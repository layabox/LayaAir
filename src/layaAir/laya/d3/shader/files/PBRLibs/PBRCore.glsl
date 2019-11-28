struct FragmentCommonData{
	vec3 diffColor;
	vec3 specColor;
	float oneMinusReflectivity;
	float smoothness;
	//vec3 eyeVec;TODO:maybe can remove
	//float alpha;
	//vec3 reflUVW;
};

#ifndef SETUP_BRDF_INPUT
    #define SETUP_BRDF_INPUT metallicSetup//default is metallicSetup,also can be other. 
#endif

const mediump vec4 dielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);

mediump vec3 diffuseAndSpecularFromMetallic(mediump vec3 albedo,mediump float metallic, out mediump vec3 specColor, out mediump float oneMinusReflectivity)
{
	specColor = mix(dielectricSpecularColor.rgb, albedo, metallic);
	oneMinusReflectivity= dielectricSpecularColor.a*(1.0-metallic);//diffuse proportion
	return albedo * oneMinusReflectivity;
}

FragmentCommonData metallicSetup(vec2 uv)
{
	mediump vec2 metallicGloss = metallicGloss(uv);
	mediump float metallic = metallicGloss.x;
	mediump float smoothness = metallicGloss.y; // this is 1 minus the square root of real roughness m.
	mediump float oneMinusReflectivity;//out
	mediump vec3 specColor;//out
	mediump vec3 diffColor = diffuseAndSpecularFromMetallic(albedo(uv), metallic,specColor,oneMinusReflectivity);

	FragmentCommonData o;
	o.diffColor = diffColor;
	o.specColor = specColor;
	o.oneMinusReflectivity = oneMinusReflectivity;
	o.smoothness = smoothness;
	return o;
}

LayaGI fragmentGI(float smoothness,vec3 eyeVec,mediump float occlusion,mediump vec2 lightmapUV,vec3 worldnormal)
{
	LayaGIInput giInput;
	#ifdef LIGHTMAP
		giInput.lightmapUV=lightmapUV;
	#endif

	vec3 worldViewDir = -eyeVec;
	mediump vec4 uvwRoughness = glossyEnvironmentSetup(smoothness, worldViewDir,worldnormal);
	return layaGlobalIllumination(giInput,occlusion, worldnormal, uvwRoughness);
}

vec3 perPixelWorldNormal(vec2 uv,mediump vec3 normal,mediump vec3 binormal,mediump vec3 tangent)
{
	#ifdef NORMALMAP
		// #if UNITY_TANGENT_ORTHONORMALIZE TODO:
		// 	normal = LayaNormalizePerPixelNormal(normal);

		// 	// ortho-normalize Tangent
		// 	tangent = normalize(tangent - normal * dot(tangent, normal));

		// 	// recalculate Binormal重新计算二法线
		// 	half3 newB = cross(normal, tangent);
		// 	//sign这个函数大于0的时候是1，等于0的时候是0，小于0的是-1
		// 	//？？？这里二法线能等于0，0，0吗？
		// 	binormal = newB * sign(dot(newB, binormal));
		// #endif
		mediump vec3 normalTangent =NormalInTangentSpace(uv);
		vec3 normalWorld = normalize(normalSampleToWorldSpace(normalTangent, normal, tangent,binormal));
	#else
		vec3 normalWorld = normalize(normal);
	#endif
		return normalWorld;
}

void fragmentForward()
{
	vec2 uv;//TODO:
	#if defined(ALBEDOTEXTURE)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		uv = v_Texcoord0;
	#endif
	//FSSetup
	//TODO:Parallax to correct uv

	mediump float alpha = alpha(uv);
	#ifdef ALPHATEST
		if(alpha<u_AlphaTestValue)
			discard;
	#endif

	FragmentCommonData o = SETUP_BRDF_INPUT(uv);
	
	vec3 binormal;
	vec3 tangent;
	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		tangent = v_Tangent;
		binormal = v_Binormal;
	#endif

	vec3 normal = v_Normal;
	vec3 normalWorld = perPixelWorldNormal(uv,normal,binormal,tangent);
	vec3 eyeVec = normalize(v_EyeVec);
	vec3 posworld = v_PositionWorld;
	//TODO:Alpha预乘


	mediump float occlusion = occlusion(uv);
	mediump vec2 lightMapUV;
	#ifdef LIGHTMAP
		lightMapUV=v_LightMapUV;
	#endif
	float perceptualRoughness = smoothnessToPerceptualRoughness(o.smoothness);
	float roughness = perceptualRoughnessToRoughness(perceptualRoughness);
	float nv = abs(dot(normalWorld, eyeVec));
	LayaGI gi =fragmentGI(o.smoothness,eyeVec,occlusion,lightMapUV,normalWorld);
	vec4 color = LAYA_BRDF_GI(o.diffColor,o.specColor,o.oneMinusReflectivity,o.smoothness,perceptualRoughness,roughness,nv,normalWorld,eyeVec,gi);
	
	//TODO:阴影
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
			LayaLight light = layaDirectionLightToLight(u_DirectionLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
		#endif
	
		#ifdef POINTLIGHT
			LayaLight light = layaPointLightToLight(posworld,normalWorld,u_PointLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
		#endif
		
		#ifdef SPOTLIGHT
		    LayaLight light = layaSpotLightToLight(posworld,normalWorld,u_SpotLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
		#endif
	#else
	 	#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				LayaLight light = layaDirectionLightToLight(directionLight,shadowValue);
			 	color+=LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
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
					LayaLight light = layaPointLightToLight(posworld,normalWorld,pointLight,shadowValue);
					color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaLight light = layaSpotLightToLight(posworld,normalWorld,u_SpotLight,shadowValue);
					color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,light);
				}
			#endif
		#endif
	 #endif

	color.rgb += emission(uv);
	mediump vec4 finalColor = vec4(color.rgb,alpha);
	#ifdef FOG
		float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
		finalColor.rgb=mix(finalColor.rgb,u_FogColor,lerpFact);
	#endif
	gl_FragColor=finalColor;
}


