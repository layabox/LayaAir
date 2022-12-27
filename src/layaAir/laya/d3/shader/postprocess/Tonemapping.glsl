#if !defined(Tonemapping_lib)
    #define Tonemapping_lib

// ACES Tonemapping color grading in ACEScg space
vec3 tonemap(in vec3 ap1)
{
    vec3 color = ap1;

    #ifdef ACES
    vec3 aces = AP1_to_AP0_MAT * color;
    vec3 oces = RRT(aces);
    color = ODT_sRGB_100nits(oces);
    #endif // ACES

    // todo other tonemap

    return color;
}

#endif // Tonemapping_lib