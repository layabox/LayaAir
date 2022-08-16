#define SHADER_NAME PrefilterFS

varying vec2 v_Texcoord0;

const int kCount = 5;
vec2 kTaps[5];

void main () {

    kTaps[0] = vec2( 0.0,  0.0);
    kTaps[1] = vec2( 0.9, -0.4);
    kTaps[2] = vec2(-0.9,  0.4);
    kTaps[3] = vec2( 0.4,  0.9);
    kTaps[4] = vec2(-0.4, -0.9);

    vec3 colorAcc = vec3(0.0);
    float farCoCAcc = 0.0;
    for (int i = 0; i < kCount; i++) {
        vec2 uv = u_MainTex_TexelSize.xy * kTaps[i] + v_Texcoord0;
        vec3 tapColor = texture2D(u_MainTex, uv).rgb;
        float coc = texture2D(u_FullCoCTex, uv).r;

        colorAcc += tapColor * coc;
        farCoCAcc += coc;
    }
    vec3 color = colorAcc * (1.0 / float(kCount));
    float farCoC = farCoCAcc * (1.0 / float(kCount));

    // float farCoC = texture2D(u_FullCoCTex, v_Texcoord0).x;
    // vec3 color = texture2D(u_MainTex, v_Texcoord0).rgb;
    // color *= farCoC;

    gl_FragColor = vec4(color, farCoC);
}