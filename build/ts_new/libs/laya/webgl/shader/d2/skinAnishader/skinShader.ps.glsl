precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D texture;
uniform float alpha;
void main() {
	vec4 t_color = texture2D(texture, v_texcoord);
	gl_FragColor = t_color.rgba * v_color;
	gl_FragColor *= alpha;
}