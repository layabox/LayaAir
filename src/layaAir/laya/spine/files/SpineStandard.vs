#define SHADER_NAME SpineStandardVS

#include "Sprite2DVertex.glsl";

#include "SpineVertex.glsl";

void main()
{
    vec4 pos = getSpinePos();
    vertexInfo info;
    getVertexInfo(pos, info);
    v_texcoord = info.uv;
    v_color = info.color;

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(info);
    #endif

    gl_Position = getScreenPos(pos);
}