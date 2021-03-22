#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 v_Texcoord0;
uniform sampler2D u_MainTex;
uniform vec4 u_MainTex_TexelSize;

void main()
{
    vec4 color = vec4(0.0,0.0,0.0,0.0);
    color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(1.0,0.0));
	color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(-1.0,0.0));
	color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(0.0,-1.0));
	color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(0.0,1.0));
    gl_FragColor = color/4.0;
    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}