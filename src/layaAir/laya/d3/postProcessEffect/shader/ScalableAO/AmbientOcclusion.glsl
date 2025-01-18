#include "Camera.glsl";
// const 
#define TWO_PI 6.2831852

#define EPSILON         1.0e-4
#define FLT_EPSILON     1.192092896e-07 // Smallest positive number, such that 1.0 + FLT_EPSILON != 1.0

const float kContrast = 0.6;
const float kGeometryCoeff = 0.8;
const float kBeta = 0.002;


// varying
varying vec2 v_Texcoord0;

#if defined(AO_High)
	#define SAMPLE_COUNT 12
#elif defined(AO_MEDIUM)
	#define SAMPLE_COUNT 8
#else
	#define SAMPLE_COUNT 4
#endif

#ifdef AOLOWEST
#define SAMPLE_COUNT 8
#endif

#ifdef AOLOWEST
#define SAMPLE_COUNT 8
#endif


#define INTENSITY u_AOParams.x
#define RADIUS u_AOParams.y
#define DOWNSAMPLE u_AOParams.z

float PositivePow(float base, float power)
{
    return pow(max(abs(base), float(FLT_EPSILON)), power);
}


// Boundary check for depth sampler
// (returns a very large value if it lies out of bounds)
float CheckBounds(vec2 uv, float d) 
{
    float ob = 0.0;
    // todo
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) 
    {
        ob = 1.0;
    }
    if (d <= 0.00001) {
        ob += 1.0;
    }

    return ob * 1e8;
}

float SampleDepth(vec2 uv) 
{
    float depthTex_Depth = SAMPLE_DEPTH_TEXTURE(u_CameraDepthTexture, uv);
    float depthTex_Linear01Depth = Linear01Depth(depthTex_Depth, u_ZBufferParams);
    return  depthTex_Linear01Depth * u_ProjectionParams.y + CheckBounds(uv, depthTex_Linear01Depth);
}

vec3 SampleNormal(vec2 uv) 
{
    vec4 col = texture2D(u_CameraDepthNormalsTexture, uv);
    vec3 depthNormal_Normal = DecodeViewNormalStereo(col);
    return depthNormal_Normal * vec3(1.0, 1.0, -1.0);
}

float SampleDepthNormal(vec2 uv, out vec3 normal) 
{
    normal = SampleNormal(uv);
    return SampleDepth(uv);
}

// Normal vector comparer (for geometry-aware weighting)
float CompareNormal(vec3 d1, vec3 d2)
{
    return smoothstep(kGeometryCoeff, 1.0, dot(d1, d2));
}

// Accessors for packed AO/normal buffer
vec4 PackAONormal(float ao, vec3 n) 
{
    return vec4(ao, n * 0.5 + 0.5);
}

vec3 GetPackedNormal(vec4 p)
{
    return p.gba * 2.0 - 1.0;
}

float GetPackAO(vec4 p)
{
    return p.r;
}


