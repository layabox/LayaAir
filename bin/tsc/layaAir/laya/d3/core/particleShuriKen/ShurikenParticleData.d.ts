import { ShurikenParticleSystem } from "././ShurikenParticleSystem";
import { ShurikenParticleRenderer } from "././ShurikenParticleRenderer";
import { Transform3D } from "../Transform3D";
import { Vector4 } from "../../math/Vector4";
/**
 *  @private
 */
export declare class ShurikenParticleData {
    /**@private */
    private static _tempVector30;
    /**@private */
    private static _tempQuaternion;
    static startLifeTime: number;
    static startColor: Vector4;
    static startSize: Float32Array;
    static startRotation: Float32Array;
    static startSpeed: number;
    static startUVInfo: Float32Array;
    static simulationWorldPostion: Float32Array;
    static simulationWorldRotation: Float32Array;
    constructor();
    /**
     * @private
     */
    private static _getStartLifetimeFromGradient;
    /**
     * @private
     */
    private static _randomInvertRoationArray;
    /**
     * @private
     */
    private static _randomInvertRoation;
    /**
     * @private
     */
    static create(particleSystem: ShurikenParticleSystem, particleRender: ShurikenParticleRenderer, transform: Transform3D): void;
}
