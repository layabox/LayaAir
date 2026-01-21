#if !defined(ClipFrag_lib)
    #define ClipFrag_lib

varying vec2 v_cliped;

void clip(){
    #ifdef UNIFORMCLIP
        if(v_cliped.x<0.) discard;
        if(v_cliped.x>1.) discard;
        if(v_cliped.y<0.) discard;
        if(v_cliped.y>1.) discard;
    #endif
    // if(v_cliped.x<0.) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // if(v_cliped.x>1.) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    // if(v_cliped.y<0.) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    // if(v_cliped.y>1.) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}

#endif  //ClipFrag_lib