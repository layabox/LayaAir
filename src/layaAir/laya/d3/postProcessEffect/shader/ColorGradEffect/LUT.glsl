#if !defined(LUT_lib)
    #define LUT_lib

// scaleOffset = (1 / lut_width, 1 / lut_height, lut_height - 1)
vec3 applyLut(vec3 uvw, vec3 scaleOffset)
{
    uvw.z *= scaleOffset.z;

    float shift = floor(uvw.z);
    uvw.xy = uvw.xy * scaleOffset.z * scaleOffset.xy + scaleOffset.xy * 0.5;
    uvw.x += shift * scaleOffset.y;

    uvw.xyz = mix(
	texture2DLodEXT(u_Lut, uvw.xy, 0.0).rgb,
	texture2DLodEXT(u_Lut, uvw.xy + vec2(scaleOffset.y, 0.0), 0.0).rgb,
	uvw.z - shift);
    return uvw;
}

#endif // LUT_lib