// #define SHADER_NAME UNLITVS;

// #include "Scene.glsl";
// #include "Camera.glsl";
// #include "MeshVertex.glsl";

// void main() {
// 	Vertex vertex;
//     getVertexParams(vertex);

// 	v_Texcoord0=transformUV(vertex.texCoord0,u_TilingOffset);
	
// 	mat4 worldMat = getWorldMatrix();
// 	vec4 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

// 	vec4 positionWS = vec4(params.positionWS, 1.0);
    
//     gl_Position = remapPositionZ(u_ViewProjection * positionWS);
// }