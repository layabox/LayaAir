// ============================================================
// VFX 渲染端粒子数据结构
// ============================================================
// 与 VFXCommon.glsl 的 RENDER_STRIDE 布局对应:
//   slot 8  (a_AttrPosition):  xyz=position, w=normalizedAge
//   slot 9  (a_AttrColor):     rgba=color
//   slot 10 (a_AttrRotation):  xyzw=rotation (combined quaternion: axis + euler)
//   slot 11 (a_AttrScale):     xyz=scale, w=texIndex
//   slot 12 (a_AttrPivot):     xyz=pivot, w=reserved
// ============================================================

struct VFXParticle {
    vec3 position;
    float normalizedAge;
    vec4 color;
    vec4 rotation;      // combined quaternion (x, y, z, w), identity = (0, 0, 0, 1)
    vec3 scale;
    float texIndex;
    vec3 pivot;
};
