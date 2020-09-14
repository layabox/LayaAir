#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 v_Texcoord0;
uniform sampler2D u_MainTex;
uniform vec4 u_MainTex_TexelSize;
uniform float u_DownSampleValue;

void main()
{
    vec4 color = vec4(0.0,0.0,0.0,0.0);
    vec2 uv = v_Texcoord0;
    vec2 uvOffset = vec2(0.0,1.0)*u_MainTex_TexelSize.xy*u_DownSampleValue;
    uv = uv - uvOffset*3.0;
    //高斯参数
    color+=0.0205*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.0855*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.232*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.324*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.232*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.0855*texture2D(u_MainTex,uv);
    uv+=uvOffset;
    color+=0.0205*texture2D(u_MainTex,uv);

    gl_FragColor = color;
    

    
}