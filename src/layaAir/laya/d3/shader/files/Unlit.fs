// #define SHADER_NAME UnlitFS;

// #include "MeshFrag.glsl";


// void main()
// {
// 	vec4 color =  u_AlbedoColor;
// 	#ifdef ALBEDOTEXTURE
// 		color *= texture2D(u_AlbedoTexture, v_Texcoord0);
// 	#endif
	
// 	#if defined(COLOR)&&defined(ENABLEVERTEXCOLOR)
// 		color *= v_VertexColor;
// 	#endif
	
// 	#ifdef ALPHATEST
// 		if(color.a < u_AlphaTestValue)
// 			discard;
// 	#endif
	
// 	gl_FragColor = color;
	
// 	#ifdef FOG
// 		float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);
// 		#ifdef ADDTIVEFOG
// 			gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.0), lerpFact);
// 		#else
// 			gl_FragColor.rgb = mix(gl_FragColor.rgb, u_FogColor, lerpFact);
// 		#endif
// 	#endif
	
// }

