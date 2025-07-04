#if !defined(OutputTransform_lib)
    #define OutputTransform_lib

vec3 gammaCorrect(in vec3 color, float gammaValue)
{
    return pow(color, vec3(gammaValue));
}

vec4 gammaCorrect(in vec4 color)
{
    // todo color gamut gamma value
    // default sRGB
    float gammaValue = 1.0 / 2.2;
    return vec4(gammaCorrect(color.rgb, gammaValue), color.a);
}

vec4 outputTransform(in vec4 color)
{
    #ifdef GAMMACORRECT
    // render in linear, output gamma
    return gammaCorrect(color);
    #else // GAMMACORRECT
    return color;
    #endif // GAMMACORRECT
}

#endif // OutputTransform_lib
