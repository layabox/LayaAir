#ifdef TEXTURESHEETANIMATION

vec2 getAnimationUV(float normalizedAge, vec2 uv)
{
    float cycles = u_TextureSheetFrameData.z;
    vec2 gridUV = 1.0 / u_TextureSheetFrameData.xy;
    float startFrame = a_SheetFrameData.x;
    float frameCount = a_SheetFrameData.y;
    float rowIndex = a_SheetFrameData.z;

    float cycleTime = mod(normalizedAge * cycles, 1.0);

    float minFrame = getCurveValue(cycleTime, u_TextureSheetFrame, u_TextureSheetFrameRange.xy);
    float maxFrame = getCurveValue(cycleTime, u_TextureSheetFrameMax, u_TextureSheetFrameRange.zw);

    float frame = floor(mix(minFrame, maxFrame, a_Random1.y));

    frame = mod(frame + startFrame, frameCount) + rowIndex * u_TextureSheetFrameData.x;

    float indexX = floor(mod(frame, u_TextureSheetFrameData.x));
    float indexY = floor(frame / u_TextureSheetFrameData.x);

    vec2 uvOffset = vec2(indexX, indexY) * gridUV;

    return uv * gridUV + uvOffset;
}

#endif // TEXTURESHEETANIMATION