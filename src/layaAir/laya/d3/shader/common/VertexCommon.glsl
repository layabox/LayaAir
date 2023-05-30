#if !defined(VertexCommon_lib)
    #define VertexCommon_lib

    #ifdef MORPHTARGETS
	#include "MorphTarget.glsl";
    #endif // MORPHTARGETS

struct Vertex {

    vec3 positionOS;

    vec3 normalOS;

    #ifdef TANGENT
    vec4 tangentOS;
    #endif // TANGENT

    // todo  uv define ?
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

/**
 * vertex position
 */
vec4 getVertexPosition()
{
    vec4 position = a_Position;

    #ifdef MORPHTARGETS
	#ifdef MORPHTARGETS_POSITION
    position.xyz = positionMorph(position.xyz);
	#endif // MORPHTARGETS_POSITION
    #endif // MORPHTARGETS

    return position;
}

vec3 getVertexNormal()
{
    vec3 normal = a_Normal.xyz;
    #ifdef MORPHTARGETS
	#ifdef MORPHTARGETS_NORMAL
    normal.xyz = normalMorph(normal);
	#endif // MORPHTARGETS_NORMAL
    #endif // MORPHTARGETS

    return normal;
}

    #ifdef TANGENT
vec4 getVertexTangent()
{
    vec4 tangent = a_Tangent0;

	#ifdef MORPHTARGETS
	    #ifdef MORPHTARGETS_TANGENT
    tangent = tangentMorph(tangent);
	    #endif // MORPHTARGETS_TANGENT
	#endif // MORPHTARGETS

    return tangent;
}
    #endif // TANGENT

void getVertexParams(inout Vertex vertex)
{
    vertex.positionOS = getVertexPosition().xyz;

    vertex.normalOS = getVertexNormal();

    #ifdef TANGENT
    vertex.tangentOS = getVertexTangent();
    #endif // TANGENT

    #ifdef UV
    vertex.texCoord0 = a_Texcoord0;
    #endif // UV

    #ifdef UV1
    vertex.texCoord1 = a_Texcoord1;
    #endif // UV1

    #ifdef COLOR
    // consider vertexColor is gamma
    vertex.vertexColor = vec4(pow(a_Color.rgb, vec3(2.2)), a_Color.a);
    #endif // COLOR
}

#endif // VertexCommon_lib