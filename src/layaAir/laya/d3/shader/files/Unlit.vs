#define SHADER_NAME UnlitVS;

#include "Scene.glsl";
#include "Camera.glsl";
#include "MeshVertex.glsl";

void main() {
	VertexParams params;
	initMeshVertexParam(params);
	v_Texcoord0=getTransfomUV(params.texCoord0,u_TilingOffset);
	vec4 positionWS = vec4(params.positionWS, 1.0);
    gl_Position = u_ViewProjection * positionWS;
    gl_Position = remapPositionZ(gl_Position);
}