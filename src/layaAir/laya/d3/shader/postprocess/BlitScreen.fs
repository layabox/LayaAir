#include "Color.glsl";
#define SHADER_NAME BlitFS

varying vec2 v_Texcoord0;

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
#ifdef GAMMAOUT
    gl_FragColor = linearTosRGB(gl_FragColor);
#endif
}
