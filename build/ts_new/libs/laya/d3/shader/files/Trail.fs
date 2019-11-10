#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D u_MainTexture;
uniform vec4 u_MainColor;

varying vec2 v_Texcoord0;
varying vec4 v_Color;

void main()
{
	vec4 color = 2.0 * u_MainColor * v_Color;
	#ifdef MAINTEXTURE
		vec4 mainTextureColor = texture2D(u_MainTexture, v_Texcoord0);
		color *= mainTextureColor;
	#endif
	gl_FragColor = color;
}

     