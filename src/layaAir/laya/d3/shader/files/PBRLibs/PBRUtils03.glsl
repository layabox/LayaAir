

vec4 DielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);
//FS
vec3 LayaNormalizePerPixelNormal(vec3 n)
{
	#ifdef LOWPLAT
		return n;
	#else
		return normalize(n); 
	#endif
}
//FSSet
float LayaAlpha(vec2 uv)
{
	//这个宏是自己控制的
	#if defined(SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA)
		return u_AlbedoColor.a;
	#else
		#if defined(ALBEDOTEXTURE)
			return texture2D(u_AlbedoTexture, uv).a * u_AlbedoColor.a;
		#else
			return u_AlbedoColor.a;
		#endif
	#endif
}

float LayaLerpOneTo(float b, float t)
{
	float oneMinusT = 1.0 - t;
	return oneMinusT + b * t;
}

float LayaOcclusion(vec2 uv)
{
	#ifdef OCCLUSIONTEXTURE
		#ifdef LOWPLAT
			return texture2D(u_OcclusionTexture, uv).g;
		#else
			float occ = texture2D(u_OcclusionTexture, uv).g;
			return LayaLerpOneTo(occ, u_occlusionStrength);
		#endif
	#else
		return 1.0;
	#endif
}

vec3 LayaAlbedo(vec2 uv)
{
	#ifdef ALBEDOTEXTURE
		return u_AlbedoColor.rgb * texture2D(u_AlbedoTexture, uv).rgb;
	#else
		return u_AlbedoColor.rgb;
	#endif
}

vec3 LayaPerPixelWorldNormal(vec2 uv,vec3 normal,vec3 binormal,vec3 tangent)
{

	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		// #if UNITY_TANGENT_ORTHONORMALIZE
		// 	normal = LayaNormalizePerPixelNormal(normal);

		// 	// ortho-normalize Tangent
		// 	tangent = normalize(tangent - normal * dot(tangent, normal));

		// 	// recalculate Binormal重新计算二法线
		// 	half3 newB = cross(normal, tangent);
		// 	//sign这个函数大于0的时候是1，等于0的时候是0，小于0的是-1
		// 	//？？？这里二法线能等于0，0，0吗？
		// 	binormal = newB * sign(dot(newB, binormal));
		// #endif
		vec3 normalTangent =texture2D(u_NormalTexture, uv).rgb ;
		vec3 normalWorld = LayaNormalizePerPixelNormal(NormalSampleToWorldSpace(normalTangent, normal, tangent,binormal));
	#else
		vec3 normalWorld = LayaNormalizePerPixelNormal(normal);
	#endif
		return normalWorld;
}



vec2 LayaMetallicGloss(vec2 uv)
{
	vec2 mg;
	//m是金属度,g是光滑度
	#ifdef METALLICGLOSSTEXTURE
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			mg.r = texture2D(u_MetallicGlossTexture, uv).r;
			mg.g = texture2D(u_AlbedoTexture, uv).a;
		#else
			mg = texture2D(u_MetallicGlossTexture, uv).ra;
		#endif
		mg.g *= u_smoothnessScale;
	#else
		mg.r = u_metallic;
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			mg.g = texture2D(u_AlbedoTexture, uv).a * u_smoothnessScale;
		#else
			mg.g = u_smoothness;
		#endif
	#endif
		return mg;
}
//能量守恒
vec3 LayaDiffuseAndSpecularFromMetallic(vec3 albedo, float metallic, out vec3 specColor, out float oneMinusReflectivity)
{
	//unity_ColorSpaceDielectricSpec.rgb是内置变量
	// (0.22 0.22 0.22 0.779)
	specColor = DielectricSpecularColor.rgb*metallic+ albedo*(1.0- metallic);
	//kd  漫反射系数
	oneMinusReflectivity= DielectricSpecularColor.a-metallic*DielectricSpecularColor.a;
	return albedo * oneMinusReflectivity;
}




//Metal flow
LayaFragmentCommonData LayaMetallicSetup(vec2 uv)
{

	LayaFragmentCommonData o;
	vec2 metallicGloss = LayaMetallicGloss(uv);
	float metallic = metallicGloss.x;
	//这是1减去实际粗糙度m的平方根。
	float smoothness = metallicGloss.y; // this is 1 minus the square root of real roughness m.
	float oneMinusReflectivity;
	vec3 specColor;
	//算出了漫反射颜色  高光反射率，KD
	vec3 diffColor = LayaDiffuseAndSpecularFromMetallic(LayaAlbedo(uv), metallic,specColor,oneMinusReflectivity);

	o.diffColor = diffColor;
	o.specColor = specColor;
	o.oneMinusReflectivity = oneMinusReflectivity;
	o.smoothness = smoothness;
	return o;
}

//Specular flow



//GI

//LayaFragmentGI
//感知光滑转换到感知粗糙
//LayaGI_Base

vec3 LayaShadeSHPerPixel(vec3 normal, vec3 ambient)
{
	//vec3 ambient_contrib = vec3(0.0,0.0,0.0);
	#if defined(LOWPLAT)&&defined(INDIRECTLIGHT)
		ambient=v_ambientDiffuse;
	#elif defined(INDIRECTLIGHT)
		ambient = LayaSHEvalLinearL0L1(vec4(normal, 1.0));
		//得到完整球谐函数
		ambient += LayaSHEvalLinearL2(vec4(normal, 1.0));

		ambient += max(vec3(0, 0, 0), ambient);
	#endif
		ambient = LinearToGammaSpace(ambient);
	return ambient;
}


vec3 LayaGI_Base(float occlusion, vec3 normalWorld)
{
	vec3 indirectDiffuse;
	
	indirectDiffuse=u_AmbientColor;
	
	#ifdef LIGHTMAP	
		indirectDiffuse += DecodeLightmap(texture2D(u_LightMap, v_LightMapUV));
	#else
		indirectDiffuse = LayaShadeSHPerPixel(normalWorld, indirectDiffuse);
	#endif

	//间接光照的diffuse
	indirectDiffuse*=occlusion;
	return indirectDiffuse;
}

//  //LayaGI_IndirectSpecular

float LayaSmoothnessToPerceptualRoughness(float smoothness)
{
	return (1.0 - smoothness);
}
vec4 LayaGlossyEnvironmentSetup(float smoothness, vec3 worldViewDir, vec3 Normal)
{
	vec4 reflRoun;
	reflRoun.a= LayaSmoothnessToPerceptualRoughness(smoothness);
	//采样方向
	reflRoun.rgb = reflect(-worldViewDir, Normal);

	return reflRoun;
}

vec3 Laya_GlossyEnvironment(vec4 glossIn)
{
	vec4 rgbm;
	#if defined(REFLECTIONMAP)
		float perceptualRoughness = glossIn.a;
		perceptualRoughness = perceptualRoughness * (1.7 - 0.7*perceptualRoughness);
		//六级
		float mip = perceptualRoughness * 6;
		vec3 r = glossIn.rgb;

		//TODO这里需要使用扩展的命令函数
		rgbm=textureCube(u_ReflectTexture,r);
	#endif
	return DecodeLightmap(rgbm);
}

vec3 LayaGI_IndirectSpecular(float occlusion, vec4 glossIn)
{
	vec3 specular;
	//一般走这
	specular = Laya_GlossyEnvironment(glossIn);
	return specular * occlusion;
}


LayaGI LayaGlobalIllumination(float occlusion, vec3 normalWorld,vec4 glossIn)
{
	//计算了间接光照的diffuse
	LayaGI o_gi;
	o_gi.diffuse= LayaGI_Base(occlusion, normalWorld);
	//计算了间接光照的高光
	o_gi.specular = LayaGI_IndirectSpecular(occlusion, glossIn);

	return o_gi;
}



LayaGI LayaFragmentGI(LayaFragmentCommonData s,vec3 worldPos,vec3 eyeVec,float occlusion,float atten,vec3 worldnormal)
{
	vec3 worldViewDir = -eyeVec;
	vec4 reflRoun = LayaGlossyEnvironmentSetup(s.smoothness, worldViewDir,worldnormal);
	return LayaGlobalIllumination(occlusion, worldnormal, reflRoun);
}

