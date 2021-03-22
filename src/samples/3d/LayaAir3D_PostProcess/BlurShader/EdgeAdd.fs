#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 v_Texcoord0;
uniform sampler2D u_MainTex;
uniform sampler2D u_sourceTexture0;

void main()
{
    vec2 uv = v_Texcoord0;
    vec4 mainColor = texture2D(u_MainTex,uv);
    vec4 sourceColor = texture2D(u_sourceTexture0,uv);
    float factor = step(sourceColor.x+sourceColor.y+sourceColor.z,0.001);
    vec4 color = mix(sourceColor,mainColor,factor);
    gl_FragColor =color;
}