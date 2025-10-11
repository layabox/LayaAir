#define SHADER_NAME TexMergeFS

#include "Color.glsl";
varying vec2 v_Texcoord0;

void main()
{
    vec4 color = texture2D(u_MainTex, v_Texcoord0);

#ifdef LINEAR_TO_GAMMA
    color.rgb = linearToGamma(color.rgb);
#endif

#ifdef GAMMA_TO_LINEAR
    color.rgb = gammaToLinear(color.rgb);
#endif

   gl_FragColor = color;
}