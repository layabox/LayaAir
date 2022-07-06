#define SHADER_NAME BlitFS

varying vec2 v_Texcoord0;

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
}
