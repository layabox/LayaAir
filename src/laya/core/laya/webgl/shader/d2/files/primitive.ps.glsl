precision mediump float;
//precision mediump float;
varying vec4 color;
//uniform float alpha;
varying vec2 cliped;
void main(){
	//vec4 a=vec4(color.r, color.g, color.b, 1);
	//a.a*=alpha;
    gl_FragColor= color;// vec4(color.r, color.g, color.b, alpha);
	gl_FragColor.rgb*=color.a;
	if(cliped.x<0.) discard;
	if(cliped.x>1.) discard;
	if(cliped.y<0.) discard;
	if(cliped.y>1.) discard;
}