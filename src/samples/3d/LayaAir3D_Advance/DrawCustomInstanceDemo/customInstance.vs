#define SHADER_NAME CustomInstanceVS
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";
#include "Color.glsl";
varying vec4 v_Color;
void main() {
	Vertex vertex;
	getVertexParams(vertex);
	mat4 worldMat = getWorldMatrix();
	vec3 positionWS = (worldMat *vec4(vertex.positionOS, 1.0)).xyz; 
	gl_Position = getPositionCS(positionWS);

    #ifdef GPU_INSTANCE
		v_Color = gammaToLinear(a_InstanceColor);
	#else
		v_Color = gammaToLinear(vec4(1.0,1.0,1.0,1.0));
	#endif

	gl_Position=remapPositionZ(gl_Position);
}