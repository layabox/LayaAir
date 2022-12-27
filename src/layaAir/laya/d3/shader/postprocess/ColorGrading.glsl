#if !defined(ColorGrading_lib)
    #define ColorGrading_lib

const float ACEScc_MAX = 1.4679964;
const float ACEScc_MIDGRAY = 0.4135884;

const float LogC_cut = 0.011361;
const float LogC_a = 5.555556;
const float LogC_b = 0.047996;
const float LogC_c = 0.244161;
const float LogC_d = 0.386036;
const float LogC_e = 5.301883;
const float LogC_f = 0.092819;

float linearToLogC(float x)
{
    float o;
    if (x > LogC_cut)
	{
	    o = LogC_c * log10(max(LogC_a * x + LogC_b, 0.0)) + LogC_d;
	}
    else
	{
	    o = LogC_e * x + LogC_f;
	}
    return o;
}

vec3 linearToLogC(vec3 x)
{
    vec3 logc;
    logc.x = linearToLogC(x.x);
    logc.y = linearToLogC(x.y);
    logc.z = linearToLogC(x.z);
    return logc;
}

float logCToLinear(float x)
{
    float o;
    if (x > LogC_e * LogC_cut + LogC_f)
	o = (pow(10.0, (x - LogC_d) / LogC_c) - LogC_b) / LogC_a;
    else
	o = (x - LogC_f) / LogC_e;
    return o;
}

vec3 logCToLinear(vec3 x)
{
    vec3 linear;
    linear.x = logCToLinear(x.x);
    linear.y = logCToLinear(x.y);
    linear.z = logCToLinear(x.z);
    return linear;
}

const mat3 Linear_to_LMS_MAT = mat3(
    vec3(3.90405e-1, 7.08416e-2, 2.31082e-2),
    vec3(5.49941e-1, 9.63172e-1, 1.28021e-1),
    vec3(8.92632e-3, 1.35775e-3, 9.36245e-1));

const mat3 LMS_to_Linear_MAT = mat3(
    vec3(2.85847e+0, -2.10182e-1, -4.18120e-2),
    vec3(-1.62879e+0, 1.15820e+0, -1.18169e-1),
    vec3(-2.48910e-2, 3.24281e-4, 1.06867e+0));

// white balance
uniform vec3 u_ColorBalance;

// split toning
uniform vec4 u_SplitShadows;
uniform vec3 u_SplitHeighlights;

// shadows, midtones, highlights
uniform vec3 u_Shadows;
uniform vec3 u_Midtones;
uniform vec3 u_Highlights;
uniform vec4 u_Limits;

// lift, gamma, gain
uniform vec3 u_Lift;
uniform vec3 u_Gamma;
uniform vec3 u_Gain;

float luminance(in vec3 color)
{
    #ifdef ACES
    float luma = dot(color, AP1_RGB2Y);
    #else
    float luma = dot(color, vec3(0.2126729, 0.7151522, 0.0721750));
    #endif // ACES
    return luma;
}

vec3 softlight(vec3 base, vec3 blend)
{
    vec3 r1 = 2.0 * base * blend + base * base * (1.0 - 2.0 * blend);
    vec3 r2 = sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
    vec3 t = step(0.5, blend);
    return r2 * t + (1.0 - t) * r1;
}

// input linear sRGB
// if ACES tonemap, calculate in ACEScg, return ACEScg
// else calculate in logC, return linear sRGB
vec3 colorGrade(in vec3 color)
{
    // White balance in LMS space
    vec3 colorLMS = Linear_to_LMS_MAT * color;
    colorLMS *= u_ColorBalance.xyz;
    color = LMS_to_Linear_MAT * colorLMS;

    #ifdef ACES
    color = sRGB_to_AP1_MAT * color;
    #endif // ACES

    color = max(vec3(0.0), color);

    // split toning
    float balance = u_SplitShadows.w;
    vec3 gamma = linearToGamma(color);
    float splitLuma = saturate(luminance(color)) + balance;
    vec3 splitShadows = mix(vec3(0.5, 0.5, 0.5), u_SplitShadows.xyz, 1.0 - splitLuma);
    vec3 splitHeighlights = mix(vec3(0.5, 0.5, 0.5), u_SplitHeighlights.xyz, splitLuma);
    gamma = softlight(gamma, splitShadows);
    gamma = softlight(gamma, splitHeighlights);
    color = gammaToLinear(gamma);

    // shadows, midtones, highlights
    float luma = luminance(color);
    float shadowFactor = 1.0 - smoothstep(u_Limits.x, u_Limits.y, luma);
    float highlightsFactor = smoothstep(u_Limits.z, u_Limits.w, luma);
    float midtonesFactor = 1.0 - shadowFactor - highlightsFactor;
    color = color * u_Shadows.xyz * shadowFactor + color * u_Midtones.xyz * midtonesFactor + color * u_Highlights.xyz * highlightsFactor;

    // Lift, gamma, gain
    color = color * u_Gain.xyz + u_Lift.xyz;
    color = sign(color) * pow(abs(color), u_Gamma.xyz);

    return color;
}

#endif // ColorGrading_lib