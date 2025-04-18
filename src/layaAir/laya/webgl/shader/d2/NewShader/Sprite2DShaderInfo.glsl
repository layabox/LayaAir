
#if defined(PRIMITIVEMESH)
    struct vertexInfo {
        vec2 pos;
        vec4 color;
        vec2 cliped;
    };
#elif defined(TEXTUREVS)
   struct vertexInfo {
        vec2 pos;
        vec4 color;
        vec2 cliped;
        vec4 texcoordAlpha;
        float useTex;
    };
#endif