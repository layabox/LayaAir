#define SHADER_NAME BlitFS

#include "Color.glsl";
#include "FastApproximateAntiAliasing.glsl";

varying vec2 v_Texcoord0;

void main()
{
#ifdef FXAA
    gl_FragColor = FXAAMain(v_Texcoord0, u_MainTex_TexelSize.zw);
#else
    vec4 mainColor = texture2D(u_MainTex, v_Texcoord0);
    #ifdef Gamma_u_MainTex
    mainColor = gammaToLinear(mainColor);
    #endif // Gamma_u_AlbedoTexture
    gl_FragColor = mainColor;
#endif

    gl_FragColor = outputTransform(gl_FragColor);
}
