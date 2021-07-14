#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

#define SHADER_NAME fragment:LensFlaresScreen

uniform sampler2D u_MainTex;
uniform sampler2D u_FlareTex;

varying vec2 v_UV;

void main() {
    vec4 mainColor = texture2D(u_MainTex, v_UV);
    vec4 flareColor = texture2D(u_FlareTex, v_UV);
    vec3 color = mainColor.rgb + flareColor.rgb * flareColor.a;
    gl_FragColor = vec4(color, 1.0);
}