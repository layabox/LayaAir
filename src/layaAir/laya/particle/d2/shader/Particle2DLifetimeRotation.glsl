#ifdef ROTATIONOVERLIFETIME

const float Angle2Radian = 0.01745329252;

float getRotationOverLifetime(float normalizedAge, float lifetime)
{
    float minRotation = getCurveCalculus(normalizedAge, lifetime, u_RotationCurveMin);
    float maxRotation = getCurveCalculus(normalizedAge, lifetime, u_RotationCurveMax);

    return mix(minRotation * -1.0 * Angle2Radian, maxRotation * -1.0 * Angle2Radian, a_Random.w);
}

#endif // ROTATIONOVERLIFETIME