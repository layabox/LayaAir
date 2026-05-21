#define SHADER_NAME TileMap2DVS


#include "TileMapVertex.glsl"

void main(){
    vertexInfo info;
    getVertexInfoTileMap(info);
   
    vec4 wordpos = getPosition(info.pos);
    
    setVertexInfo(info);

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(info);
    #endif
    
    gl_Position=wordpos;
}