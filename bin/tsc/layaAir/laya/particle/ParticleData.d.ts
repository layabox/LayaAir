import { ParticleSetting } from "./ParticleSetting";
/**
 *  @private
 */
export declare class ParticleData {
    private static _tempVelocity;
    private static _tempStartColor;
    private static _tempEndColor;
    private static _tempSizeRotation;
    private static _tempRadius;
    private static _tempRadian;
    position: Float32Array;
    velocity: Float32Array;
    startColor: Float32Array;
    endColor: Float32Array;
    sizeRotation: Float32Array;
    radius: Float32Array;
    radian: Float32Array;
    durationAddScale: number;
    time: number;
    constructor();
    static Create(settings: ParticleSetting, position: Float32Array, velocity: Float32Array, time: number): ParticleData;
}
