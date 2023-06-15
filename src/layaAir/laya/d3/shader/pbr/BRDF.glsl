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
    float d = k * k * INVERT_PI;

    return saturateMediump(d);
}

float D_GGX_Anisotropic(float NoH, const vec3 h, const vec3 t, const vec3 b, float at, float ab)
{
    float ToH = dot(t, h);
    float BoH = dot(b, h);
    float a2 = at * ab;
    highp vec3 v = vec3(ab * ToH, at * BoH, a2 * NoH);
    highp float v2 = dot(v, v);
    float w2 = a2 / v2;
    return a2 * w2 * w2 * INVERT_PI;
}

float D_Charlie(float roughness, float NoH)
{
    float invR = 1.0 / roughness;
    float cos2h = NoH * NoH;
    float sin2h = max(1.0 - cos2h, 0.0078125);
    return (2.0 + invR) * pow(sin2h, invR * 0.5) * 0.5 * INVERT_PI;
}

float V_SmithGGXCorrelated(float roughness, float NoV, float NoL)
{
    float a2 = roughness * roughness;
    float lambdaV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);
    float lambdaL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);
    float v = 0.5 / (lambdaV + lambdaL);

    return saturateMediump(v);
}

float V_SmithGGXCorrelated_Fast(float roughness, float NoV, float NoL)
{
    float v = 0.5 / mix(2.0 * NoL * NoV, NoL + NoV, roughness);
    return saturateMediump(v);
}

// Kelemen 2001, "A Microfacet Based Coupled Specular-Matte BRDF Model with Importance Sampling"
float V_kelemen(float LoH)
{
    return saturateMediump(0.25 / (LoH * LoH));
}

float lCharlieNumericHelper(float x, float alphaG)
{
    float oneMinusAlphaSq = (1.0 - alphaG) * (1.0 - alphaG);
    float a = mix(21.5473, 25.3245, oneMinusAlphaSq);
    float b = mix(3.82987, 3.32435, oneMinusAlphaSq);
    float c = mix(0.19823, 0.16801, oneMinusAlphaSq);
    float d = mix(-1.97760, -1.27393, oneMinusAlphaSq);
    float e = mix(-4.32054, -4.85967, oneMinusAlphaSq);
    return a / (1.0 + b * pow(x, c)) + d * x + e;
}

float lCharlie(float cosTheta, float alphaG)
{
    if (abs(cosTheta) < 0.5)
	{
	    return exp(lCharlieNumericHelper(cosTheta, alphaG));
	}
    else
	{
	    return exp(2.0 * lCharlieNumericHelper(0.5, alphaG) - lCharlieNumericHelper(1.0 - cosTheta, alphaG));
	}
}

float V_Charlie(float NoL, float NoV, float roughness)
{
    float alphaG = roughness * roughness;
    return clamp(1.0 / ((1.0 + lCharlie(NoV, alphaG) + lCharlie(NoL, alphaG)) * (4.0 * NoV * NoL)), 0.0, 1.0);
}

// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
float V_Neubelt(float NoV, float NoL)
{
    return saturateMediump(1.0 / (4.0 * (NoL + NoV - NoL * NoV)));
}

float V_SmithGGXCorrelated_Anisotropic(float at, float ab, float ToV, float BoV, float ToL, float BoL, float NoV, float NoL)
{
    float lambdaV = NoL * length(vec3(at * ToV, ab * BoV, NoV));
    float lambdaL = NoV * length(vec3(at * ToL, ab * BoL, NoL));
    float v = 0.5 / (lambdaV + lambdaL);
    return saturate(v);
}

vec3 F_Schlick(vec3 f0, float f90, float VoH)
{
    return f0 + (f90 - f0) * pow5(1.0 - VoH);
}

vec3 F_Schlick(vec3 f0, float VoH)
{
    return f0 + (1.0 - f0) * pow5(1.0 - VoH);
}

float F_Schlick(float f0, float f90, float VoH)
{
    return f0 + (f90 - f0) * pow5(1.0 - VoH);
}

float F_Schlick(float f0, float VoH)
{
    return f0 + (1.0 - f0) * pow5(1.0 - VoH);
}

vec3 F_Schlick(vec3 f0, vec3 f90, float VoH)
{
    return f0 + (f90 - f0) * pow5(1.0 - VoH);
}

    #ifdef IRIDESCENCE

// CIE XYZ to REC.709
const mat3 XYZ_to_REC709_MAT = mat3(
    vec3(3.2409699419, -0.9692436363, 0.0556300797),
    vec3(-1.5373831776, 1.8759675015, -0.2039769589),
    vec3(-0.498610760, 0.0415550574, 1.0569715142));

float IorToFresnel0(float iorT, float iorI)
{
    return pow2((iorT - iorI) / (iorT + iorI));
}

vec3 IorToFresnel0(vec3 iorT, float iorI)
{
    return pow2((iorT - vec3(iorI)) / (iorT + vec3(iorI)));
}

// air to surfaceR0 ior
vec3 Fresnel0ToIor(vec3 f0)
{
    vec3 sqrtF0 = sqrt(f0);
    return (1.0 + sqrtF0) / (1.0 - sqrtF0);
}

vec3 evalSensitivity(float OPD, vec3 shift)
{
    float phase = 2.0 * PI * OPD * 1.0e-9;
    vec3 val = vec3(5.4856e-13, 4.4201e-13, 5.2481e-13);
    vec3 pos = vec3(1.6810e+06, 1.7953e+06, 2.2084e+06);
    vec3 var = vec3(4.3278e+09, 9.3046e+09, 6.6121e+09);
    vec3 xyz = val * sqrt(2.0 * PI * var) * cos(pos * phase + shift) * exp(-pow2(phase) * var);
    xyz.x += 9.7470e-14 * sqrt(2.0 * PI * 4.5282e+09) * cos(2.2399e+06 * phase + shift[0]) * exp(-4.5282e+09 * pow2(phase));
    xyz /= 1.0685e-7;
    vec3 srgb = XYZ_to_REC709_MAT * xyz;
    return srgb;
}

// https://belcour.github.io/blog/research/publication/2017/05/01/brdf-thin-film.html
vec3 evalIridescence(float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0)
{
    vec3 I;
    float iridescenceIor = mix(outsideIOR, eta2, smoothstep(0.0, 0.03, thinFilmThickness));

    float sinTheta2Sq = pow2(outsideIOR / iridescenceIor) * (1.0 - pow2(cosTheta1));

    float cosTheta2Sq = 1.0 - sinTheta2Sq;
    if (cosTheta2Sq < 0.0)
	{
	    return vec3(1.0);
	}
    float cosTheta2 = sqrt(cosTheta2Sq);

    float R0 = IorToFresnel0(iridescenceIor, outsideIOR);
    float R12 = F_Schlick(R0, cosTheta1);
    float R21 = R12;
    float T121 = 1.0 - R12;
    float phi12 = 0.0;
    if (iridescenceIor < outsideIOR)
	phi12 = PI;
    float phi21 = PI - phi12;

    vec3 baseIOR = Fresnel0ToIor(clamp(baseF0, 0.0, 0.9999));

    vec3 R1 = IorToFresnel0(baseIOR, iridescenceIor);
    vec3 R23 = F_Schlick(R1, cosTheta2);
    vec3 phi23 = vec3(0.0);

    if (baseIOR[0] < iridescenceIor)
	phi23[0] = PI;
    if (baseIOR[1] < iridescenceIor)
	phi23[1] = PI;
    if (baseIOR[2] < iridescenceIor)
	phi23[2] = PI;

    float OPD = 2.0 * iridescenceIor * thinFilmThickness * cosTheta2;
    vec3 phi = vec3(phi21) + phi23;

    vec3 R123 = clamp(R12 * R23, 1e-5, 0.9999);
    vec3 r123 = sqrt(R123);
    vec3 Rs = pow2(T121) * R23 / (vec3(1.0) - R123);

    vec3 C0 = R12 + Rs;
    I = C0;

    vec3 Cm = Rs - T121;
    for (int m = 1; m <= 2; ++m)
	{
	    Cm *= r123;
	    vec3 Sm = 2.0 * evalSensitivity(float(m) * OPD, float(m) * phi);
	    I += Cm * Sm;
	}

    return max(I, vec3(0.0));
}
    #endif // IRIDESCENCE

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

vec3 fresnel(vec3 f0, vec3 f90, float LoH)
{
    return F_Schlick(f0, f90, LoH);
}

// diffuse BRDF implementations

float Fd_Lambert()
{
    // https://seblagarde.wordpress.com/2012/01/08/pi-or-not-to-pi-in-game-lighting-equation/
    // return INVERT_PI;
    return 1.0;
}

float Fd_Burley(float roughness, float NoV, float NoL, float LoH)
{
    float f90 = 0.5 + 2.0 * roughness * LoH * LoH;
    float lightScatter = F_Schlick(1.0, f90, NoL);
    float veiwScatter = F_Schlick(1.0, f90, NoV);
    return lightScatter * veiwScatter * INVERT_PI;
}

    #ifdef IRIDESCENCE
vec3 Fd_IridescenceLambert(vec3 f0, vec3 f90, vec3 iridescenceFresnel, float iridescenceFactor, float VoH)
{
    vec3 iridescenceFresnelMax = vec3(vecmax(iridescenceFresnel));
    vec3 schlickFresnel = F_Schlick(f0, f90, VoH);

    vec3 F = mix(schlickFresnel, iridescenceFresnelMax, iridescenceFactor);

    return (1.0 - F) * Fd_Lambert();
}
    #endif // IRIDESCENCE

#endif // BRDF