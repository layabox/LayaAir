#include "PBRVSInput.glsl";
#include "Lighting.glsl";
#include "PBRVertex.glsl";

void main()
{
	vertexForward();
	gl_Position=remapGLPositionZ(gl_Position);
}