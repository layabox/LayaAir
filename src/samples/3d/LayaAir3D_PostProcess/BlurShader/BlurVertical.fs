#define SHADER_NAME BlurVertical
varying vec2 v_Texcoord0;

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