#define SHADER_NAME 2DLineVS

#include "Sprite2DVertex.glsl"

varying vec2 v_position;
varying vec4 v_linePionts;
varying float v_lineLength;
varying vec2 v_linedir;
varying vec3 v_dashed;
varying float v_lineWidth;
uniform vec3 u_dashed;
uniform float u_lineWidth;




void lineMat(in vec2 left,in vec2 right,inout vec3 xDir,inout vec3 yDir,float LineWidth){
    vec2 dir=right-left;
   
    float lineLength=length(dir)+LineWidth+2.0;
    dir=normalize(dir);
    xDir.x=dir.x*lineLength;
    yDir.x=dir.y*lineLength;
    
    float lineWidth=LineWidth+2.0;
    xDir.y=-dir.y*LineWidth;
    yDir.y=dir.x*LineWidth;

    xDir.z=(left.x+right.x)*0.5;
    yDir.z=(left.y+right.y)*0.5;
}


void main(){
  
    vec2 oriUV = (a_position.xy + vec2(0.5,0.5));
    //v_texcoord
     oriUV.x = (oriUV.x*length(a_linePos.xy-a_linePos.zw)+a_linelength)/50.0;
    v_texcoord = oriUV;

    vec2 left,right;
    getGlobalPos(a_linePos.xy,left);
    getGlobalPos(a_linePos.zw,right);
    float lengthScale = length(right-left)/length(a_linePos.zw-a_linePos.xy) ;
    v_lineLength = a_linelength*lengthScale;
    v_dashed = vec3(u_dashed.x*lengthScale,u_dashed.y,u_dashed.z*lengthScale);
    v_linePionts=vec4(left,right);
    
    float lineWidth = u_lineWidth*lengthScale;
    v_lineWidth = lineWidth;
    v_linedir = normalize(right - left) * v_lineWidth*0.5;
    vec3 xDir;
    vec3 yDir;
    lineMat(left,right,xDir,yDir,v_lineWidth);
 
    transfrom(a_position.xy,xDir,yDir,v_position);
   
  
    vec2 viewPos;
    getViewPos(v_position,viewPos);
    v_cliped = getClipedInfo(viewPos);
    vec4 pos;
    getProjectPos(viewPos,pos);
    gl_Position = pos;
}