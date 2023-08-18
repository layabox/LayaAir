#define SHADER_NAME COCFS

#ifdef CAMERA_NORMALDEPTH
uniform sampler2D u_CameraDepthNormalTexture;
#else
uniform sampler2D u_CameraDepthTexture;
#endif

varying vec2 v_Texcoord0;

// Z buffer to linear 0..1 depth
float Linear01Depth(float z, vec4 zbufferParams)
{
    return 1.0 / (zbufferParams.x * z + zbufferParams.y);
}

// Z buffer to linear depth
float LinearEyeDepth(float z, vec4 zbufferParams)
{
    return 1.0 / (zbufferParams.z * z + zbufferParams.w);
}

float DecodeFloatRG(vec2 enc)
{
    vec2 kDecodeDot = vec2(1.0, 1.0 / 255.0);
    return dot(enc, kDecodeDot);
}

void DecodeDepthNormal(vec4 enc, out float depth)
{
    depth = DecodeFloatRG(enc.zw);
}

void main()
{

#ifdef CAMERA_NORMALDEPTH
    vec4 depthNormal = texture2D(u_CameraDepthNormalTexture, v_Texcoord0);
    float depth = 0.0;
    DecodeDepthNormal(depthNormal, depth);
    depth = ((1.0 / depth) - u_ZBufferParams.y) * (1.0 / u_ZBufferParams.x);
#else
    float depth = texture2D(u_CameraDepthTexture, v_Texcoord0).x;
#endif

    depth = LinearEyeDepth(depth, u_ZBufferParams);
    float farStart = u_CoCParams.x;
    float farEnd = u_CoCParams.y;

    float coc = (depth - farStart) / (farEnd - farStart);
    coc = clamp(coc, 0.0, 1.0);
    gl_FragColor = vec4(coc, coc, coc, 1.0);
}
