#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "SkyUtil.glsl";

uniform mat4 u_ViewProjection;
attribute vec4 a_Position;
varying vec3 skyColor;

vec4 remapGLPositionZ(vec4 position) {
	position.z=position.z * 2.0 - position.w;
	return position;
}


void main(){
    vec3 vertex = normalize(a_Position.xyz);
    skyColor = vertex;
    gl_Position = u_ViewProjection*a_Position;
    gl_Position=skyRemapGLPositionZ(gl_Position);
}