#if !defined(GradientNumber_lib)
#define GradientNumber_lib

float getCurveValue(float time, vec4 curve[PARTICLE2D_GRADIENT_VEC4_COUNT], vec2 range)
{
    vec2 curveDatas[PARTICLE2D_GRADIENT_KEY_COUNT];
    curveDatas[0] = curve[0].xy;
    curveDatas[1] = curve[0].zw;
    curveDatas[2] = curve[1].xy;
    curveDatas[3] = curve[1].zw;
#ifdef GRADIENTKEYCOUNT_8
    curveDatas[4] = curve[2].xy;
    curveDatas[5] = curve[2].zw;
    curveDatas[6] = curve[3].xy;
    curveDatas[7] = curve[3].zw;
#endif

    float age = clamp(time, range.x, range.y);
    float value = curveDatas[0].y;
    for (int i = 1; i < PARTICLE2D_GRADIENT_KEY_COUNT; i++) {
        vec2 current = curveDatas[i];
        vec2 previous = curveDatas[i - 1];
        // Unused entries are zero-filled; they do not form another segment.
        if (current.x <= previous.x)
            break;
        if (age <= current.x) {
            float t = (age - previous.x) / (current.x - previous.x);
            return mix(previous.y, current.y, t);
        }
        value = current.y;
    }
    return value;
}

float getCurveCalculus(float normalizedAge, float lifetime, vec4 curve[PARTICLE2D_GRADIENT_VEC4_COUNT])
{
    vec2 curveDatas[PARTICLE2D_GRADIENT_KEY_COUNT];
    curveDatas[0] = curve[0].xy;
    curveDatas[1] = curve[0].zw;
    curveDatas[2] = curve[1].xy;
    curveDatas[3] = curve[1].zw;
#ifdef GRADIENTKEYCOUNT_8
    curveDatas[4] = curve[2].xy;
    curveDatas[5] = curve[2].zw;
    curveDatas[6] = curve[3].xy;
    curveDatas[7] = curve[3].zw;
#endif

    float keyTime = min(normalizedAge, curveDatas[0].x);
    float lastValue = curveDatas[0].y;
    float totalValue = lifetime * keyTime * lastValue;
    for (int i = 1; i < PARTICLE2D_GRADIENT_KEY_COUNT; i++) {
        vec2 current = curveDatas[i];
        vec2 previous = curveDatas[i - 1];
        if (current.x <= previous.x)
            break;

        float time = max(min(normalizedAge, current.x) - previous.x, 0.0);
        float t = time / (current.x - previous.x);
        lastValue = mix(previous.y, current.y, t);
        totalValue += (previous.y + lastValue) * time * lifetime * 0.5;
        keyTime = max(keyTime, min(normalizedAge, current.x));
        if (current.x >= normalizedAge)
            break;
    }
    totalValue += max(normalizedAge - keyTime, 0.0) * lifetime * lastValue;
    return totalValue;
}

#endif // GradientNumber_lib
