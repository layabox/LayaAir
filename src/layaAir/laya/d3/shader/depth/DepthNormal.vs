#define SHADER_NAME DepthNormalVS

#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "VertexCommon.glsl";

//传入法线
varying vec4 v_depthNormals;

vec4 depthNormalsVertex()
{
    Vertex vertex;
    getVertexParams(vertex);

    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;

    mat4 normalMat = transpose(inverse(worldMat));
    vec3 normalWS = normalize((normalMat * vec4(vertex.normalOS, 0.0)).xyz);

    //存储View空间法线
    vec3 normalVS = mat3(u_View) * normalWS;
    v_depthNormals.xyz = normalVS;

    vec4 positionCS = u_ViewProjection * vec4(positionWS, 1.0);
    v_depthNormals.w = (positionCS.z * 2.0 - positionCS.w) * u_ProjectionParams.w;

    return positionCS;
}

void main()
{
    vec4 positionCS = depthNormalsVertex();
    gl_Position = remapPositionZ(positionCS);
}