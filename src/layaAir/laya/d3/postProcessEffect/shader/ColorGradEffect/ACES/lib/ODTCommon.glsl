#if !defined(ODTCommon_lib)
#define ODTCommon_lib

const float CINEMA_WHITE = 48.0;
const float CINEMA_BLACK = 0.02; // CINEMA_WHITE / 2400.

// Gamma compensation factor
const float DIM_SURROUND_GAMMA = 0.9811;

// Saturation compensation factor
const float ODT_SAT_FACTOR = 0.93;

// white point D60 to D65
// ACES white point D60
const mat3 D60_to_D65_MAT = mat3(
    vec3(0.987224, -0.00759836, 0.00307257),
    vec3(-0.00611327, 1.00186, -0.00509595),
    vec3(0.0159533, 0.00533002, 1.08168));

float Y_2_linCV(float Y, float Ymax, float Ymin)
{
    return (Y - Ymin) / (Ymax - Ymin);
}

vec3 darkSurround_to_dimSurround(vec3 linearCV)
{
    vec3 XYZ = linearCV * AP1_to_XYZ_MAT;
    vec3 xyY = XYZ_2_xyY(XYZ);
    xyY.z = clamp(xyY.z, 0.0, MEDIUMP_FLT_MAX);
    xyY.z = pow(xyY.z, DIM_SURROUND_GAMMA);
    XYZ = xyY_2_XYZ(xyY);

    return XYZ * XYZ_to_AP1_MAT;
}

#endif // ODTCommon_lib