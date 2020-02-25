#include "Lighting.glsl";
#include "Shadow.glsl"
#include "PBRVSInput.glsl";
#include "PBRVertex.glsl";

void main()
{
	vertexForward();
	gl_Position=remapGLPositionZ(gl_Position);
}