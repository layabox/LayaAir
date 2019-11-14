

vec4 DielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);
//FS
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
	specColor = lerp(DielectricSpecularColor.rgb, albedo, metallic);
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