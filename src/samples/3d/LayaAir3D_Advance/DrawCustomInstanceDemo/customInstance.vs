#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif
#include "Lighting.glsl";
#include "LayaUtile.glsl";

attribute vec4 a_Position;

#ifdef GPU_INSTANCE
	uniform mat4 u_ViewProjection;
	attribute mat4 a_WorldMat;
#else
	uniform mat4 u_MvpMatrix;
#endif

#ifdef GPU_INSTANCE
    attribute vec4 a_InstanceColor;
#endif

varying vec4 v_Color;

void main() {
	vec4 position;
	position=a_Position;
	#ifdef GPU_INSTANCE
		gl_Position = u_ViewProjection * a_WorldMat * position;
	#else
		gl_Position = u_MvpMatrix * position;
	#endif


    #ifdef GPU_INSTANCE
		v_Color =a_InstanceColor;
	#else
		v_Color = vec4(1.0,1.0,1.0,1.0);
	#endif

	gl_Position=remapGLPositionZ(gl_Position);
}