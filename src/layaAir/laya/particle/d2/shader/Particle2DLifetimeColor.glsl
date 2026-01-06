#ifdef COLOROVERLIFETIME

#ifdef COLOROVERLIFETIME_COLORKEY_8

vec4 getColorFromGradient(float normalizedAge, vec4 gradientRGB[8], vec4 gradientAlpha[4], vec4 range)
{
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    vec2 colorRange = range.xy;
    float colorAge = clamp(normalizedAge, colorRange.x, colorRange.y);

    for (int i = 1; i < 8; i++) {
        vec4 currentRGB = gradientRGB[i];
        vec4 lastRGB = gradientRGB[i - 1];
        if (currentRGB.x >= colorAge) {
            float t = (colorAge - lastRGB.x) / (currentRGB.x - lastRGB.x);
            color.rgb = mix(lastRGB.yzw, currentRGB.yzw, t);
            break;
        }
    }

    vec2 alphaRange = range.zw;
    float alphaAge = clamp(normalizedAge, alphaRange.x, alphaRange.y);

    vec2 alphas[8];
    alphas[0] = gradientAlpha[0].xy;
    alphas[1] = gradientAlpha[0].zw;
    alphas[2] = gradientAlpha[1].xy;
    alphas[3] = gradientAlpha[1].zw;
    alphas[4] = gradientAlpha[2].xy;
    alphas[5] = gradientAlpha[2].zw;
    alphas[6] = gradientAlpha[3].xy;
    alphas[7] = gradientAlpha[3].zw;

    for (int i = 1; i < 8; i++) {
        vec2 currentAlpha = alphas[i];
        vec2 lastAlpha = alphas[i - 1];
        if (currentAlpha.x >= alphaAge) {
            float t = (alphaAge - lastAlpha.x) / (currentAlpha.x - lastAlpha.x);
            color.a = mix(lastAlpha.y, currentAlpha.y, t);
            break;
        }
    }

    return color;
}

#else // COLOROVERLIFETIME_COLORKEY_8

vec4 getColorFromGradient(float normalizedAge, vec4 gradientRGB[4], vec4 gradientAlpha[2], vec4 range)
{
    vec4 color = vec4(1.0, 1.0, 1.0, 1.0);

    vec2 colorRange = range.xy;
    float colorAge = clamp(normalizedAge, colorRange.x, colorRange.y);

    for (int i = 1; i < 4; i++) {
        vec4 currentRGB = gradientRGB[i];
        vec4 lastRGB = gradientRGB[i - 1];
        if (currentRGB.x >= colorAge) {
            float t = (colorAge - lastRGB.x) / (currentRGB.x - lastRGB.x);
            color.rgb = mix(lastRGB.yzw, currentRGB.yzw, t);
            break;
        }
    }

    vec2 alphaRange = range.zw;
    float alphaAge = clamp(normalizedAge, alphaRange.x, alphaRange.y);

    vec2 alphas[4];
    alphas[0] = gradientAlpha[0].xy;
    alphas[1] = gradientAlpha[0].zw;
    alphas[2] = gradientAlpha[1].xy;
    alphas[3] = gradientAlpha[1].zw;

    for (int i = 1; i < 4; i++) {
        vec2 currentAlpha = alphas[i];
        vec2 lastAlpha = alphas[i - 1];
        if (currentAlpha.x >= alphaAge) {
            float t = (alphaAge - lastAlpha.x) / (currentAlpha.x - lastAlpha.x);
            color.a = mix(lastAlpha.y, currentAlpha.y, t);
            break;
        }
    }

    return color;
}

#endif // COLOROVERLIFETIME_COLORKEY_8

vec4 getColorOverLifetime(float normalizedAge)
{
#ifdef COLOROVERLIFETIME_RANDOM
    vec4 minColor = getColorFromGradient(normalizedAge, u_GradientRGB, u_GradientAlpha, u_GradientTimeRange);
    vec4 maxColor = getColorFromGradient(normalizedAge, u_GradientMaxRGB, u_GradientMaxAlpha, u_GradientMaxTimeRange);
    return mix(minColor, maxColor, a_Random.x);
#else // COLOROVERLIFETIME_RANDOM
    return getColorFromGradient(normalizedAge, u_GradientRGB, u_GradientAlpha, u_GradientTimeRange);
#endif // COLOROVERLIFETIME_RANDOM
}

#endif // COLOROVERLIFETIME