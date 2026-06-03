// ============================================================
// VFX 渲染端顶点变换
// ============================================================
// 依赖: VFXRenderCommon.glsl (提供 VFXParticle 结构体)
//
// 从 instance vertex attributes 读取粒子渲染数据，
// 与 VFXCommon.glsl 的 RENDER_STRIDE 布局对应:
//   slot 8  (a_AttrPosition):  xyz=position, w=normalizedAge
//   slot 9  (a_AttrColor):     rgba=color
//   slot 10 (a_AttrRotation):  xyzw=rotation (combined quaternion: axis + euler)
//   slot 11 (a_AttrScale):     xyz=scale, w=texIndex
//   slot 12 (a_AttrPivot):     xyz=pivot, w=reserved
//
// Transform order:
//   1. offset by -pivot
//   2. scale by scale
//   3. rotate by combined quaternion
//   4. translate to position
//
// Orient/Billboard 计算已移至 compute shader 端 (Output 阶段)，
// 顶点着色器只做标准 TRS 变换。
//
// 使用方式:
//   Vertex vertex;
//   getVertexParams(vertex);
//   VFXParticle p = vfxProcessVertex(vertex);
//   mat4 worldMat = getWorldMatrix();
//   vec3 positionWS = vfxWorldPosition(vertex, worldMat);
// ============================================================

#include "VFXRenderCommon.glsl";

// 四元数旋转向量: v' = q * v * q^-1
vec3 rotateByQuat(vec3 v, vec4 q)
{
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w * t + cross(q.xyz, t);
}

// 从 instance vertex attributes 读取粒子数据
VFXParticle getVFXParticle()
{
    VFXParticle p;
    p.position      = a_AttrPosition.xyz;
    p.normalizedAge = a_AttrPosition.w;
    p.color         = a_AttrColor;
    p.rotation      = a_AttrRotation;
    p.scale         = a_AttrScale.xyz;
    p.texIndex      = a_AttrScale.w;
    p.pivot         = a_AttrPivot.xyz;
    return p;
}

// 将粒子变换应用到 Vertex (pivot→scale→rotate→translate)
VFXParticle vfxProcessVertex(inout Vertex vertex)
{
    VFXParticle p = getVFXParticle();
    vec3 v = vertex.positionOS - p.pivot;   // 1. pivot offset
    v = v * p.scale;                        // 2. scale
    v = rotateByQuat(v, p.rotation);        // 3. rotate
    vertex.positionOS = v + p.position;     // 4. translate
    return p;
}

// Local → World 变换
vec3 vfxWorldPosition(Vertex vertex, mat4 worldMat)
{
    vec4 pos = worldMat * vec4(vertex.positionOS, 1.0);
    return pos.xyz / pos.w;
}
