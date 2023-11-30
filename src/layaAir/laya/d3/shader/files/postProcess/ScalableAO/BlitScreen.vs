#define SHADER_NAME ScalableAO

#include "Camera.glsl";
#include "Math.glsl";

varying vec2 v_Texcoord0;
varying mat4 v_inverseView;
varying mat4 v_inverseProj;

void main()
{
    gl_Position = vec4(u_OffsetScale.x * 2.0 - 1.0 + (a_PositionTexcoord.x + 1.0) * u_OffsetScale.z, (1.0 - ((u_OffsetScale.y * 2.0 - 1.0 + (-a_PositionTexcoord.y + 1.0) * u_OffsetScale.w) + 1.0) / 2.0) * 2.0 - 1.0, 0.0, 1.0);
    v_Texcoord0 = a_PositionTexcoord.zw;
    gl_Position = remapPositionZ(gl_Position);

    v_inverseView = inverse(u_View);
    v_inverseProj = inverse(u_Projection);
}