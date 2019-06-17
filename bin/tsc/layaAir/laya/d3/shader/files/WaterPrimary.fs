#ifdef FSHIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

#ifdef MAINTEXTURE
	uniform sampler2D u_MainTexture;
#endif

#ifdef NORMALTEXTURE
	uniform sampler2D u_NormalTexture;
#endif

uniform vec4 u_HorizonColor;

varying vec3 v_Normal;
varying vec3 v_Tangent;
varying vec3 v_Binormal;
varying vec3 v_ViewDir;
varying vec2 v_Texcoord0;
varying vec2 v_Texcoord1;

#include "Lighting.glsl"

void main()
{
	vec4 bumpColor1 = texture2D(u_NormalTexture, v_Texcoord0);
	vec4 bumpColor2 = texture2D(u_NormalTexture, v_Texcoord1);
	
	vec3 normal1 = NormalSampleToWorldSpace1(bumpColor1, v_Tangent, v_Binormal, v_Normal);
	vec3 normal2 = NormalSampleToWorldSpace1(bumpColor2, v_Tangent, v_Binormal, v_Normal);
	
	vec3 normal = normalize((normal1 + normal2) * 0.5);
	vec3 viewDir = normalize(v_ViewDir);
	float fresnel = dot(viewDir, normal);
	
	vec4 waterColor = texture2D(u_MainTexture, vec2(fresnel, fresnel));
	
	vec4 color;
	color.rgb = mix(waterColor.rgb, u_HorizonColor.rgb, vec3(waterColor.a));
	color.a = u_HorizonColor.a;
	
	gl_FragColor = color;
}

