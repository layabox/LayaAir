#include "StdLib.glsl";

#define EPSILON 1.0e-4

// Quadratic color thresholding
// curve = (threshold - knee, knee * 2, 0.25 / knee)
mediump vec4 quadraticThreshold(mediump vec4 color, mediump float threshold, mediump vec3 curve) {
	// Pixel brightness
	mediump float br = max3(color.r, color.g, color.b);

	// Under-threshold part: quadratic curve
	mediump float rq = clamp(br - curve.x, 0.0, curve.y);
	rq = curve.z * rq * rq;

	// Combine and apply the brightness response curve.
	color *= max(rq, br - threshold) / max(br, EPSILON);

	return color;
}



//
// sRGB transfer functions
// Fast path ref: http://chilliant.blogspot.com.au/2012/08/srgb-approximations-for-hlsl.html?m=1
//
mediump vec3 sRGBToLinear(mediump vec3 c) {
	#ifdef USE_VERY_FAST_SRGB
		return c * c;
	#elif defined(USE_FAST_SRGB)
		return c * (c * (c * 0.305306011 + 0.682171111) + 0.012522878);
	#else
		mediump vec3 linearRGBLo = c / 12.92;
		mediump vec3 power=vec3(2.4, 2.4, 2.4);
		mediump vec3 linearRGBHi = positivePow((c + 0.055) / 1.055, power);
		mediump vec3 linearRGB =vec3((c.r<=0.04045) ? linearRGBLo.r : linearRGBHi.r,(c.g<=0.04045) ? linearRGBLo.g : linearRGBHi.g,(c.b<=0.04045) ? linearRGBLo.b : linearRGBHi.b);
		return linearRGB;
	#endif
}

mediump vec4 sRGBToLinear(mediump vec4 c){
    return vec4(sRGBToLinear(c.rgb), c.a);
}



mediump vec3 linearToSRGB(mediump vec3 c) {
	#ifdef USE_VERY_FAST_SRGB
		return sqrt(c);
	#elif defined(USE_FAST_SRGB)
		return max(1.055 * PositivePow(c, 0.416666667) - 0.055, 0.0);
	#else
		mediump vec3 sRGBLo = c * 12.92;
		mediump vec3 power=vec3(1.0 / 2.4, 1.0 / 2.4, 1.0 / 2.4);
		mediump vec3 sRGBHi = (positivePow(c, power) * 1.055) - 0.055;
		mediump vec3 sRGB =vec3((c.r<=0.0031308) ? sRGBLo.r : sRGBHi.r,(c.g<=0.0031308) ? sRGBLo.g : sRGBHi.g,(c.b<=0.0031308) ? sRGBLo.b : sRGBHi.b);
		return sRGB;
	#endif
}

mediump vec4 linearToSRGB(mediump vec4 c){
    return vec4(linearToSRGB(c.rgb), c.a);
}