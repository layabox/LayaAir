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

const vec4 dielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);

float lerpOneTo(float b, float t)
{
	float oneMinusT = 1.0 - t;
	return oneMinusT + b * t;
}

//能量守恒
vec3 diffuseAndSpecularFromMetallic(vec3 albedo, float metallic, out vec3 specColor, out float oneMinusReflectivity)
{
	//unity_ColorSpaceDielectricSpec.rgb是内置变量
	// (0.22 0.22 0.22 0.779)
	specColor = mix(dielectricSpecularColor.rgb, albedo, metallic);
	//kd  漫反射系数
	oneMinusReflectivity= dielectricSpecularColor.a-metallic*dielectricSpecularColor.a;
	return albedo * oneMinusReflectivity;
}

//Metal flow
FragmentCommonData metallicSetup(vec2 uv)
{

	FragmentCommonData o;
	vec2 metallicGloss = metallicGloss(uv);
	float metallic = metallicGloss.x;
	//这是1减去实际粗糙度m的平方根。
	float smoothness = metallicGloss.y; // this is 1 minus the square root of real roughness m.
	float oneMinusReflectivity;
	vec3 specColor;
	//算出了漫反射颜色  高光反射率，KD
	vec3 diffColor = diffuseAndSpecularFromMetallic(albedo(uv), metallic,specColor,oneMinusReflectivity);

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


