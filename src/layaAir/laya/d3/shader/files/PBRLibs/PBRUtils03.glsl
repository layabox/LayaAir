

vec4 DielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);
//FS
vec3 LayaEmission(vec2 uv)
{
	#ifdef EMISSIONTEXTURE
		return texture2D(u_EmissionTexture, uv).rgb * u_EmissionColor.rgb;
	#else
		return u_EmissionColor.rgb;
	#endif
}

mediump float alpha(vec2 uv)
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

float LayaLerpOneTo(float b, float t)
{
	float oneMinusT = 1.0 - t;
	return oneMinusT + b * t;
}

float LayaOcclusion(vec2 uv)
{
	#ifdef OCCLUSIONTEXTURE
		float occ = texture2D(u_OcclusionTexture, uv).g;
		return LayaLerpOneTo(occ, u_occlusionStrength);
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
		vec3 normalWorld = normalize(NormalSampleToWorldSpace(normalTangent, normal, tangent,binormal));
	#else
		vec3 normalWorld = normalize(normal);
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
	specColor = mix(DielectricSpecularColor.rgb, albedo, metallic);
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



vec3 LinearToGammaSpace (vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0.0, 0.0, 0.0));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB, vec3(0.416666667)) - 0.055, 0.0);   
}

//GI
#ifdef INDIRECTLIGHT


vec3 LayaSHEvalLinearL0L1(vec4 normal)
{
	vec3 x;
	//九个参数转换为矩阵
	// Linear (L1) + constant (L0) polynomial terms
	x.r = dot(u_SHAr, normal);
	x.g = dot(u_SHAg, normal);
	x.b = dot(u_SHAb, normal);
	return x;
}


vec3 LayaSHEvalLinearL2(vec4 normal)
{
	vec3 x1;
	vec3 x2;
	// 4 of the quadratic (L2) polynomials
	vec4 vB = normal.xyzz * normal.yzzx;
	x1.r = dot(u_SHBr, vB);
	x1.g = dot(u_SHBg, vB);
	x1.b = dot(u_SHBb, vB);

	// Final (5th) quadratic (L2) polynomial
	float vC = normal.x*normal.x - normal.y*normal.y;
	x2 = u_SHC.rgb * vC;

	return x1 + x2;
}

half3 LayaShadeSH9(half4 normal)
{
	// Linear + constant polynomial terms
	//线性+常量多项式项
	half3 res = LayaSHEvalLinearL0L1(normal);

	// Quadratic polynomials
	res += LayaSHEvalLinearL2(normal);

	//需要转换到Gamma空间
	res = LinearToGammaSpace(res);
	return res;
}
#endif
//LayaFragmentGI
//感知光滑转换到感知粗糙
//LayaGI_Base

vec3 LayaShadeSHPerPixel(vec3 normal, vec3 ambient)
{
	
	#ifdef INDIRECTLIGHT
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


//,,float occlusion,vec3 worldnormal
LayaGI LayaFragmentGI(LayaFragmentCommonData s,vec3 eyeVec,float occlusion,vec3 worldnormal)
{
	LayaGI layagi;
	vec3 worldViewDir = -eyeVec;
	vec4 reflRoun = LayaGlossyEnvironmentSetup(s.smoothness, worldViewDir,worldnormal);
	return LayaGlobalIllumination(occlusion, worldnormal, reflRoun);
	//return layagi;
}

