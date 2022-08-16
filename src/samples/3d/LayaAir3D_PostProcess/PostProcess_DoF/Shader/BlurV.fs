#define SHADER_NAME BlurVFS

varying vec2 v_Texcoord0;

// todo 3 & 5
const int kTapCount = 3;
float kOffsets[3];
float kCoeffs[3];


vec4 Blur(vec2 dir, float premultiply) {

    kOffsets[0] = -1.33333333;
    kOffsets[1] = 0.00000000;
    kOffsets[2] = 1.33333333;

    kCoeffs[0] = 0.35294118;
    kCoeffs[1] = 0.29411765;
    kCoeffs[2] = 0.3529411;

    vec2 uv = v_Texcoord0;
    // ivec2 positionSS = ivec2(u_SourceSize.xy * uv);

    vec4 halfColor = texture2D(u_MainTex, uv);
    float samp0CoC = halfColor.a;

    float maxRadius = u_CoCParams.z;
    vec2 offset = u_SourceSize.zw * dir * samp0CoC * maxRadius;

    vec4 acc = vec4(0.0);

    for (int i = 0; i < kTapCount; i++) {
        vec2 sampCoord = uv + kOffsets[i] * offset;
        vec4 samp = texture2D(u_MainTex, sampCoord);
        float sampCoC = samp.w;
        vec3 sampColor = samp.xyz;

        float weight = clamp(1.0 - (samp0CoC - sampCoC), 0.0, 1.0);
        acc += vec4(sampColor, 1.0) * kCoeffs[i] * weight;
    }

    acc.xyz /= acc.w + 1e-4;
    return vec4(acc.xyz, 1.0);
}

void main() {
    gl_FragColor = Blur(vec2(0.0, 1.0), 0.0);
    // gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
}
