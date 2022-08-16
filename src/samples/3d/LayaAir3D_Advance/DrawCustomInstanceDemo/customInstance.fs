#define SHADER_NAME CustomInstanceFS
#include "Color.glsl";

varying vec4 v_Color;

void main()
{
	vec4 color =  v_Color;
	color = color;
	gl_FragColor.rgb = color.rgb;
}

