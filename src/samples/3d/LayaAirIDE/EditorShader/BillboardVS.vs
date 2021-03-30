#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";
#include "LayaUtile.glsl";


attribute vec4 a_Position;

attribute vec2 a_Texcoord0;

uniform mat4 u_MvpMatrix;
uniform vec3 u_CameraDirection;
uniform vec3 u_CameraUp;
uniform vec3 u_CameraPos;

varying vec2 v_Texcoord0;

uniform vec4 u_TilingOffset;

void main(){
    vec4 position = a_Position;

    vec3 cameraUpWS = normalize(u_CameraUp);
    vec3 cameraForwardWS = normalize(u_CameraDirection);
    vec3 cameraRightWS = normalize(cross(cameraForwardWS, cameraUpWS));
    position.x = -position.x;
    
    //z无效  BillBoard
    vec3 positionOS= position.x * cameraRightWS;
    positionOS += position.y * cameraUpWS;
    gl_Position = u_MvpMatrix*vec4(positionOS,1.0);
    v_Texcoord0=TransformUV(a_Texcoord0,u_TilingOffset);
    gl_Position=remapGLPositionZ(gl_Position);
}