#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

#define SHADER_NAME fragment:LensFlares

uniform sampler2D u_FlareTex;
uniform vec4 u_Color;


varying vec2 v_UV;

void main() {
	vec4 flareTex = texture2D(u_FlareTex, v_UV);
	flareTex.xyzw = flareTex.xyzw * flareTex.a;
	// if (flareTex.a > 0.0) {
    	gl_FragColor = flareTex * u_Color;
	// }
	// else {
	// 	gl_FragColor = vec4 (0.0, 0.0, 0.0, 1.0);
	// }
}