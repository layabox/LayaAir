#if !defined(RRT_lib)
#define RRT_lib

#include "ACES_RRTCommon.glsl";

/**
 * @param ACES AP0
 * @returns OCES
 */
vec3 RRT(vec3 aces)
{
    // --- Glow module --- //
    float saturation = rgb_2_saturation(aces);
    float ycIn = rgb_2_yc(aces);
    float s = sigmoid_shaper((saturation - 0.4) / 0.2);
    float addedGlow = 1.0 + glow_fwd(ycIn, RRT_GLOW_GAIN * s, RRT_GLOW_MID);

    aces *= addedGlow;

    // --- Red modifier --- //
    float hue = rgb_2_hue(aces);
    float centeredHue = center_hue(hue, RRT_RED_HUE);

    float hueWeight = smoothstep(0.0, 1.0, 1.0 - abs(2.0 * centeredHue / RRT_RED_WIDTH));
    hueWeight *= hueWeight;

    aces.r += hueWeight * saturation * (RRT_RED_PIVOT - aces.r) * (1. - RRT_RED_SCALE);

    // --- ACES to RGB rendering space --- //
    vec3 rgbPre = AP0_to_AP1_MAT * aces;
    rgbPre = clamp(rgbPre, 0.0, MEDIUMP_FLT_MAX);

    // --- Global desaturation --- //
    rgbPre = mix(vec3(dot(rgbPre, AP1_RGB2Y)), rgbPre, RRT_SAT_FACTOR);

    // --- Apply the tonescale independently in rendering-space RGB --- //
    vec3 rgbPost;
    rgbPost.x = segmented_spline_c5_fwd(rgbPre.x);
    rgbPost.y = segmented_spline_c5_fwd(rgbPre.y);
    rgbPost.z = segmented_spline_c5_fwd(rgbPre.z);

    // --- RGB rendering space to OCES --- //
    vec3 rgbOces = AP1_to_AP0_MAT * rgbPost;

    return rgbOces;
}

#endif // RRT_lib