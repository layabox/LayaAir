#if !defined(Sprite3DCommon_lib)
    #define Sprite3DCommon_lib

uniform mat4 u_WorldMat;

// todo const int c_MaxBoneCount = 24
uniform mat4 u_Bones[24];

    #ifdef LIGHTMAP
uniform vec4 u_LightmapScaleOffset;
    #endif // LIGHTMAP

#endif // Sprite3DCommon_lib