#if !defined(SpineFragment_lib)
        #define SpineFragment_lib
        
        #include "Sprite2DFrag.glsl";
    
vec4 getColor(){
    vec4 color = texture2D(u_spineTexture, v_texcoord.xy);//vec4(1.0,0.0,0.0,1.0);
    #ifndef GAMMATEXTURE
        //linear
        #ifdef GAMMASPACE
            color.xyz = linearToGamma(color.xyz);    
        #endif
    #else
        //gamma
        #ifndef GAMMASPACE
            color.xyz = gammaToLinear(color.xyz);
        #endif
    #endif
    
    return color*v_color;
}

#endif //SpineFragment_lib