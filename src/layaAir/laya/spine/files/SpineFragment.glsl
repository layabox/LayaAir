#if !defined(SpineFragment_lib)
        #define SpineFragment_lib

varying vec2 vUv;
varying vec4 vColor;

vec4 getColor(){
    return texture2D(u_spineTexture, vUv.xy)*vColor;//vec4(1.0,0.0,0.0,1.0);
}

#endif //SpineFragment_lib