

const vec4 dielectricSpecularColor = vec4(0.220916301, 0.220916301, 0.220916301, 1.0 - 0.220916301);

uniform vec3 u_AmbientColor;
//alphaTest
#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif

uniform vec4 u_AlbedoColor;

#ifdef NORMALTEXTURE
	uniform sampler2D u_NormalTexture;
#endif
//漫反射贴图
#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

#ifdef METALLICGLOSSTEXTURE
	uniform sampler2D u_MetallicGlossTexture;
#endif

uniform float u_smoothness;
uniform float u_smoothnessScale;

uniform float u_metallic;

#ifdef PARALLAXTEXTURE
	uniform sampler2D u_ParallaxTexture;
#endif

#ifdef OCCLUSIONTEXTURE
	uniform sampler2D u_OcclusionTexture;
	uniform float u_occlusionStrength;
#endif

#ifdef EMISSIONTEXTURE
	uniform sampler2D u_EmissionTexture;
#endif
uniform vec4 u_EmissionColor;


#if defined(DIFFUSEMAP)||defined(METALLICGLOSSTEXTURE)||defined(NORMALTEXTURE)||defined(EMISSIONTEXTURE)||defined(OCCLUSIONTEXTURE)||defined(PARALLAXTEXTURE)
	varying vec2 v_Texcoord0;
#endif

#ifdef LIGHTMAP
	varying vec2 v_LightMapUV;
	uniform sampler2D u_LightMap;
#endif

#if defined(REFLECTIONMAP)
	uniform samplerCube u_ReflectTexture;
#endif

varying vec3 v_Normal; 

#if defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT)
	#ifdef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			uniform DirectionLight u_DirectionLight;
		#endif
		#ifdef POINTLIGHT
			uniform PointLight u_PointLight;
		#endif
		#ifdef SPOTLIGHT
			uniform SpotLight u_SpotLight;
		#endif
	#else
		uniform mat4 u_View;
		uniform vec4 u_ProjectionParams;
		uniform vec4 u_Viewport;
		uniform int u_DirationLightCount;
		uniform sampler2D u_LightBuffer;
		uniform sampler2D u_LightClusterBuffer;
	#endif
#endif
//后面考虑宏TODO
varying vec3 v_EyeVec;

#if defined(NORMALMAP)||defined(PARALLAXMAP)
	varying vec3 v_Tangent;
	varying vec3 v_Binormal;
#endif

#if defined(INDIRECTLIGHT)
uniform vec4 u_SHAr;
uniform vec4 u_SHAg;
uniform vec4 u_SHAb;
uniform vec4 u_SHBr;
uniform vec4 u_SHBg;
uniform vec4 u_SHBb;
uniform vec4 u_SHC;
#endif

//后面考虑宏TODO
varying vec3 v_PositionWorld;


//FS
vec3 emission(vec2 uv)
{
	#ifdef EMISSIONTEXTURE
		return texture2D(u_EmissionTexture, uv).rgb * u_EmissionColor.rgb;
	#else
		return u_EmissionColor.rgb;
	#endif
}

mediump float alpha(vec2 uv)
{
	#ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
		return u_AlbedoColor.a;
	#else
		#ifdef ALBEDOTEXTURE
			return texture2D(u_AlbedoTexture, uv).a * u_AlbedoColor.a;
		#else
			return u_AlbedoColor.a;
		#endif
	#endif
}

float lerpOneTo(float b, float t)
{
	float oneMinusT = 1.0 - t;
	return oneMinusT + b * t;
}

float occlusion(vec2 uv)
{
	#ifdef OCCLUSIONTEXTURE
		float occ = texture2D(u_OcclusionTexture, uv).g;
		return LayaLerpOneTo(occ, u_occlusionStrength);
	#else
		return 1.0;
	#endif
}

vec3 albedo(vec2 uv)
{
	#ifdef ALBEDOTEXTURE
		return u_AlbedoColor.rgb * texture2D(u_AlbedoTexture, uv).rgb;
	#else
		return u_AlbedoColor.rgb;
	#endif
}

vec3 perPixelWorldNormal(vec2 uv,vec3 normal,vec3 binormal,vec3 tangent)
{

	#if defined(NORMALMAP)||defined(PARALLAXMAP)
		// #if UNITY_TANGENT_ORTHONORMALIZE
		// 	normal = LayaNormalizePerPixelNormal(normal);

		// 	// ortho-normalize Tangent
		// 	tangent = normalize(tangent - normal * dot(tangent, normal));

		// 	// recalculate Binormal重新计算二法线
		// 	half3 newB = cross(normal, tangent);
		// 	//sign这个函数大于0的时候是1，等于0的时候是0，小于0的是-1
		// 	//？？？这里二法线能等于0，0，0吗？
		// 	binormal = newB * sign(dot(newB, binormal));
		// #endif
		vec3 normalTangent =texture2D(u_NormalTexture, uv).rgb ;
		vec3 normalWorld = normalize(normalSampleToWorldSpace(normalTangent, normal, tangent,binormal));
	#else
		vec3 normalWorld = normalize(normal);
	#endif
		return normalWorld;
}



vec2 metallicGloss(vec2 uv)
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
LayaFragmentCommonData metallicSetup(vec2 uv)
{

	LayaFragmentCommonData o;
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

//Specular flow



vec3 LayaLinearToGammaSpace (vec3 linRGB)
{
    linRGB = max(linRGB, vec3(0.0, 0.0, 0.0));
    // An almost-perfect approximation from http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
    return max(1.055 * pow(linRGB, vec3(0.416666667)) - 0.055, 0.0);   
}

//GI
#ifdef INDIRECTLIGHT
vec3 SHEvalLinearL0L1(vec4 normal)
{
	vec3 x;
	//九个参数转换为矩阵
	// Linear (L1) + constant (L0) polynomial terms
	x.r = dot(u_SHAr, normal);
	x.g = dot(u_SHAg, normal);
	x.b = dot(u_SHAb, normal);
	return x;
}

vec3 SHEvalLinearL2(vec4 normal)
{
	vec3 x1;
	vec3 x2;
	// 4 of the quadratic (L2) polynomials
	vec4 vB = normal.xyzz * normal.yzzx;
	x1.r = dot(u_SHBr, vB);
	x1.g = dot(u_SHBg, vB);
	x1.b = dot(u_SHBb, vB);

	// Final (5th) quadratic (L2) polynomial
	float vC = normal.x*normal.x - normal.y*normal.y;
	x2 = u_SHC.rgb * vC;

	return x1 + x2;
}
#endif
//LayaFragmentGI
//感知光滑转换到感知粗糙
//LayaGI_Base

vec3 shadeSHPerPixel(vec3 normal, vec3 ambient)
{
	vec3 nenormal = vec3(-normal.x,normal.y,normal.z);
	#ifdef INDIRECTLIGHT
		ambient = SHEvalLinearL0L1(vec4(nenormal, 1.0));
		//得到完整球谐函数
		ambient += SHEvalLinearL2(vec4(nenormal, 1.0));

		ambient += max(vec3(0, 0, 0), ambient);
	#endif
		ambient = LayaLinearToGammaSpace(ambient);
	return ambient;
}


vec3 GI_Base(float occlusion, vec3 normalWorld)
{
	vec3 indirectDiffuse;
	
	indirectDiffuse=u_AmbientColor;
	
	#ifdef LIGHTMAP	
		indirectDiffuse += DecodeLightmap(texture2D(u_LightMap, v_LightMapUV));
	#else
		indirectDiffuse = shadeSHPerPixel(normalWorld, indirectDiffuse);
	#endif

	//间接光照的diffuse
	indirectDiffuse*=occlusion;
	return indirectDiffuse;
}

//  //LayaGI_IndirectSpecular

float smoothnessToPerceptualRoughness(float smoothness)
{
	return (1.0 - smoothness);
}
vec4 glossyEnvironmentSetup(float smoothness, vec3 worldViewDir, vec3 Normal)
{
	vec4 reflRoun;
	reflRoun.a= smoothnessToPerceptualRoughness(smoothness);
	//采样方向
	reflRoun.rgb = reflect(-worldViewDir, Normal);

	return reflRoun;
}

vec3 glossyEnvironment(vec4 glossIn)
{
	vec4 rgbm;
	#if defined(REFLECTIONMAP)
		float perceptualRoughness = glossIn.a;
		perceptualRoughness = perceptualRoughness * (1.7 - 0.7*perceptualRoughness);
		//六级
		float mip = perceptualRoughness * 6;
		vec3 r = glossIn.rgb;

		//TODO这里需要使用扩展的命令函数
		rgbm=textureCube(u_ReflectTexture,r);
	#endif
	return DecodeLightmap(rgbm);
}

vec3 GI_IndirectSpecular(float occlusion, vec4 glossIn)
{
	vec3 specular;
	//一般走这
	specular = glossyEnvironment(glossIn);
	return specular * occlusion;
}


LayaGI globalIllumination(float occlusion, vec3 normalWorld,vec4 glossIn)
{
	//计算了间接光照的diffuse
	LayaGI o_gi;
	o_gi.diffuse= GI_Base(occlusion, normalWorld);
	//计算了间接光照的高光
	o_gi.specular = GI_IndirectSpecular(occlusion, glossIn);

	return o_gi;
}


//,,float occlusion,vec3 worldnormal
LayaGI fragmentGI(LayaFragmentCommonData s,vec3 eyeVec,float occlusion,vec3 worldnormal)
{
	LayaGI layagi;
	vec3 worldViewDir = -eyeVec;
	vec4 reflRoun = glossyEnvironmentSetup(s.smoothness, worldViewDir,worldnormal);
	return globalIllumination(occlusion, worldnormal, reflRoun);
	//return layagi;
}

