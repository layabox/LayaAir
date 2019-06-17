#ifdef FSHIGHPRECISION
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D u_SplatAlphaTexture;

uniform sampler2D u_DiffuseTexture1;
uniform sampler2D u_DiffuseTexture2;
uniform sampler2D u_DiffuseTexture3;
uniform sampler2D u_DiffuseTexture4;
uniform sampler2D u_DiffuseTexture5;

uniform vec2 u_DiffuseScale1;
uniform vec2 u_DiffuseScale2;
uniform vec2 u_DiffuseScale3;
uniform vec2 u_DiffuseScale4;
uniform vec2 u_DiffuseScale5;

varying vec2 v_Texcoord0;

void main()
{
	#ifdef CUSTOM_DETAIL_NUM1
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r;
	#endif
	#ifdef CUSTOM_DETAIL_NUM2
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r + color2.xyz * (1.0 - splatAlpha.r);
	#endif
	#ifdef CUSTOM_DETAIL_NUM3
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * (1.0 - splatAlpha.r - splatAlpha.g);
	#endif
	#ifdef CUSTOM_DETAIL_NUM4
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);
		vec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScale4);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b);
	#endif
	#ifdef CUSTOM_DETAIL_NUM5
		vec4 splatAlpha = texture2D(u_SplatAlphaTexture, v_Texcoord0);
		vec4 color1 = texture2D(u_DiffuseTexture1, v_Texcoord0 * u_DiffuseScale1);
		vec4 color2 = texture2D(u_DiffuseTexture2, v_Texcoord0 * u_DiffuseScale2);
		vec4 color3 = texture2D(u_DiffuseTexture3, v_Texcoord0 * u_DiffuseScale3);
		vec4 color4 = texture2D(u_DiffuseTexture4, v_Texcoord0 * u_DiffuseScale4);
		vec4 color5 = texture2D(u_DiffuseTexture5, v_Texcoord0 * u_DiffuseScale5);
		gl_FragColor.xyz = color1.xyz * splatAlpha.r  + color2.xyz * splatAlpha.g + color3.xyz * splatAlpha.b + color4.xyz * splatAlpha.a + color5.xyz * (1.0 - splatAlpha.r - splatAlpha.g - splatAlpha.b - splatAlpha.a);
	#endif
}



