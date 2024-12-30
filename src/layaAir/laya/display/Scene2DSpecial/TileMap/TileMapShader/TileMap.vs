#define SHADER_NAME TileMap2DVS


#include "TileMapVertex.glsl"

uniform vec2 u_TileSize;

void main(){
    vertexInfo info;
    getVertexInfoTileMap(info);
   
    vec4 wordpos;
    getPosition(info,wordpos);
    setVertexInfo(info);

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(info);
    #endif
    
    gl_Position=wordpos;
}