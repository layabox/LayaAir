#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#define SHADER_NAME UnlitFS;

#include "LayaComInput.glsl";


#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
	varying vec4 v_Color;
#endif

#ifdef ALBEDOTEXTURE
	uniform sampler2D u_AlbedoTexture;
	varying vec2 v_Texcoord0;
#endif


uniform vec4 u_AlbedoColor;
uniform vec4 u_TilingOffset;

#ifdef ALPHATEST
	uniform float u_AlphaTestValue;
#endif


void main()
{
	vec4 color =  u_AlbedoColor;
	#ifdef ALBEDOTEXTURE
		color *= texture2D(u_AlbedoTexture, v_Texcoord0);
	#endif
	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
		color *= v_Color;
	#endif
	
	#ifdef ALPHATEST
		if(color.a < u_AlphaTestValue)
			discard;
	#endif
	
	gl_FragColor = color;
	
	#ifdef FOG
		float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
		#ifdef ADDTIVEFOG
			gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lerpFact);
		#else
			gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
		#endif
	#endif
	
}

