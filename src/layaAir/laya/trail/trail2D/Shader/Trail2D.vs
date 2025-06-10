#define SHADER_NAME Trail2DVS

#include "Sprite2DVertex.glsl"

#include "TrailVertexUtil.glsl"

void main(){
    float normalizeTime = (u_CurTime - a_BirthTime) / u_LifeTime;
    v_Texcoord0 = vec2(a_Texcoord0X, 1.0 - a_Texcoord0Y) * u_TilingOffset.xy + u_TilingOffset.zw;
    v_Color = a_Color;
    vec4 glPos;
    vec2 globalPos;
    vec2 trailPos = a_position.xy + a_OffsetVector.xy * getCurWidth(normalizeTime);
    getGlobalPos(trailPos,globalPos);
    vec2 viewPos;
    getViewPos(globalPos,viewPos);
    clip(viewPos);
    getProjectPos(viewPos,glPos);
    gl_Position = glPos;
}