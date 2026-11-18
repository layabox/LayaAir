// The coverage mask is stationary. Only this internal material pattern moves.
// 覆盖遮罩保持静止，仅内部材质图案随时间流动。
uniform float u_WaterTime;
uniform float u_WaterFlowSpeed;
uniform vec4 u_WaterTint;

float waterHash(vec2 cell)
{
    cell = mod(cell, 64.0);
    vec3 p = fract(vec3(cell.xyx) * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.x + p.y) * p.z);
}

// Value noise plus its analytic gradient; no implicit derivative instruction.
// 值噪声及其解析梯度，不使用隐式求导指令。
vec3 waterNoise(vec2 p)
{
    vec2 cell = floor(p), f = fract(p);
    vec2 blend = f * f * (3.0 - 2.0 * f);
    vec2 derivative = 6.0 * f * (1.0 - f);
    float a = waterHash(cell), b = waterHash(cell + vec2(1.0, 0.0));
    float c = waterHash(cell + vec2(0.0, 1.0)), d = waterHash(cell + vec2(1.0, 1.0));
    return vec3(mix(mix(a, b, blend.x), mix(c, d, blend.x), blend.y),
        mix(b - a, d - c, blend.y) * derivative.x,
        mix(c - a, d - b, blend.x) * derivative.y);
}

void decalModifySurface(vec2 uv, vec2 gradientX, vec2 gradientY,
    inout vec4 albedo, inout vec3 normalTS, inout float metallic,
    inout float smoothness, inout float occlusion, inout vec3 emission)
{
    vec2 footprint = vec2(length(vec2(gradientX.x, gradientY.x)), length(vec2(gradientX.y, gradientY.y)));
    float coverage = 0.0;
    // Fixed, uneven rivulets run from the top to different heights. Their
    // silhouettes do not drift with time, even when the internal flow is paused.
    // 不规则细流从顶部延伸至不同高度；轮廓不随时间漂移，暂停内部流动时也保持不变。
    for (int i = 0; i < 7; i++)
    {
        float lane = float(i);
        float seed = waterHash(vec2(lane, 11.0));
        float center = 0.105 + lane * 0.13 + (seed - 0.5) * 0.045;
        float bend = (waterNoise(vec2(uv.y * 3.0, lane + 2.0)).x - 0.5) * 0.045;
        float contour = waterNoise(vec2(uv.y * 2.3 + seed * 7.0, lane + 19.0)).x;
        float width = mix(0.018, 0.052, waterHash(vec2(lane, 23.0))) * mix(0.55, 1.35, contour);
        float end = mix(0.035, 0.39, waterHash(vec2(lane, 37.0)));
        float aa = max(footprint.x * 1.2, 0.0015);
        float band = 1.0 - smoothstep(width * 0.55, width + aa, abs(uv.x - center - bend));
        float lengthMask = smoothstep(end, end + max(0.08, footprint.y), uv.y)
            * (1.0 - smoothstep(0.91, 0.985, uv.y));
        coverage = max(coverage, band * lengthMask * mix(0.55, 0.98, seed));
    }
    float edges = smoothstep(0.02, 0.07, uv.x) * (1.0 - smoothstep(0.93, 0.98, uv.x));
    coverage *= edges;

    // Increasing local V is world-up on the sample wall. +time in the lookup
    // therefore transports the material down by flowSpeed UV units per second.
    // 示例墙面的局部 V 正向朝世界上方，采样坐标加时间后，
    // 材质便以每秒 flowSpeed 个 UV 单位向下流动。
    vec2 frequency = vec2(18.0, 7.0);
    vec2 flowUV = vec2(uv.x, uv.y + u_WaterTime * u_WaterFlowSpeed);
    vec3 flow = waterNoise(flowUV * frequency);
    float filterWidth = max(length(gradientX * frequency), length(gradientY * frequency));
    float detailWeight = 1.0 - smoothstep(0.22, 0.72, filterWidth);
    float movingDetail = mix(0.5, flow.x, detailWeight);
    float sheen = smoothstep(0.24, 0.85, movingDetail);

    albedo.rgb *= u_WaterTint.rgb * mix(0.55, 1.20, sheen);
    albedo.a *= coverage * u_WaterTint.a;
    // The projector maps tangent V onto -axisY after texture decoding.
    // 贴图解码后，投射器将切线空间 V 轴映射到 -axisY。
    normalTS = normalize(vec3(-flow.y * frequency.x * 0.012 * detailWeight,
        flow.z * frequency.y * 0.012 * detailWeight, 1.0));
    metallic = 0.0;
    smoothness = mix(0.86, 0.98, sheen);
    occlusion = 1.0;
    emission = vec3(0.0);
}
