// allow to explicitly override LAYA_BRDF_GI and LAYA_BRDF_LIGHT in custom shader,default is layaBRDFHighGI and layaBRDFHighLight
#if !defined (LAYA_BRDF_GI) 
	#if defined(LAYA_PBR_BRDF_LOW)
		#define LAYA_BRDF_GI layaBRDFLowGI
	#elif defined(LAYA_PBR_BRDF_HIGH)
		#define LAYA_BRDF_GI layaBRDFHighGI
	#endif
#endif
#if !defined (LAYA_BRDF_LIGHT)
	#if defined(LAYA_PBR_BRDF_LOW)
		#define LAYA_BRDF_LIGHT layaBRDFLowLight
	#elif defined(LAYA_PBR_BRDF_HIGH)
		#define LAYA_BRDF_LIGHT layaBRDFHighLight
	#endif
#endif

#define PI 3.14159265359
#define INV_PI 0.31830988618

mediump float pow4(mediump float x)
{
	return x * x * x * x;
}

mediump float pow5(mediump float x)
{
	return x * x * x * x * x;
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

// approximage Schlick with ^4 instead of ^5
mediump vec3 fresnelLerpFast (mediump vec3 F0, mediump vec3 F90,mediump float cosA)
{
    mediump float t = pow4 (1.0 - cosA);
    return mix (F0, F90, t);
}

float smoothnessToPerceptualRoughness(float smoothness)
{
    return 1.0 - smoothness;
}

float perceptualRoughnessToRoughness(float perceptualRoughness)
{
    return perceptualRoughness * perceptualRoughness;
}

vec3 safeNormalize(vec3 inVec)
{
	float dp3 = max(0.001,dot(inVec,inVec));
	return inVec * inversesqrt(dp3);
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
// *NDF GGX:
// *Smith for Visiblity term
// *Schlick approximation for Fresnel
mediump vec4 layaBRDFHighLight(mediump vec3 diffColor, mediump vec3 specColor, mediump float oneMinusReflectivity, float perceptualRoughness,float roughness,mediump float nv,vec3 normal, vec3 viewDir,LayaLight light)
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
	float V = smithJointGGXVisibilityTerm(nl, nv, roughness);
	float D = ggxTerm(nh, roughness);

	float specularTerm = V * D * PI; // Torrance-Sparrow model, Fresnel is applied later

	//#ifdef LAYA_COLORSPACE_GAMMA
	specularTerm = sqrt(max(1e-4, specularTerm));
	//#endif
	specularTerm = max(0.0, specularTerm * nl);
		
	mediump vec3 color = diffColor * light.color * diffuseTerm + specularTerm * light.color * fresnelTerm(specColor, lh);
	return vec4(color, 1.0);
}

vec4 layaBRDFHighGI(mediump vec3 diffColor,mediump vec3 specColor,mediump float oneMinusReflectivity,float smoothness ,float perceptualRoughness,float roughness,mediump float nv,vec3 normal, vec3 viewDir,LayaGI gi)
{
	// surfaceReduction = Int D(NdotH) * NdotH * Id(NdotL>0) dH = 1/(roughness^2+1)
	float surfaceReduction;
	surfaceReduction = 1.0 - 0.28*roughness*perceptualRoughness;// 1-0.28*x^3 as approximation for (1/(x^4+1))^(1/2.2) on the domain [0;1]
	float grazingTerm = clamp(smoothness + (1.0 - oneMinusReflectivity),0.0,1.0);
	mediump vec3 color =diffColor * gi.diffuse + surfaceReduction * gi.specular * fresnelLerp(specColor,vec3(grazingTerm), nv);
	return vec4(color,1.0);
}
// BRDF1-------------------------------------------------------------------------------------


// BRDF2-------------------------------------------------------------------------------------
// Based on Minimalist CookTorrance BRDF
// Implementation is slightly different from original derivation: http://www.thetenthplanet.de/archives/255
//
// *NDF [Modified] GGX:
// *Modified Kelemen and Szirmay-​Kalos for Visibility term
// *Fresnel approximated with 1/LdotH
mediump vec4 layaBRDFLowLight (mediump vec3 diffColor, mediump vec3 specColor,mediump float oneMinusReflectivity,float perceptualRoughness,float roughness,mediump float nv,vec3 normal,vec3 viewDir,LayaLight light)
{
    vec3 halfDir = safeNormalize (viewDir-light.dir);
    mediump float nl = clamp(dot(normal, -light.dir),0.0,1.0);
    float nh = clamp(dot(normal, halfDir),0.0,1.0);
    float lh = clamp(dot(-light.dir, halfDir),0.0,1.0);

    // GGX Distribution multiplied by combined approximation of Visibility and Fresnel
    // See "Optimizing PBR for Mobile" from Siggraph 2015 moving mobile graphics course
    // https://community.arm.com/events/1155
    mediump float a = roughness;
    float a2 = a*a;

    float d = nh * nh * (a2 - 1.0) + 1.00001;
	// #ifdef LAYA_COLORSPACE_GAMMA
		// Tighter approximation for Gamma only rendering mode!
		// DVF = sqrt(DVF);
		// DVF = (a * sqrt(.25)) / (max(sqrt(0.1), lh)*sqrt(roughness + .5) * d);
		float specularTerm = a / (max(0.32, lh) * (1.5 + roughness) * d);
	// #else
	// 	float specularTerm = a2 / (max(0.1f, lh*lh) * (roughness + 0.5f) * (d * d) * 4);
	// #endif

    // on mobiles (where half actually means something) denominator have risk of overflow
    // clamp below was added specifically to "fix" that, but dx compiler (we convert bytecode to metal/gles)
    // sees that specularTerm have only non-negative terms, so it skips max(0,..) in clamp (leaving only min(100,...))

	//#if defined (SHADER_API_MOBILE)
    specularTerm = specularTerm - 1e-4;
	//#endif

	// #else
		// // Legacy
		// half specularPower = PerceptualRoughnessToSpecPower(perceptualRoughness);
		// // Modified with approximate Visibility function that takes roughness into account
		// // Original ((n+1)*N.H^n) / (8*Pi * L.H^3) didn't take into account roughness
		// // and produced extremely bright specular at grazing angles

		// half invV = lh * lh * smoothness + perceptualRoughness * perceptualRoughness; // approx ModifiedKelemenVisibilityTerm(lh, perceptualRoughness);
		// half invF = lh;

		// half specularTerm = ((specularPower + 1) * pow (nh, specularPower)) / (8 * invV * invF + 1e-4h);

		// #ifdef LAYA_COLORSPACE_GAMMA
		// 	specularTerm = sqrt(max(1e-4f, specularTerm));
		// #endif
	// #endif

	// #if defined (SHADER_API_MOBILE)
		specularTerm = clamp(specularTerm, 0.0, 100.0); // Prevent FP16 overflow on mobiles
	// #endif
    
    mediump vec3 color = (diffColor + specularTerm * specColor) * light.color * nl;

    return vec4(color, 1.0);
}

mediump vec4 layaBRDFLowGI (mediump vec3 diffColor, mediump vec3 specColor,mediump float oneMinusReflectivity,mediump float smoothness,float perceptualRoughness,float roughness,mediump float nv,vec3 normal,vec3 viewDir,LayaGI gi)
{
	// surfaceReduction = Int D(NdotH) * NdotH * Id(NdotL>0) dH = 1/(realRoughness^2+1)

    // 1-0.28*x^3 as approximation for (1/(x^4+1))^(1/2.2) on the domain [0;1]
    // 1-x^3*(0.6-0.08*x)   approximation for 1/(x^4+1)
	// #ifdef LAYA_COLORSPACE_GAMMA
		mediump float surfaceReduction = 0.28;
	// #else
		// mediump float surfaceReduction = (0.6-0.08*perceptualRoughness);
	// #endif

    surfaceReduction = 1.0 - roughness*perceptualRoughness*surfaceReduction;

	mediump float grazingTerm = clamp(smoothness + (1.0-oneMinusReflectivity),0.0,1.0);
	mediump vec3 color =gi.diffuse * diffColor+ surfaceReduction * gi.specular * fresnelLerpFast (specColor, vec3(grazingTerm), nv);

    return vec4(color, 1.0);
}
// BRDF2-------------------------------------------------------------------------------------