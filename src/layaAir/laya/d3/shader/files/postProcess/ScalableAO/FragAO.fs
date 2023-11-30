#define SHADER_NAME OcclusionEstimationFS

#include "DepthNormalUtil.glsl";

#include "AmbientOcclusion.glsl";

#define FIX_SAMPLING_PATTERN

// Check if the camera is perspective.
// (returns 1.0 when orthographic)
float CheckPerspective(float x)
{
    // todo ortho
    return mix(x, 1.0, 0.0);
}

vec3 ReconstructViewPos(vec2 uv, float depth, vec2 p11_22, vec2 p13_31)
{
    return vec3((uv * 2.0 - 1.0 - p13_31) / p11_22 * CheckPerspective(depth), depth);
}

// Pseudo random number generator with 2D coordinates
// https://stackoverflow.com/questions/12964279/whats-the-origin-of-this-glsl-rand-one-liner
float UVRandom(float u, float v)
{
    float f = dot(vec2(12.9898, 78.233), vec2(u, v));
    return fract(43758.5453 * sin(f));
}

vec2 CosSin(float theta)
{
    // float sn, cs;
    // sincos(theta, sn, cs);
    float sn = sin(theta);
    float cs = cos(theta);
    return vec2(cs, sn);
}

float GradientNoise(vec2 uv)
{
    uv = floor(uv * u_MainTex_TexelSize.zw);
    float f = dot(vec2(0.06711056, 0.00583715), uv);
    return fract(52.9829189 * fract(f));
}

// Sample point picker
vec3 PickSamplePoint(vec2 uv, float index)
{
#if defined(FIX_SAMPLING_PATTERN)
    float gn = GradientNoise(uv * DOWNSAMPLE);
    float u = fract(UVRandom(0.0, index + uv.x * 1e-10) + gn) * 2.0 - 1.0;
    float theta = (UVRandom(1.0, index + uv.x * 1e-10) + gn) * TWO_PI;
#else
    float u = UVRandom(uv.x + u_PlugTime.x, uv.y + index) * 2.0 - 1.0;
    float theta = UVRandom(-uv.x - u_PlugTime.x, uv.y + index) * TWO_PI;
#endif

    vec3 v = vec3(CosSin(theta) * sqrt(1.0 - u * u), u);
    float l = sqrt((index + 1.0) / float(SAMPLE_COUNT)) * RADIUS;
    return v * l;
}

void main()
{
    vec2 uv = v_Texcoord0;

    mat3 proj = mat3(u_Projection);
    vec2 p11_22 = vec2(u_Projection[0][0], u_Projection[1][1]);
    vec2 p13_31 = vec2(u_Projection[2][0], u_Projection[2][1]);

    vec3 norm_o;
    float depth_o = SampleDepthNormal(uv, norm_o);

    // Reconstruct the view-space position.
    vec3 vpos_o = ReconstructViewPos(uv, depth_o, p11_22, p13_31);

    float ao = 0.0;

    for (int s = 0; s < int(SAMPLE_COUNT); s++)
	{
	    float s_float = float(s);
	    vec3 v_s1 = PickSamplePoint(uv, s_float);

	    v_s1 = faceforward(v_s1, -norm_o, v_s1);
	    vec3 vpos_s1 = vpos_o + v_s1;

	    // Reproject the sample point
	    vec3 spos_s1 = proj * vpos_s1;
	    vec2 uv_s1_01 = (spos_s1.xy / CheckPerspective(vpos_s1.z) + 1.0) * 0.5;

	    float depth_s1 = SampleDepth(uv_s1_01);

	    vec3 vpos_s2 = ReconstructViewPos(uv_s1_01, depth_s1, p11_22, p13_31);
	    vec3 v_s2 = vpos_s2 - vpos_o;

	    float a1 = max(dot(v_s2, norm_o) - kBeta * depth_o, 0.0);
	    float a2 = dot(v_s2, v_s2) + EPSILON;

	    ao += a1 / a2;
	}

    ao *= RADIUS;

    ao = PositivePow(ao * INTENSITY / float(SAMPLE_COUNT), kContrast);

    gl_FragColor = PackAONormal(ao, norm_o);
}

/**
    0.8741,     0,          0,          0,
    0,          1.7320,     0,          0,
    0,          0,          -1.0152,    -1,
    0,          0,          -0.3046,    0
**/