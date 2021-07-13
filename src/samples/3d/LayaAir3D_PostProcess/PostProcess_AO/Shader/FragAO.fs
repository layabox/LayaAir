#if defined(GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

#define SHADER_NAME FragAO

#include "DepthNormalUtil.glsl";

// define const
#define SAMPLE_COUNT 6.0
#define TWO_PI 6.28318530718
#define EPSILON 1.0e-4
const float kBeta = 0.002;
const float kContrast = 0.6;
// varying
varying vec2 v_Texcoord0;
varying mat4 v_inverseProj;
// uniform
uniform sampler2D u_MainTex;
uniform float u_radius;
uniform float u_Intensity;


uniform mat4 u_Projection;
uniform vec4 u_ProjectionParams;
uniform mat4 u_ViewProjection;
uniform mat4 u_View;
uniform float u_Time;

// 采样 depthNormalTexture, 返回 positionCS.z, normalVS
float GetDepthCSNormalVS(vec2 uv, out vec3 normalVS) {
    vec4 env = texture2D(u_CameraDepthNormalsTexture, uv);
    float depthCS = 0.0;
    DecodeDepthNormal(env, depthCS, normalVS);
    normalVS = normalize(normalVS);
    return depthCS;
}

// 返回 观察空间深度
float GetDepthVS(float depthCS) {

    return LinearEyeDepth(depthCS, u_ZBufferParams);
    // return depthCS * 20.0;
}

// 根据屏幕uv和深度值，计算 观察空间坐标
vec3 GetPositionVS(vec2 uv, float depthCS) {
    vec3 positionNDC = vec3(uv * 2.0 - 1.0, depthCS);

    vec4 positionVS = v_inverseProj * vec4(positionNDC, 1.0);
    return positionVS.xyz / positionVS.w;
}

float UVRandom(float u, float v) {
    float f = dot(vec2(12.9898, 78.233), vec2(u, v));
    return fract(43758.5453 * sin(f));
}

// 获取随机偏移
vec3 PickSamplePoint(vec2 uv, int i) {
    float index = float(i);

    float time =sin(u_Time*2.0);
    // todo  采样 noise 代替计算随机?
    float u = UVRandom(uv.x + time, uv.y + index) * 2.0 - 1.0;
    float theta = UVRandom(-uv.x - time, uv.y + index) * TWO_PI;

    vec3 v = vec3(vec2(cos(theta), sin(theta)) * sqrt(1.0 - u * u), u);
    float l = sqrt((index + 1.0) / SAMPLE_COUNT) * u_radius;
    return v * l;
}

vec4 PackAONormal(float ao, vec3 normal) {
    return vec4(ao, normal * 0.5 + 0.5);
}

void main() {
    vec2 uv = v_Texcoord0;
    //法线
    vec3 normalVS = vec3(0.0);
    float depthCS = GetDepthCSNormalVS(uv, normalVS);
    //非线性深度
    depthCS = SAMPLE_DEPTH_TEXTURE(u_CameraDepthTexture, uv);
    //线性深度
    float depthVS = GetDepthVS(depthCS);
    //获得观察空间的位置
    vec3 positionVS = GetPositionVS(uv, depthCS);

    float ao = 0.0;
    vec3 tempNormalVS;
    
    for (int s = 0; s < int(SAMPLE_COUNT); s++) {
        // 随机偏移
        vec3 sampleOffset = PickSamplePoint(uv, s);
        // 调整偏移方向， 与 normalVS 同向,保证半球
        sampleOffset = -sampleOffset * sign(dot(-normalVS , sampleOffset));
        sampleOffset = sampleOffset*0.5;

        vec3 positionVS_S = sampleOffset + positionVS;

        // 将偏移后view space 坐标 乘上投影矩阵转换到 clip space
        vec3 positionCS_S = (u_Projection * vec4(positionVS_S, 1.0)).xyz;
        // 获取 偏移点 的屏幕 uv
        vec2 uv_S = (positionCS_S.xy / (-positionVS_S.z) + 1.0) * 0.5;
        // 采样 uv_S 获取 深度值
        //取得深度
        float depthCS_S = SAMPLE_DEPTH_TEXTURE(u_CameraDepthTexture, uv_S);
        if (uv_S.x < 0.0 || uv_S.y > 1.0) {
            depthCS_S += 1.0e8;
        }
        //得到采样点的世界坐标
        vec3 positionVS_S2 = GetPositionVS(uv_S, depthCS_S);
        vec3 sampleOffset2 = positionVS_S2 - positionVS;
        float a1 = max(dot(sampleOffset2, normalVS) - kBeta * depthVS, 0.0);
        float a2 = dot(sampleOffset2, sampleOffset2) + EPSILON;
        ao += a1/ a2;
    }

    ao *= u_radius;

    ao = pow(abs(ao * u_Intensity / SAMPLE_COUNT), kContrast);

     gl_FragColor = PackAONormal(ao, normalVS);
}