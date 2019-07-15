#ifdef FSHIGHPRECISION
precision highp float;
#else
precision mediump float;
#endif

varying vec4 v_Color;
varying vec2 v_TextureCoordinate;
uniform sampler2D u_texture;

void main()
{	
	gl_FragColor=texture2D(u_texture,v_TextureCoordinate)*v_Color;
	gl_FragColor.xyz *= v_Color.w;
}