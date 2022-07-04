#if !defined(Color_lib)
    #define Color_lib

vec3 linearTosRGB(in vec3 value)
{
    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));
}

vec4 linearTosRGB(in vec4 value)
{
    return vec4(linearTosRGB(value.rgb), value.a);
}

vec3 sRGBToLinear(in vec3 value)
{
    return pow((value + 0.055) / 1.055, vec3(2.4));
}

vec4 sRGBToLinear(in vec4 value)
{
    return vec4(SrgbToLinear(value.rgb), value.a);
}

#endif // Color_lib