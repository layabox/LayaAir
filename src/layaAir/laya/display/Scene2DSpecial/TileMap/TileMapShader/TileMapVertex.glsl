
#include "Sprite2DVertex.glsl";

#include "TileMapCommon.glsl";

vec2 getVertexPos(){
    float x=a_cellPosScale.x+a_position.x*a_cellPosScale.z;
    float y=a_cellPosScale.y+a_position.y*a_cellPosScale.w;
    return vec2(x,y);
}

vec2 getVertexUv(){
    float u=a_cellUVOriScale.z*dot(a_texcoord,a_celluvTrans.xy)+a_cellUVOriScale.x;
    float v=a_cellUVOriScale.w*dot(a_texcoord,a_celluvTrans.zw)+a_cellUVOriScale.y;
    return vec2(u,v);
}

vec4 getVertexColor(){
    return a_color*a_cellColor;
}

void getVertexInfoTileMap(inout vertexInfo info){
    info.pos=getVertexPos();
    info.color=getVertexColor();
    info.uv=getVertexUv();

    #ifdef LIGHT2D_ENABLE
        vec2 global;
        getGlobalPos(info.pos, global);
        info.lightUV.x = (global.x - u_LightAndShadow2DParam.x) / u_LightAndShadow2DParam.z;
        info.lightUV.y = 1.0 - (global.y - u_LightAndShadow2DParam.y) / u_LightAndShadow2DParam.w;
    #endif
}

void getPosition(in vertexInfo info , inout vec4 pos){
    vec2 a_pos=info.pos;
    vec2 globalPos;
    getGlobalPos(a_pos.xy,globalPos);
    vec2 viewPos;
    getViewPos(globalPos,viewPos);
    v_cliped = getClipedInfo(viewPos);
    getProjectPos(viewPos,pos);
}

void setVertexInfo(in vertexInfo info){
    v_texcoord=info.uv;
    v_color=info.color;
    v_pos=info.pos;
}