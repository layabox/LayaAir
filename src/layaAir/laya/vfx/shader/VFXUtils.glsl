uint WangHash(uint seed)
{
    seed = (seed ^ 61u) ^ (seed >> 16u);
    seed *= 9u;
    seed = seed ^ (seed >> 4u);
    seed *= 668265261u;
    seed = seed ^ (seed >> 15u);
    return seed;
}

float toFloat01(uint u)
{
    return uintBitsToFloat((u >> 9) | 1065353216u) - 1.0;
}

// LCG 线性同余生成器
uint Lcg(uint seed)
{
    return 1664525u * seed + 1013904223u;
}

// 有状态随机：每次调用推进 seed，返回 [0, 1)
float Rand(inout uint seed)
{
    seed = Lcg(seed);
    return toFloat01(seed);
}

// 无状态哈希（用于 FixedRand）
uint AnotherHash(uint seed)
{
    seed = ((seed >> 16u) ^ seed) * 73244475u;
    seed = ((seed >> 16u) ^ seed) * 73244475u;
    seed = (seed >> 16u) ^ seed;
    return seed;
}

// 无状态随机：纯函数，相同输入 = 相同输出
float FixedRand(uint seed)
{
    return toFloat01(AnotherHash(seed));
}

// IEEE 754 浮点数 → 保序整数（用于 atomicMin/atomicMax 模拟浮点比较）
// 正浮点 → 正整数（天然保序）
// 负浮点 → 翻转非符号位（修正反序）
int floatToSortableInt(float f)
{
    int i = floatBitsToInt(f);
    return (i >= 0) ? i : (i ^ 2147483647);
}

// 保序整数 → IEEE 754 浮点数（floatToSortableInt 的逆操作）
float sortableIntToFloat(int si)
{
    int i = (si >= 0) ? si : (si ^ 2147483647);
    return intBitsToFloat(i);
}
