#ifdef SIZEOVERLIFETIME

vec2 getSizeOverLifetime(float normalizedAge)
{
    float minSizeX = getCurveValue(normalizedAge, u_SizeCurveMinX, u_SizeCurveMinTimeRange.xy);
    float minSizeY = getCurveValue(normalizedAge, u_SizeCurveMinY, u_SizeCurveMinTimeRange.zw);

    float maxSizeX = getCurveValue(normalizedAge, u_SizeCurveMaxX, u_SizeCurveMaxTimeRange.xy);
    float maxSizeY = getCurveValue(normalizedAge, u_SizeCurveMaxY, u_SizeCurveMaxTimeRange.zw);

    vec2 minSize = vec2(minSizeX, minSizeY);
    vec2 maxSize = vec2(maxSizeX, maxSizeY);

    vec2 size = mix(minSize, maxSize, vec2(a_Random1.xy));

    return size;
}

#endif // SIZEOVERLIFETIME