#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

varying float v_Discard;
varying vec4 v_Color;
varying vec2 v_TextureCoordinate;
uniform sampler2D u_texture;
uniform vec4 u_Tintcolor;

#ifdef RENDERMODE_MESH
	varying vec4 v_MeshColor;
#endif

uniform vec4 u_PickColor;

void main() {
	#ifdef RENDERMODE_MESH
		gl_FragColor=v_MeshColor;
	#else
		gl_FragColor=vec4(1.0);
	#endif

	#ifdef DIFFUSEMAP
		if (v_Discard!=0.0)
			discard;
		#ifdef TINTCOLOR
			gl_FragColor*=texture2D(u_texture,v_TextureCoordinate)*u_Tintcolor*2.0*v_Color;
		#else
			gl_FragColor*=texture2D(u_texture,v_TextureCoordinate)*v_Color;
		#endif
	#else
		#ifdef TINTCOLOR
			gl_FragColor*=u_Tintcolor*2.0*v_Color;
		#else
			gl_FragColor*=v_Color;
		#endif
	#endif

	if (gl_FragColor.a>0.1)
		gl_FragColor = u_PickColor;
	else
		discard;
}