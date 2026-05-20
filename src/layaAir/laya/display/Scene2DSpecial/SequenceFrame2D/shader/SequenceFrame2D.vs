#define SHADER_NAME SequenceFrame2DVS

#include "Sprite2DVertex.glsl";

varying vec2 v_texcoord;

uniform float u_Time;

struct sequenceFrameVertexInfo {
    vec2 pos;
    vec2 uv;
    vec4 color;
    vec2 lightUV;
};

// Use the per-instance matrix instead of u_NMatrix so batched sprites can keep
// their own world transforms.
void getSequenceFrameGlobalPosition(in vec2 positionOS, out vec2 globalPos) {
    transfrom(positionOS, a_SequenceFrameMatrix0.xyz, a_SequenceFrameMatrix1.xyz, globalPos);
}

// Keep the final position path aligned with BaseRenderNode2D:
// world position -> clip -> Camera2D/render texture view -> projection.
vec4 getSequenceFramePosition(in vec2 rawGlobalPos) {
    vec2 globalPos = rawGlobalPos;

    clip(globalPos);

    vec2 viewPos;
    getViewPos(globalPos, viewPos);

    vec4 projectPos;
    getProjectPos(viewPos, projectPos);
    return projectPos;
}

#ifdef LIGHT2D_ENABLE
varying vec2 v_lightUV;
uniform vec4 u_LightAndShadow2DParam;

void getSequenceFrameLightUV(in vec2 globalPos, out vec2 lightUV) {
    lightUV.x = (globalPos.x - u_LightAndShadow2DParam.x) / u_LightAndShadow2DParam.z;
    lightUV.y = 1.0 - (globalPos.y - u_LightAndShadow2DParam.y) / u_LightAndShadow2DParam.w;
}

void applySequenceFrameLightUV(in sequenceFrameVertexInfo info) {
    v_lightUV = info.lightUV;
}
#endif

void getSequenceFrameVertexInfo(inout sequenceFrameVertexInfo info) {
    float unitPixels = max(a_SequenceFrameColorUnit.w, 0.0001);
    vec2 sourceFramePixels = max(a_SequenceFrameSizeTiles.xy, vec2(1.0));
    vec2 displaySize = sourceFramePixels / max(max(sourceFramePixels.x, sourceFramePixels.y), 0.0001) * unitPixels;
    vec2 localOffset = a_SequenceFramePositionUV.xy * displaySize;
    info.pos = localOffset + vec2(a_SequenceFrameMatrix0.w, a_SequenceFrameMatrix1.w);

    float elapsedAge = max(u_Time - a_SequenceFrameRuntime.x, 0.0);
    float lifeTime = max(a_SequenceFramePlayback.y, 0.0001);

    // Runtime.w: 0 = paused/hold, 1 = one-shot playing, 2 = loop playing.
    // Looping stays fully u_Time driven in shader; one-shot completion is
    // handled on CPU so finished instances are removed from the batch.
    float playbackState = a_SequenceFrameRuntime.w;
    float runningAge = mix(elapsedAge, mod(elapsedAge, lifeTime), step(1.5, playbackState));
    float age = clamp(mix(a_SequenceFrameRuntime.z, runningAge, step(0.5, playbackState)), 0.0, lifeTime);
    float alpha = clamp(a_SequenceFrameRuntime.y, 0.0, 1.0);
    float startFrame = max(a_SequenceFramePlayback.x, 0.0);
    float cycles = max(a_SequenceFramePlayback.z, 0.0);
    float tilesX = max(floor(a_SequenceFrameSizeTiles.z + 0.5), 1.0);
    float tilesY = max(floor(a_SequenceFrameSizeTiles.w + 0.5), 1.0);
    float frameCount = max(floor(a_SequenceFramePlayback.w + 0.5), 1.0);

    float normalizedAge = min(age / lifeTime, 0.999999);
    float frame = mod(floor(normalizedAge * cycles * frameCount) + floor(startFrame), frameCount);
    float indexX = floor(mod(frame, tilesX));
    float indexY = floor(frame / tilesX);
    vec2 gridUV = vec2(1.0 / tilesX, 1.0 / tilesY);

    // Keep sequence-frame sampling half a texel inside the selected cell.
    // Sampling exactly on cell borders can bleed from neighbor frames when the
    // texture uses linear filtering or comes from an atlas.
    vec2 innerFrameUV = (a_SequenceFramePositionUV.zw * max(sourceFramePixels - vec2(1.0), vec2(0.0)) + vec2(0.5)) / sourceFramePixels;
    vec2 frameUV = (innerFrameUV + vec2(indexX, indexY)) * gridUV;

    info.uv = a_SequenceFrameUVRect.xy + frameUV * a_SequenceFrameUVRect.zw;

    vec4 renderColor = linearToGamma(vec4(a_SequenceFrameColorUnit.rgb, alpha));
    renderColor.rgb *= renderColor.a;
    info.color = renderColor;
}

void main() {
    sequenceFrameVertexInfo info;
    getSequenceFrameVertexInfo(info);

    v_texcoord = info.uv;
    v_color = info.color;

    vec2 globalPos;
    getSequenceFrameGlobalPosition(info.pos, globalPos);
#ifdef LIGHT2D_ENABLE
    getSequenceFrameLightUV(globalPos, info.lightUV);
    applySequenceFrameLightUV(info);
#endif
    gl_Position = getSequenceFramePosition(globalPos);
}
