#if !defined(RRTCommon_lib)
#define RRTCommon_lib

// "Glow" module constants
const float RRT_GLOW_GAIN = 0.05;
const float RRT_GLOW_MID = 0.08;

// Red modifier constants
const float RRT_RED_SCALE = 0.82;
const float RRT_RED_PIVOT = 0.03;
const float RRT_RED_HUE = 0.;
const float RRT_RED_WIDTH = 135.;

// Desaturation contants
const float RRT_SAT_FACTOR = 0.96;

// ------- Glow module functions

float glow_fwd(float ycIn, float glowGainIn, float glowMid)
{
    float glowGainOut;
    if (ycIn <= 2.0 / 3.0 * glowMid) {
        glowGainOut = glowGainIn;
    } else if (ycIn >= 2.0 * glowMid) {
        glowGainOut = 0.0;
    } else {
        glowGainOut = glowGainIn * (glowMid / ycIn - 0.5);
    }
    return glowGainOut;
}

// Sigmoid function in the range 0 to 1 spanning -2 to +2.
float sigmoid_shaper(float x)
{
    float t = max(1.0 - abs(x * 0.5), 0.0);
    float y = 1.0 + sign(x) * (1.0 - t * t);

    return y * 0.5;
}

// ------- Red modifier functions
float center_hue(float hue, float centerH)
{
    float hueCentered = hue - centerH;
    if (hueCentered < -180.0) {
        hueCentered = hueCentered + 360.0;
    } else if (hueCentered > 180.0) {
        hueCentered -= 360.0;
    }
    return hueCentered;
}

#endif // RRTCommon_lib