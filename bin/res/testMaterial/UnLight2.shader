Shader3D Start
{
    type: Shader3D,
    name: UnLight,
    enableInstancing: true,
    supportReflectionProbe: true,
    uniformMap: {
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0] },
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1] },
    },
    shaderPass:[
        {
            pipeline: Forward,
            VS: unlitVS,
            FS: unlitPS,
        },
    ]
}
Shader3D End

GLSL Start
#defineGLSL unlitVS
#define SHADER_NAME UnLight

#include "Camera.glsl";
#include "VertexCommon.glsl";
#include "Sprite3DVertex.glsl";

void main()
{
    Vertex vertex;
    getVertexParams(vertex);
    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;
    gl_Position = getPositionCS(positionWS);
    gl_Position = remapPositionZ(gl_Position);
}
#endGLSL

#defineGLSL unlitPS
#define SHADER_NAME UnLight

void main()
{
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
#endGLSL
GLSL End