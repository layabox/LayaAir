#include "PBRVSShadow.glsl";

void main()
{
	fragmentShadowCaster();
	gl_Position=remapGLPositionZ(gl_Position);
}