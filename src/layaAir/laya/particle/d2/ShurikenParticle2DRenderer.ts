import { addAfterInitCallback } from "../../../Laya";
import { LayaEnv } from "../../../LayaEnv";
import { GradientDataNumber } from "../../d3/core/particleShuriKen/module/GradientDataNumber";
import { Sprite } from "../../display/Sprite";
import { LayaGL } from "../../layagl/LayaGL";
import { Gradient } from "../../maths/Gradient";
import { Matrix } from "../../maths/Matrix";
import { Vector3 } from "../../maths/Vector3";
import { Vector4 } from "../../maths/Vector4";
import { BaseRenderNode2D } from "../../NodeRender2D/BaseRenderNode2D";
import { Physics2DOption } from "../../physics/Physics2DOption";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Context } from "../../renders/Context";
import { Material } from "../../resource/Material";
import { ClassUtils } from "../../utils/ClassUtils";
import { Stat } from "../../utils/Stat";
import { ParticleMinMaxCurveMode } from "../common/ParticleMinMaxCurve";
import { ParticleMinMaxGradientMode } from "../common/ParticleMinMaxGradient";
import { Particle2DScalingMode, Particle2DSimulationSpace } from "./module/Main2DModule";
import { Shape2DModule } from "./module/Shape2DModule";
import { Velocity2DSimulateSpace } from "./module/Velocity2DOverLifetimeModule";
import { Particle2DGeomotry } from "./Particle2DGeomotry";
import { Particle2DShader } from "./Particle2DShader";
import { Particle2DVertexMesh } from "./Particle2DVertexMesh";
import { ShurikenParticle2DSystem, Particle2DSystemDirtyFlagBits } from "./ShurikenParticle2DSystem";

const nMatrix0 = new Vector3();
const nMatrix1 = new Vector3();

const tempV4 = new Vector4();

const fillGradientRGB = (gradient: Gradient, buffer: Float32Array) => {
    let count = Math.min(gradient.colorRGBKeysCount, 8);
    if (count == 1) {
        let time = gradient._rgbElements[0];
        let r = gradient._rgbElements[1];
        let g = gradient._rgbElements[2];
        let b = gradient._rgbElements[3];
        buffer[0] = 0;
        buffer[1] = r;
        buffer[2] = g;
        buffer[3] = b;
        buffer[4] = 1;
        buffer[5] = r;
        buffer[6] = g;
        buffer[7] = b;
    }
    else {
        let length = Math.min(gradient._rgbElements.length, 8 * 4);
        let data = new Float32Array(gradient._rgbElements.buffer, 0, length);
        buffer.set(data);
    }
    if (count <= 4) {
        return new Float32Array(buffer.buffer, 0, 4 * 4);
    }
    else {
        return buffer;
    }
}

const fillGradientAlpha = (gradient: Gradient, buffer: Float32Array) => {
    let count = Math.min(gradient.colorAlphaKeysCount, 8);
    if (count == 1) {
        let time = gradient._alphaElements[0];
        let a = gradient._alphaElements[1];
        buffer[0] = 0;
        buffer[1] = a;
        buffer[2] = 1;
        buffer[3] = a;
    }
    else {
        let length = Math.min(gradient._alphaElements.length, 8 * 2);
        let data = new Float32Array(gradient._alphaElements.buffer, 0, length);
        buffer.set(data);
    }
    if (count <= 4) {
        return new Float32Array(buffer.buffer, 0, 4 * 2);
    }
    else {
        return buffer;
    }
};

const fillGradientTimeRange = (gradient: Gradient, range: Vector4, maxCount: number) => {
    // color
    let colorMinTime = 0;
    let colorMaxTime = 1;
    let count = Math.min(gradient.colorRGBKeysCount, maxCount);
    if (count == 1) {
        colorMinTime = 0;
        colorMaxTime = 1;
    }
    else {
        colorMinTime = 1;
        colorMaxTime = 0;
        for (let i = 0; i < count; i++) {
            let time = gradient._rgbElements[i * 4];
            colorMinTime = Math.min(colorMinTime, time);
            colorMaxTime = Math.max(colorMaxTime, time);
        }
    }

    // alpha
    let alphaMinTime = 0;
    let alphaMaxTime = 1;
    count = Math.min(gradient.colorAlphaKeysCount, maxCount);
    if (count == 1) {
        alphaMinTime = 0;
        alphaMaxTime = 1;
    }
    else {
        alphaMinTime = 1;
        alphaMaxTime = 0;
        for (let i = 0; i < count; i++) {
            let time = gradient._alphaElements[i * 2];
            alphaMinTime = Math.min(alphaMinTime, time);
            alphaMaxTime = Math.max(alphaMaxTime, time);
        }
    }

    range.setValue(colorMinTime, colorMaxTime, alphaMinTime, alphaMaxTime);
}

const fillCurveMinMaxTimeRange = (curve0: GradientDataNumber, curve1: GradientDataNumber, range: Vector4) => {

    let curve0MinTime = 1;
    let curve0MaxTime = 0;
    let count = Math.min(curve0.gradientCount, 4);
    if (count == 1) {
        curve0MinTime = 0;
        curve0MaxTime = 1;
    }
    else {
        let lastTime = curve0.getKeyByIndex(0);
        curve0MinTime = Math.min(curve0MinTime, lastTime);
        curve0MaxTime = Math.max(curve0MaxTime, lastTime);

        for (let i = 1; i < count; i++) {
            let time = curve0.getKeyByIndex(i);
            if (time > lastTime) {
                curve0MinTime = Math.min(curve0MinTime, time);
                curve0MaxTime = Math.max(curve0MaxTime, time);
                lastTime = time;
            }
        }
    }

    let curve1MinTime = 1;
    let curve1MaxTime = 0;
    count = Math.min(curve1.gradientCount, 4);
    if (count == 1) {
        curve1MinTime = 0;
        curve1MaxTime = 1;
    }
    else {
        let lastTime = curve1.getKeyByIndex(0);
        curve1MinTime = Math.min(curve1MinTime, lastTime);
        curve1MaxTime = Math.max(curve1MaxTime, lastTime);
        for (let i = 1; i < count; i++) {
            let time = curve1.getKeyByIndex(i);
            if (time > lastTime) {
                curve1MinTime = Math.min(curve1MinTime, time);
                curve1MaxTime = Math.max(curve1MaxTime, time);
                lastTime = time;
            }
        }
    }

    range.setValue(curve0MinTime, curve0MaxTime, curve1MinTime, curve1MaxTime);
}

const fillParticleData = (particleIndex: number, particleStride: number, particleByteStride: number, particleDatas: Float32Array, meshVertexCount: number, particleVertexDatas: Float32Array) => {
    let particleDataOffset = particleIndex * particleByteStride;
    let particleData = new Float32Array(particleDatas.buffer, particleDataOffset, particleStride);
    for (let j = 0; j < meshVertexCount; j++) {
        let vertexOffset = (particleIndex * meshVertexCount + j) * particleStride;
        particleVertexDatas.set(particleData, vertexOffset);
    }
}

function gradientDataNumberConstant(gradient: GradientDataNumber, value: number) {
    gradient._elements.fill(0);

    gradient._elements[0] = 0;
    gradient._elements[1] = value;

    gradient._elements[2] = 1;
    gradient._elements[3] = value;
}

export class ShurikenParticle2DRenderer extends BaseRenderNode2D {

    declare owner: Sprite;

    private _particleSystem: ShurikenParticle2DSystem;

    public get particleSystem(): ShurikenParticle2DSystem {
        return this._particleSystem;
    }

    _setOwner(node: Sprite): void {
        super._setOwner(node);
        this.particleSystem.owner = node;
    }

    get sharedMaterial(): Material {
        return super.sharedMaterial;
    }
    set sharedMaterial(value: Material) {
        super.sharedMaterial = value;
        this._createRenderElements();
    }

    private particleGeometry: Particle2DGeomotry;

    private _gradientRGBBuffer: Float32Array = new Float32Array(8 * 4);
    private _gradientAlphaBuffer: Float32Array = new Float32Array(8 * 2);
    private _gradientTimeRange: Vector4 = new Vector4();

    private _gradientMaxRGBBuffer: Float32Array = new Float32Array(8 * 4);
    private _gradientMaxAlphaBuffer: Float32Array = new Float32Array(8 * 2);
    private _gradientMaxTimeRange: Vector4 = new Vector4();

    constructor() {
        super();

        this._renderElements = [];
        this._materials = [];

        this._particleSystem = new ShurikenParticle2DSystem();
        // this.particleSystem.shape = new Shape2DModule();

        this._spriteShaderData.addDefine(BaseRenderNode2D.SHADERDEFINE_BASERENDER2D);
    }

    protected _getcommonUniformMap(): Array<string> {
        return ["BaseRender2D", "_Particle2D"];
    }

    private setParticleColorOverLifetime(shaderData: ShaderData) {
        let ps = this.particleSystem;

        if (ps.colorOverLifetime && ps.colorOverLifetime.enable) {
            shaderData.addDefine(Particle2DShader.ColorOverLifetimeDef);

            let color = ps.colorOverLifetime.color;

            let gradientMin = color.gradientMin;
            let gradientMax = color.gradientMax;

            let mode = color.mode;

            let rgbMinBuffer = fillGradientRGB(gradientMin, this._gradientRGBBuffer);
            let alphaMinBuffer = fillGradientAlpha(gradientMin, this._gradientAlphaBuffer);

            let colorKey8 = false;
            if (rgbMinBuffer.length == 32 || alphaMinBuffer.length == 16) {
                colorKey8 = true;
                fillGradientTimeRange(gradientMin, this._gradientTimeRange, 8);
            }
            else {
                fillGradientTimeRange(gradientMin, this._gradientTimeRange, 4);
            }
            shaderData.setVector(Particle2DShader.GradientTimeRange, this._gradientTimeRange);

            let rgbMaxBuffer: Float32Array;
            let alphaMaxBuffer: Float32Array;

            switch (mode) {
                case ParticleMinMaxGradientMode.Gradient:
                    shaderData.removeDefine(Particle2DShader.ColorOverLifetimeRandom);
                    break;
                case ParticleMinMaxGradientMode.TwoGradients: {
                    shaderData.addDefine(Particle2DShader.ColorOverLifetimeRandom);

                    rgbMaxBuffer = fillGradientRGB(gradientMax, this._gradientMaxRGBBuffer);
                    alphaMaxBuffer = fillGradientAlpha(gradientMax, this._gradientMaxAlphaBuffer);

                    if (rgbMaxBuffer.length == 32 || alphaMaxBuffer.length == 16) {
                        colorKey8 = true;
                        shaderData.setBuffer(Particle2DShader.GradientMaxRGB, this._gradientMaxRGBBuffer);
                        shaderData.setBuffer(Particle2DShader.GradientMaxAlpha, this._gradientMaxAlphaBuffer);
                        fillGradientTimeRange(gradientMax, this._gradientMaxTimeRange, 8);

                    }
                    else {
                        shaderData.setBuffer(Particle2DShader.GradientMaxRGB, rgbMaxBuffer);
                        shaderData.setBuffer(Particle2DShader.GradientMaxAlpha, alphaMaxBuffer);
                        fillGradientTimeRange(gradientMax, this._gradientMaxTimeRange, 4);
                    }
                    shaderData.setVector(Particle2DShader.GradientMaxTimeRange, this._gradientMaxTimeRange);
                    break;
                }
                default:
                    break;
            }

            if (colorKey8) {
                shaderData.addDefine(Particle2DShader.ColorOVerLifetimeColorKey_8);

                shaderData.setBuffer(Particle2DShader.GradientRGB, this._gradientRGBBuffer);
                shaderData.setBuffer(Particle2DShader.GradientAlpha, this._gradientAlphaBuffer);
            }
            else {
                shaderData.setBuffer(Particle2DShader.GradientRGB, rgbMinBuffer);
                shaderData.setBuffer(Particle2DShader.GradientAlpha, alphaMinBuffer);
            }
        }
        else {
            shaderData.removeDefine(Particle2DShader.ColorOverLifetimeDef);
            shaderData.removeDefine(Particle2DShader.ColorOverLifetimeRandom);
            shaderData.removeDefine(Particle2DShader.ColorOVerLifetimeColorKey_8);
        }

    }

    private setParticleVelocityOverLifetime(shaderData: ShaderData) {
        let ps = this.particleSystem;
        if (ps.velocity2DOverLifetime && ps.velocity2DOverLifetime.enable) {
            shaderData.addDefine(Particle2DShader.VelocityOverLifetimeDef);

            let velocityX = ps.velocity2DOverLifetime.x;
            let velocityY = ps.velocity2DOverLifetime.y;

            let mode = velocityX.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.Constant:
                    {
                        let valueX = velocityX.constant;
                        let valueY = velocityY.constant;
                        gradientDataNumberConstant(velocityX.curve, valueX);
                        gradientDataNumberConstant(velocityY.curve, valueY);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinX, velocityX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinY, velocityY.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxX, velocityX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxY, velocityY.curve._elements);
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoConstants:
                    {
                        let valueMinX = velocityX.constantMin;
                        let valueMinY = velocityY.constantMin;

                        let valueMaxX = velocityX.constantMax;
                        let valueMaxY = velocityY.constantMax;

                        gradientDataNumberConstant(velocityX.curveMin, valueMinX);
                        gradientDataNumberConstant(velocityY.curveMin, valueMinY);

                        gradientDataNumberConstant(velocityX.curveMax, valueMaxX);
                        gradientDataNumberConstant(velocityY.curveMax, valueMaxY);

                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinX, velocityX.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinY, velocityY.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxX, velocityX.curveMax._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxY, velocityY.curveMax._elements);
                        break;
                    };
                case ParticleMinMaxCurveMode.Curve:
                    {
                        velocityX.curve._formatData();
                        velocityY.curve._formatData();

                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinX, velocityX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinY, velocityY.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxX, velocityX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxY, velocityY.curve._elements);
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoCurves:
                    {
                        velocityX.curveMin._formatData();
                        velocityY.curveMin._formatData();
                        velocityX.curveMax._formatData();
                        velocityY.curveMax._formatData();

                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinX, velocityX.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMinY, velocityY.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxX, velocityX.curveMax._elements);
                        shaderData.setBuffer(Particle2DShader.VelocityCurveMaxY, velocityY.curveMax._elements);
                        break;
                    }
                default:
                    break;
            }

            let space = ps.velocity2DOverLifetime.space;
            switch (space) {
                case Velocity2DSimulateSpace.Local:
                    shaderData.setNumber(Particle2DShader.VelocityOverLifetimeSpace, 0);
                    break;
                case Velocity2DSimulateSpace.World:
                    shaderData.setNumber(Particle2DShader.VelocityOverLifetimeSpace, 1);
                    break;
                default:
                    break;
            }
        }
        else {
            shaderData.removeDefine(Particle2DShader.VelocityOverLifetimeDef);
        }
    }

    private setSize2DOverLifetime(shaderData: ShaderData) {
        let ps = this.particleSystem;
        if (ps.size2DOverLifetime && ps.size2DOverLifetime.enable) {
            let sizeX = ps.size2DOverLifetime.x;
            let sizeY = ps.size2DOverLifetime.y;

            let mode = sizeX.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.Curve:
                    shaderData.addDefine(Particle2DShader.SizeOverLifetimeDef);

                    if (ps.size2DOverLifetime.separateAxes) {
                        sizeX.curve._formatData();
                        sizeY.curve._formatData();
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinX, sizeX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinY, sizeY.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxX, sizeX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxY, sizeY.curve._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(sizeX.curve, sizeY.curve, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMinTimeRange, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMaxTimeRange, range);
                    }
                    else {
                        sizeX.curve._formatData();
                        // sizeY.curve._formatData();
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinX, sizeX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinY, sizeX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxX, sizeX.curve._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxY, sizeX.curve._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(sizeX.curve, sizeX.curve, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMinTimeRange, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMaxTimeRange, range);
                    }
                    break;
                case ParticleMinMaxCurveMode.TwoCurves:
                    shaderData.addDefine(Particle2DShader.SizeOverLifetimeDef);

                    if (ps.size2DOverLifetime.separateAxes) {
                        sizeX.curveMin._formatData();
                        sizeX.curveMax._formatData();
                        sizeY.curveMin._formatData();
                        sizeX.curveMax._formatData();
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinX, sizeX.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinY, sizeY.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxX, sizeX.curveMax._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxY, sizeY.curveMax._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(sizeX.curveMin, sizeY.curveMin, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMinTimeRange, range);

                        fillCurveMinMaxTimeRange(sizeX.curveMax, sizeY.curveMax, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMaxTimeRange, range);
                    }
                    else {
                        sizeX.curveMin._formatData();
                        sizeX.curveMax._formatData();

                        shaderData.setBuffer(Particle2DShader.SizeCurveMinX, sizeX.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMinY, sizeX.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxX, sizeX.curveMax._elements);
                        shaderData.setBuffer(Particle2DShader.SizeCurveMaxY, sizeX.curveMax._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(sizeX.curveMin, sizeX.curveMin, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMinTimeRange, range);

                        fillCurveMinMaxTimeRange(sizeX.curveMax, sizeX.curveMax, range);
                        shaderData.setVector(Particle2DShader.SizeCurveMaxTimeRange, range);
                    }
                    break;
                case ParticleMinMaxCurveMode.Constant:
                case ParticleMinMaxCurveMode.TwoConstants:
                default:
                    shaderData.removeDefine(Particle2DShader.SizeOverLifetimeDef);
                    break;
            }
        }
        else {
            shaderData.removeDefine(Particle2DShader.SizeOverLifetimeDef);
        }

    }

    private setRotationOverlifetime(shaderData: ShaderData) {
        let ps = this.particleSystem;
        if (ps.rotation2DOverLifetime && ps.rotation2DOverLifetime.enable) {
            shaderData.addDefine(Particle2DShader.RotationOverLifetimeDef);

            let angularVelocity = ps.rotation2DOverLifetime.angularVelocity;

            let mode = angularVelocity.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.Constant:
                    {
                        let value = angularVelocity.constant;
                        gradientDataNumberConstant(angularVelocity.curve, value);

                        shaderData.setBuffer(Particle2DShader.RotationCurveMin, angularVelocity.curve._elements);
                        shaderData.setBuffer(Particle2DShader.RotationCurveMax, angularVelocity.curve._elements);
                        break;
                    }
                case ParticleMinMaxCurveMode.Curve:
                    {
                        angularVelocity.curve._formatData();
                        shaderData.setBuffer(Particle2DShader.RotationCurveMin, angularVelocity.curve._elements);
                        shaderData.setBuffer(Particle2DShader.RotationCurveMax, angularVelocity.curve._elements);
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoConstants:
                    {
                        let valueMin = angularVelocity.constantMin;
                        let valueMax = angularVelocity.constantMax;

                        gradientDataNumberConstant(angularVelocity.curveMin, valueMin);
                        gradientDataNumberConstant(angularVelocity.curveMax, valueMax);

                        shaderData.setBuffer(Particle2DShader.RotationCurveMin, angularVelocity.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.RotationCurveMax, angularVelocity.curveMax._elements);
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoCurves:
                    {
                        angularVelocity.curveMin._formatData();
                        angularVelocity.curveMax._formatData();

                        shaderData.setBuffer(Particle2DShader.RotationCurveMin, angularVelocity.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.RotationCurveMax, angularVelocity.curveMax._elements);
                        break;
                    }
                default:
                    break;
            }
        }
        else {
            shaderData.removeDefine(Particle2DShader.RotationOverLifetimeDef);
        }
    }

    private setTextureSheetAnimation(shaderData: ShaderData) {
        let ps = this.particleSystem;
        if (ps.textureSheetAnimation && ps.textureSheetAnimation.enable) {
            shaderData.addDefine(Particle2DShader.TextureSheetAnimationDef);

            let tiles = ps.textureSheetAnimation.tiles;

            let cycles = ps.textureSheetAnimation.cycles;
            let animationSubUV = tempV4;
            animationSubUV.setValue(tiles.x, tiles.y, cycles, 0);
            shaderData.setVector(Particle2DShader.TextureSheetFrameData, animationSubUV);

            let frame = ps.textureSheetAnimation.frame;
            let mode = ps.textureSheetAnimation.frame.mode;
            switch (mode) {
                case ParticleMinMaxCurveMode.Constant:
                    {
                        let value = frame.constant;
                        gradientDataNumberConstant(frame.curve, value);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrame, frame.curve._elements);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrameMax, frame.curve._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(frame.curve, frame.curve, range);
                        shaderData.setVector(Particle2DShader.TextureSheetFrameRange, range);
                        break;
                    }
                case ParticleMinMaxCurveMode.Curve:
                    {
                        frame.curve._formatData();
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrame, frame.curve._elements);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrameMax, frame.curve._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(frame.curve, frame.curve, range);
                        shaderData.setVector(Particle2DShader.TextureSheetFrameRange, range);
                        break;
                    };
                case ParticleMinMaxCurveMode.TwoConstants:
                    {
                        let valueMin = frame.constantMin;
                        let valueMax = frame.constantMax;
                        gradientDataNumberConstant(frame.curveMin, valueMin);
                        gradientDataNumberConstant(frame.curveMax, valueMax);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrame, frame.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrameMax, frame.curveMax._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(frame.curveMin, frame.curveMax, range);
                        shaderData.setVector(Particle2DShader.TextureSheetFrameRange, range);
                        break;
                    }
                case ParticleMinMaxCurveMode.TwoCurves:
                    {
                        frame.curveMin._formatData();
                        frame.curveMax._formatData();
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrame, frame.curveMin._elements);
                        shaderData.setBuffer(Particle2DShader.TextureSheetFrameMax, frame.curveMax._elements);

                        let range = tempV4;
                        fillCurveMinMaxTimeRange(frame.curveMin, frame.curveMax, range);
                        shaderData.setVector(Particle2DShader.TextureSheetFrameRange, range);
                        break;
                    }
                default:
                    break;
            }
        }
        else {
            shaderData.removeDefine(Particle2DShader.TextureSheetAnimationDef);
        }
    }

    private setParticleData(shaderData: ShaderData, worldMat: Matrix) {
        let ps = this.particleSystem;

        if (!this.particleGeometry || ps.main.maxParticles != this.particleGeometry.maxParitcleCount) {
            this._createRenderGeometry();
        }

        shaderData.setNumber(Particle2DShader.CurrentTime, ps.totalTime);
        shaderData.setNumber(Particle2DShader.UnitPixels, ps.main.unitPixels);

        let scaleX = worldMat.getScaleX();
        let scaleY = worldMat.getScaleY();

        let cosAngle = worldMat.a / scaleX;
        let sinAngle = worldMat.b / scaleX;

        let translateX = nMatrix0.z;
        let translateY = nMatrix1.z;

        let simulationSpace = 0;
        switch (ps.main.simulationSpace) {
            case Particle2DSimulationSpace.Local:
                simulationSpace = 0;
                break;
            case Particle2DSimulationSpace.World:
                simulationSpace = 1;
                break;
            default:
                break;
        }

        switch (ps.main.scaleMode) {
            case Particle2DScalingMode.Hierarchy:
                break;
            case Particle2DScalingMode.Local:
                scaleX = this.owner.scaleX;
                scaleY = this.owner.scaleY;
                break;
            default:
                break;
        }

        ps.main._spriteRotAndScale.setValue(cosAngle, sinAngle, scaleX, scaleY);
        ps.main._spriteTranslateAndSpace.setValue(translateX, translateY, simulationSpace);

        // gravity
        const Physics2DSettingPixelRatio = Physics2DOption?.pixelRatio ?? 50;
        const Physics2DSettingGravity = Physics2DOption?.gravity ?? { x: 0, y: 9.8 };
        let physicPixelRatio = ps.main.unitPixels / Physics2DSettingPixelRatio;
        let gravityX = Physics2DSettingGravity.x * physicPixelRatio;
        let gravityY = Physics2DSettingGravity.y * physicPixelRatio;
        let gravityModifier = ps.main.gravityModifier;
        ps.main._gravity.setValue(gravityX * gravityModifier, gravityY * gravityModifier);

        if (ps.emission.rateOverDistance >= 0) {

            let posX = translateX;
            let posY = translateY;

            let lastX = ps.emission._lastPosition.x;
            let lastY = ps.emission._lastPosition.y;

            let dx = (posX - lastX);
            let dy = (posY - lastY);
            let distance = dx * dx + dy * dy;
            distance = Math.sqrt(distance);

            ps._emitDistance += distance;

            ps.emission._lastPosition.set(posX, posY, 0);
        }

        // ColorOverLifetime
        if (ps._dirtyFlags & Particle2DSystemDirtyFlagBits.ColorOverLifetimeBit) {
            this.setParticleColorOverLifetime(shaderData);
            ps._dirtyFlags &= ~Particle2DSystemDirtyFlagBits.ColorOverLifetimeBit;
        }

        // VelocityOverLifetime
        if (ps._dirtyFlags & Particle2DSystemDirtyFlagBits.Velocity2DOverLifetimeBit) {
            this.setParticleVelocityOverLifetime(shaderData);
            ps._dirtyFlags &= ~Particle2DSystemDirtyFlagBits.Velocity2DOverLifetimeBit;
        }

        // SizeOverLifetime
        if (ps._dirtyFlags & Particle2DSystemDirtyFlagBits.Size2DOverLifetimeBit) {
            this.setSize2DOverLifetime(shaderData);
            ps._dirtyFlags &= ~Particle2DSystemDirtyFlagBits.Size2DOverLifetimeBit;
        }

        // RotationOverLifetime
        if (ps._dirtyFlags & Particle2DSystemDirtyFlagBits.Rotation2DOverLifetimeBit) {
            this.setRotationOverlifetime(shaderData);
            ps._dirtyFlags &= ~Particle2DSystemDirtyFlagBits.Rotation2DOverLifetimeBit;
        }

        // TextureSheetAnimation
        if (ps._dirtyFlags & Particle2DSystemDirtyFlagBits.TextureSheetAnimationBit) {
            this.setTextureSheetAnimation(shaderData);
            ps._dirtyFlags &= ~Particle2DSystemDirtyFlagBits.TextureSheetAnimationBit;
        }
    }

    addCMDCall(context: Context, px: number, py: number): void {

        if (!this.particleSystem) {
            return;
        }

        let mat = context._curMat;

        nMatrix0.x = mat.a;
        nMatrix0.y = mat.c;
        nMatrix0.z = px * mat.a + py * mat.c + mat.tx;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_0, nMatrix0);

        nMatrix1.x = mat.b;
        nMatrix1.y = mat.d;
        nMatrix1.z = px * mat.b + py * mat.d + mat.ty;
        this._spriteShaderData.setVector3(BaseRenderNode2D.NMATRIX_1, nMatrix1);

        this._setRenderSize(context.width, context.height);
        context._copyClipInfoToShaderData(this._spriteShaderData);
        this._lightReceive && this._updateLight();

        this.setParticleData(this._spriteShaderData, mat);
    }

    private _createRenderGeometry() {
        if (this.particleGeometry) {
            this.particleGeometry.destroy();
            this.particleGeometry = null;
        }

        let maxParticles = this.particleSystem.main.maxParticles;
        let particleDeclaration = Particle2DVertexMesh.Particle2DDeclaration;
        let meshDeclaration = Particle2DVertexMesh.Particle2DMeshDeclaration;

        this.particleGeometry = new Particle2DGeomotry(maxParticles, particleDeclaration, meshDeclaration);

        this._createRenderElements();
    }

    private _createRenderElements() {
        this._renderElements.forEach(element => {
            element.destroy();
        });
        this._renderElements.length = 0;

        if (!this.sharedMaterial) {
            return;
        }

        {
            let declaration = Particle2DVertexMesh.Particle2DDeclaration;
            let particleInfo = Particle2DVertexMesh.Particle2DInfo;

            let particleByteStride = declaration.vertexStride;

            this.particleSystem._initParticleData(particleByteStride, particleInfo);
        }

        const createRenderElement = (geometry: IRenderGeometryElement) => {
            let element = LayaGL.render2DRenderPassFactory.createRenderElement2D();
            element.geometry = geometry;
            element.value2DShaderData = this._spriteShaderData;
            BaseRenderNode2D._setRenderElement2DMaterial(element, this.sharedMaterial);
            element.renderStateIsBySprite = false;
            element.nodeCommonMap = this._getcommonUniformMap();
            return element;
        };

        if (this.particleGeometry) {
            let geometry = this.particleGeometry.geometry;
            let element = createRenderElement(geometry);
            this._renderElements.push(element);
        }
    }

    private _updateParticleBuffer(startActive: number, endActive: number) {
        let ps = this.particleSystem;

        let meshVertexCount = 4;
        let meshIndexCount = 6;

        let maxParticles = ps.main.maxParticles;

        let particleDatas = ps.particlePool.particleDatas;

        let particleVertexDatas = this.particleGeometry.particleDatas;

        let particleBuffer = this.particleGeometry.particleBuffer;

        let particleStride = ps.particlePool.particleStride;
        let particleByteStride = ps.particlePool.particleByteStride;

        if (startActive <= endActive) {
            let particleCount = endActive - startActive;

            for (let i = startActive; i <= endActive; i++) {
                fillParticleData(i, particleStride, particleByteStride, particleDatas, meshVertexCount, particleVertexDatas);
            }

            let start = startActive * meshVertexCount * particleByteStride;
            let length = particleCount * meshVertexCount * particleByteStride;
            particleBuffer.setData(particleVertexDatas.buffer, start, start, length);
        }
        else {
            {
                for (let i = startActive; i <= maxParticles; i++) {
                    fillParticleData(i, particleStride, particleByteStride, particleDatas, meshVertexCount, particleVertexDatas);
                }
                let start = startActive * meshVertexCount * particleByteStride;
                let length = (maxParticles + 1 - startActive) * meshVertexCount * particleByteStride;
                particleBuffer.setData(particleVertexDatas.buffer, start, start, length);
            }
            {
                for (let i = 0; i < endActive; i++) {
                    fillParticleData(i, particleStride, particleByteStride, particleDatas, meshVertexCount, particleVertexDatas);
                }

                let start = 0;
                let length = endActive * meshVertexCount * particleByteStride;
                particleBuffer.setData(particleVertexDatas.buffer, start, start, length);
            }
        }
    }

    private _updateMark: number = -1;
    renderUpdate(context: IRenderContext2D): void {
        let ps = this.particleSystem;
        if (this._renderElements.length <= 0) {
            return;
        }
        if (this._updateMark != Stat.loopCount) {
            this._updateMark = Stat.loopCount;

            let elapsedTime = this.owner.scene.timer.delta / 1000;
            ps._update(elapsedTime);

            const startUpdate = ps.particlePool.updateStartIndex;
            const endUpdate = ps.particlePool.updateEndIndex;
            if (startUpdate != endUpdate) {
                this._updateParticleBuffer(startUpdate, endUpdate);
            }

            const startActive = ps.particlePool.activeStartIndex;
            const endActive = ps.particlePool.activeEndIndex;

            let meshVertexCount = 4;
            let meshIndexCount = 6;
            let maxParticles = ps.main.maxParticles;
            if (startActive <= endActive) {
                let particleCount = endActive - startActive;
                this._renderElements.forEach(element => {
                    element.geometry.clearRenderParams();
                    let drawCount = particleCount * meshIndexCount;
                    element.geometry.setDrawElemenParams(drawCount, startActive * meshIndexCount * 2);
                });
            }
            else {
                this._renderElements.forEach(element => {
                    element.geometry.clearRenderParams();
                    let drawCount = (maxParticles + 1 - startActive) * meshIndexCount;
                    element.geometry.setDrawElemenParams(drawCount, startActive * meshIndexCount * 2);
                    drawCount = endActive * meshIndexCount;
                    if (drawCount > 0) {
                        element.geometry.setDrawElemenParams(drawCount, 0);
                    }
                });
            }

        }
    }

    onEnable(): void {
        let ps = this.particleSystem;
        if (LayaEnv.isPlaying && ps.main.playOnAwake) {
            ps.play();
        }
    }

    onDisable(): void {
        let ps = this.particleSystem;
        ps.simulate(0, true);
    }

    onDestroy(): void {
        this.particleGeometry.destroy();
        this.particleGeometry = null;

        this.particleSystem.destroy();
    }

    _cloneTo(dest: ShurikenParticle2DRenderer): void {
        super._cloneTo(dest);
        this.particleSystem.cloneTo(dest.particleSystem);
    }

}

addAfterInitCallback(() => {
    Particle2DVertexMesh.init();
    Particle2DShader.init();
})


