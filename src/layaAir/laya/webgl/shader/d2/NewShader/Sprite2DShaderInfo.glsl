
#if defined(PRIMITIVEMESH)
    struct vertexInfo {
        vec4 color;
        vec2 cliped;
        vec2 lightUV[5];
    };
#elif defined(TEXTUREVS)
   struct vertexInfo {
        vec4 color;
        vec2 cliped;
        vec4 texcoordAlpha;
        float useTex;
        vec2 lightUV[5];
    };
#endif