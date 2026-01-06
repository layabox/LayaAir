#if !defined(ShurikenParticleFrag_glsl)
#define ShurikenParticleFrag_glsl

#include "Particle2DCommon.glsl"

vec4 getParticleColor()
{
    return v_ParticleColor;
}

vec2 getParticleUV()
{
    return v_ParticleUV;
}

void clip()
{
    if(v_cliped.x < 0.)
        discard;
    if(v_cliped.x > 1.)
        discard;
    if(v_cliped.y < 0.)
        discard;
    if(v_cliped.y > 1.)
        discard;
}

#endif // ShurikenParticleFrag_glsl