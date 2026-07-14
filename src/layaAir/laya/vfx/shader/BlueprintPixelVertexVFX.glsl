#if !defined(BlueprintPixelVertexVFX_lib)
    #define BlueprintPixelVertexVFX_lib

    #include "shaderBlueprint/lib/BlueprintPixel.glsl";

    // ============================================================
    // VFX 蓝图 shader 顶点扩展 (Phase 4: 蓝图 +VFX 兼容)
    // ============================================================
    // 自包含: 不 #include "VFXRenderVertex.glsl" — 那个文件由 LayaVisualEffect
    // 运行时 addInclude，IDE shader preview 不认识。把所需 struct/函数 inline 进来。
    //
    // attribute 引脚由 Shader3D Start 头部 attributeMap 提供 (slot 8-12):
    //   a_AttrPosition: xyz=position, w=normalizedAge
    //   a_AttrColor:    rgba=color
    //   a_AttrRotation: xyzw=combined quaternion
    //   a_AttrScale:    xyz=scale, w=texIndex
    //   a_AttrPivot:    xyz=pivot, w=reserved
    //
    // 用法:
    //   Vertex vertex; getVertexParams(vertex);
    //   #ifdef VFX_INSTANCED
    //     vfxTransformVertex(vertex);   // pivot→scale→rotate→translate, 同时旋转 normal/tangent
    //   #endif
    //   PixelParams pixel; initPixelParams(pixel, vertex);
    //
    // ⚠️ 整个 struct + 函数定义都用 #ifdef VFX_INSTANCED 包裹：
    //   shader 走 supportVFX=true 路径时 attributeMap 一律加 slot 8-12，但用户也可能
    //   把这套 shader 挂到普通 MeshRenderer 不走 VFX instance buffer。当 VFX_INSTANCED off,
    //   下面所有 a_AttrPosition 等 attribute 引用完全从源码消失，GLSL→SPIR-V 编译器不会保留
    //   未使用 in 变量声明，WebGPU pipeline 创建不会要求绑定 instance buffer。
    //   不加 #ifdef 包裹时函数定义体保留 attribute 引用，依赖编译器 DCE 行为不可靠。
// Per-particle data 通过 varying 传 fragment shader,
// 让 ShaderGraph 内部用 uniform Float (如 MaskFlipbookIndex) 的 property 能改成 per-particle value.
// ShaderBuild post-process 把 FS 内 uniform name `MaskFlipbookIndex` 等替换成 `v_TexIndex`.
// 转换器 init context 加 setAttribute(texIndex, Random(0, range)) 让 GPU 每粒子写 unique value 到 a_AttrScale.w.
// ⭐声明在 #ifdef VFX_INSTANCED 之外：FS 的 per-particle 替换是无条件文本替换，strip 材质变体
//   (VFX_INSTANCED off，粒子属性走顶点流而非实例 buffer) 下声明若被剥掉而引用仍在 → 编译炸。
//   非实例分支由 ShaderBuild 注入的 #else 写默认值（v_TexIndex=0/v_NormalizedAge=0/v_MainTexRand=0）。
varying float v_TexIndex;

// per-particle ageOverLifetime: 让 SG Disappear/Lifetime/Age 等 uniform 走 per-particle 路径
// (ShaderBuild 把 FS 内 `Disappear` 等 uniform 替换成 v_NormalizedAge varying)
// 直接 0→1 linear 跟随粒子 age, 不是 sampleCurve V 形 (粒子生 visible/老化 fade-out, 没 fade-in 阶段)
// 完整 curve sample 路径后续优化 (vertex 端 sample 256x1 curve texture)
varying float v_NormalizedAge;

    #ifdef VFX_INSTANCED

struct VFXParticle {
    vec3 position;
    float normalizedAge;
    vec4 color;
    vec4 rotation;     // combined quaternion
    vec3 scale;
    float texIndex;
    vec3 pivot;
};

// 四元数旋转: v' = q * v * q^-1
vec3 vfxRotateByQuat(vec3 v, vec4 q)
{
    vec3 t = 2.0 * cross(q.xyz, v);
    return v + q.w * t + cross(q.xyz, t);
}

// 从 instance attribute 读取粒子数据
VFXParticle vfxGetParticle()
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

// 将粒子 TRS 应用到顶点: pivot offset → scale → rotate → translate
// 同时把 rotation 应用到 normal/tangent 让 Lit 链路法线方向跟粒子一致
// p.color 覆盖 vertex.vertexColor 让 FS 端 pixel.vertexColor 拿到粒子色
VFXParticle vfxTransformVertex(inout Vertex vertex)
{
    VFXParticle p = vfxGetParticle();

    // per-particle texIndex 通过 varying 传 fragment, 让 SG shader 内部 uniform 引用 (MaskFlipbookIndex 等) 被 ShaderBuild 替换成 per-particle 路径.
    v_TexIndex = p.texIndex;
    // per-particle normalizedAge: SG Disappear/Lifetime/Age 等 uniform 走 v_NormalizedAge per-particle 异步
    v_NormalizedAge = p.normalizedAge;

    // 1. position
    vec3 vp = vertex.positionOS - p.pivot;
    vp = vp * p.scale;
    vp = vfxRotateByQuat(vp, p.rotation);
    vertex.positionOS = vp + p.position;

    // 2. normal: per-particle rotation 不含 pivot/scale 平移项
    vertex.normalOS = vfxRotateByQuat(vertex.normalOS, p.rotation);

    // 3. tangent: 只有 mesh 声明 tangent 时才合法
    #ifdef TANGENT
    vec3 t = vfxRotateByQuat(vertex.tangentOS.xyz, p.rotation);
    vertex.tangentOS = vec4(t, vertex.tangentOS.w);
    #endif // TANGENT

    // 4. 粒子色 tint 进 vertexColor:
    //    r/g/a 用乘法保 mesh 顶点色语义 (SG_Candle 用 mesh vc.r/g/a 分蜡烛体/蜡池/火焰),
    //    b 通道直接覆盖让粒子色 .b 当 free channel 给 ShaderGraph 传 per-particle 数据
    //    (e.g. mix(orangeWax, tealWax, vertexColor.b) 让 spawnIndex 决定蜡池色)
    #ifdef COLOR
    vertex.vertexColor.r *= p.color.r;
    vertex.vertexColor.g *= p.color.g;
    vertex.vertexColor.b = p.color.b;
    vertex.vertexColor.a *= p.color.a;
    #endif // COLOR

    return p;
}

    #endif // VFX_INSTANCED

#endif // BlueprintPixelVertexVFX_lib
