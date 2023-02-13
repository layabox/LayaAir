#if !defined(SceneFog_lib)
    #define SceneFog_lib

#include "Camera.glsl";

    
#ifdef FOG
    varying float v_fogFactor;
    float getFogFactor()
    {
        return v_fogFactor;
    }

    vec3 scenUnlitFog(in vec3 color)
    {
        float lerpFact = getFogFactor();
        #ifdef ADDTIVEFOG
        return mix(vec3(0.0), color, lerpFact);
        #else
        return mix(u_FogColor.rgb, color, lerpFact);
        #endif // ADDTIVEFOG
    }

    vec3 sceneLitFog(in vec3 color)
    {
        float lerpFact = getFogFactor();
        return mix(u_FogColor.rgb, color, lerpFact);
    }

#endif
#endif // SceneFog_lib