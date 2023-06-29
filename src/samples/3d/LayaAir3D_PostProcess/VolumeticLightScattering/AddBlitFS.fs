#define SHADER_NAME AddBlitFS
varying vec2 v_Texcoord0;

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0)+texture2D(u_addTexture,v_Texcoord0);
}
