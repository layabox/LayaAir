precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D texture;
uniform float alpha;

vec4 sampleTexture(sampler2D texture,vec2 uv){
   vec4 color = texture2D(texture,uv);
   #ifdef GAMMASPACE
      color.xyz = color.xyz*color.xyz;
   #endif
   return color;
}

void main() {
	vec4 t_color = sampleTexture(texture, v_texcoord);
	gl_FragColor = t_color.rgba * v_color;
	gl_FragColor *= alpha;
}