#define LAYA_SPECCUBE_LOD_STEPS 6.0

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


uniform samplerCube u_ReflectTexture;

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
		indirectDiffuse += DecodeHDR(texture2D(u_LightMap, v_LightMapUV),5.0);
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
	uvwRoughness.rgb = reflect(worldViewDir, normal);//reflectUVW
	uvwRoughness.a= smoothnessToPerceptualRoughness(smoothness);//perceptualRoughness
	return uvwRoughness;
}

mediump vec3 LayaGlossyEnvironment(mediump vec4 glossIn)
{
	mediump float perceptualRoughness = glossIn.a;

	// use approximation to solve,below is more reasonable,but maybe slow. 
	// float m = PerceptualRoughnessToRoughness(perceptualRoughness); // m is the real roughness parameter
    // const float fEps = 1.192092896e-07F;        // smallest such that 1.0+FLT_EPSILON != 1.0  (+1e-4h is NOT good here. is visibly very wrong)
    // float n =  (2.0/max(fEps, m*m))-2.0;        // remap to spec power. See eq. 21 in --> https://dl.dropboxusercontent.com/u/55891920/papers/mm_brdf.pdf
    // n /= 4;                                     // remap from n_dot_h formulatino to n_dot_r. See section "Pre-convolved Cube Maps vs Path Tracers" --> https://s3.amazonaws.com/docs.knaldtech.com/knald/1.0.0/lys_power_drops.html
    // perceptualRoughness = pow( 2/(n+2), 0.25);  // remap back to square root of real roughness (0.25 include both the sqrt root of the conversion and sqrt for going from roughness to perceptualRoughness)
	perceptualRoughness = perceptualRoughness * (1.7 - 0.7*perceptualRoughness);//just a approximation,but fast.
 
	mediump float mip = perceptualRoughness * LAYA_SPECCUBE_LOD_STEPS;
	mediump vec3 uvw = glossIn.rgb;
	mediump vec4 rgbm=textureCube(u_ReflectTexture,uvw);//TODO:should replace to textureCubeLod
	return DecodeHDR(rgbm,2.0);//TODO:2.0 is Temp
}

mediump vec3 LayaGIIndirectSpecular(mediump float occlusion, vec4 glossIn)
{
	mediump vec3 specular;
	#ifdef REFLECTIONS_OFF
        //specular = unity_IndirectSpecColor.rgb;//TODO: maybe the average lumination
    #else
		specular = LayaGlossyEnvironment(glossIn);
	#endif
	return specular * occlusion;
}


LayaGI globalIllumination(mediump float occlusion, mediump vec3 normalWorld,mediump vec4 uvwRoughness)
{
	LayaGI gi;
	gi.diffuse= giBase(occlusion, normalWorld);
	gi.specular = LayaGIIndirectSpecular(occlusion, uvwRoughness);
	return gi;
}



