import { ParticleSetting } from "./ParticleSetting";
import { MathUtil } from "../maths/MathUtil";

/**
 *  @private
 */
export class ParticleData {
    private static _tempVelocity: Float32Array = new Float32Array(3);
    private static _tempStartColor: Float32Array = new Float32Array(4);
    private static _tempEndColor: Float32Array = new Float32Array(4);
    private static _tempSizeRotation: Float32Array = new Float32Array(3);
    private static _tempRadius: Float32Array = new Float32Array(2);
    private static _tempRadian: Float32Array = new Float32Array(4);

    position: Float32Array;
    velocity: Float32Array;
    startColor: Float32Array;
    endColor: Float32Array;
    sizeRotation: Float32Array;
    radius: Float32Array;
    radian: Float32Array;
    durationAddScale: number;
    time: number;

    constructor() {

    }

    static Create(settings: ParticleSetting, position: Float32Array, velocity: Float32Array, time: number): ParticleData {
        var particleData: ParticleData = new ParticleData();
        particleData.position = position;

        MathUtil.scaleVector3(velocity, settings.emitterVelocitySensitivity, ParticleData._tempVelocity);
        var horizontalVelocity: number = MathUtil.lerp(settings.minHorizontalVelocity, settings.maxHorizontalVelocity, Math.random());
        var horizontalAngle: number = Math.random() * Math.PI * 2;
        ParticleData._tempVelocity[0] += horizontalVelocity * Math.cos(horizontalAngle);
        ParticleData._tempVelocity[2] += horizontalVelocity * Math.sin(horizontalAngle);
        ParticleData._tempVelocity[1] += MathUtil.lerp(settings.minVerticalVelocity, settings.maxVerticalVelocity, Math.random());
        particleData.velocity = ParticleData._tempVelocity;

        particleData.startColor = ParticleData._tempStartColor;
        particleData.endColor = ParticleData._tempEndColor;
        var i: number;
        if (settings.disableColor) {
            for (i = 0; i < 3; i++) {
                particleData.startColor[i] = 1;
                particleData.endColor[i] = 1;
            }
            particleData.startColor[i] = MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());//R、G、B、A插值
            particleData.endColor[i] = MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());//R、G、B、A插值

        }
        else {
            if (settings.colorComponentInter) {
                for (i = 0; i < 4; i++) {
                    particleData.startColor[i] = MathUtil.lerp(settings.minStartColor[i], settings.maxStartColor[i], Math.random());//R、G、B、A插值
                    particleData.endColor[i] = MathUtil.lerp(settings.minEndColor[i], settings.maxEndColor[i], Math.random());//R、G、B、A插值
                }
            } else {
                MathUtil.lerpVector4(settings.minStartColor, settings.maxStartColor, Math.random(), particleData.startColor);//RGBA统一插值
                MathUtil.lerpVector4(settings.minEndColor, settings.maxEndColor, Math.random(), particleData.endColor);//RGBA统一插值
            }
        }

        particleData.sizeRotation = ParticleData._tempSizeRotation;
        var sizeRandom: number = Math.random();
        particleData.sizeRotation[0] = MathUtil.lerp(settings.minStartSize, settings.maxStartSize, sizeRandom);//StartSize
        particleData.sizeRotation[1] = MathUtil.lerp(settings.minEndSize, settings.maxEndSize, sizeRandom);//EndSize
        particleData.sizeRotation[2] = MathUtil.lerp(settings.minRotateSpeed, settings.maxRotateSpeed, Math.random());//Rotation

        particleData.radius = ParticleData._tempRadius;
        var radiusRandom: number = Math.random();
        particleData.radius[0] = MathUtil.lerp(settings.minStartRadius, settings.maxStartRadius, radiusRandom);//StartRadius
        particleData.radius[1] = MathUtil.lerp(settings.minEndRadius, settings.maxEndRadius, radiusRandom);//EndRadius

        particleData.radian = ParticleData._tempRadian;
        particleData.radian[0] = MathUtil.lerp(settings.minHorizontalStartRadian, settings.maxHorizontalStartRadian, Math.random());//StartHorizontalRadian
        particleData.radian[1] = MathUtil.lerp(settings.minVerticalStartRadian, settings.maxVerticalStartRadian, Math.random());//StartVerticleRadian
        var useEndRadian: boolean = settings.useEndRadian;
        particleData.radian[2] = useEndRadian ? MathUtil.lerp(settings.minHorizontalEndRadian, settings.maxHorizontalEndRadian, Math.random()) : particleData.radian[0];//EndHorizontalRadian
        particleData.radian[3] = useEndRadian ? MathUtil.lerp(settings.minVerticalEndRadian, settings.maxVerticalEndRadian, Math.random()) : particleData.radian[1];//EndVerticleRadian

        particleData.durationAddScale = settings.ageAddScale * Math.random();

        particleData.time = time;
        return particleData;
    }

}


