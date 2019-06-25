struct LayaGI
{
	vec3 diffuse;
	vec3 specular;
};

vec4 LayaAirBRDF(in vec3 diffuseColor, in vec3 specularColor, in float oneMinusReflectivity, in float smoothness, in vec3 normal, in vec3 viewDir, in vec3 lightDir, in vec3 lightColor, in LayaGI gi)
{
	float perceptualRoughness = SmoothnessToPerceptualRoughness(smoothness);
	vec3 halfDir = SafeNormalize(viewDir - lightDir);
	
	float nv = abs(dot(normal, viewDir));
	
	float nl = clamp(dot(normal,   -lightDir),  0.0, 1.0);
	float nh = clamp(dot(normal,     halfDir),  0.0, 1.0);
	float lv = clamp(dot(lightDir,   viewDir),  0.0, 1.0);
	float lh = clamp(dot(lightDir,  -halfDir),  0.0, 1.0);
	
	float diffuseTerm = DisneyDiffuse(nv, nl, lh, perceptualRoughness) * nl;
	
	float roughness = PerceptualRoughnessToRoughness(perceptualRoughness);
	
	//#if UNITY_BRDF_GGX
	float V = SmithJointGGXVisibilityTerm(nl, nv, roughness);
	float D = GGXTerm(nh, roughness);
	
	float specularTerm = V * D * PI;
	
	specularTerm = sqrt(max(0.0001, specularTerm));
	specularTerm = max(0.0, specularTerm * nl);
	
	float surfaceReduction = 1.0 - 0.28 * roughness * perceptualRoughness;
	float grazingTerm = clamp(smoothness + (1.0 - oneMinusReflectivity), 0.0, 1.0);
	
	vec4 color;
	color.rgb = diffuseColor * (gi.diffuse + lightColor * diffuseTerm) 
			  + specularTerm * lightColor * FresnelTerm (specularColor, lh)
			  + surfaceReduction * gi.specular * FresnelLerp(specularColor, vec3(grazingTerm), nv);
	
	return color;
}