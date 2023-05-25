#if !defined(PBRDebug_lib)
    #define PBRDebug_lib

// debug
Surface surface;
initSurface(surface, inputs, pixel);

// PixelInfo info;
// getPixelInfo(info, pixel, surface);

vec3 debug = vec3(0.0);

debug = vec3(surface.occlusion);

debug = gammaToLinear(debug);
gl_FragColor = vec4(debug, 1.0);

#endif // PBRDebug_lib