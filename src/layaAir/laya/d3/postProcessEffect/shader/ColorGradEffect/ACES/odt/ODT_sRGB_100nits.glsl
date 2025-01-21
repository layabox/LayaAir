#if !defined(ODT_sRGB_100nits_lib)
#define ODT_sRGB_100nits_lib

#include "ACES_ODTCommon.glsl";

// CIE XYZ to REC.709
const mat3 XYZ_to_REC709_MAT = mat3(
    vec3(3.2409699419, -0.9692436363, 0.0556300797),
    vec3(-1.5373831776, 1.8759675015, -0.2039769589),
    vec3(-0.498610760, 0.0415550574, 1.0569715142));

const float DISPGAMMA = 2.4;
const float OFFSET = 0.055;

vec3 ODT_sRGB_100nits(vec3 oces)
{
    // OCES to RGB rendering space
    vec3 rgbPre = AP0_to_AP1_MAT * oces;

    // Apply the tonescale independently in rendering-space RGB
    vec3 rgbPost;
    rgbPost.r = segmented_spline_c9_fwd(rgbPre.r);
    rgbPost.g = segmented_spline_c9_fwd(rgbPre.g);
    rgbPost.b = segmented_spline_c9_fwd(rgbPre.b);

    // Scale luminance to linear code value
    vec3 linearCV;
    linearCV.r = Y_2_linCV(rgbPost.r, CINEMA_WHITE, CINEMA_BLACK);
    linearCV.g = Y_2_linCV(rgbPost.g, CINEMA_WHITE, CINEMA_BLACK);
    linearCV.b = Y_2_linCV(rgbPost.b, CINEMA_WHITE, CINEMA_BLACK);

    // Apply gamma adjustment to compensate for dim surround
    linearCV = darkSurround_to_dimSurround(linearCV);

    // Convert to display primary encoding
    // Rendering space RGB to XYZ
    vec3 XYZ = AP1_to_XYZ_MAT * linearCV;

    // Apply CAT from ACES white point to assumed observer adapted white point
    XYZ = D60_to_D65_MAT * XYZ;

    // CIE XYZ to display primaries
    linearCV = XYZ_to_REC709_MAT * XYZ;

    linearCV = clamp(linearCV, vec3(0.0), vec3(1.0));
    return linearCV;
}

#endif // ODT_sRGB_100nits_lib