#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

varying vec2 v_Texcoord0;
uniform sampler2D u_sourceTexture0;
uniform sampler2D u_sourceTexture1;

void main()
{
    vec2 uv = v_Texcoord0;
    vec4 blurColor = texture2D(u_sourceTexture0,uv);
    vec4 clearColor = texture2D(u_sourceTexture1,uv);
    float factor = step(clearColor.x+clearColor.y+clearColor.z,0.001);
    vec4 color = blurColor*factor;
    color = (1.0-step(color.x+color.y+color.z,0.15))*vec4(1.0,0.0,0.0,1.0);
    gl_FragColor = color;
}