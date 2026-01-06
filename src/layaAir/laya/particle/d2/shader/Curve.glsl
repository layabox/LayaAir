#if !defined(GradientNumber_lib)
#define GradientNumber_lib

float getCurveValue(float time, vec4 curve[2], vec2 range)
{
    vec2 curveDatas[4];
    curveDatas[0] = curve[0].xy;
    curveDatas[1] = curve[0].zw;
    curveDatas[2] = curve[1].xy;
    curveDatas[3] = curve[1].zw;

    float value = 0.0;

    float age = clamp(time, range.x, range.y);

    for (int i = 1; i < 4; i++) {
        vec2 curveData = curveDatas[i];
        vec2 lastCurveData = curveDatas[i - 1];

        float t = (age - lastCurveData.x) / (curveData.x - lastCurveData.x);
        float currentSize = mix(lastCurveData.y, curveData.y, t);

        value = currentSize;

        if (curveData.x >= age) {
            break;
        }
    }

    return value;
}

float getCurveCalculus(float normalizedAge, float lifetime, vec4 curve[2])
{
    vec2 curveDatas[4];
    curveDatas[0] = curve[0].xy;
    curveDatas[1] = curve[0].zw;
    curveDatas[2] = curve[1].xy;
    curveDatas[3] = curve[1].zw;

    float startCurveTime = curveDatas[0].x;
    float startCurveValue = curveDatas[0].y;

    float keyTime = min(normalizedAge, startCurveTime);
    float totalValue = lifetime * keyTime * startCurveValue;

    float lastValue = 0.0;
    for (int i = 1; i < 4; i++) {
        float currentCurveTime = curveDatas[i].x;
        float currentCurveValue = curveDatas[i].y;
        float lastCurveTime = curveDatas[i - 1].x;
        float lastCurveValue = curveDatas[i - 1].y;

        if (currentCurveTime >= normalizedAge) {
            float time = max((normalizedAge - lastCurveTime), 0.0);
            float t = time / (currentCurveTime - lastCurveTime);

            lastValue = mix(lastCurveValue, currentCurveValue, t);

            float calculus = (lastCurveValue + mix(lastCurveValue, currentCurveValue, t)) * time * lifetime * 0.5;
            totalValue += calculus;

            keyTime = normalizedAge;
            break;
        } else if (currentCurveTime > keyTime) {
            float calculus = (lastCurveValue + currentCurveValue) * (currentCurveTime - lastCurveTime) * lifetime * 0.5;
            totalValue += calculus;

            lastValue = lastCurveValue;
            keyTime = currentCurveTime;
        }
    }

    totalValue += max((normalizedAge - keyTime), 0.0) * lifetime * lastValue;
    return totalValue;
}

#endif // GradientNumber_lib