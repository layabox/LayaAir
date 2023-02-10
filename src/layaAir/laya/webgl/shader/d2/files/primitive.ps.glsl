precision mediump float;
//precision mediump float;
varying vec4 color;
//uniform float alpha;
varying vec2 cliped;

vec3 gammaToLinear(in vec3 value)
{
    return pow((value + 0.055) / 1.055, vec3(2.4));
}

vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}

void main(){
	//vec4 a=vec4(color.r, color.g, color.b, 1);
	//a.a*=alpha;
	#ifdef GAMMASPACE
    	gl_FragColor= color;// vec4(color.r, color.g, color.b, alpha);
	#else
		gl_FragColor= gammaToLinear(color);
	#endif
	gl_FragColor.rgb*=color.a;
	if(cliped.x<0.) discard;
	if(cliped.x>1.) discard;
	if(cliped.y<0.) discard;
	if(cliped.y>1.) discard;
}