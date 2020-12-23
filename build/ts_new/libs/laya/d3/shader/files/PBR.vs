#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif
#include "Lighting.glsl";
#include "LayaUtile.glsl"
#include "Shadow.glsl"
#include "PBRVSInput.glsl";
#include "PBRVertex.glsl";

void main()
{
	vertexForward();
	gl_Position=remapGLPositionZ(gl_Position);
}