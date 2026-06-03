#include "VFXUtils.glsl"

// DeadList 管理空闲槽位（栈结构）
buffer DeadListBuffer
{
    uint count;
    uint indices[];
}
DeadList;

// AliveList 存储活跃粒子索引（读缓冲）
buffer AliveListReadBuffer
{
    uint count;
    uint indices[];
}
AliveListRead;

// AliveList 存储活跃粒子索引（写缓冲）
buffer AliveListWriteBuffer
{
    uint count;
    uint indices[];
}
AliveListWrite;

// ============================================================
// 粒子属性布局
// ============================================================
// AttributeBuffer 使用 flat vec4[] 存储，
// 避免 naga (SPIR-V → WGSL) struct 对齐不一致问题。
//
// AttributeBuffer: 每粒子 PARTICLE_STRIDE 个 vec4 (64 bytes):
//   [0] xyz=position,  w=lifetime (寿命，初始化后不变)
//   [1] rgba=color
//   [2] xyz=velocity,  w=size (粒子尺寸)
//   [3] x=age, yzw=(保留)
//
// RenderBuffer: 每粒子 RENDER_STRIDE 个 vec4 (80 bytes):
//   [0] xyz=position,  w=normalizedAge
//   [1] rgba=color
//   [2] xyzw=rotation (combined quaternion, identity = 0,0,0,1)
//   [3] xyz=scale, w=texIndex
//   [4] xyz=pivot, w=(保留)
//
// 存活判定: age < lifetime
// normalizedAge = age / lifetime
// ============================================================

#define PARTICLE_STRIDE 4u
#define RENDER_STRIDE 5u

// Particle 仅用于 shader 内部临时传递，不直接映射 buffer 布局
struct Particle {
    vec3 position;      // 粒子位置
    float lifetime;     // 预期寿命（秒），初始化后不变
    vec4 color;         // RGBA 颜色
    vec3 velocity;      // 速度（系统单位/秒）
    float size;         // 统一尺寸（系统单位）
    float age;          // 自生成以来的年龄（秒）
    bool alive;         // 派生属性（age < lifetime），不参与存储
    vec3 oldPosition;   // 派生属性（readParticle 时快照 position），不参与存储
};

// ---------- Buffer 声明 ----------

// AttributeBuffer: flat vec4 数组，每粒子 PARTICLE_STRIDE 个 vec4
buffer AttributeBuffer
{
    vec4 data[];
}
Attributes;

// ---------- 坐标空间变换 ----------

// 变换位置（含平移）
vec3 transformPosition(mat4 m, vec3 pos)
{
    return (m * vec4(pos, 1.0)).xyz;
}

// 变换方向（不含平移）
vec3 transformDirection(mat4 m, vec3 dir)
{
    return (m * vec4(dir, 0.0)).xyz;
}

// ---------- 粒子读写 (操作 AttributeBuffer) ----------

Particle readParticle(uint particleIndex)
{
    uint base = particleIndex * PARTICLE_STRIDE;
    vec4 v0 = Attributes.data[base];
    vec4 v1 = Attributes.data[base + 1u];
    vec4 v2 = Attributes.data[base + 2u];
    vec4 v3 = Attributes.data[base + 3u];

    Particle p;
    p.position = v0.xyz;
    p.lifetime = v0.w;
    p.color    = v1;
    p.velocity = v2.xyz;
    p.size     = v2.w;
    p.age      = v3.x;
    p.alive    = p.age < p.lifetime;
    p.oldPosition = p.position;
    return p;
}

void writeParticle(uint particleIndex, Particle p)
{
    uint base = particleIndex * PARTICLE_STRIDE;
    Attributes.data[base]      = vec4(p.position, p.lifetime);
    Attributes.data[base + 1u] = p.color;
    Attributes.data[base + 2u] = vec4(p.velocity, p.size);
    Attributes.data[base + 3u] = vec4(p.age, 0.0, 0.0, 0.0);
}

// ---------- 粒子隐式行为 ----------

// 更新粒子隐式行为: velocity 积分 + age 递增 + alive 判定
void updateParticle(inout Particle p, float dt)
{
    p.position += p.velocity * dt;
    p.age += dt;
    p.alive = p.age < p.lifetime;
}

// ---------- 其他 Buffer ----------

buffer PrefixSumBuffer
{
    uint sums[];
}
PrefixSum;

// CPU 事件源属性
struct SourceEventData {
    vec4 color;     // RGBA 颜色
    vec4 velocity;  // xyz: 速度, w: size
};

buffer SourceAttributeBuffer
{
    float spawnCount;
    SourceEventData events[];
}
SourceAttributes;
