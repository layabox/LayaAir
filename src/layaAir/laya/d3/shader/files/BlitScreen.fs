#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D u_MainTex;
varying vec2 v_Texcoord0;

void main() {
	gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
}

