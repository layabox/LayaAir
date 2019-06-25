//#version 300 es

precision highp float;
precision lowp int;

const float PI = 3.14159265358979323846264;
const float _2PI = 6.2831853071796;
varying vec2 vUv;
varying vec3 vWorldNorm;
#ifdef HAS_TANGENT
varying vec3 vWorldTangent;
varying vec3 vWorldBinormal;
#endif
varying vec3 vViewDir;
varying vec4 vViewPos;
varying vec4 vWorldPos;
//
uniform sampler2D texBaseColor;
uniform sampler2D texNormal;
//预计算的贴图
uniform sampler2D texPrefilterdEnv;
uniform sampler2D texBRDFLUT;
uniform sampler2D texPrefilterDiff;
#ifdef HAS_PBRINFO
uniform sampler2D texPbrInfo;   //Ao, Roughness, Metallic
#endif
uniform float u_hdrexposure;
uniform float u_AlphaTestValue;

uniform float u_roughness;
uniform float u_metaless;
const float maxlv = 7.;	//现在只支持512分辨率的环境贴图
const int nmaxlv = 9;//
							
uniform mat4 irrad_mat_red;
uniform mat4 irrad_mat_green;
uniform mat4 irrad_mat_blue;							

vec3 speccontrib = vec3(0.);

const float _maxu8 = 255.0;
const float _maxu16 = 65535.0;
const float _shift8 = 256.0;    //平移的话是*256而不是255
vec2 _RGBAToU16(const in vec4 rgba){
    return vec2((rgba.r*_maxu8+rgba.g*_maxu8*_shift8)/_maxu16, (rgba.b*_maxu8+rgba.a*_maxu8*_shift8)/_maxu16);
}
vec3 _RGBEToRGB( const in vec4 rgba ){
    float f = pow(2.0, rgba.w * 255.0 - (128.0 + 8.0));
    return rgba.rgb * (255.0 * f);
}

float saturate(float v){
    return min(max(v,0.),1.);
}

vec4 tex2dLod(sampler2D tex, float u, float v, float lod){
	vec2 uv = vec2(u,v);
	uv+=mod(gl_FragCoord.xy-vec2(0.5),2.0)*vec2(128.,0.);
	return texture2D(tex,uv,lod-16.);
}

/*
* 对一个全景图进行采样。假设x轴指向中心。
*/
vec4 texPanorama(sampler2D tex, const in vec3 dir){
	float envu = atan(dir.z,dir.x)/_2PI+0.5; 	
	float envv = acos(dir.y)/PI;//(1.0-dir.y)/2.0;
	return texture2D(tex,vec2(envu,envv));
}

vec4 texPanoramaLod(sampler2D tex, const in vec3 dir, float lod){
	float envu = atan(dir.z,dir.x)/_2PI+0.5; 	
	float envv = acos(dir.y)/PI;//(1.0-dir.y)/2.0;
	return tex2dLod(tex,envu,envv,lod);
}

/*
    计算sh光照。
    使用level=2，所以需要9个系数。
    https://cseweb.ucsd.edu/~ravir/papers/envmap/envmap.pdf
*/
float environment_exposure = 1.0;
vec3 diff_sh9(vec3 dir){
	vec4 shDir = vec4(dir.x,-dir.z,dir.y,1.0);
  return max(vec3(0.0), vec3(
	dot(shDir, irrad_mat_red * shDir),
	dot(shDir, irrad_mat_green * shDir),
	dot(shDir, irrad_mat_blue * shDir)
	)) * environment_exposure;	
}

#ifdef HAS_TANGENT
vec3 applyNormalTex( vec3 norm, vec3 surf_norm ) {
    vec3 mapN = norm * 2.0 - 1.0;
    //mapN.xy = normalScale * mapN.xy;
    mat3 tsn = mat3( vWorldTangent, vWorldBinormal, surf_norm );
    return normalize( tsn * mapN );
}
#endif

vec4 pbrlight(vec3 normal, float rough, float NoV, vec3 R){
    vec4 basecolor = texture2D(texBaseColor,vUv);
	basecolor.rgb = pow(basecolor.rgb,vec3(2.2));
	float metaless = 1.0; 	
	const float ismetalinfov = (128./255.);
	if(basecolor.a>=ismetalinfov){//这时候表示金属度
		metaless = (basecolor.a-ismetalinfov)*2.;
		basecolor.a = 1.0;
	}else{
		metaless = 0.;
		basecolor.a = basecolor.a*2.0;
	}
	#ifdef FIX_METALESS
	metaless = u_metaless;
	#endif
	#ifdef HAS_PBRINFO	
	vec4 pbrinfo = texture2D(texPbrInfo, vUv);
	metaless = pbrinfo.b;
	rough = pbrinfo.g;
	#endif
    const vec3 nonmetalF0 =vec3(0.02);
    vec3 F0 =  mix(nonmetalF0, basecolor.rgb, metaless);
	
    vec4 PrefilteredColor = texPanoramaLod(texPrefilterdEnv, R, rough*maxlv);
    PrefilteredColor.rgb = _RGBEToRGB(PrefilteredColor);
    vec4 EnvBRDF = texture2D(texBRDFLUT,vec2(rough , NoV));//TODO lod
    vec2 rg = _RGBAToU16(EnvBRDF);    
    speccontrib = (F0* rg.x + saturate( 50.0 * PrefilteredColor.g ) * rg.y);
	vec3 color_spec = PrefilteredColor.rgb*speccontrib;
	
	vec3 color_diff=diff_sh9(normal);
	vec3 outc =  color_diff*mix(basecolor.rgb,vec3(0.),metaless)*(vec3(1.0)-speccontrib)+color_spec;
	#ifdef HAS_PBRINFO
	outc*=pbrinfo.r;
	#endif
	return vec4(outc, basecolor.a);
}

vec3 oldlight(vec4 normal, float NoV, vec3 R){
    vec4 basecolor = texture2D(texBaseColor,vUv);
	const vec3 lightdir=normalize(vec3(1.,1.,0.));
	const vec3 spcecol = vec3(1.,0.8,0.8);
	const vec3 amb = vec3(0.5);
	vec3 diffv =  (vec3(saturate(dot(lightdir,normal.xyz)))+amb);
	//vec3 spec = spcecol* pow(saturate(dot(R,lightdir)),(1.-pbrinfo.g)*5.);
	return diffv*basecolor.rgb;//+spec;
}

#include "ShadowHelper.glsl"
#ifdef RECEIVESHADOW
varying float v_posViewZ;
	#if defined(SHADOWMAP_PSSM2)||defined(SHADOWMAP_PSSM3)
	uniform mat4 u_lightShadowVP[4];
	#endif
	#ifdef SHADOWMAP_PSSM1 
	varying vec4 v_lightMVPPos;
	#endif
#endif

void main() {
#ifdef CASTSHADOW
	gl_FragColor=packDepth(gl_FragCoord.w);
	#if defined(DIFFUSEMAP)&&defined(ALPHATEST)
		float alpha = texture2D(texBaseColor,vUv).w;
		if( alpha < u_AlphaTestValue ){
			discard;
		}
	#endif
#else

	#ifdef RECEIVESHADOW
		float shadowValue = 1.0;
		#ifdef SHADOWMAP_PSSM3
			shadowValue = getShadowPSSM3( u_shadowMap1,u_shadowMap2,u_shadowMap3,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,vWorldPos.xyz,v_posViewZ,0.0001);
		#endif
		#ifdef SHADOWMAP_PSSM2
			shadowValue = getShadowPSSM2( u_shadowMap1,u_shadowMap2,u_lightShadowVP,u_shadowPSSMDistance,u_shadowPCFoffset,vWorldPos.xyz,v_posViewZ,0.0001);
		#endif 
		#ifdef SHADOWMAP_PSSM1
			shadowValue = getShadowPSSM1( u_shadowMap1,v_lightMVPPos,u_shadowPSSMDistance,u_shadowPCFoffset,v_posViewZ,0.0001);
		#endif
	#endif	
	
    vec3 normal =  normalize(vWorldNorm);
	vec4 normtex = texture2D( texNormal, vUv );
	#ifdef HAS_TANGENT	
	normal = applyNormalTex(normtex.xyz, normal);
	#endif
    vec3 view   = -normalize(vViewDir);
    float NoV = saturate(dot( view, normal ));
    vec3 R = 2. * NoV * normal - view;
	float roughness = normtex.a;
	#ifdef FIX_ROUGHNESS
	roughness = u_roughness;
	#endif
	
	vec4 pbrl = pbrlight(normal,roughness,NoV,R)*u_hdrexposure;
    gl_FragColor.rgb =  pow(pbrl.rgb,vec3(0.45455));
	//gl_FragColor.rgb = oldlight(normtex,NoV,R);
	#ifdef RECEIVESHADOW
	gl_FragColor.rgb *= max(shadowValue,0.7);
	#endif
	
    gl_FragColor.a = pbrl.a;

#endif
}
