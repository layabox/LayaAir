struct LayaGIInput
{
	vec2 lightmapUV;
	vec3 worldPos;
};

#define LAYA_SPECCUBE_LOD_STEPS 6.0

uniform vec3 u_AmbientColor;

#if defined(GI_AMBIENT_SH)
	uniform vec4 u_AmbientSHAr;
	uniform vec4 u_AmbientSHAg;
	uniform vec4 u_AmbientSHAb;
	uniform vec4 u_AmbientSHBr;
	uniform vec4 u_AmbientSHBg;
	uniform vec4 u_AmbientSHBb;
	uniform vec4 u_AmbientSHC;
#endif

uniform samplerCube u_ReflectTexture;
uniform vec4 u_ReflectCubeHDRParams;

#ifdef SPECCUBE_BOX_PROJECTION
	uniform vec3 u_SpecCubeProbePosition;
	uniform vec3 u_SpecCubeBoxMax;
	uniform vec3 u_SpecCubeBoxMin;
#endif


#ifdef GI_AMBIENT_SH
	mediump vec3 shEvalLinearL0L1(mediump vec4 normal)
	{
		mediump vec3 x;
		// Linear (L1) + constant (L0) polynomial terms
		x.r = dot(u_AmbientSHAr, normal);
		x.g = dot(u_AmbientSHAg, normal);
		x.b = dot(u_AmbientSHAb, normal);
		return x;
	}

	mediump vec3 shEvalLinearL2(mediump vec4 normal)
	{
		mediump vec3 x1,x2;
		// 4 of the quadratic (L2) polynomials
		mediump vec4 vB = normal.xyzz * normal.yzzx;
		x1.r = dot(u_AmbientSHBr, vB);
		x1.g = dot(u_AmbientSHBg, vB);
		x1.b = dot(u_AmbientSHBb, vB);

		// Final (5th) quadratic (L2) polynomial
		mediump float vC = normal.x*normal.x - normal.y*normal.y;
		x2 = u_AmbientSHC.rgb * vC;

		return x1 + x2;
	}
	
	mediump vec3 shadeSHPerPixel(mediump vec3 normal)
	{
		mediump vec3 ambientContrib;
		mediump vec4 normalV4=vec4(-normal.x,normal.yz, 1.0);//Note:SH Data is left-hand,so x need inverse
		ambientContrib = shEvalLinearL0L1(normalV4);
		ambientContrib += shEvalLinearL2(normalV4);
		mediump vec3 ambient = max(vec3(0.0), ambientContrib);
		ambient = layaLinearToGammaSpace(ambient);
		return ambient;
	}
#endif



 mediump vec3 BoxProjectedCubemapDirection(mediump vec3 worldRefl,mediump vec3 worldPos,mediump vec3 cubemapCenter,mediump vec3 boxMin,mediump vec3 boxMax){
	 mediump vec3 nrdir = normalize(worldRefl);
	 mediump vec3 rbmax = (boxMax - worldPos);
	 mediump vec3 rbmin = (boxMin - worldPos);
	 mediump vec3 select = step(vec3(0.0), worldRefl);
	 mediump vec3 rbminmax = mix(rbmin, rbmax, select);
	rbminmax = rbminmax / nrdir;
	mediump float scalar = min(min(rbminmax.x, rbminmax.y), rbminmax.z);
	 mediump vec3 worldChangeRefl = nrdir * scalar + (worldPos - cubemapCenter);
	return worldChangeRefl;
}


mediump vec3 layaDecodeDirectionalLightmap (mediump vec3 color, lowp vec4 dirTex, mediump vec3 normalWorld)
{
    // In directional (non-specular) mode Enlighten bakes dominant light direction
    // in a way, that using it for half Lambert and then dividing by a "rebalancing coefficient"
    // gives a result close to plain diffuse response lightmaps, but normalmapped.

    // Note that dir is not unit length on purpose. Its length is "directionality", like
    // for the directional specular lightmaps.
	lowp vec3 directional=dirTex.xyz - 0.5;
	directional.x=-directional.x;//NOTE:because coord System
    mediump float halfLambert = dot(normalWorld,directional) + 0.5;

    return color * halfLambert / max(1e-4, dirTex.w);
}

vec3 layaGIBase(LayaGIInput giInput,mediump float occlusion, mediump vec3 normalWorld)
{
	vec3 indirectDiffuse;
	#ifdef LIGHTMAP	
		mediump vec3 bakedColor =decodeHDR(texture2D(u_LightMap, giInput.lightmapUV),5.0);
		#ifdef LIGHTMAP_DIRECTIONAL
			lowp vec4 bakedDirTex = texture2D (u_LightMapDirection, giInput.lightmapUV);
            indirectDiffuse = layaDecodeDirectionalLightmap (bakedColor, bakedDirTex, normalWorld);
		#else //unDirectional lightmap
			indirectDiffuse = bakedColor;
		#endif
	#else
		#ifdef GI_AMBIENT_SH
			indirectDiffuse = shadeSHPerPixel(normalWorld);
		#else
			indirectDiffuse = u_AmbientColor; //already in gamma space
		#endif
	#endif

	indirectDiffuse*=occlusion;
	return indirectDiffuse;
}

mediump vec3 layaGlossyEnvironment(mediump vec4 glossIn)
{
	mediump float perceptualRoughness = glossIn.a;

	// use approximation to solve,below is more reasonable,but maybe slow. 
	// float m = perceptualRoughnessToRoughness(perceptualRoughness); // m is the real roughness parameter
    // const float fEps = 1.192092896e-07F;        // smallest such that 1.0+FLT_EPSILON != 1.0  (+1e-4h is NOT good here. is visibly very wrong)
    // float n =  (2.0/max(fEps, m*m))-2.0;        // remap to spec power. See eq. 21 in --> https://dl.dropboxusercontent.com/u/55891920/papers/mm_brdf.pdf
    // n /= 4;                                     // remap from n_dot_h formulatino to n_dot_r. See section "Pre-convolved Cube Maps vs Path Tracers" --> https://s3.amazonaws.com/docs.knaldtech.com/knald/1.0.0/lys_power_drops.html
    // perceptualRoughness = pow( 2/(n+2), 0.25);  // remap back to square root of real roughness (0.25 include both the sqrt root of the conversion and sqrt for going from roughness to perceptualRoughness)
	perceptualRoughness = perceptualRoughness * (1.7 - 0.7*perceptualRoughness);//just a approximation,but fast.
 
	mediump float mip = perceptualRoughness * LAYA_SPECCUBE_LOD_STEPS;
	mediump vec3 uvw = glossIn.rgb;
	uvw.x=-uvw.x;//Note:reflectCube is left-hand,so x need inverse
	mediump vec4 rgbm=textureCubeLodEXT(u_ReflectTexture,uvw,mip);
	return decodeHDR(rgbm,u_ReflectCubeHDRParams.x);
}

mediump vec3 layaGIIndirectSpecular(LayaGIInput giInput,mediump float occlusion, vec4 glossIn)
{
	#ifdef SPECCUBE_BOX_PROJECTION
		vec3 originalReflUVW = glossIn.xyz;
		glossIn.xyz =BoxProjectedCubemapDirection(originalReflUVW,giInput.worldPos,u_SpecCubeProbePosition,u_SpecCubeBoxMin,u_SpecCubeBoxMax);
	#endif
	mediump vec3 specular = layaGlossyEnvironment(glossIn);
	return specular * occlusion;
}


LayaGI layaGlobalIllumination(LayaGIInput giInput,mediump float occlusion, mediump vec3 normalWorld,mediump vec4 uvwRoughness)
{
	LayaGI gi;
	gi.diffuse = layaGIBase(giInput,occlusion, normalWorld);
	gi.specular = layaGIIndirectSpecular(giInput,occlusion, uvwRoughness);
	return gi;
}


