#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif

uniform vec4 u_AlbedoColor;

#ifdef NORMALTEXTURE
	uniform sampler2D u_NormalTexture;
	uniform float u_NormalScale;
#endif

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

#ifdef METALLICGLOSSTEXTURE
	uniform sampler2D u_MetallicGlossTexture;
#endif
uniform float u_Metallic;

#ifdef SPECULARGLOSSTEXTURE
	uniform sampler2D u_SpecGlossTexture;
#endif
uniform vec3 u_SpecularColor;

uniform float u_Smoothness;
uniform float u_SmoothnessScale;

#ifdef PARALLAXTEXTURE
	uniform sampler2D u_ParallaxTexture;
	uniform float u_ParallaxScale;
	varying vec3 v_ViewDirForParallax;
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

#if defined(ALBEDOTEXTURE)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
	varying vec2 v_Texcoord0;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform sampler2D u_LightMap;
	#ifdef LIGHTMAP_DIRECTIONAL
		uniform sampler2D u_LightMapDirection;
	#endif
#endif

varying vec3 v_Normal; 

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

varying vec3 v_EyeVec;

#ifdef NORMALTEXTURE
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	uniform vec3 u_FogColor;
#endif


//后面考虑宏TODO
varying vec3 v_PositionWorld;

#if defined(CALCULATE_SHADOWS)&&!defined(SHADOW_CASCADE)
	varying vec4 v_ShadowCoord;
#endif

#if defined(CALCULATE_SPOTSHADOWS)//shader中自定义的宏不可用ifdef 必须改成if defined
	varying vec4 v_SpotShadowCoord;
#endif

mediump float lerpOneTo(mediump float b, mediump float t)
{
    mediump float oneMinusT = 1.0 - t;
    return oneMinusT + b * t;
}

#ifdef EMISSION 
	vec3 emission(vec2 uv)
	{
		#ifdef EMISSIONTEXTURE
			return texture2D(u_EmissionTexture, uv).rgb * u_EmissionColor.rgb;
		#else
			return u_EmissionColor.rgb;
		#endif
	}
#endif

mediump float getAlpha(vec2 uv)
{
	#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
		return u_AlbedoColor.a;
	#else
		#ifdef ALBEDOTEXTURE
			return texture2D(u_AlbedoTexture, uv).a * u_AlbedoColor.a;
		#else
			return u_AlbedoColor.a;
		#endif
	#endif
}

mediump float getOcclusion(vec2 uv)
{
	#ifdef OCCLUSIONTEXTURE
		mediump float occ = texture2D(u_OcclusionTexture, uv).g;
		return lerpOneTo(occ, u_occlusionStrength);
	#else
		return 1.0;
	#endif
}

mediump vec3 albedo(vec2 uv)
{
	#ifdef ALBEDOTEXTURE
		return u_AlbedoColor.rgb * texture2D(u_AlbedoTexture, uv).rgb;
	#else
		return u_AlbedoColor.rgb;
	#endif
	//TODO:Detail Texture
}

mediump vec2 getMetallicGloss(vec2 uv)
{
	mediump vec2 ms;//x is metallic,y is smoothness
	#ifdef METALLICGLOSSTEXTURE
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			ms.x = texture2D(u_MetallicGlossTexture, uv).r;
			#ifdef ALBEDOTEXTURE
				ms.y = texture2D(u_AlbedoTexture, uv).a*u_SmoothnessScale;
			#else
				ms.y = u_SmoothnessScale;
			#endif
		#else
			ms = texture2D(u_MetallicGlossTexture, uv).ra;
			ms.y *= u_SmoothnessScale;
		#endif
	#else
		ms.x = u_Metallic;
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			#ifdef ALBEDOTEXTURE
				ms.y = texture2D(u_AlbedoTexture, uv).a * u_SmoothnessScale;
			#else
				ms.y = u_SmoothnessScale;
			#endif
		#else
			ms.y = u_Smoothness;
		#endif
	#endif
	return ms;
}

mediump vec4 specularGloss(vec2 uv)
{
	mediump vec4 sg;
	#ifdef SPECULARGLOSSTEXTURE
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			sg.rgb = texture2D(u_SpecGlossTexture, uv).rgb;
			#ifdef ALBEDOTEXTURE
				sg.a = texture2D(u_AlbedoTexture, uv).a*u_SmoothnessScale;
			#else
				sg.a = u_SmoothnessScale;
			#endif
		#else
			sg = texture2D(u_SpecGlossTexture, uv);
			sg.a *= u_SmoothnessScale;
		#endif
	#else
		sg.rgb = u_SpecularColor.rgb;
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			#ifdef ALBEDOTEXTURE
				sg.a = texture2D(u_AlbedoTexture, uv).a * u_SmoothnessScale;
			#else
				sg.a = u_SmoothnessScale;
			#endif
		#else
			sg.a = u_Smoothness;
		#endif
	#endif
		return sg;
}


#ifdef NORMALTEXTURE
	mediump vec3 unpackScaleNormal(mediump vec3 packednormal, mediump float bumpScale)
	{
		mediump vec3 normal = packednormal.xyz * 2.0 - 1.0;
		normal.y=-normal.y;//NOTE:because unity to LayaAir coordSystem.
		normal.xy *= bumpScale;
		return normal;
	}
	
	mediump vec3 normalInTangentSpace(vec2 texcoords)
	{
		mediump vec3 normalTangent = unpackScaleNormal(texture2D(u_NormalTexture, texcoords).rgb,u_NormalScale);
		return normalTangent;
	}
#endif

#ifdef PARALLAXTEXTURE
	mediump vec2 parallaxOffset1Step(mediump float h, mediump float height, mediump vec3 viewDir)
	{
		h = h * height - height / 2.0;
		viewDir.z += 0.42;
		return h * (viewDir.xy / viewDir.z);
	}

	vec2 parallax(vec2 texcoords, mediump vec3 viewDir)
	{
		mediump float h = texture2D(u_ParallaxTexture, texcoords.xy).g;
		vec2 offset = parallaxOffset1Step(h, u_ParallaxScale, viewDir);
		return texcoords+offset;
	}
#endif








