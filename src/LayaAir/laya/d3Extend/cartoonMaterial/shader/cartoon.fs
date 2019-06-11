#ifdef FSHIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

struct DirectionLight
{
	vec3 Color;
	vec3 Direction;
};

varying vec2 v_Texcoord0;
varying vec3 v_Normal;
varying vec3 v_PositionWorld;
varying vec3 v_ViewDir;

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

#ifdef BLENDTEXTURE
	uniform sampler2D u_BlendTexture;
#endif

uniform vec4 u_ShadowColor;
uniform float u_ShadowRange;
uniform float u_ShadowIntensity;
uniform float u_SpecularRange;
uniform float u_SpecularIntensity;

uniform DirectionLight u_DirectionLight;

void main()
{
	vec3 normal = normalize(v_Normal);
	vec3 viewdir = normalize(v_ViewDir);
	vec3 lightDir = normalize(u_DirectionLight.Direction);
	
	vec4 albedoTextureColor = vec4(1.0);
	#ifdef ALBEDOTEXTURE
		albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);
	#endif
	
	vec4 blendTextureColor = vec4(1.0); 
	#ifdef BLENDTEXTURE
		blendTextureColor = texture2D(u_BlendTexture, v_Texcoord0);
	#endif
	
	float blendTexColorG = blendTextureColor.g;
	
	//Overlay BlendMode 叠加
	vec3 albedoColor;
	albedoColor.r = albedoTextureColor.r > 0.5 ? 1.0 - 2.0 * (1.0 - albedoTextureColor.r) * (1.0 - blendTexColorG) : 2.0 * albedoTextureColor.r * blendTexColorG;
	albedoColor.g = albedoTextureColor.g > 0.5 ? 1.0 - 2.0 * (1.0 - albedoTextureColor.g) * (1.0 - blendTexColorG) : 2.0 * albedoTextureColor.g * blendTexColorG;
	albedoColor.b = albedoTextureColor.b > 0.5 ? 1.0 - 2.0 * (1.0 - albedoTextureColor.b) * (1.0 - blendTexColorG) : 2.0 * albedoTextureColor.b * blendTexColorG;
	
	albedoColor = clamp(albedoColor, 0.0, 1.0);
	
	float nl = max(dot(normal, -lightDir), 0.0);
	
	float shadowValue = nl + blendTexColorG - 0.5;
	float shadow = step(shadowValue, u_ShadowRange);
	if(u_ShadowRange > (shadowValue + 0.015))
		shadow = 1.0;
	else if(u_ShadowRange < (shadowValue - 0.015))
		shadow = 0.0;
	else
		shadow = (u_ShadowRange - (shadowValue - 0.015)) / 0.03;
		
	shadow = clamp(shadow, 0.0, 1.0);
	
	//specularTextureColor.r 影响高光范围
	float specular = step(u_SpecularRange, clamp(pow(nl, blendTextureColor.r), 0.0, 1.0));
	//specularTextureColor.b 影响高光强度
	specular = step(0.1, specular * blendTextureColor.b);
	
	vec3 albedoAreaColor = (1.0 - shadow) * albedoColor;
	vec3 shadowAreaColor = shadow * albedoColor * u_ShadowColor.rgb * u_ShadowIntensity;
	vec3 speculAreaColor = (1.0 - shadow) * albedoColor * u_SpecularIntensity * specular;
	
	vec3 finalColor = albedoAreaColor + speculAreaColor + shadowAreaColor;
	
	gl_FragColor = vec4(finalColor, 1.0);
}
