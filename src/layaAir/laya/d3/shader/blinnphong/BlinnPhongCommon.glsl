#if !defined(BlinnPhongCommon_lib)
    #define BlinnPhongCommon_lib

struct BlinnPhongSurface {
    vec3 positionWS;
    vec3 normalWS;
    vec3 viewDirectionWS;

    vec3 diffuseColor;
    vec3 specularColor;
    float shininess;
    vec3 gloss;
    float alpha;
    float alphaClip;
};

varying vec3 v_ViewDir;

#endif // BlinnPhongCommon_libn