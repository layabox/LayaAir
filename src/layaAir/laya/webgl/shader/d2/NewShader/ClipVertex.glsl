#if !defined(ClipVertex_lib)
    #define ClipVertex_lib

#ifdef UNIFORMCLIP
    uniform vec2 u_clipOffset;
#endif

void clip(inout vec2 globalPos) {
#ifdef UNIFORMCLIP
    globalPos += u_clipOffset;
#endif
}

#endif
