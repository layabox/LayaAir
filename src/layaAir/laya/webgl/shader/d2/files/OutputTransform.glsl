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

#ifdef BRIDGE3D_CLIP
    uniform vec4 u_Bridge3DClipDir;   // RT pixel space clip direction (dirX.x, dirX.y, dirY.x, dirY.y)
    uniform vec4 u_Bridge3DClipPos;   // RT pixel space clip position (originX, originY, rtH, -)
#endif

vec4 outputTransform(in vec4 color)
{
    #ifdef BRIDGE3D_CLIP
        vec2 fragPos = vec2(gl_FragCoord.x, u_Bridge3DClipPos.z - gl_FragCoord.y);
        vec2 clppos = fragPos - u_Bridge3DClipPos.xy;
        float clipw = length(u_Bridge3DClipDir.xy);
        float cliph = length(u_Bridge3DClipDir.zw);
        if (clipw > 20000.0 && cliph > 20000.0) {
            // default clip (very large), no clipping
        } else {
            float cx = dot(clppos, u_Bridge3DClipDir.xy) / clipw / clipw;
            float cy = dot(clppos, u_Bridge3DClipDir.zw) / cliph / cliph;
            if (cx < 0.0 || cx > 1.0 || cy < 0.0 || cy > 1.0) discard;
        }
    #endif

    #ifdef GAMMACORRECT
    // render in linear, output gamma
    return gammaCorrect(color);
    #else // GAMMACORRECT
    return color;
    #endif // GAMMACORRECT
}

#endif // OutputTransform_lib
