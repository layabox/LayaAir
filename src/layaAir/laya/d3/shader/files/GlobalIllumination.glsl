uniform vec3 u_AmbientColor;

#if defined(INDIRECTLIGHT)
uniform vec4 u_AmbientSHAr;
uniform vec4 u_AmbientSHAg;
uniform vec4 u_AmbientSHAb;
uniform vec4 u_AmbientSHBr;
uniform vec4 u_AmbientSHBg;
uniform vec4 u_AmbientSHBb;
uniform vec4 u_AmbientSHC;
#endif

#if defined(REFLECTIONMAP)
	uniform samplerCube u_ReflectTexture;
#endif

//GI
#ifdef INDIRECTLIGHT
vec3 SHEvalLinearL0L1(vec4 normal)
{
	vec3 x;
	//九个参数转换为矩阵
	// Linear (L1) + constant (L0) polynomial terms
	x.r = dot(u_AmbientSHAr, normal);
	x.g = dot(u_AmbientSHAg, normal);
	x.b = dot(u_AmbientSHAb, normal);
	return x;
}

vec3 SHEvalLinearL2(vec4 normal)
{
	vec3 x1;
	vec3 x2;
	// 4 of the quadratic (L2) polynomials
	vec4 vB = normal.xyzz * normal.yzzx;
	x1.r = dot(u_AmbientSHBr, vB);
	x1.g = dot(u_AmbientSHBg, vB);
	x1.b = dot(u_AmbientSHBb, vB);

	// Final (5th) quadratic (L2) polynomial
	float vC = normal.x*normal.x - normal.y*normal.y;
	x2 = u_AmbientSHC.rgb * vC;

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


vec3 giBase(mediump float occlusion, mediump vec3 normalWorld)
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


mediump vec4 glossyEnvironmentSetup(mediump float smoothness,mediump vec3 worldViewDir,mediump vec3 normal)
{
	mediump vec4 uvwRoughness;
	uvwRoughness.rgb = reflect(-worldViewDir, normal);//reflectUVW
	uvwRoughness.a= smoothnessToPerceptualRoughness(smoothness);//perceptualRoughness
	return uvwRoughness;
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

vec3 giIndirectSpecular(float occlusion, vec4 glossIn)
{
	vec3 specular;
	//一般走这
	specular = glossyEnvironment(glossIn);
	return specular * occlusion;
}


LayaGI globalIllumination(mediump float occlusion, mediump vec3 normalWorld,mediump vec4 uvwRoughness)
{
	LayaGI gi;
	gi.diffuse= giBase(occlusion, normalWorld);
	gi.specular = giIndirectSpecular(occlusion, uvwRoughness);
	return gi;
}



