#define SHADER_NAME BlurDownSample
varying vec2 v_Texcoord0;

void main()
{
    vec4 color = vec4(0.0,0.0,0.0,0.0);
    color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(1.0,0.0));
	color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(-1.0,0.0));
	color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(0.0,-1.0));
    color += texture2D(u_MainTex,v_Texcoord0+u_MainTex_TexelSize.xy*vec2(0.0,1.0));
    gl_FragColor = color/4.0;
    // gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}