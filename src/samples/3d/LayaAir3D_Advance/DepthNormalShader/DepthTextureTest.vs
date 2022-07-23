#define SHADER_NAME DepthTextureTestVS

#include "Color.glsl";

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3D.glsl";

#include "VertexCommon.glsl";

varying vec2 v_Texcoord0;
void main() {
    Vertex vertex;
    getVertexParams(vertex);

    v_Texcoord0 = vertex.texCoord0;
    mat4 worldMat = getWorldMatrix();
    vec3 PositionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;

    gl_Position = getPositionCS(PositionWS);
    gl_Position=remapPositionZ(gl_Position);
}