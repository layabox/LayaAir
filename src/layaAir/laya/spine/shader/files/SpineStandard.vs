#define SHADER_NAME SpineStandardVS

#include "Sprite2DVertex.glsl";

#include "SpineVertex.glsl";

varying vec4 v_color2;

void main()
{
    vec4 pos = getSpinePos();
    vertexInfo info;
    getVertexInfo(pos, info);
    v_texcoord = info.uv;
    v_color = info.color;
    
    #ifdef COLOR2
        v_color2 = a_color2;
    #else
        v_color2 = vec4(0.0, 0.0, 0.0, 1.0);
    #endif

    #ifdef PREMULTIPLYALPHA
        v_color2.xyz = v_color2.xyz * v_color.a;
    #endif

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(info);
    #endif

    gl_Position = getScreenPos(pos);
}