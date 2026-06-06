#if !defined(ShurikenParticleVertex_glsl)
#define ShurikenParticleVertex_glsl
#include "ClipVertex.glsl"
#include "Particle2DCommon.glsl"

#include "Curve.glsl"

#include "Particle2DLifetimeColor.glsl"
#include "Particle2DLifetimeRotation.glsl"
#include "Particle2DLifetimeSize.glsl"
#include "Particle2DLifetimeVelocity.glsl"
#include "Particle2DTextureSheetAnimation.glsl"

struct VertexInfo
{
    vec2 position;
    vec2 uv;
};

VertexInfo getVertexInfo()
{
    VertexInfo vertex;
    vertex.position = a_PositionAndUV.xy;
    vertex.uv = a_PositionAndUV.zw;
    return vertex;
}

struct Particle
{
    float age;
    float lifetime;
    vec2 position;
    vec2 startVelocity;
    vec2 size;
    vec2 rot;
    vec2 gravity;
    vec4 color;
    vec2 uv;
    vec2 meshPos;
};

vec2 transfrom(vec2 pos, vec3 xDir, vec3 yDir)
{
    vec2 outPos;
    outPos.x = xDir.x * pos.x + xDir.y * pos.y + xDir.z;
    outPos.y = yDir.x * pos.x + yDir.y * pos.y + yDir.z;
    return outPos;
}

Particle getParticle()
{
    Particle p;

    p.age = u_CurrentTime - a_SizeAndTimes.z;
    p.lifetime = a_SizeAndTimes.w;
    p.position = a_DirectionAndPosition.zw * vec2(1.0, -1.0);

    // vec3 matrix0 = vec3(u_NMatrix_0) * vec3(1.0, -1.0, 0.0);
    // matrix0.z = 0.0;
    // vec3 matrix1 = vec3(u_NMatrix_1) * vec3(-1.0, 1.0, 0.0);
    // matrix1.z = 0.0;
    // p.position = transfrom(p.position, matrix0, matrix1) * vec2(1.0, -1.0);

    vec4 spriteRotAndScale = mix(u_SpriteRotAndScale, a_SpriteRotAndSacle, a_SpeedSpaceAndRot.y);
    // spriteRotAndScale = a_SpriteRotAndSacle;

    vec2 spriteRot = spriteRotAndScale.xy;
    vec2 spriteScale = spriteRotAndScale.zw;
    mat2 spriteRotMat = mat2(spriteRot.x, spriteRot.y, -spriteRot.y, spriteRot.x);

    p.position = spriteRotMat * (p.position * spriteScale);

    float normalizedAge = p.age / p.lifetime;

    vec2 direction = normalize((a_DirectionAndPosition.xy));

    float startSpeed = a_SpeedSpaceAndRot.x;

    p.startVelocity = direction * startSpeed;

    p.size = a_SizeAndTimes.xy;
    p.rot = a_SpeedSpaceAndRot.zw;
    p.gravity = a_SpriteTransAndGravity.zw;
    p.color = a_StartColor;

#ifdef COLOROVERLIFETIME
    p.color *= getColorOverLifetime(normalizedAge);
#endif // COLOROVERLIFETIME

    VertexInfo vertex = getVertexInfo();
    p.meshPos = vertex.position;

    p.uv = vertex.uv;
#ifdef TEXTURESHEETANIMATION
    p.uv = getAnimationUV(normalizedAge, p.uv);
#endif // TEXTURESHEETANIMATION

    return p;
}

vec4 transPosition(vec2 position, vec3 nMatrix0, vec3 nMatrix1)
{
    vec4 pos = vec4(position * u_UnitPixels, 0.0, 1.0);

    float x = nMatrix0.x * pos.x + nMatrix0.y * pos.y + nMatrix0.z;
    float y = nMatrix1.x * pos.x + nMatrix1.y * pos.y + nMatrix1.z;

    x = (x / u_size.x - 0.5) * 2.0;
    y = (0.5 - y / u_size.y) * 2.0;

    pos.xy = vec2(x, y);
    return pos;
}

void getViewPos(in vec2 globalPos, out vec2 viewPos)
{
    #ifdef RENDERTEXTURE
    vec2 tempPos = transfrom(globalPos, u_InvertMat_0, u_InvertMat_1);
        #ifdef CAMERA2D
    viewPos.xy = (u_view2D * vec3(tempPos, 1.0)).xy + u_size / 2.;
        #else
    viewPos.xy = tempPos;
        #endif
    #else
        #ifdef CAMERA2D
    viewPos.xy = (u_view2D * vec3(globalPos, 1.0)).xy + u_size / 2.;
        #else
    viewPos.xy = globalPos;
        #endif
    #endif
}

void getProjectPos(in vec2 viewPos, out vec4 projectPos)
{
    projectPos = vec4((viewPos.x / u_size.x - 0.5) * 2.0, (0.5 - viewPos.y / u_size.y) * 2.0, 0., 1.0);
    #ifdef INVERTY
    projectPos.y = -projectPos.y;
    #endif
}

vec4 updateParticlePosition(Particle particle)
{
    vec2 position = particle.meshPos;
    vec4 spriteRotAndScale = mix(u_SpriteRotAndScale, a_SpriteRotAndSacle, a_SpeedSpaceAndRot.y);
    // spriteRotAndScale = a_SpriteRotAndSacle;
    vec2 spriteRot = spriteRotAndScale.xy;
    vec2 spriteScale = spriteRotAndScale.zw;
    mat2 spriteRotMat = mat2(spriteRot.x, spriteRot.y, -spriteRot.y, spriteRot.x);

    vec2 startVelocity = spriteRotMat * (particle.startVelocity * spriteScale * vec2(1.0, -1.0));

    vec2 particleOffset = startVelocity * particle.age + 0.5 * particle.gravity * particle.age * particle.age;

    vec2 particleSize = particle.size;

    float normalizedAge = particle.age / particle.lifetime;

#ifdef SIZEOVERLIFETIME
    vec2 sizeOverLifetime = getSizeOverLifetime(normalizedAge);
    particleSize *= sizeOverLifetime;
#endif // SIZEOVERLIFETIME

    float cosAngle = particle.rot.x;
    float sinAngle = particle.rot.y;

#ifdef ALIGNTODIRECTION
    // Align particle rotation to current velocity direction
    vec2 currentVelocity = startVelocity + particle.gravity * particle.age;
    float speed = length(currentVelocity);
    if (speed > 0.001) {
        vec2 dir = currentVelocity / speed;
        cosAngle = dir.x;
        sinAngle = dir.y;
    }
#endif // ALIGNTODIRECTION

    mat2 particleRot = mat2(cosAngle, -sinAngle, sinAngle, cosAngle);

#ifdef ROTATIONOVERLIFETIME
    float rotationOverLifetime = getRotationOverLifetime(normalizedAge, particle.lifetime);
    float cosRot = cos(rotationOverLifetime);
    float sinRot = sin(rotationOverLifetime);

    mat2 rotationMat = mat2(cosRot, -sinRot, sinRot, cosRot);

    particleRot *= rotationMat;
#endif // ROTATIONOVERLIFETIME

    mat2 transMat = particleRot * mat2(particleSize.x, 0.0, 0.0, particleSize.y);

    vec2 positionOS = transMat * position;

    vec2 scale = spriteRotAndScale.zw;
    vec3 nMatrix0 = vec3(1.0 * scale.x, 0.0, 0.0);
    vec3 nMatrix1 = vec3(0.0, 1.0 * scale.y, 0.0);
    positionOS.x = nMatrix0.x * positionOS.x + nMatrix0.y * positionOS.y + nMatrix0.z;
    positionOS.y = nMatrix1.x * positionOS.x + nMatrix1.y * positionOS.y + nMatrix1.z;

    positionOS += particleOffset;

#ifdef VELOCITYOVERLIFETIME
    vec2 velocityWorldDistance = getVelocityOverLifetimeDistance(normalizedAge, particle.lifetime);

    vec2 velocityLocalDistance = spriteRotMat * (velocityWorldDistance * vec2(1.0, -1.0));

    vec2 velocityDistance = mix(velocityLocalDistance, velocityWorldDistance, u_VelocityOverLifetimeSpace);

    positionOS += velocityDistance;
#endif // VELOCITYOVERLIFETIME

    vec2 loaclTrans = vec2(u_NMatrix_0.z, u_NMatrix_1.z);
    vec2 worldTrans = vec2(a_SpriteTransAndGravity.xy);
    float space = a_SpeedSpaceAndRot.y;
    vec2 trans = mix(loaclTrans, worldTrans, space);

    vec2 positionWS = positionOS + trans / u_UnitPixels;

    // float x = nMatrix0.x * positionWS.x + nMatrix0.y * positionWS.y + nMatrix0.z;
    // float y = nMatrix1.x * positionWS.x + nMatrix1.y * positionWS.y + nMatrix1.z;
    float x = positionWS.x;
    float y = positionWS.y;

    // x = (x / u_size.x - 0.5) * 2.0;
    // y = (0.5 - y / u_size.y) * 2.0;

    x = x + particle.position.x;
    y = y + particle.position.y;

    vec4 positionCS = vec4(x * u_UnitPixels, y * u_UnitPixels, 0.0, 1.0);

    clip(positionCS.xy);

    vec2 viewPos;
    getViewPos(positionCS.xy, viewPos);

    getProjectPos(viewPos, positionCS);

    return positionCS;
}

void shareParticleParams(Particle p)
{
    v_ParticleColor = p.color;
    v_ParticleUV = p.uv;
}

#endif // ShurikenParticleVertex_glsl
