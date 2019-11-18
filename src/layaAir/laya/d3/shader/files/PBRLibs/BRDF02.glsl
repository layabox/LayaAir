







float LayaPow5(float x)
{
	return x * x * x*x * x;
}
float PerceptualRoughnessToRoughness(float perceptualRoughness)
{
    return perceptualRoughness * perceptualRoughness;
}

// Note: Disney diffuse must be multiply by diffuseAlbedo / PI. This is done outside of this function.
float LayaDisneyDiffuse(float NdotV, float NdotL, float LdotH, float perceptualRoughness)
{
	//再边缘和光线和眼睛的地方更亮一点点https://www.cnblogs.com/herenzhiming/articles/5790389.html  lambort
	float fd90 = 0.5 + 2 * LdotH * LdotH * perceptualRoughness;
	// Two schlick fresnel term
	float lightScatter = (1 + (fd90 - 1) * LayaPow5(1 - NdotL));
	float viewScatter = (1 + (fd90 - 1) * LayaPow5(1 - NdotV));

	return lightScatter * viewScatter;
}
//感知粗糙度和感知光滑
float SmoothnessToPerceptualRoughness(float smoothness)
{
    return (1 - smoothness);
}

// Ref: http://jcgt.org/published/0003/02/03/paper.pdf
float LayaSmithJointGGXVisibilityTerm(float NdotL, float NdotV, float roughness)
{
	// Approximation of the above formulation (simplify the sqrt, not mathematically correct but close enough)
	//上述公式的近似（简化sqrt，不是数学上正确，而是足够接近）
	//这里做了近似
	float a = roughness;
	float lambdaV = NdotL * (NdotV * (1 - a) + a);
	float lambdaL = NdotV * (NdotL * (1 - a) + a);
	return 0.5f / (lambdaV + lambdaL + 1e-5);
}

float LayaGGXTerm(float NdotH, float roughness)
{
	float a2 = roughness * roughness;
	float d = (NdotH * a2 - NdotH) * NdotH + 1.0; // 2 mad
	//#define UNITY_INV_PI        0.31830988618f
	return 0.31830988618 * a2 / (d * d + 1e-7); // This function is not intended to be running on Mobile,//不会用于移动设备
	// therefore epsilon is smaller than what can be represented by half//返回值小用half来返回
}

LayaLight LayaAirBRDFDirectionLight(in vec3 normal,in vec3 viewDir, in DirectionLight light)
{
	LayaLight relight;
	relight.color = light.color;
	relight.dir = light.direction;
	return relight;
} 
LayaLight LayaAirBRDFPointLight(in vec3 pos,in vec3 normal,in vec3 viewDir, in PointLight light)
{
	LayaLight relight;
	vec3 lightVec =  pos-light.position;
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range);
	relight.color = PointLight.color*attenuate;
	relight.dir = normalize(lightVec);
	return relight;
}
LayaLight LayaAirBRDFSpotLight(in vec3 pos,in vec3 normal,in vec3 viewDir, in SpotLight light)
{
	LayaLight relight;
	vec3 lightVec =  pos-light.position;
	vec3 normalLightVec=lightVec/length(lightVec);
	vec2 cosAngles=cos(vec2(light.spot,light.spot*0.5)*0.5);//ConeAttenuation
	float dl=dot(normalize(light.direction),normalLightVec);
	dl*=smoothstep(cosAngles[0],cosAngles[1],dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.range)*dl;
	relight.dir = lightVec;
	relight.color = light.color*attenuate;
	return relight;
}

half4 BRDF1_Laya_PBS_Light(vec3 diffColor, vec3 specColor, float oneMinusReflectivity, float smoothness,vec3 normal, vec3 viewDir,LayaLight light)
{
	//感知粗糙度
	float perceptualRoughness = SmoothnessToPerceptualRoughness(smoothness);
	//H
	//vec3 halfDir = Laya_SafeNormalize(light.dir + viewDir);
	vec3 halfDir = normalize((light.dir+viewDir));
	//法线和视线
	float nv = abs(dot(normal, viewDir));    // This abs allow to limit artifact

	//法线和光线
	float nl = clamp(dot(normal, light.dir),0.0,1.0);
	//法线和半线
	float nh = clamp(dot(normal, halfDir),0.0,1.0);
	//光线和视线
	float lv = clamp(dot(light.dir, viewDir),0.0,1.0);
	//光线和半线
	float lh = clamp(dot(light.dir, halfDir),0.0,1.0);

	float diffuseTerm = LayaDisneyDiffuse(nv, nl, lh, perceptualRoughness) * nl;
	float roughness = PerceptualRoughnessToRoughness(perceptualRoughness);
	roughness = max(roughness, 0.002);
	//微面元遮挡函数
	float V = LayaSmithJointGGXVisibilityTerm(nl, nv, roughness);
	//微法线分布函数
	float D = LayaGGXTerm(nh, roughness);


	float specularTerm = V * D * UNITY_PI; // Torrance-Sparrow model, Fresnel is applied later //fresnel会在后面匹配

	#   ifdef UNITY_COLORSPACE_GAMMA
			specularTerm = sqrt(max(1e-4h, specularTerm));
	#   endif

	// specularTerm * nl can be NaN on Metal in some cases, use max() to make sure it's a sane value
	specularTerm = max(0, specularTerm * nl);

	// surfaceReduction = Int D(NdotH) * NdotH * Id(NdotL>0) dH = 1/(roughness^2+1)
	half surfaceReduction;
#   ifdef UNITY_COLORSPACE_GAMMA
		surfaceReduction = 1.0 - 0.28*roughness*perceptualRoughness;      // 1-0.28*x^3 as approximation for (1/(x^4+1))^(1/2.2) on the domain [0;1]
#   else
		surfaceReduction = 1.0 / (roughness*roughness + 1.0);           // fade \in [0.5;1]
#   endif

	// To provide true Lambert lighting, we need to be able to kill specular completely.
	//输入参数只要有其中一个不为 0，则返回 true。||运算
	specularTerm *= any(specColor) ? 1.0 : 0.0;

	half grazingTerm = saturate(smoothness + (1 - oneMinusReflectivity));
	half3 color = diffColor * (gi.diffuse + light.color * diffuseTerm)//这里是漫反射部分  分为两部分  一部分GI 一部分光照  GI在于diffColor*gi.diffuse  光线在于light.color*diffuseTerm
		+ specularTerm * light.color * LayaFresnelTerm(specColor, lh)//这里灯光的高光
		+ surfaceReduction * gi.specular * LayaFresnelLerp(specColor, grazingTerm, nv);//这里是全局光照的间接光
	return half4(color, 1);
}