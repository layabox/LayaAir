#define HALF_MAX       65504.0 // (2 - 2^-10) * 2^15

#define FLT_EPSILON    1.192092896e-07 // Smallest positive number, such that 1.0 + FLT_EPSILON != 1.0

mediump vec4 safeHDR(mediump vec4 c)
{
    return min(c, HALF_MAX);
}

float max3(float a, float b, float c)
{
    return max(max(a, b), c);
}

vec3 positivePow(vec3 base, vec3 power)
{
    return pow(max(abs(base), vec3(FLT_EPSILON, FLT_EPSILON, FLT_EPSILON)), power);
}