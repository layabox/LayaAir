#include "PBRUtils.glsl"
#include "BRDF.glsl"

vec4 PBRSpecularLight(in vec4 albedoColor, in vec3 specularColor, in float smoothness, in vec3 normal, in vec3 viewDir, in vec3 lightDir, in vec3 lightColor, in LayaGI gi)
{
	float oneMinusReflectivity;
	vec3 diffuseColor;
	float alpha;
	
	diffuseColor = EnergyConservationBetweenDiffuseAndSpecular (albedoColor.rgb, specularColor, oneMinusReflectivity);
	
	diffuseColor = LayaPreMultiplyAlpha(diffuseColor, albedoColor.a, oneMinusReflectivity, alpha);
	
	vec4 color = LayaAirBRDF(diffuseColor, specularColor, oneMinusReflectivity, smoothness, normal, viewDir, lightDir, lightColor, gi);
	color.a = alpha;
	return color;
}

vec4 PBRSpecularDiectionLight (in vec4 albedoColor, in vec3 specularColor, in float smoothness, in vec3 normal, in vec3 viewDir, in DirectionLight light, in LayaGI gi)
{
	vec3 lightVec = normalize(light.Direction);
	return PBRSpecularLight(albedoColor, specularColor, smoothness, normal, viewDir, lightVec, light.Color, gi);
}

vec4 PBRSpecularPointLight (in vec4 albedoColor, in vec3 specularColor, in float smoothness, in vec3 normal, in vec3 viewDir, in PointLight light, in vec3 pos, in LayaGI gi)
{
	vec3 lightCoord = (u_PointLightMatrix * vec4(pos, 1.0)).xyz;
	float distance = dot(lightCoord, lightCoord);
	float attenuate = texture2D(u_RangeTexture, vec2(distance)).w;
	vec3 lightVec = normalize(pos - light.Position);
	return PBRSpecularLight(albedoColor, specularColor, smoothness, normal, viewDir, lightVec, light.Color, gi) * attenuate;
}

vec4 PBRSpecularSpotLight (in vec4 albedoColor, in vec3 specularColor, in float smoothness, in vec3 normal, in vec3 viewDir, in SpotLight light, in vec3 pos, in LayaGI gi)
{
	vec3 lightVec =  pos - light.Position;
	vec3 normalLightVec = normalize(lightVec);
	vec2 cosAngles = cos(vec2(light.SpotAngle, light.SpotAngle*0.5) * 0.5);//ConeAttenuation
	float dl = dot(normalize(light.Direction), normalLightVec);
	dl *= smoothstep(cosAngles[0], cosAngles[1], dl);
	float attenuate = LayaAttenuation(lightVec, 1.0/light.Range) * dl;
	return PBRSpecularLight(albedoColor, specularColor, smoothness, normal, viewDir, lightVec, light.Color, gi) * attenuate;
}

//vec4 PBRStandardSpotLight1 (in vec4 albedoColor, in float metallic, in float smoothness, in vec3 normal, in vec3 viewDir, in SpotLight light, in vec3 pos, in LayaGI gi)
//{
//	vec4 lightCoord = u_SpotLightMatrix * vec4(pos, 1.0);
//	
//	float distance = dot(lightCoord, lightCoord);
//	float attenuate = (lightCoord.z < 0.0) ? texture2D(u_RangeTexture, vec2(distance)).w : 0.0;
//	//float attenuate = (lightCoord.z < 0.0) ? texture2D(u_AngleTexture, vec2(lightCoord.x / lightCoord.w + 0.5, lightCoord.y / lightCoord.w + 0.5)).r * texture2D(u_RangeTexture, vec2(distance)).w : 0.0;
//	//vec2 _uv = vec2(pos.x * 180.0/(2.0 * pos.z) + 0.5, pos.y * 180.0/(2.0 * pos.z) + 0.5);
//	vec3 lightVec = normalize(pos - light.Position);
//	return PBRStandardLight(albedoColor, metallic, smoothness, normal, viewDir, lightVec, light.Color, gi) * attenuate;
//}

vec4 SpecularGloss(float albedoTextureAlpha, in vec2 uv0)
{
    vec4 sg;
	
	#ifdef SPECULARTEXTURE
		vec4 specularTextureColor = texture2D(u_SpecularTexture, uv0);
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			sg.rgb = specularTextureColor.rgb;
			sg.a = albedoTextureAlpha;
		#else
			sg = specularTextureColor;
		#endif
		sg.a *= u_smoothnessScale;
	#else
		sg.rgb = u_SpecularColor.rgb;
		#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
			sg.a = albedoTextureAlpha * u_smoothnessScale;
		#else
			sg.a = u_smoothness;
		#endif
	#endif
	
    return sg;
}

