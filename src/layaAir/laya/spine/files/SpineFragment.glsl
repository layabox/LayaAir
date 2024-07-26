#if !defined(SpineFragment_lib)
        #define SpineFragment_lib
        
        #include "Sprite2DFrag.glsl";
    
vec4 getColor(){
    return texture2D(u_spineTexture, v_texcoord.xy) * v_color;//vec4(1.0,0.0,0.0,1.0);
}

#endif //SpineFragment_lib