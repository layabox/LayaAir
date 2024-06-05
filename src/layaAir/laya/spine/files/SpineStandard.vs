#define SHADER_NAME SpineStandardVS
#include "SpineVertex.glsl"

void main()
{
    vUv = a_texcoord;
    vColor = a_color*u_color;
    vec4 pos = getSpinePos();
    gl_Position = getScreenPos(pos);
}