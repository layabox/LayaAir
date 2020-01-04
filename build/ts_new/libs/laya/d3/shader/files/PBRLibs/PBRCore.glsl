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

mediump float specularStrength(mediump vec3 specular)
{
    return max (max (specular.r, specular.g), specular.b);
}

// Diffuse/Spec Energy conservation
mediump vec3 energyConservationBetweenDiffuseAndSpecular (mediump vec3 albedo, mediump vec3 specColor, out mediump float oneMinusReflectivity)
{
	oneMinusReflectivity = 1.0 - specularStrength(specColor);
    return albedo * (vec3(1.0) - specColor);
}

#ifdef TRANSPARENTBLEND
	mediump vec3 preMultiplyAlpha (mediump vec3 diffColor, mediump float alpha, mediump float oneMinusReflectivity,out mediump float modifiedAlpha)
	{
		// Transparency 'removes' from Diffuse component
		diffColor *= alpha;
		// Reflectivity 'removes' from the rest of components, including Transparency
		// modifiedAlpha = 1.0-(1.0-alpha)*(1.0-reflectivity) = 1.0-(oneMinusReflectivity - alpha*oneMinusReflectivity) = 1.0-oneMinusReflectivity + alpha*oneMinusReflectivity
		modifiedAlpha = 1.0 - oneMinusReflectivity + alpha*oneMinusReflectivity;
		return diffColor;
	}
#endif

FragmentCommonData metallicSetup(vec2 uv)
{
	mediump vec2 metallicGloss = metallicGloss(uv);
	mediump float metallic = metallicGloss.x;
	mediump float smoothness = metallicGloss.y; // this is 1 minus the square root of real roughness m.
	mediump float oneMinusReflectivity;
	mediump vec3 specColor;
	mediump vec3 diffColor = diffuseAndSpecularFromMetallic(albedo(uv), metallic,/*out*/specColor,/*out*/oneMinusReflectivity);

	FragmentCommonData o;
	o.diffColor = diffColor;
	o.specColor = specColor;
	o.oneMinusReflectivity = oneMinusReflectivity;
	o.smoothness = smoothness;
	return o;
}

FragmentCommonData specularSetup(vec2 uv)
{
    mediump vec4 specGloss = specularGloss(uv);
    mediump vec3 specColor = specGloss.rgb;
    mediump float smoothness = specGloss.a;

    mediump float oneMinusReflectivity;
    mediump vec3 diffColor = energyConservationBetweenDiffuseAndSpecular (albedo(uv), specColor, /*out*/ oneMinusReflectivity);

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
	mediump vec4 uvwRoughness;
	uvwRoughness.rgb = reflect(worldViewDir, worldnormal);//reflectUVW
	uvwRoughness.a= smoothnessToPerceptualRoughness(smoothness);//perceptualRoughness

	return layaGlobalIllumination(giInput,occlusion, worldnormal, uvwRoughness);
}


vec3 perPixelWorldNormal(vec2 uv,vec3 normal,vec3 binormal,vec3 tangent)
{
	#ifdef NORMALTEXTURE
		mediump vec3 normalTangent=normalInTangentSpace(uv);
		vec3 normalWorld = normalize(tangent * normalTangent.x + binormal * normalTangent.y + normal * normalTangent.z);
	#else
		vec3 normalWorld = normalize(normal);
	#endif
		return normalWorld;
}

void fragmentForward()
{
	vec2 uv;
	#if defined(ALBEDOTEXTURE)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
		#ifdef PARALLAXTEXTURE
			uv = parallax(v_Texcoord0,normalize(v_ViewDirForParallax));
		#else
			uv = v_Texcoord0;
		#endif
	#endif

	mediump float alpha = alpha(uv);
	#ifdef ALPHATEST
		if(alpha<u_AlphaTestValue)
			discard;
	#endif

	FragmentCommonData o = SETUP_BRDF_INPUT(uv);
	
	vec3 binormal;
	vec3 tangent;
	#ifdef NORMALTEXTURE
		tangent = v_Tangent;
		binormal = v_Binormal;
	#endif

	vec3 normal = v_Normal;
	vec3 normalWorld = perPixelWorldNormal(uv,normal,binormal,tangent);//In FS if the normal use mediump before normalize will cause precision prolem in mobile device.
	vec3 eyeVec = normalize(v_EyeVec);
	vec3 posworld = v_PositionWorld;

	#ifdef TRANSPARENTBLEND
		o.diffColor=preMultiplyAlpha(o.diffColor,alpha,o.oneMinusReflectivity,/*out*/alpha);// shader relies on pre-multiply alpha-blend (srcBlend = One, dstBlend = OneMinusSrcAlpha)
	#endif

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
	
	//Shadow
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
			LayaLight dirLight = layaDirectionLightToLight(u_DirectionLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,dirLight);
		#endif
	
		#ifdef POINTLIGHT
			LayaLight poiLight = layaPointLightToLight(posworld,normalWorld,u_PointLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,poiLight);
		#endif
		
		#ifdef SPOTLIGHT
		    LayaLight spoLight = layaSpotLightToLight(posworld,normalWorld,u_SpotLight,shadowValue);
			color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,spoLight);
		#endif
	#else
	 	#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				LayaLight dirLight = layaDirectionLightToLight(directionLight,shadowValue);
			 	color+=LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,dirLight);
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
					LayaLight poiLight = layaPointLightToLight(posworld,normalWorld,pointLight,shadowValue);
					color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,poiLight);
				}
			#endif
			#ifdef SPOTLIGHT
				for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
				{
					if(i >= clusterInfo.y)//SpotLightCount
						break;
					SpotLight spotLight = getSpotLight(u_LightBuffer,u_LightClusterBuffer,clusterInfo,i);
					LayaLight spoLight = layaSpotLightToLight(posworld,normalWorld,spotLight,shadowValue);
					color+= LAYA_BRDF_LIGHT(o.diffColor,o.specColor,o.oneMinusReflectivity,perceptualRoughness,roughness,nv,normalWorld,eyeVec,spoLight);
				}
			#endif
		#endif
	 #endif

	#ifdef EMISSION
		color.rgb += emission(uv);
	#endif

	#ifdef FOG
		float lerpFact=clamp((1.0/gl_FragCoord.w-u_FogStart)/u_FogRange,0.0,1.0);
		color.rgb=mix(color.rgb,u_FogColor,lerpFact);
	#endif
	
	gl_FragColor=vec4(color.rgb,alpha);
}


