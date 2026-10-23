// Copyright (c) 2021 Advanced Micro Devices, Inc. All rights reserved.
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files(the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and / or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions :
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

#define SHADER_NAME TemporalAARcasFS

#include "Color.glsl";

// 移植 FSR 1 的 FsrRcasF，对齐 URP 17.3；输入为线性色，锐化结果不进入历史。
// 与 Unity 一致，不启用 FSR_RCAS_DENOISE。

vec4 taaRcasLoad(vec2 uv, vec2 offset)
{
    vec2 halfTexel = 0.5 * u_MainTex_TexelSize.xy;
    vec4 color = texture2DLodEXT(u_MainTex, clamp(uv + offset * u_MainTex_TexelSize.xy, halfTexel, vec2(1.0) - halfTexel), 0.0);
#ifdef Gamma_u_MainTex
    color = gammaToLinear(color);
#endif
    return color;
}

void main()
{
    vec2 uv = gl_FragCoord.xy * u_MainTex_TexelSize.xy;
    vec4 center = taaRcasLoad(uv, vec2(0.0));
    if (u_TaaRcasSharpness <= 0.0) {
        gl_FragColor = outputTransform(center);
        return;
    }
    vec3 b = taaRcasLoad(uv, vec2(0.0, -1.0)).rgb;
    vec3 d = taaRcasLoad(uv, vec2(-1.0, 0.0)).rgb;
    vec3 e = center.rgb;
    vec3 f = taaRcasLoad(uv, vec2(1.0, 0.0)).rgb;
    vec3 h = taaRcasLoad(uv, vec2(0.0, 1.0)).rgb;
    // HDR 按邻域峰值归一化以抑制振铃，锐化后恢复亮度。
    vec3 peak = max(max(max(b, d), max(e, f)), h);
    float range = max(1.0, max(max(peak.r, peak.g), peak.b));
    b /= range;
    d /= range;
    e /= range;
    f /= range;
    h /= range;
    vec3 mn4 = min(min(b, d), min(f, h));
    vec3 mx4 = max(max(b, d), max(f, h));
    // 常量黑白区域避免除零产生 NaN。
    vec3 hitMin = min(mn4, e) / max(4.0 * mx4, vec3(0.000001));
    vec3 hitMaxDenominator = 4.0 * mn4 - 4.0;
    hitMaxDenominator = max(abs(hitMaxDenominator), vec3(0.000001)) *
        mix(vec3(-1.0), vec3(1.0), step(vec3(0.0000001), hitMaxDenominator));
    vec3 hitMax = (vec3(1.0) - max(mx4, e)) / hitMaxDenominator;
    vec3 lobes = max(-hitMin, hitMax);
    float lobe = max(-0.1875, min(max(max(lobes.r, lobes.g), lobes.b), 0.0)) * u_TaaRcasSharpness;
    vec3 color = ((lobe * (b + d + f + h) + e) / (4.0 * lobe + 1.0)) * range;
    gl_FragColor = outputTransform(vec4(color, center.a));
}
