#define SHADER_NAME TileMap2DVS


#include "TileMapVertex.glsl"

uniform vec2 u_TileSize;
uniform vec4 u_clipMatDir;
uniform vec2 u_clipMatPos;

void main(){
    vertexInfo info;
    getVertexInfo(info);
   
    vec4 wordpos;
    getWorldPos(info,wordpos);
    setVertexInfo(info);
    gl_Position=wordpos;
}