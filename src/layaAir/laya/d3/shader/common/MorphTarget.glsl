#if !defined(MorphTarget_lib)
    #define MorphTarget_lib

    #ifdef GRAPHICS_API_GLES3

/// static mesh property
uniform sampler2DArray u_MorphTargetsTex;
// xy: tex size, z: attribute count
uniform vec4 u_MorphParams;
uniform vec4 u_MorphAttrOffset;

	#define Morph_TexWidth	   u_MorphParams.x
	#define Morph_TexHeight	   u_MorphParams.y
	#define Morph_AttributeNum u_MorphParams.z
	#define Morph_TargetNum	   u_MorphParams.w

	#define Morph_PositionOffset u_MorphAttrOffset.x
	#define Morph_NormalOffset   u_MorphAttrOffset.y
	#define Morph_TangentOffset  u_MorphAttrOffset.z

#define MORPH_MAX_COUNT 32 //兼容WGSL

/// dynamic params
//uniform float u_MorphActiveTargets[MORPH_MAX_COUNT];
//uniform float u_MorphTargetWeights[MORPH_MAX_COUNT];
uniform vec4 u_MorphActiveTargets[MORPH_MAX_COUNT];
uniform int u_MorphTargetActiveCount;

	#define MORPH_ACTIVE_COUNT u_MorphTargetActiveCount

vec4 sampleMorphTargets(in int vertexID, in float targetID)
{
    int v = vertexID / int(Morph_TexWidth);
    int u = vertexID - v * int(Morph_TexWidth);

    vec3 uvw = vec3((float(u) + 0.5) / Morph_TexWidth, (float(v) + 0.5) / Morph_TexHeight, targetID);

    return texture(u_MorphTargetsTex, uvw);
}

vec3 positionMorph(in vec3 position)
{
    int vertexID = gl_VertexID * int(Morph_AttributeNum) + int(Morph_PositionOffset);

    for (int i = 0; i < MORPH_ACTIVE_COUNT; i++)
	{
	    float index = u_MorphActiveTargets[i].x;
		float weight = u_MorphActiveTargets[i].y;

	    position += sampleMorphTargets(vertexID, index).xyz * weight;
	}

    return position;
}

vec3 normalMorph(in vec3 normal)
{
    int vertexID = gl_VertexID * int(Morph_AttributeNum) + int(Morph_NormalOffset);
    for (int i = 0; i < MORPH_ACTIVE_COUNT; i++)
	{
	    float index = u_MorphActiveTargets[i].x;
		float weight = u_MorphActiveTargets[i].y;

	    normal += sampleMorphTargets(vertexID, index).xyz * weight;
	}

    return normal;
}

vec4 tangentMorph(in vec4 tangent)
{
    int vertexID = gl_VertexID * int(Morph_AttributeNum) + int(Morph_TangentOffset);
    for (int i = 0; i < MORPH_ACTIVE_COUNT; i++)
	{
	    float index = u_MorphActiveTargets[i].x;
		float weight = u_MorphActiveTargets[i].y;

	    vec4 sampleTangent = sampleMorphTargets(vertexID, index);

	    tangent.xyz += sampleTangent.xyz * weight * tangent.w * sampleTangent.w;
	}

    return tangent;
}

    #endif // GRAPHICS_API_GLES3

#endif // MorphTarget_lib