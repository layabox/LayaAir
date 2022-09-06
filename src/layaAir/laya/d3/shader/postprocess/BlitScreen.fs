#define SHADER_NAME BlitFS

#include "Color.glsl";
#include "FastApproximateAntiAliasing.glsl";

varying vec2 v_Texcoord0;

void main()
{
#ifdef FXAA
    gl_FragColor = FXAAMain(u_MainTex,v_Texcoord0,u_MainTex_TexelSize.zw);
#else
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
#endif
    
#ifdef GAMMAOUT
    gl_FragColor = linearToGamma(gl_FragColor);
#endif
    //gl_FragColor.rgb = FXAAMain(u_MainTex,v_Texcoord0,u_MainTex_TexelSize.zw);
}
