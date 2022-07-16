#define SHADER_NAME SkyBoxVS

#include "Camera.glsl";

const float c_deg2ang = 3.141593 / 180.0;

vec4 rotateAroundYInDegrees(vec4 vertex, float deg)
{
    float angle = deg * c_deg2ang;
    float sina = sin(angle);
    float cosa = cos(angle);
    mat2 m = mat2(cosa, -sina, sina, cosa);
    return vec4(m * vertex.xz, vertex.yw).xzyw;
}

vec4 remapSkyPositionZ(in vec4 position)
{
    position.z = position.w;
    return position;
}

varying vec3 v_Texcoord;

void main()
{
    // todo 这个转换 ？
    v_Texcoord = vec3(-a_Position.x, a_Position.yz); //转换坐标系

    vec4 position = rotateAroundYInDegrees(a_Position, u_Rotation);
    gl_Position = getPositionCS(position.xyz);
    gl_Position = remapSkyPositionZ(position);
}