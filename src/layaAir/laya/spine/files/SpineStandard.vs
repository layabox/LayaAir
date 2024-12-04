#define SHADER_NAME SpineStandardVS

#include "Sprite2DVertex.glsl";

#include "SpineVertex.glsl";

void main()
{
    vColor.rgb = vColor.rgb*vec3(u_color.a);

    vec4 pos = getSpinePos();
    vertexInfo info;
    getVertexInfo(info);
    v_texcoord = info.uv;
    v_color = info.color;
    gl_Position = getScreenPos(pos);
}