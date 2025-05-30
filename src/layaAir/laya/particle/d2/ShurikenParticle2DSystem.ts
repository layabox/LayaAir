// ShurikenParticle2DSystem

import { Sprite } from "../../display/Sprite";
import { Point } from "../../maths/Point";
import { Vector4 } from "../../maths/Vector4";
import { ClassUtils } from "../../utils/ClassUtils";
import { IClone } from "../../utils/IClone";
import { ColorOverLifetimeModule } from "../common/module/ColorOverLifetimeModule";
import { EmissionBurst, EmissionModule } from "../common/module/EmissionModule";
import { TextureSheetAnimationModule } from "../common/module/TextureSheetAnimationModule";
import { ParticleControler } from "../common/ParticleController";
import { ParticleMinMaxCurveMode } from "../common/ParticleMinMaxCurve";
import { ParticleMinMaxGradientMode } from "../common/ParticleMinMaxGradient";
import { ParticleInfo } from "../common/ParticlePool";
import { Main2DModule } from "./module/Main2DModule";
import { Rotation2DOverLifetimeModule } from "./module/Rotation2DOverLifetimeModule";
import { Shape2DModule } from "./module/Shape2DModule";
import { Size2DOverLifetimeModule } from "./module/Size2DOverLifetimeModule";
import { Velocity2DOverLifetimeModule } from "./module/Velocity2DOverLifetimeModule";
import { Particle2DVertexMesh } from "./Particle2DVertexMesh";

const _globalPoint: Point = new Point();

/** @internal */
export enum Particle2DSystemDirtyFlagBits {
    Velocity2DOverLifetimeBit = 1 << 0,
    ColorOverLifetimeBit = 1 << 1,
    Size2DOverLifetimeBit = 1 << 2,
    Rotation2DOverLifetimeBit = 1 << 3,
    TextureSheetAnimationBit = 1 << 4
}

export class ShurikenParticle2DSystem extends ParticleControler implements IClone {

    owner: Sprite;

    _dirtyFlags: number = ~0;

    private _main: Main2DModule;

    public get main(): Main2DModule {
        return this._main;
    }

    private _emission: EmissionModule;

    public get emission(): EmissionModule {
        return this._emission;
    }

    shape: Shape2DModule;

    private _velocity2DOverLifetime: Velocity2DOverLifetimeModule;
    public get velocity2DOverLifetime(): Velocity2DOverLifetimeModule {
        return this._velocity2DOverLifetime;
    }
    public set velocity2DOverLifetime(value: Velocity2DOverLifetimeModule) {
        this._velocity2DOverLifetime = value;

        this._dirtyFlags |= Particle2DSystemDirtyFlagBits.Velocity2DOverLifetimeBit;
    }

    private _colorOverLifetime: ColorOverLifetimeModule;
    public get colorOverLifetime(): ColorOverLifetimeModule {
        return this._colorOverLifetime;
    }
    public set colorOverLifetime(value: ColorOverLifetimeModule) {
        this._colorOverLifetime = value;

        this._dirtyFlags |= Particle2DSystemDirtyFlagBits.ColorOverLifetimeBit;
    }

    private _size2DOverLifetime: Size2DOverLifetimeModule;
    public get size2DOverLifetime(): Size2DOverLifetimeModule {
        return this._size2DOverLifetime;
    }
    public set size2DOverLifetime(value: Size2DOverLifetimeModule) {
        this._size2DOverLifetime = value;

        this._dirtyFlags |= Particle2DSystemDirtyFlagBits.Size2DOverLifetimeBit;
    }

    private _rotation2DOverLifetime: Rotation2DOverLifetimeModule;
    public get rotation2DOverLifetime(): Rotation2DOverLifetimeModule {
        return this._rotation2DOverLifetime;
    }
    public set rotation2DOverLifetime(value: Rotation2DOverLifetimeModule) {
        this._rotation2DOverLifetime = value;

        this._dirtyFlags |= Particle2DSystemDirtyFlagBits.Rotation2DOverLifetimeBit;
    }

    private _textureSheetAnimation: TextureSheetAnimationModule;
    public get textureSheetAnimation(): TextureSheetAnimationModule {
        return this._textureSheetAnimation;
    }
    public set textureSheetAnimation(value: TextureSheetAnimationModule) {
        this._textureSheetAnimation = value;

        this._dirtyFlags |= Particle2DSystemDirtyFlagBits.TextureSheetAnimationBit;
    }

    _initParticleData(particleByteStride: number, particleInfo: ParticleInfo) {

        let maxparticles = this.main.maxParticles;

        this._initParticlePool(maxparticles, particleByteStride, particleInfo);
    }

    constructor() {
        super();
        this._main = new Main2DModule();
        this._emission = new EmissionModule();
        this._dirtyFlags = ~0;
    }

    play(): void {
        super.play();
        let globalPoint = _globalPoint;
        this.owner.globalTrans.getPos(globalPoint);
        this.emission._lastPosition.setValue(globalPoint.x, globalPoint.y, 0);
    }

    protected getPositionAndDirection(): Vector4 {

        if (this.shape && this.shape.enable && this.shape.shape) {
            return this.shape.shape.getPositionAndDirection();
        }
        else {
            return Vector4.UnitW;
        }

    }

    _emit(emitTime: number, age: number) {

        if (this.particlePool.activeParticleCount >= this.main.maxParticles) {
            return false;
        }

        const main = this.main;

        let particle = Particle2DVertexMesh.TempParticle2D;
        let duration = main.duration;
        let normalizedTime = this.time / duration;

        let lifetimeRandom = curveNeedRandom(main.startLifetime.mode) ? Math.random() : 0;
        let lifetime = main.startLifetime.evaluate(normalizedTime, lifetimeRandom);

        let normalizedAge = age / lifetime;

        let startDelayRandom = curveNeedRandom(main.startDelay.mode) ? Math.random() : 0;
        let startDelay = main.startDelay.evaluate(normalizedTime, startDelayRandom);

        let startSpeedRandom = curveNeedRandom(main.startSpeed.mode) ? Math.random() : 0;
        let startSpeed = main.startSpeed.evaluate(normalizedTime, startSpeedRandom);

        let startSizeXRandom = curveNeedRandom(main.startSizeX.mode) ? Math.random() : 0;
        let startSizeX = main.startSizeX.evaluate(normalizedTime, startSizeXRandom);
        let startSizeY = startSizeX;
        if (main.startSize2D) {
            let startSizeYRandom = curveNeedRandom(main.startSizeY.mode) ? Math.random() : 0;
            startSizeY = main.startSizeY.evaluate(normalizedTime, startSizeYRandom);
        }

        let startRotationRandom = curveNeedRandom(main.startRotation.mode) ? Math.random() : 0;
        let startRotation = main.startRotation.evaluate(normalizedTime, startRotationRandom);
        let startRadians = -startRotation * Math.PI / 180;

        particle.setEmitTime(emitTime + startDelay);
        particle.setLifetime(lifetime);

        let startPosAndDir = this.getPositionAndDirection();
        particle.setPosition(startPosAndDir.x, startPosAndDir.y);
        particle.setDirection(startPosAndDir.z, startPosAndDir.w);

        particle.setSize(startSizeX, startSizeY);
        particle.setSpeed(startSpeed);
        particle.setGravity(main._gravity.x, main._gravity.y);
        particle.setRot(Math.cos(startRadians), Math.sin(startRadians));

        let colorOverLifetimeRandom = 0;
        if (this.colorOverLifetime && this.colorOverLifetime.enable) {
            let color = this.colorOverLifetime.color;
            switch (color.mode) {
                case ParticleMinMaxGradientMode.TwoGradients:
                    colorOverLifetimeRandom = Math.random();
                    break;
                default:
                    break;
            }
        }
        let velocityOverLifetimeRandomX = 0;
        let velocityOverLifetimeRandomY = 0;
        if (this.velocity2DOverLifetime && this.velocity2DOverLifetime.enable) {
            let mode = this.velocity2DOverLifetime.x.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.TwoConstants:
                case ParticleMinMaxCurveMode.TwoCurves:
                    velocityOverLifetimeRandomX = Math.random();
                    velocityOverLifetimeRandomY = Math.random();
                    break;
                default:
                    break;
            }
        }
        let rotation2DOverLifetimeRandom = 0;
        if (this.rotation2DOverLifetime && this.rotation2DOverLifetime.enable) {
            let mode = this.rotation2DOverLifetime.angularVelocity.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.TwoConstants:
                case ParticleMinMaxCurveMode.TwoCurves:
                    rotation2DOverLifetimeRandom = Math.random();
                    break;
                default:
                    break;
            }
        }

        particle.setRandom(colorOverLifetimeRandom, velocityOverLifetimeRandomX, velocityOverLifetimeRandomY, rotation2DOverLifetimeRandom);

        let sizeOverLifetimeRandomX = 0;
        let sizeOverLifetimeRandomY = 0;
        if (this.size2DOverLifetime && this.size2DOverLifetime.enable) {
            let mode = this.size2DOverLifetime.size.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.Constant:
                    {
                        if (this.size2DOverLifetime.separateAxes) {
                            let sizeX = this.size2DOverLifetime.x.constant;
                            let sizeY = this.size2DOverLifetime.y.constant;
                            particle.setSize(startSizeX * sizeX, startSizeY * sizeY);
                        }
                        else {
                            let size = this.size2DOverLifetime.size.constant;
                            particle.setSize(startSizeX * size, startSizeY * size);
                        }
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoConstants:
                    {
                        if (this.size2DOverLifetime.separateAxes) {
                            let sizeMinX = this.size2DOverLifetime.x.constantMin;
                            let sizeMinY = this.size2DOverLifetime.y.constantMin;

                            let sizeMaxX = this.size2DOverLifetime.x.constantMax;
                            let sizeMaxY = this.size2DOverLifetime.y.constantMax;

                            let sizeX = sizeMinX + Math.random() * (sizeMaxX - sizeMinX);
                            let sizeY = sizeMinY + Math.random() * (sizeMaxY - sizeMinY);
                            particle.setSize(startSizeX * sizeX, startSizeY * sizeY);
                        }
                        else {
                            let sizeMin = this.size2DOverLifetime.size.constantMin;
                            let sizeMax = this.size2DOverLifetime.size.constantMax;

                            let size = sizeMin + Math.random() * (sizeMax - sizeMin);
                            particle.setSize(startSizeX * size, startSizeY * size);
                        }
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoCurves:
                    if (this.size2DOverLifetime.separateAxes) {
                        sizeOverLifetimeRandomX = Math.random();
                        sizeOverLifetimeRandomY = Math.random();
                    }
                    else {
                        sizeOverLifetimeRandomX = sizeOverLifetimeRandomY = Math.random();
                    }
                    break;
                default:
                    break;
            }
        }

        let textureSheetAnimationRandom = 0;
        if (this.textureSheetAnimation && this.textureSheetAnimation.enable) {
            let frame = this.textureSheetAnimation.frame;
            let mode = frame.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.TwoConstants:
                case ParticleMinMaxCurveMode.TwoCurves:
                    textureSheetAnimationRandom = Math.random();
                    break;
                default:
                    break;
            }
        }

        particle.setRandom1(sizeOverLifetimeRandomX, sizeOverLifetimeRandomY, textureSheetAnimationRandom, 0);

        let spriteRotAndScale = main._spriteRotAndScale;
        particle.setSpriteRotAndScale(spriteRotAndScale.x, spriteRotAndScale.y, spriteRotAndScale.z, spriteRotAndScale.w);
        let spriteTransAndSpace = main._spriteTranslateAndSpace;
        particle.setSpriteTrans(spriteTransAndSpace.x, spriteTransAndSpace.y);
        particle.setSimulationSpace(spriteTransAndSpace.z);

        let startColorRandom = gradientNeedRandom(main.startColor.mode) ? Math.random() : 0;
        let color = main.startColor.evaluate(normalizedTime, startColorRandom);
        particle.setColor(color.r, color.g, color.b, color.a);

        if (this.textureSheetAnimation && this.textureSheetAnimation.enable) {
            this.textureSheetAnimation._calculateSheetFrameData();
            let sheetFrameData = this.textureSheetAnimation._sheetFrameData;

            particle.setSheetFrameData(sheetFrameData.x, sheetFrameData.y, sheetFrameData.z, sheetFrameData.w);
        }

        this.particlePool.addParticleData(particle.data);

        return true;
    }

    _emitOverTime(elapsedTime: number) {
        let currentTime = this.totalTime;
        let lastEmitTime = this._lastEmitTime;

        // 上次发射到现在经过的时间
        let duration = currentTime - lastEmitTime;
        let emissionInterval = this.emission._emissionInterval;
        if (duration >= emissionInterval) {
            let count = Math.floor(duration / emissionInterval);
            for (let i = 1; i <= count; i++) {
                let emitTime = i * emissionInterval + lastEmitTime;
                let age = currentTime - emitTime;

                this._emit(emitTime, age);

                // 超过最大粒子数跳过渲染时
                // 也要更新 _laseEmitTime，否则下次发射会还原跳过的粒子
                this._lastEmitTime = emitTime;

            }
        }
    }


    _emitOverDistance() {
        let emission = this.emission;
        if (emission.rateOverDistance <= 0) {
            return;
        }

        let pxielDistance = 1 / emission.rateOverDistance * this.main.unitPixels;
        if (this._emitDistance >= pxielDistance) {
            let count = Math.floor(this._emitDistance / pxielDistance);
            for (let i = 1; i <= count; i++) {
                let emitTime = this.totalTime;
                let age = 0;
                this._emit(emitTime, age);
                this._emitDistance -= pxielDistance;
            }
        }
    }

    _emitBurst(burst: EmissionBurst, emitTime: number) {
        let time = burst.time;
        let count = burst.count;

        let age = this.totalTime - emitTime;
        for (let j = 0; j < count; j++) {
            if (!this._emit(emitTime, age)) {
                break;
            }
        }

    }

    _emitBursts() {

        let bursts = this.emission._sortedBursts;
        let count = bursts ? bursts.length : 0;
        let duration = this.main.duration;

        let start = this._nextBurstIndex;
        for (let i = start; i < count; i++) {
            let burst = bursts[i];

            if (burst.time > duration) {
                break;
            }

            let burstTime = this._burstLoopCount * duration + burst.time;

            if (burstTime <= this.totalTime) {
                this._emitBurst(burst, burstTime);

                this._nextBurstIndex = i + 1;
                if (this._nextBurstIndex >= count) {
                    this._nextBurstIndex = (i + 1) % count;
                    this._burstLoopCount++;
                }
            }
        }

    }

    _update(deltaTime: number) {

        if (this.isPlaying) {
            // simulation speed
            {
                let simulationSpeed = this.main.simulationSpeed;
                deltaTime *= simulationSpeed;
            }

            if (deltaTime <= 0) {
                return;
            }

            this.time += deltaTime;
            this.totalTime += deltaTime;

            // 处理循环播放
            if (this.time >= this.main.duration) {
                if (this.main.looping) {
                    this.time -= this.main.duration;
                }
                else {
                    this._isEmitting = false;
                    if (this.particlePool.activeParticleCount <= 0) {
                        this.stop();
                    }
                }
            }

            this.particlePool.retireParticles(this.totalTime);

            // 发射粒子
            if (this.emission.enable && this.isEmitting) {
                this._emitOverTime(deltaTime);
                this._emitOverDistance();
                this._emitBursts();
            }
        }
    }

    // todo
    simulate(time: number, restart: boolean = true) {
        if (this.isPlaying) {
            if (restart) {
                this.stop();
                this.play();
            }

            this._update(time);

            this.pause();
        }
    }

    cloneTo(destObject: ShurikenParticle2DSystem): void {
        this.main.cloneTo(destObject.main);
        this.emission.cloneTo(destObject.emission);
        this.shape.cloneTo(destObject.shape);
        this.velocity2DOverLifetime.cloneTo(destObject.velocity2DOverLifetime);
        this.colorOverLifetime.cloneTo(destObject.colorOverLifetime);
        this.size2DOverLifetime.cloneTo(destObject.size2DOverLifetime);
        this.rotation2DOverLifetime.cloneTo(destObject.rotation2DOverLifetime);
        this.textureSheetAnimation.cloneTo(destObject.textureSheetAnimation);
    }

    clone() {
        let dest = new ShurikenParticle2DSystem();
        this.cloneTo(dest);
        return dest;
    }

    destroy(): void {
        super.destroy();
        if (this.particlePool) {
            this.particlePool.destroy();
            this.particlePool = null;
        }
        // todo

    }

}

function curveNeedRandom(mode: ParticleMinMaxCurveMode) {
    switch (mode) {
        case ParticleMinMaxCurveMode.TwoConstants:
        case ParticleMinMaxCurveMode.TwoCurves:
            return true;
        default:
            return false;
    }
}
function gradientNeedRandom(mode: ParticleMinMaxGradientMode) {
    switch (mode) {
        case ParticleMinMaxGradientMode.TwoColors:
        case ParticleMinMaxGradientMode.TwoGradients:
            return true;
        default:
            return false;
    }
}


