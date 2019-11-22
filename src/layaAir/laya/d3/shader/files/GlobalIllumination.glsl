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

#ifdef GL_EXT_shader_texture_lod
    #extension GL_EXT_shader_texture_lod : enable
#endif
#if !defined(GL_EXT_shader_texture_lod)
    #define texture1DLodEXT texture1D
    #define texture2DLodEXT texture2D
    #define texture2DProjLodEXT texture2DProj
    #define texture3DLodEXT texture3D
    #define textureCubeLodEXT textureCube
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


vec3 GI_Base(float occlusion, vec3 normalWorld)
{
	vec3 indirectDiffuse;
	
	indirectDiffuse=u_AmbientColor;
	
	#ifdef LIGHTMAP	
		indirectDiffuse += DecodeHDR(texture2D(u_LightMap, v_LightMapUV),5.0);
	#else
		indirectDiffuse = shadeSHPerPixel(normalWorld, indirectDiffuse);
	#endif

	//间接光照的diffuse
	indirectDiffuse*=occlusion;
	return indirectDiffuse;
}

//  //LayaGI_IndirectSpecular


vec4 glossyEnvironmentSetup(float smoothness, vec3 worldViewDir, vec3 Normal)
{
	vec4 reflRoun;
	reflRoun.a= smoothnessToPerceptualRoughness(smoothness);
	//采样方向
	reflRoun.rgb = reflect(worldViewDir, Normal);
	return reflRoun;
}

vec3 glossyEnvironment(vec4 glossIn)
{
	vec4 rgbm;
	#if defined(REFLECTIONMAP)
		float perceptualRoughness = glossIn.a;
		perceptualRoughness = perceptualRoughness * (1.7 - 0.7*perceptualRoughness);
		//六级
		float mip = perceptualRoughness * 6.0;
		vec3 r = glossIn.rgb;

		//TODO这里需要使用扩展的命令函数
		rgbm=textureCubeLodEXT(u_ReflectTexture,r,mip);
	#endif
	return DecodeHDR(rgbm,2.0);
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
LayaGI fragmentGI(float smoothness,vec3 eyeVec,float occlusion,vec3 worldnormal)
{
	LayaGI layagi;
	vec3 worldViewDir = -eyeVec;
	vec4 reflRoun = glossyEnvironmentSetup(smoothness, worldViewDir,worldnormal);
	return globalIllumination(occlusion, worldnormal, reflRoun);
	//return layagi;
}
