#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#ifdef COLOR
	varying vec4 v_Color;
#endif
varying vec2 v_Texcoord0;

#ifdef MAINTEXTURE
	uniform sampler2D u_AlbedoTexture;
#endif

uniform vec4 u_AlbedoColor;

#ifdef FOG
	uniform float u_FogStart;
	uniform float u_FogRange;
	#ifdef ADDTIVEFOG
	#else
		uniform vec3 u_FogColor;
	#endif
#endif

void main()
{
	vec4 color =  2.0 * u_AlbedoColor;
	#ifdef COLOR
		color *= v_Color;
	#endif
	#ifdef MAINTEXTURE
		color *= texture2D(u_AlbedoTexture, v_Texcoord0);
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

