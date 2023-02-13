#if !defined(SceneFog_lib)
    #define SceneFog_lib

#include "Camera.glsl";

    
#ifdef FOG
    varying float v_fogFactor;
    void FogHandle(in float fact)
    {
        float lerpFact = 0.0;
        #ifdef FOG_EXP
            lerpFact = fact * (u_FogParams.z / log(2.0));
            lerpFact = exp2(-lerpFact);
        #elif defined(FOG_EXP2)
            lerpFact = fact * (u_FogParams.z / sqrt(log(2.0)));
            lerpFact = exp2(-lerpFact);
        #else // default FOG_LINEAR
            lerpFact = (-1.0 * fact / (u_FogParams.y - u_FogParams.x) + u_FogParams.y / (u_FogParams.y - u_FogParams.x));
        #endif
        v_fogFactor = lerpFact;
    }
#endif
#endif // SceneFog_lib