#if !defined(SceneFog_lib)
    #define SceneFog_lib

vec3 scenUnlitFog(in vec3 color)
{
    float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);

    #ifdef ADDTIVEFOG
    return mix(color, vec3(0.0), lerpFact);
    #else
    return mix(color, u_FogColor.rgb, lerpFact);
    #endif // ADDTIVEFOG
}

vec3 sceneLitFog(in vec3 color)
{
    float lerpFact = clamp((1.0 / gl_FragCoord.w - u_FogStart) / u_FogRange, 0.0, 1.0);

    return mix(color, u_FogColor.rgb, lerpFact);
}

#endif // SceneFog_lib