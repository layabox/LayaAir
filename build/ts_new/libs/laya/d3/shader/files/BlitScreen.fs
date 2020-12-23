#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D u_MainTex;
varying vec2 v_Texcoord0;

void main() {
	gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
}

