#define SHADER_NAME EdgeEffectFS
#include "DepthNormalUtil.glsl";

varying vec2 v_Texcoord0;

#ifdef DEPTHNORMAL
    void getDepthNormal(out float depth, out vec3 normal){
        vec4 col = texture2D(u_DepthNormalTex, v_Texcoord0);
        DecodeDepthNormal(col, depth, normal);
    }

    float getDepth(vec2 uv) {
        float depth;
        vec3 normal;
        vec4 col = texture2D(u_DepthNormalTex, uv);
        DecodeDepthNormal(col, depth, normal);
        return depth;
    }

    vec3 getNormal(vec2 uv) {
        float depth;
        vec3 normal;
        vec4 col = texture2D(u_DepthNormalTex, uv);
        DecodeDepthNormal(col, depth, normal);
        return normal;
    }

#endif

#ifdef DEPTH
    float getDepth(vec2 uv) {
        float depth = texture2D(u_DepthTex, uv).r;
        depth = Linear01Depth(depth, u_DepthBufferParams);
        return depth;
    }
#endif

void SobelSample(in vec2 uv,out vec3 colorG, out vec3 normalG, out vec3 depthG) {

    float offsetx = u_MainTex_TexelSize.x;
    float offsety = u_MainTex_TexelSize.y;
    vec2 offsets[9];
    offsets[0] = vec2(-offsetx,  offsety); // 左上
    offsets[1] = vec2( 0.0,    offsety); // 正上
    offsets[2] = vec2( offsetx,  offsety); // 右上
    offsets[3] = vec2(-offsetx,  0.0);   // 左
    offsets[4] = vec2( 0.0,    0.0);   // 中
    offsets[5] = vec2( offsetx,  0.0);   // 右
    offsets[6] = vec2(-offsetx, -offsety); // 左下
    offsets[7] = vec2( 0.0,   -offsety); // 正下
    offsets[8] = vec2( offsetx, -offsety); // 右下

    float Gx[9];
    Gx[0] = -1.0; Gx[1] = 0.0; Gx[2] = 1.0; 
    Gx[3] = -2.0; Gx[4] = 0.0; Gx[5] = 2.0; 
    Gx[6] = -1.0; Gx[7] = 0.0; Gx[8] = 1.0; 

    float Gy[9];
    Gy[0] = 1.0; Gy[1] = 2.0; Gy[2] = 1.0; 
    Gy[3] = 0.0; Gy[4] = 0.0; Gy[5] = 0.0; 
    Gy[6] = -1.0; Gy[7] = -2.0;Gy[8] = -1.0; 

    vec3 sampleTex[9];
    float sampleDepth[9];
    vec3 sampleNormal[9];
    for (int i = 0; i < 9; i++)
    {
        vec2 uvOffset = uv + offsets[i];
        sampleTex[i] = texture2D(u_MainTex, uvOffset).rgb;
        sampleDepth[i] = getDepth(uvOffset);
        sampleNormal[i] = (getNormal(uvOffset) + 1.0) / 2.0;
    }

    vec3 colorGx = vec3(0.0);
    vec3 colorGy = vec3(0.0);
    float depthGx = 0.0;
    float depthGy = 0.0;
    vec3 normalGx = vec3(0.0);
    vec3 normalGy = vec3(0.0);

    for (int i = 0; i < 9; i++) {
        colorGx += sampleTex[i] * Gx[i];
        colorGy += sampleTex[i] * Gy[i];
        depthGx += sampleDepth[i] * Gx[i];
        depthGy += sampleDepth[i] * Gy[i];
        normalGx += sampleNormal[i] * Gx[i];
        normalGy += sampleNormal[i] * Gy[i];
    }

    float colDepthG = abs(depthGx) + abs(depthGy);
    depthG = vec3(colDepthG);

    colorG = abs(colorGx) + abs(colorGy);

    normalG = abs(normalGx) + abs(normalGy);

}

float ColorGray(vec3 color) {
    return (color.r + color.g + color.b) / 3.0;
}

vec3 getEdgeValue(float hold, vec3 valueG) {
    return vec3(step(hold, ColorGray(valueG)));
}

void main() {
    
    vec2 uv = v_Texcoord0;

    vec3 colorG, normalG, depthG;
    SobelSample(uv, colorG, normalG, depthG);
    vec3 edgeColor = vec3(0.2);

    #if defined(DEPTHEDGE)
        vec3 edgeValue = getEdgeValue(u_Depthhold, depthG);
    #endif

    #if defined(NORMALEDGE)
        vec3 edgeValue = getEdgeValue(u_NormalHold, normalG);
    #endif

    #if defined(COLOREDGE)
        vec3 edgeValue = getEdgeValue(u_ColorHold, colorG);
    #endif

    vec3 fillColor = u_EdgeColor.xyz;

    #ifdef SOURCE
        #ifdef BLITSCREEN_INVERTY
            uv.y = 1.0 - uv.y;
        #endif
        fillColor = texture2D(u_MainTex, uv).rgb;
    #endif

    vec3 finalColor = mix(fillColor, edgeColor, edgeValue);
    gl_FragColor = vec4(finalColor, 1.0);

}