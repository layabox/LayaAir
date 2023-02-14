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
            clamp(lerpFact, 0.0, 1.0);
            return mix(vec3(0.0), color, lerpFact);
        #else
            clamp(lerpFact, 0.0, 1.0);
            return mix(u_FogColor.rgb, color, lerpFact);
        #endif // ADDTIVEFOG
    }

    vec3 sceneLitFog(in vec3 color)
    {
        float lerpFact = getFogFactor();
        clamp(lerpFact, 0.0, 1.0);
        return mix(u_FogColor.rgb, color, lerpFact);
    }

#endif
#endif // SceneFog_lib