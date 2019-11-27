#include "PBRVSInput.glsl";
#include "Lighting.glsl";
#include "PBRVertex.glsl";

void main()
{
	#ifdef CASTSHADOW
		main_castShadow();
	#else
		vertexForward();
	#endif
	gl_Position=remapGLPositionZ(gl_Position);
}