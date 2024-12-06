#include "TileMapCommon.glsl"

#include "Sprite2DFrag.glsl";

void getVertexInfo(inout vertexInfo info){
    info.pos=v_pos;
    info.color=v_color;
    info.uv=v_texcoord;
}

uniform sampler2D u_render2DTexture;
vec4 getTextureColor(in vec2 uv){
    return texture2D(u_render2DTexture, uv);
}