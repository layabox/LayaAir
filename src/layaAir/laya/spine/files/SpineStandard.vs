#define SHADER_NAME SpineStandardVS
#include "SpineVertex.glsl"

void main()
{
    vUv = a_texcoord;
    vColor = a_color*u_color;
    vColor.rgb = vColor.rgb*vec3(u_color.a);

    vec4 pos = getSpinePos();
    gl_Position = getScreenPos(pos);
}