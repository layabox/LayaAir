struct FragmentCommonData{
	vec3 diffColor;
	vec3 specColor;
	float oneMinusReflectivity;
	float smoothness;
	//vec3 eyeVec;TODO:maybe can remove
	//float alpha;
	//vec3 reflUVW;
};

struct LayaGI{
	vec3 diffuse;
	vec3 specular;
};

struct LayaLight{
	vec3 color;
	vec3 dir;
};

const mediump vec4 dielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);

#ifndef SETUP_BRDF_INPUT
    #define SETUP_BRDF_INPUT metallicSetup//default is metallicSetup,also can be other. 
#endif

float lerpOneTo(float b, float t)
{
	float oneMinusT = 1.0 - t;
	return oneMinusT + b * t;
}

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

vec3 perPixelWorldNormal(vec2 uv,mediump vec3 normal,mediump vec3 binormal,mediump vec3 tangent)
{
	#if defined(NORMALMAP)||defined(PARALLAXMAP)//TODO:Need PARALLAXMAP deine?
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

vec3 LayaLinearToGammaSpace (vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0.0, 0.0, 0.0));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB, vec3(0.416666667)) - 0.055, 0.0);   
}

float smoothnessToPerceptualRoughness(float smoothness)
{
	return (1.0 - smoothness);
}


