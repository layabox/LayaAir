#include "TileMapCommon.glsl"

#include "Sprite2DFrag.glsl";

uniform sampler2D u_render2DTexture;
vec4 getTextureColor(in vec2 uv){
    return texture2D(u_render2DTexture, uv);
}