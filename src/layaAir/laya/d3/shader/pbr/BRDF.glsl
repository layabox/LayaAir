#if !defined(BRDF)
    #define BRDF

// Specular implementations
float D_GGX(float roughness, float NoH, vec3 h, vec3 n)
{
    // todo 精度
    #if !defined(GL_FRAGMENT_PRECISION_HIGH)
    vec3 NxH = cross(n, h);
    float oneMinusNoHSquared = dot(NxH, NxH);
    #else
    float oneMinusNoHSquared = 1.0 - NoH * NoH;
    #endif

    float a = NoH * roughness;
    float k = roughness / (oneMinusNoHSquared + a * a);
    float d = k * k * (1.0 / PI);

    return saturateMediump(d);
}

float V_SmithGGXCorrelated(float roughness, float NoV, float NoL)
{
    float a2 = roughness * roughness;
    float lambdaV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);
    float lambdaL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);
    float v = 0.5 / (lambdaV + lambdaL);

    return saturateMediump(v);
}

vec3 F_Schlick(vec3 f0, float f90, float VoH)
{
    return f0 + (f90 - f0) * pow5(1.0 - VoH);
}

vec3 F_Schlick(vec3 f0, float VoH)
{
    return f0 + (1.0 - f0) * pow5(1.0 - VoH);
}

// Specular dispatch

// D
float distribution(float roughness, float NoH, vec3 h, vec3 n)
{
    return D_GGX(roughness, NoH, h, n);
}

// V
float visibility(float roughness, float NoV, float NoL)
{
    return V_SmithGGXCorrelated(roughness, NoV, NoL);
}

// F
vec3 fresnel(vec3 f0, float LoH)
{
    float f90 = saturate(dot(f0, vec3(50.0 * 0.33)));
    return F_Schlick(f0, f90, LoH);

    // return F_Schlick(f0, LoH);
}

// diffuse BRDF implementations

float Fd_Lambert()
{
    return 1.0 / PI;
}

// diffuse dispatch
float diffuse()
{
    return Fd_Lambert();
}

#endif // BRDF