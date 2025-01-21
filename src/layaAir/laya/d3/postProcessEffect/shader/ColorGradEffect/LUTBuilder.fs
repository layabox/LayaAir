#define SHADER_NAME LutBuilder

#include "Color.glsl";

#ifdef ACES
    #include "ACES.glsl";
#endif // ACES

#include "ColorGrading.glsl";

#include "Tonemapping.glsl";

varying vec2 v_Texcoord0;

// lut params: (lutHeight, 0.5 / lutWidth, 0.5 / lutHeight, lutHeidht / (lutHeight - 1))
vec3 lutValue(vec2 uv, vec4 params)
{
    vec3 color;
    uv -= params.yz;
    color.r = fract(uv.x * params.x);
    color.b = uv.x - color.r / params.x;
    color.g = uv.y;
    return color * params.w;
}

// internal lut logC space
void main()
{
    vec2 uv = v_Texcoord0;
    vec3 color = lutValue(uv, u_LutParams);
    color = logCToLinear(color);
    vec3 grade = colorGrade(color);
    vec3 tone = tonemap(grade);

    gl_FragColor = vec4(tone, 1.0);
}