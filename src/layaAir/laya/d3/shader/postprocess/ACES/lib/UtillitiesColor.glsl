#if !defined(UtillitiesColor_lib)
#define UtillitiesColor_lib

// Transformations between CIE XYZ tristimulus values and CIE x,y
// chromaticity coordinates
vec3 XYZ_2_xyY(vec3 XYZ)
{
    vec3 xyY;
    float divisor = max(XYZ.x + XYZ.y + XYZ.z, 1e-10);
    xyY.x = XYZ.x / divisor;
    xyY.y = XYZ.y / divisor;
    xyY.z = XYZ.y;
    return xyY;
}

vec3 xyY_2_XYZ(vec3 xyY)
{
    vec3 XYZ;
    XYZ.x = xyY.x * xyY.z / max(xyY.y, 1e-10);
    XYZ.y = xyY.z;
    XYZ.z = (1.0 - xyY.x - xyY.y) * xyY.z / max(xyY.y, 1e-10);
    return XYZ;
}

float rgb_2_yc(vec3 rgb, float ycRadiusWeight)
{
    float r = rgb.r;
    float g = rgb.g;
    float b = rgb.b;
    float k = b * (b - g) + g * (g - r) + r * (r - b);
    k = max(MEDIUMP_FLT_MIN, k);
    float chroma = sqrt(k);
    return (b + g + r + ycRadiusWeight * chroma) / 3.0;
}

float rgb_2_yc(vec3 rgb)
{
    return rgb_2_yc(rgb, 1.75);
}

// Transformations from RGB to other color representations

// Returns a geometric hue angle in degrees (0-360) based on RGB values.
float rgb_2_hue(vec3 rgb)
{
    float hue;
    // For neutral colors, hue is undefined and the function will return a quiet NaN value.
    // if (rgb.r == rgb.g && rgb.g == rgb.b) {
    //     // hue = FLT_NAN;
    //     // todo FLT_NAN
    //     hue = 0.0;
    // } else {
    //     hue = (180.0 * INVERT_PI) * atan2(sqrt(3.0) * (rgb.g - rgb.b), 2.0 * rgb.r - rgb.g - rgb.b);
    // }
    if (rgb.x == rgb.y && rgb.y == rgb.z)
        hue = 0.0; // RGB triplets where RGB are equal have an undefined hue
    else
        hue = (180.0 * INVERT_PI) * atan(sqrt(3.0) * (rgb.y - rgb.z), 2.0 * rgb.x - rgb.y - rgb.z);

    if (hue < 0.0) {
        hue = hue + 360.0;
    }

    return hue;
}

#endif // UtillitiesColor_lib