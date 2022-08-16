#define SeparableSSSRenderFS
varying vec2 v_Texcoord0;
varying vec4 v_ScreenTexcoord;

void main()
{
	vec4 color;
	color =texture2D(sssssDiffuseTexture,v_ScreenTexcoord.xy/v_ScreenTexcoord.w)+texture2D(sssssSpecularTexture, v_ScreenTexcoord.xy/v_ScreenTexcoord.w);

	gl_FragColor = color;
}

