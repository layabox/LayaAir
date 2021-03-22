#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif
#include "Lighting.glsl";

attribute vec4 a_Position;
uniform mat4 u_ViewProjection;
uniform float u_Rotation;
varying vec3 v_Texcoord;


vec4 rotateAroundYInDegrees (vec4 vertex, float degrees)
{
	float angle = degrees * 3.141593 / 180.0;
	float sina=sin(angle);
	float cosa=cos(angle);
	mat2 m = mat2(cosa, -sina, sina, cosa);
	return vec4(m*vertex.xz, vertex.yw).xzyw;
}
		
void main()
{
	vec4 position=rotateAroundYInDegrees(a_Position,u_Rotation);
	gl_Position = u_ViewProjection*position;
	v_Texcoord=vec3(-a_Position.x,a_Position.yz);//转换坐标系
	gl_Position=remapGLPositionZ(gl_Position);
}
