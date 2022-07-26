#if !defined(Sprite3DCommon_lib)
    #define Sprite3DCommon_lib

uniform mat4 u_WorldMat;

    #ifdef BONE
// todo const int c_MaxBoneCount = 24
uniform mat4 u_Bones[24];

	#ifdef SIMPLEBONE
	    #include "BakedBoneMatrixSampler.glsl";
uniform vec4 u_SimpleAnimatorParams;
uniform sampler2D u_SimpleAnimatorTexture;
uniform float u_SimpleAnimatorTextureSize;
	#endif // SIMPLEBONE

    #endif // BONE

    #ifdef LIGHTMAP
uniform vec4 u_LightmapScaleOffset;
    #endif // LIGHTMAP

vec2 tranformLightMapUV(in vec2 texcoord, in vec4 tilingOffset)
{
    vec2 lightMapUV = vec2(texcoord.x, 1.0 - texcoord.y) * tilingOffset.xy + tilingOffset.zw;
    lightMapUV.y = 1.0 - lightMapUV.y;
    return lightMapUV;
}

#endif // Sprite3DCommon_lib