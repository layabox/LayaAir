#define PI 3.14159265359
#define INV_PI 0.31830988618

mediump float pow5(mediump float x)
{
	return x * x * x*x * x;
}

mediump vec3 fresnelLerp(mediump vec3 F0,mediump vec3 F90,mediump float cosA)
{
	float t = pow5(1.0 - cosA);   // ala Schlick interpoliation
	return mix(F0, F90, t);
}

mediump vec3 fresnelTerm(mediump vec3 F0,mediump float cosA)
{
	float t = pow5(1.0 - cosA);   // ala Schlick interpoliation
	return F0 + (vec3(1.0) - F0) * t;
}
float perceptualRoughnessToRoughness(float perceptualRoughness)
{
    return perceptualRoughness * perceptualRoughness;
}

vec3 safeNormalize(vec3 inVec)
{
	float dp3 = max(0.001,dot(inVec,inVec));
	return inVec * (1.0 / sqrt(dp3));
}

// Note: Disney diffuse must be multiply by diffuseAlbedo / PI. This is done outside of this function.
mediump float disneyDiffuse(mediump float NdotV,mediump float NdotL,mediump float LdotH,mediump float perceptualRoughness)
{
	//https://www.cnblogs.com/herenzhiming/articles/5790389.html
	mediump float fd90 = 0.5 + 2.0 * LdotH * LdotH * perceptualRoughness;
	// Two schlick fresnel term
	mediump float lightScatter = (1.0 + (fd90 - 1.0) * pow5(1.0 - NdotL));
	mediump float viewScatter = (1.0 + (fd90 - 1.0) * pow5(1.0 - NdotV));

	return lightScatter * viewScatter;
}

//感知粗糙度和感知光滑
float smoothnessToPerceptualRoughness(float smoothness)
{
    return 1.0 - smoothness;
}

// Ref: http://jcgt.org/published/0003/02/03/paper.pdf
float smithJointGGXVisibilityTerm(float NdotL, float NdotV, float roughness)
{
	// Original formulation:
    // lambda_v    = (-1 + sqrt(a2 * (1 - NdotL2) / NdotL2 + 1)) * 0.5f;
    // lambda_l    = (-1 + sqrt(a2 * (1 - NdotV2) / NdotV2 + 1)) * 0.5f;
    // G           = 1 / (1 + lambda_v + lambda_l);

	// scientific code implement:
	// Reorder code to be more optimal
    // half a          = roughness;
    // half a2         = a * a;

    // half lambdaV    = NdotL * sqrt((-NdotV * a2 + NdotV) * NdotV + a2);
    // half lambdaL    = NdotV * sqrt((-NdotL * a2 + NdotL) * NdotL + a2);

    // Simplify visibility term: (2.0f * NdotL * NdotV) /  ((4.0f * NdotL * NdotV) * (lambda_v + lambda_l + 1e-5f));
    // return 0.5f / (lambdaV + lambdaL + 1e-5f);  
	// This function is not intended to be running on Mobile,therefore epsilon is smaller than can be represented by half

	// Approximation of the above formulation (simplify the sqrt, not mathematically correct but close enough)
	float a = roughness;
	float lambdaV = NdotL * (NdotV * (1.0 - a) + a);
	float lambdaL = NdotV * (NdotL * (1.0 - a) + a);
	return 0.5 / (lambdaV + lambdaL + 1e-5);
}

float ggxTerm(float NdotH, float roughness)
{
	float a2 = roughness * roughness;
	float d = (NdotH * a2 - NdotH) * NdotH + 1.0; // 2 mad
	return INV_PI * a2 / (d * d + 1e-7); // This function is not intended to be running on Mobile,therefore epsilon is smaller than what can be represented by half//返回值小用half来返回
}

// BRDF1-------------------------------------------------------------------------------------

// Note: BRDF entry points use smoothness and oneMinusReflectivity for optimization purposes,
// mostly for DX9 SM2.0 level. Most of the math is being done on these (1-x) values, and that saves a few precious ALU slots.

// Main Physically Based BRDF
// Derived from Disney work and based on Torrance-Sparrow micro-facet model
//
// BRDF = kD / pi + kS * (D * V * F) / 4
// I = BRDF * NdotL
//
// *NDF (depending on LAYA_BRDF_GGX):
//  a) Normalized BlinnPhong
//  b) GGX
// *Smith for Visiblity term
// *Schlick approximation for Fresnel
mediump vec4 layaBRDF1Light(mediump vec3 diffColor, mediump vec3 specColor, mediump float oneMinusReflectivity, float perceptualRoughness,float roughness,mediump float nv,vec3 normal, vec3 viewDir,LayaLight light)
{
	vec3 halfDir = safeNormalize(viewDir-light.dir);

	float nl = clamp(dot(normal, -light.dir),0.0,1.0);
	float nh = clamp(dot(normal, halfDir),0.0,1.0);
	mediump float lv = clamp(dot(light.dir, viewDir),0.0,1.0);
	mediump float lh = clamp(dot(light.dir, -halfDir),0.0,1.0);

	// Diffuse term
	mediump float diffuseTerm = disneyDiffuse(nv, nl, lh, perceptualRoughness) * nl;

	// Specular term
    // HACK: theoretically we should divide diffuseTerm by Pi and not multiply specularTerm!
    // BUT that will make shader look significantly darker than Legacy ones

	// GGX with roughtness to 0 would mean no specular at all, using max(roughness, 0.002) here to match HDrenderloop roughtness remapping.
	roughness = max(roughness, 0.002);
	//TODO:UNITY_BRDF_GGX define
	float V = smithJointGGXVisibilityTerm(nl, nv, roughness);
	//微法线分布函数
	float D = ggxTerm(nh, roughness);

	float specularTerm = V * D * PI; // Torrance-Sparrow model, Fresnel is applied later

	//#ifdef UNITY_COLORSPACE_GAMMA
	specularTerm = sqrt(max(1e-4, specularTerm));
	//#endif

	specularTerm = max(0.0, specularTerm * nl);

	//#def _SPECULARHIGHLIGHTS_OFF
		
	vec3 color = diffColor * light.color * diffuseTerm + specularTerm * light.color * fresnelTerm(specColor, lh);
	return vec4(color, 1.0);
}

vec4 layaBRDF1GI(vec3 diffColor, vec3 specColor, float oneMinusReflectivity,float smoothness ,float perceptualRoughness,float roughness,float nv,vec3 normal, vec3 viewDir,LayaGI gi)
{
	// surfaceReduction = Int D(NdotH) * NdotH * Id(NdotL>0) dH = 1/(roughness^2+1)
	float surfaceReduction;
	surfaceReduction = 1.0 - 0.28*roughness*perceptualRoughness;// 1-0.28*x^3 as approximation for (1/(x^4+1))^(1/2.2) on the domain [0;1]
	float grazingTerm = clamp(smoothness + (1.0 - oneMinusReflectivity),0.0,1.0);
	vec3 color =diffColor * gi.diffuse + surfaceReduction * gi.specular * fresnelLerp(specColor,vec3(grazingTerm), nv);
	return vec4(color,1.0);
}
// BRDF1-------------------------------------------------------------------------------------