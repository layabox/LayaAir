#define SHADER_NAME SpineStandardVS
#include "SpineVertex.glsl"

void main()
{
    vUv = a_texcoord;
    vColor = a_color*u_color;

    #ifdef PREMULTIPLYALPHA
        vColor.rgb = vColor.rgb * vColor.a;
    #endif

    vec4 pos = getSpinePos();
    gl_Position = getScreenPos(pos);
}