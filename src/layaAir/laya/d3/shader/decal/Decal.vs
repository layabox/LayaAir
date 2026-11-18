#define SHADER_NAME DecalVS

#include "Math.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";
#include "ShadingCommon.glsl";

#ifndef GPU_INSTANCE
uniform vec4 u_DecalUVTransform;
uniform vec4 u_DecalParams;
#endif

varying vec4 v_DecalInverseX;
varying vec4 v_DecalInverseY;
varying vec4 v_DecalInverseZ;
varying vec4 v_DecalUVTransform;
varying vec4 v_DecalParams;

void main()
{
    mat4 world = getWorldMatrix();
    vec3 origin = world[3].xyz;
    // An affine inverse also covers shear inherited from a rotated child of a
    // non-uniformly scaled parent. Avoid inverse() for GLSL/WGSL portability.
    // 仿射逆矩阵也支持非均匀缩放父节点下旋转子节点产生的剪切；
    // 避免使用 inverse()，兼顾 GLSL/WGSL 可移植性。
    vec3 crossYZ = cross(world[1].xyz, world[2].xyz);
    float determinant = dot(world[0].xyz, crossYZ);
    float inverseDeterminant = determinant == 0.0 ? 0.0 : 1.0 / determinant;
    vec3 inverseX = crossYZ * inverseDeterminant;
    vec3 inverseY = cross(world[2].xyz, world[0].xyz) * inverseDeterminant;
    vec3 inverseZ = cross(world[0].xyz, world[1].xyz) * inverseDeterminant;
    v_DecalInverseX = vec4(inverseX, -dot(inverseX, origin));
    v_DecalInverseY = vec4(inverseY, -dot(inverseY, origin));
    v_DecalInverseZ = vec4(inverseZ, -dot(inverseZ, origin));
#ifdef GPU_INSTANCE
    v_DecalUVTransform = a_DecalUVTransform;
    v_DecalParams = a_DecalParams;
#else
    v_DecalUVTransform = u_DecalUVTransform;
    v_DecalParams = u_DecalParams;
#endif
    v_PositionWS = (world * a_Position).xyz;
    v_NormalWS = -normalize(world[2].xyz);
    v_TangentWS = normalize(world[0].xyz);
    v_BiNormalWS = -normalize(world[1].xyz);
#ifdef UV
    v_Texcoord0 = a_Texcoord0;
#endif
#ifdef UV1
    #ifdef LIGHTMAP
    v_Texcoord1 = a_Texcoord1;
    #endif
#endif
#ifdef COLOR
    v_VertexColor = a_Color;
#endif
    gl_Position = remapPositionZ(getPositionCS(v_PositionWS));
    // Keep the volume's exit faces when the projector crosses the far plane.
    // Both GL (-w..w) and Vulkan/WebGPU (0..w) use z=w at the far plane;
    // clamping only z preserves screen coverage and all near/side clipping.
    // The fragment shader still clips against the original projector box.
    // 投射器穿过远裁剪面时保留体积的出射面。GL 的 (-w..w) 与
    // Vulkan/WebGPU 的 (0..w) 均以 z=w 为远面，仅限制 z 可保留屏幕覆盖
    // 及近面、侧面裁剪；片元 Shader 仍按原始投射器盒子裁剪。
    gl_Position.z = min(gl_Position.z, gl_Position.w);
}
