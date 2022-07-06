#if !defined(MeshCommon_lib)
    #define MeshCommon_lib

// todo uniform block
uniform mat4 u_WorldMat;
uniform vec4 u_LightmapScaleOffset;
// todo const int c_MaxBoneCount = 24 动态调整
uniform mat4 u_Bones[24];

varying vec3 v_PositionWS;

    // #ifdef VERTEXNORMAL
varying vec3 v_Normal;
    // #endif VERTEXNORMAL

    #if defined(NEEDTBN)
varying vec4 v_Tangent;
    #endif // NEEDTBN

    #ifdef UV
varying vec2 v_Texcoord0;
    #endif // UV

    #ifdef UV1
varying vec2 v_Texcoord1;
    #endif // UV1

    #ifdef COLOR
varying vec4 v_VertexColor;
    #endif // COLOR

struct VertexParams {

    vec3 positionWS;

    // #ifdef VERTEXNORMAL
    vec3 normalWS;
    // #endif // VERTEXNORMAL

    #ifdef NEEDTBN
    vec4 tangentWS;
    vec3 biNormalWS;
    #endif // NEEDTBN

    #ifdef UV
    vec2 texCoord0;
    #endif // UV

    #ifdef UV1
    vec2 texCoord1;
    #endif // UV1

    #ifdef COLOR
    vec4 vertexColor;
    #endif // COLOR
};

#endif // MeshCommon_lib