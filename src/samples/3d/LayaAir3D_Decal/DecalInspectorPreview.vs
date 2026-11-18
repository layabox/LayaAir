#define SHADER_NAME DecalInspectorPreviewVS

#include "Math.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";
#include "VertexCommon.glsl";

varying vec2 v_PreviewUV;

void main()
{
    Vertex vertex;
    getVertexParams(vertex);
    // Projector V grows upwards, unlike the standard quad's image V.
    // 投射器 V 轴向上增长，与标准四边形的图像 V 方向不同。
    v_PreviewUV = vec2(vertex.texCoord0.x, 1.0 - vertex.texCoord0.y);
    vec4 positionWS = getWorldMatrix() * vec4(vertex.positionOS, 1.0);
    gl_Position = remapPositionZ(getPositionCS(positionWS.xyz / positionWS.w));
}
