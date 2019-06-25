import { MathUtil } from "../maths/MathUtil";
/**
 *  @private
 */
export class ParticleData {
    constructor() {
    }
    static Create(settings, position, velocity, time) {
        var particleData = new ParticleData();
        particleData.position = position;
        MathUtil.scaleVector3(velocity, settings.emitterVelocitySensitivity, ParticleData._tempVelocity);
        var horizontalVelocity = MathUtil.lerp(settings.minHorizontalVelocity, settings.maxHorizontalVelocity, Math.random());
        var horizontalAngle = Math.random() * Math.PI * 2;
        ParticleData._tempVelocity[0] += horizontalVelocity * Math.cos(horizontalAngle);
        ParticleData._tempVelocity[2] += horizontalVelocity * Math.sin(horizontalAngle);
        ParticleData._tempVelocity[1] += MathUtil.lerp(settings.minVerticalVelocity, settings.maxVerticalVelocity, Math.random());
        particleData.velocity = ParticleData._tempVelocity;
        particleData.startColor = ParticleData._tempStartColor;
        particleData.endColor = ParticleData._tempEndColor;
        var i;
        if (settings.disableColor) {
            for (i = 0; i < 3; i++) {
                particleData.startColor[i] = 1;
                particleData.endColor[i] = 1;
            }
            particleData.startColor[i] = MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random()); //R、G、B、A插值
            particleData.endColor[i] = MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random()); //R、G、B、A插值
        }
        else {
            if (settings.colorComponentInter) {
                for (i = 0; i < 4; i++) {
                    particleData.startColor[i] = MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random()); //R、G、B、A插值
                    particleData.endColor[i] = MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random()); //R、G、B、A插值
                }
            }
            else {
                MathUtil.lerpVector4(settings.minStartColor, settings.maxStartColor, Math.random(), particleData.startColor); //RGBA统一插值
                MathUtil.lerpVector4(settings.minEndColor, settings.maxEndColor, Math.random(), particleData.endColor); //RGBA统一插值
            }
        }
        particleData.sizeRotation = ParticleData._tempSizeRotation;
        var sizeRandom = Math.random();
        particleData.sizeRotation[0] = MathUtil.lerp(settings.minStartSize, settings.maxStartSize, sizeRandom); //StartSize
        particleData.sizeRotation[1] = MathUtil.lerp(settings.minEndSize, settings.maxEndSize, sizeRandom); //EndSize
        particleData.sizeRotation[2] = MathUtil.lerp(settings.minRotateSpeed, settings.maxRotateSpeed, Math.random()); //Rotation
        particleData.radius = ParticleData._tempRadius;
        var radiusRandom = Math.random();
        particleData.radius[0] = MathUtil.lerp(settings.minStartRadius, settings.maxStartRadius, radiusRandom); //StartRadius
        particleData.radius[1] = MathUtil.lerp(settings.minEndRadius, settings.maxEndRadius, radiusRandom); //EndRadius
        particleData.radian = ParticleData._tempRadian;
        particleData.radian[0] = MathUtil.lerp(settings.minHorizontalStartRadian, settings.maxHorizontalStartRadian, Math.random()); //StartHorizontalRadian
        particleData.radian[1] = MathUtil.lerp(settings.minVerticalStartRadian, settings.maxVerticalStartRadian, Math.random()); //StartVerticleRadian
        var useEndRadian = settings.useEndRadian;
        particleData.radian[2] = useEndRadian ? MathUtil.lerp(settings.minHorizontalEndRadian, settings.maxHorizontalEndRadian, Math.random()) : particleData.radian[0]; //EndHorizontalRadian
        particleData.radian[3] = useEndRadian ? MathUtil.lerp(settings.minVerticalEndRadian, settings.maxVerticalEndRadian, Math.random()) : particleData.radian[1]; //EndVerticleRadian
        particleData.durationAddScale = settings.ageAddScale * Math.random();
        particleData.time = time;
        return particleData;
    }
}
ParticleData._tempVelocity = new Float32Array(3);
ParticleData._tempStartColor = new Float32Array(4);
ParticleData._tempEndColor = new Float32Array(4);
ParticleData._tempSizeRotation = new Float32Array(3);
ParticleData._tempRadius = new Float32Array(2);
ParticleData._tempRadian = new Float32Array(4);
