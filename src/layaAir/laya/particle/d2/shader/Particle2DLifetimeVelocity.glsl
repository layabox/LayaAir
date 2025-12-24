#ifdef VELOCITYOVERLIFETIME

vec2 getVelocityOverLifetimeDistance(float normalizedAge, float lifetime)
{
    float minDistanceX = getCurveCalculus(normalizedAge, lifetime, u_VelocityCurveMinX);
    float minDistanceY = getCurveCalculus(normalizedAge, lifetime, u_VelocityCurveMinY);

    float maxDistanceX = getCurveCalculus(normalizedAge, lifetime, u_VelocityCurveMaxX);
    float maxDistanceY = getCurveCalculus(normalizedAge, lifetime, u_VelocityCurveMaxY);

    vec2 minDistance = vec2(minDistanceX, minDistanceY);
    vec2 maxDistance = vec2(maxDistanceX, maxDistanceY);

    vec2 dis = mix(minDistance, maxDistance, vec2(a_Random.y, a_Random.z));

    return dis * vec2(1.0, -1.0);
}

#endif // VELOCITYOVERLIFETIME