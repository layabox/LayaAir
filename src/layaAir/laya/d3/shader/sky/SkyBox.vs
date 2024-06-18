#define SHADER_NAME SkyBoxVS

#include "SkyCommon.glsl";

varying vec3 v_Texcoord;

void main()
{
    // todo 这个转换 ？
    v_Texcoord = vec3(-a_Position.x, a_Position.yz); //转换坐标系

    vec4 position = rotateAroundYInDegrees(a_Position, u_Rotation);
    // gl_Position = getPositionCS(position.xyz);

    gl_Position = u_SkyProjectionViewMat * position;

    gl_Position = remapSkyPositionZ(gl_Position);
}