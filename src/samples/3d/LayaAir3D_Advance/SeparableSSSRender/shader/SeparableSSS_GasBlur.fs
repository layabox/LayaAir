#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

//#if defined(SAMPLE_HIGH)
    const int StepRange = 3;
    const int SamplerNum = 17;
    uniform vec4 u_kernel[SamplerNum];
//#else
//    const int StepRange = 2;
//    const int SamplerNum = 7;
//    uniform vec4 u_kernel[samplerNum];
//#endif

//DiffuseBuffer
uniform sampler2D u_MainTex;
//深度贴图
uniform sampler2D u_depthTex;
//uv
varying vec2 v_Texcoord0;
//sss宽度
uniform float u_sssWidth;
//模糊方向 0，1 或者1，0
uniform vec2 u_blurDir;

//float distanceToProjectionWindow = 1.0 / tan(0.5 * radians(SSSS_FOVY));
uniform float u_distanceToProjectionWindow;


vec4 Sample17Nums(vec2 finalStep,vec4 colorBlurred,float depthM,vec4 colorM){
      for (int i = 1; i < SamplerNum; i++) {
        // Fetch color and depth for current sample:
        vec2 offset = v_Texcoord0 + u_kernel[i].a * finalStep;
        vec4 color = texture2D(u_MainTex, offset);

            // // If the difference in depth is huge, we lerp color back to "colorM"://深度差异过大 我们把颜色还原为原色
             float depth = texture2D(u_depthTex, offset).r;
             float s = clamp(300.0 * abs(depthM - depth),0.0,1.0);
            color.rgb = mix(color.rgb, colorM.rgb, s);

        // Accumulate:
        colorBlurred.rgb += u_kernel[i].rgb * color.rgb;
       
    }
     return colorBlurred;
}


void main()
{
    vec4 colorM = texture2D(u_MainTex,v_Texcoord0);

    //   if (initStencil) // (Checked in compile time, it's optimized away)如果模具缓冲区不可用，请初始化该缓冲区：
    //     if (SSSS_STREGTH_SOURCE == 0.0) discard;

    float depthM = texture2D(u_depthTex,v_Texcoord0).r;
    //计算随着depth的变化ssswidth的比例
    float scale = u_distanceToProjectionWindow/depthM;
    //计算像素采样步长
    vec2 finalStep = u_sssWidth *scale* u_blurDir;
    finalStep *=colorM.a* 0.2;

    vec4 colorBlurred = colorM;

    colorBlurred.rgb*=u_kernel[0].rgb;
    colorBlurred = Sample17Nums(finalStep,colorBlurred,depthM,colorM);
    //累计其他采样
    //   for (int i = 1; i < SSSS_N_SAMPLES; i++) {
    //     // Fetch color and depth for current sample:
    //     float2 offset = texcoord + kernel[i].a * finalStep;
    //     float4 color = SSSSSample(colorTex, offset);

    //     #if SSSS_FOLLOW_SURFACE == 1
    //     // If the difference in depth is huge, we lerp color back to "colorM":
    //     float depth = SSSSSample(depthTex, offset).r;
    //     float s = SSSSSaturate(300.0f * distanceToProjectionWindow *
    //                            sssWidth * abs(depthM - depth));
    //     color.rgb = SSSSLerp(color.rgb, colorM.rgb, s);
    //     #endif

    //     // Accumulate:
    //     colorBlurred.rgb += kernel[i].rgb * color.rgb;
    // }
    gl_FragColor = colorBlurred;
    // gl_FragColor = vec4(scale,scale,scale,1.0);
}

