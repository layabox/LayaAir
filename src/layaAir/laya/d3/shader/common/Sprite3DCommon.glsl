#if !defined(Sprite3DCommon_lib)
    #define Sprite3DCommon_lib

uniform mat4 u_WorldMat;

    #ifdef BONE
// todo const int c_MaxBoneCount = 24
uniform mat4 u_Bones[24];

	#ifdef SIMPLEBONE
uniform vec4 u_SimpleAnimatorParams;
uniform sampler2D u_SimpleAnimatorTexture;
uniform float u_SimpleAnimatorTextureSize;
	#endif // SIMPLEBONE

    #endif // BONE

    #ifdef LIGHTMAP
uniform vec4 u_LightmapScaleOffset;
    #endif // LIGHTMAP

#endif // Sprite3DCommon_lib