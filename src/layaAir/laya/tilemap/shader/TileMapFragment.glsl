#include "TileMapCommon.glsl"

#include "Sprite2DFrag.glsl";

// u_render2DTexture 已在 TileMapShaderInit 的 uniformMap 中注册，由引擎生成声明，此处不再声明。
vec4 getTextureColor(in vec2 uv){
    return texture2D(u_render2DTexture, uv);
}