
#include "TileMapCommon.glsl"
varying vec2 v_cliped;
uniform vec2 u_baseRenderSize2D;

uniform vec3 u_NMatrix_0;
uniform vec3 u_NMatrix_1;


vec2 getVertexPos(){
    float x=a_cellPosScale.x+a_posuv.x*a_cellPosScale.z;
    float y=a_cellPosScale.y+a_posuv.y*a_cellPosScale.w;
    return vec2(x,y);
}

vec2 getVertexUv(){
    vec2 uv=a_posuv.zw;
    float u=a_cellUVOriScale.z*dot(uv,a_celluvTrans.xy)+a_cellUVOriScale.x;
    float v=a_cellUVOriScale.w*dot(uv,a_celluvTrans.zw)+a_cellUVOriScale.y;
    return vec2(u,v);
}

vec4 getVertexColor(){
    return a_color*a_cellColor;
}

void getVertexInfo(inout vertexInfo info){
    info.pos=getVertexPos();
    info.color=getVertexColor();
    info.uv=getVertexUv();
}

void getWorldPos(in vertexInfo info,inout vec4 pos){
    vec2 vpos = info.pos;
    float x=u_NMatrix_0.x*vpos.x+u_NMatrix_0.y*vpos.y+u_NMatrix_0.z;
    float y=u_NMatrix_1.x*vpos.x+u_NMatrix_1.y*vpos.y+u_NMatrix_1.z;
    pos=vec4((x/u_baseRenderSize2D.x-.5)*2.,(.5-y/u_baseRenderSize2D.y)*2.,0.,1.);
}


void setVertexInfo(in vertexInfo info){
    v_texcoord=info.uv;
    v_color=info.color;
    v_pos=info.pos;
}