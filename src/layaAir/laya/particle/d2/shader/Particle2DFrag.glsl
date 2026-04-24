#if !defined(ShurikenParticleFrag_glsl)
#define ShurikenParticleFrag_glsl

#include "ClipFrag.glsl"
#include "Particle2DCommon.glsl"

vec4 getParticleColor()
{
    return v_ParticleColor;
}

vec2 getParticleUV()
{
    return v_ParticleUV;
}

#endif // ShurikenParticleFrag_glsl