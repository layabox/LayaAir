#include "PBRVSShadow.glsl";
void main()
{
	vertexShadowCaster();
	gl_Position=remapGLPositionZ(gl_Position);
}