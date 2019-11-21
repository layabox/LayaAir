struct FragmentCommonData{
	vec3 diffColor;
	vec3 specColor;
	float oneMinusReflectivity;
	float smoothness;
	vec3 eyeVec;
	float alpha;
	vec3 reflUVW;
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

//能量守恒
vec3 diffuseAndSpecularFromMetallic(mediump vec3 albedo,mediump float metallic, out mediump vec3 specColor, out mediump float oneMinusReflectivity)
{
	specColor = mix(dielectricSpecularColor.rgb, albedo, metallic);
	//kd  漫反射系数
	oneMinusReflectivity= dielectricSpecularColor.a-metallic*dielectricSpecularColor.a;
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


