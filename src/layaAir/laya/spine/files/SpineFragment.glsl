#if !defined(SpineFragment_lib)
        #define SpineFragment_lib
        
        #include "Sprite2DFrag.glsl";
    

vec3 gammaToLinear(in vec3 value)
{
    return pow((value + 0.055) / 1.055, vec3(2.4));
}

vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}

vec3 linearToGamma(in vec3 value)
{
    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));

    // return pow(value, vec3(1.0 / 2.2));
    // return pow(value, vec3(0.455));
}

vec4 linearToGamma(in vec4 value)
{
    return vec4(linearToGamma(value.rgb), value.a);
}

vec4 getColor(){
    vec4 color = texture2D(u_spineTexture, vUv.xy);//vec4(1.0,0.0,0.0,1.0);
    #ifndef GAMMATEXTURE
        //是linear数据
        #ifdef GAMMASPACE
            color.xyz = linearToGamma(color.xyz);    
        #endif
    #else
        //gamma数据
        #ifndef GAMMASPACE
            color.xyz = gammaToLinear(color.xyz);
        #endif
    #endif
    return color*vColor;
}

#endif //SpineFragment_lib