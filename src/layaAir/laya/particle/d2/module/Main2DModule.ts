import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { Vector4 } from "../../../maths/Vector4";
import { ClassUtils } from "../../../utils/ClassUtils";
import { IClone } from "../../../utils/IClone";
import { ParticleMinMaxCurve, ParticleMinMaxCurveMode } from "../../common/ParticleMinMaxCurve";
import { ParticleMinMaxGradient, ParticleMinMaxGradientMode } from "../../common/ParticleMinMaxGradient";

export enum Particle2DSimulationSpace {
    Local,
    World
}

export enum Particle2DScalingMode {
    Hierarchy,
    Local
}

/**
 * @blueprintIgnore
 */
export class Main2DModule implements IClone {

    duration: number = 5;

    looping: boolean = true;

    playOnAwake: boolean = true;

    startDelay: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    startLifetime: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    startSpeed: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    startSize2D: boolean = false;

    private _startSizeX: ParticleMinMaxCurve = new ParticleMinMaxCurve();
    public get startSizeX(): ParticleMinMaxCurve {
        return this._startSizeX;
    }
    public set startSizeX(value: ParticleMinMaxCurve) {
        this._startSizeX = value;
        this._startSizeY.mode = value.mode;
    }

    private _startSizeY: ParticleMinMaxCurve = new ParticleMinMaxCurve();
    public get startSizeY(): ParticleMinMaxCurve {
        return this._startSizeY;
    }
    public set startSizeY(value: ParticleMinMaxCurve) {
        this._startSizeY = value;
        this._startSizeX.mode = value.mode;
    }

    get startSize(): ParticleMinMaxCurve {
        return this.startSizeX;
    }

    set startSize(value: ParticleMinMaxCurve) {
        this.startSizeX = value;
    }

    startRotation: ParticleMinMaxCurve = new ParticleMinMaxCurve();

    startColor: ParticleMinMaxGradient = new ParticleMinMaxGradient();

    /** @internal */
    _gravity: Vector2 = new Vector2();

    gravityModifier: number = 0;

    /** @internal */
    _spriteRotAndScale: Vector4 = new Vector4();
    /** @internal */
    _spriteTranslateAndSpace: Vector3 = new Vector3();

    simulationSpace: Particle2DSimulationSpace = Particle2DSimulationSpace.Local;

    simulationSpeed: number = 1;

    scaleMode: Particle2DScalingMode = Particle2DScalingMode.Local;

    private _maxParticles: number = 100;

    public get maxParticles(): number {
        return this._maxParticles;
    }
    public set maxParticles(value: number) {
        this._maxParticles = Math.floor(value);
    }

    autoRandomSeed: boolean = true;

    randomSeed: number = 0;

    unitPixels: number = 50;

    constructor() {
        this.startDelay.mode = ParticleMinMaxCurveMode.Constant;
        this.startDelay.constant = 0;

        this.startLifetime.mode = ParticleMinMaxCurveMode.Constant;
        this.startLifetime.constant = 5;

        this.startSpeed.mode = ParticleMinMaxCurveMode.Constant;
        this.startSpeed.constant = 5;

        this.startSizeX.mode = ParticleMinMaxCurveMode.Constant;
        this.startSizeX.constant = 0.5;

        this.startSizeY.mode = ParticleMinMaxCurveMode.Constant;
        this.startSizeY.constant = 0.5;

        this.startRotation.mode = ParticleMinMaxCurveMode.Constant;
        this.startRotation.constant = 0;

        this.startColor.mode = ParticleMinMaxGradientMode.Color;
        this.startColor.color.setValue(1, 1, 1, 1);
    }

    cloneTo(destObject: Main2DModule): void {
        destObject.duration = this.duration;
        destObject.looping = this.looping;
        destObject.playOnAwake = this.playOnAwake;
        this.startDelay.cloneTo(destObject.startDelay);
        this.startLifetime.cloneTo(destObject.startLifetime);
        this.startSpeed.cloneTo(destObject.startSpeed);
        destObject.startSize2D = this.startSize2D;
        this.startSizeX.cloneTo(destObject.startSizeX);
        this.startSizeY.cloneTo(destObject.startSizeY);
        destObject.startRotation = this.startRotation;
        this.startColor.cloneTo(destObject.startColor);
        destObject.gravityModifier = this.gravityModifier;
        destObject.simulationSpace = this.simulationSpace;
        destObject.simulationSpeed = this.simulationSpeed;
        destObject.scaleMode = this.scaleMode;
        destObject.maxParticles = this.maxParticles;
        destObject.autoRandomSeed = this.autoRandomSeed;
        destObject.randomSeed = this.randomSeed;
        destObject.unitPixels = this.unitPixels;
    }

    clone() {
        let dest = new Main2DModule();
        this.cloneTo(dest);
        return dest;
    }

}

