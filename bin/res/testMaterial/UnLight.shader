Shader3D Start
{
    type: Shader3D,
    name: UnLight,
    enableInstancing: true,
    supportReflectionProbe: true,
    uniformMap: {
        u_AlphaTestValue: { type: Float, default: 0.5 },
        u_TilingOffset: { type: Vector4, default: [1, 1, 0, 0], block: unlit },
        u_AlbedoColor: { type: Color, default: [1, 1, 1, 1], block: unlit },
        u_AlbedoTexture: { type: Texture2D, options: { define: "ALBEDOTEXTURE" } },
    },
    defines: {
        ENABLEVERTEXCOLOR: { type: bool, default: false },
    },
    shaderPass:[
        {
            pipeline: Forward,
            VS: unlitVS,
            FS: unlitPS,
        },
    ]
}
Shader3D End

GLSL Start
#defineGLSL unlitVS
#define SHADER_NAME Empty

#include "Math.glsl";
#include "Scene.glsl";
#include "Camera.glsl";
#include "SceneFogInput.glsl";
#include "Sprite3DVertex.glsl";
#include "VertexCommon.glsl";

#ifdef UV
varying vec2 v_Texcoord0;
#endif // UV
#ifdef COLOR
varying vec4 v_VertexColor;
#endif // COLOR

void main()
{
    Vertex vertex;
    getVertexParams(vertex);
#ifdef UV
    v_Texcoord0 = transformUV(vertex.texCoord0, u_TilingOffset);
#endif // UV
#ifdef COLOR
    v_VertexColor = vertex.vertexColor;
#endif // COLOR
    mat4 worldMat = getWorldMatrix();
    vec4 pos = (worldMat * vec4(vertex.positionOS, 1.0));
    vec3 positionWS = pos.xyz / pos.w;
    gl_Position = getPositionCS(positionWS);
    gl_Position = remapPositionZ(gl_Position);
#ifdef FOG
    FogHandle(gl_Position.z);
#endif
}
#endGLSL

#defineGLSL unlitPS
#define SHADER_NAME Empty

#include "Color.glsl";
#include "Scene.glsl";
#include "Camera.glsl";
#include "SceneFog.glsl";
#include "Sprite3DFrag.glsl";

varying vec4 v_Color;
varying vec2 v_Texcoord0;

void main()
{
    vec2 uv = v_Texcoord0;
    vec3 color = u_AlbedoColor.rgb;
    float alpha = u_AlbedoColor.a;
    vec4 albedoSampler = texture2D(u_AlbedoTexture, uv);
#ifdef ALBEDOTEXTURE
    #ifdef Gamma_u_AlbedoTexture
    albedoSampler = gammaToLinear(albedoSampler);
    #endif // Gamma_u_AlbedoTexture
    color *= albedoSampler.rgb;
    alpha *= albedoSampler.a;
#endif // ALBEDOTEXTURE
#ifdef COLOR
    #ifdef ENABLEVERTEXCOLOR
    vec4 vertexColor = v_Color;
    color *= vertexColor.rgb;
    alpha *= vertexColor.a;
    #endif // ENABLEVERTEXCOLOR
#endif // COLOR
#ifdef ALPHATEST
    if (alpha < u_AlphaTestValue)
        discard;
#endif // ALPHATEST
#ifdef FOG
    color = scenUnlitFog(color);
#endif // FOG
    gl_FragColor = vec4(color, alpha);
    gl_FragColor = outputTransform(gl_FragColor);
}
#endGLSL
GLSL End