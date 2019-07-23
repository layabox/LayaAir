#ifdef FSHIGHPRECISION
	precision highp float;
#else
	precision mediump float;
#endif

struct DirectionLight
{
	vec3 Color;
	vec3 Direction;
};

varying vec2 v_Texcoord0;

#ifdef OUTLINETEXTURE
	uniform sampler2D u_OutlineTexture;
#endif
uniform float u_OutlineLightness;

void main()
{
	vec4 outlineTextureColor = vec4(1.0);
	#ifdef OUTLINETEXTURE
		outlineTextureColor = texture2D(u_OutlineTexture, v_Texcoord0);
	#endif
	
	vec3 finalColor = outlineTextureColor.rgb * u_OutlineLightness;
	
	gl_FragColor = vec4(finalColor,0.0);
}
