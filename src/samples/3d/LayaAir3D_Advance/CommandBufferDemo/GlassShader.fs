#define SHADER_NAME GlassShaderFS

varying vec2 v_Texcoord0;
varying vec4 v_ScreenTexcoord;

void main()
{
	vec4 color;
	vec4 screenTexColor = texture2D(u_screenTexture,v_ScreenTexcoord.xy/v_ScreenTexcoord.w);
	vec4 tintTexColor = texture2D(u_tintTexure, v_Texcoord0);
	color = mix(screenTexColor, tintTexColor,0.5);
	gl_FragColor = color;
}

