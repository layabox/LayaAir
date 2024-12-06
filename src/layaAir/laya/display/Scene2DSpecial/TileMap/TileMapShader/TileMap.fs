#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"

void main() {
    vertexInfo info;
    getVertexInfo(info);
    vec4 textureColor = getTextureColor(info.uv);
    gl_FragColor = textureColor*info.color;
}