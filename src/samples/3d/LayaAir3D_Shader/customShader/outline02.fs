#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif
varying vec2 v_Texcoord0;
varying vec3 v_Normal;

// uniform sampler2D u_AlbedoTexture;


void main()
{
    vec4 albedoTextureColor = vec4(1.0);
    
    albedoTextureColor = texture2D(u_AlbedoTexture, v_Texcoord0);
    gl_FragColor = albedoTextureColor;
}