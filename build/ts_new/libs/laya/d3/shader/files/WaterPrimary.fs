#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
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



vec3 NormalSampleToWorldSpace(vec4 normalMapSample) {
	vec3 normalT;
	normalT.x = 2.0 * normalMapSample.x - 1.0;
	normalT.y = 1.0 - 2.0 * normalMapSample.y;
	normalT.z = sqrt(1.0 - clamp(dot(normalT.xy, normalT.xy), 0.0, 1.0));

	vec3 bumpedNormal = normalize(normalT);

	return bumpedNormal;
}


void main()
{
	vec4 bumpColor1 = texture2D(u_NormalTexture, v_Texcoord0);
	vec4 bumpColor2 = texture2D(u_NormalTexture, v_Texcoord1);

	vec3 normal1 = NormalSampleToWorldSpace(bumpColor1);
	vec3 normal2 = NormalSampleToWorldSpace(bumpColor2);
	
	vec3 normal = normalize((normal1 + normal2) * 0.5);
	vec3 viewDir = normalize(v_ViewDir);
	float fresnel = dot(viewDir, normal);
	
	vec4 waterColor = texture2D(u_MainTexture, vec2(fresnel, fresnel));
	
	vec4 color;
	color.rgb = mix(waterColor.rgb, u_HorizonColor.rgb, vec3(waterColor.a));
	color.a = u_HorizonColor.a;
	
	gl_FragColor = color;
}


