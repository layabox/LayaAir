#define SHADER_NAME TrailVS

#include "Camera.glsl";
#include "Scene.glsl"
#include "SceneFogInput.glsl"

#include "TrailVertexUtil.glsl"

void main()
{
    float normalizeTime = (u_CurTime - a_BirthTime) / u_LifeTime;

    v_Texcoord0 = vec2(a_Texcoord0X, 1.0 - a_Texcoord0Y) * u_TilingOffset.xy + u_TilingOffset.zw;

    v_Color = a_Color;

    vec3 cameraPos = (u_View * a_position).rgb;
    gl_Position = u_Projection * vec4(cameraPos + a_OffsetVector * getCurWidth(normalizeTime), 1.0);

    gl_Position = remapPositionZ(gl_Position);
	#ifdef FOG
        FogHandle(gl_Position.z);
    #endif
}