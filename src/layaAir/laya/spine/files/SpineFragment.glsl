#if !defined(SpineFragment_lib)
        #define SpineFragment_lib

varying vec2 vUv;
varying vec4 vColor;
varying vec2 v_cliped;

vec4 getColor(){
    return texture2D(u_spineTexture, vUv.xy)*vColor;//vec4(1.0,0.0,0.0,1.0);
}

void clip(){
    if(v_cliped.x<0.) discard;
    if(v_cliped.x>1.) discard;
    if(v_cliped.y<0.) discard;
    if(v_cliped.y>1.) discard;
}

#endif //SpineFragment_lib