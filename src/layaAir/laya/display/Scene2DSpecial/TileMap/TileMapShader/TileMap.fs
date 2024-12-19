#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"

void main() {
    vertexInfo info;
    getVertexInfo(info);
    vec4 textureColor = getTextureColor(info.uv);

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(textureColor);
    #endif
    
    gl_FragColor = textureColor*info.color;
}