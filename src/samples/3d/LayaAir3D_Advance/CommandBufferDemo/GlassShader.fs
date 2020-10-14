#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D u_tintTexure;
uniform sampler2D u_screenTexture;
varying vec2 v_Texcoord0;
uniform float u_tintAmount;
varying vec2 v_ScreenTexcoord;

void main()
{
	vec4 color;
	color =mix(texture2D(u_screenTexture,v_ScreenTexcoord),texture2D(u_tintTexure, v_Texcoord0),0.5);

	gl_FragColor = color;
}

