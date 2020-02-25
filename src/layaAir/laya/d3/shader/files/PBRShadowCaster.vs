#include "ShadowCasterVS.glsl"

void main()
{
	vec4 positionCS =  shadowCasterVertex();
	gl_Position=remapGLPositionZ(positionCS);
}