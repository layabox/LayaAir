import { Loader } from "../../../net/Loader";
import { Color } from "../../math/Color";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { ShaderDefines } from "../../shader/ShaderDefines";
import { Gradient } from "../Gradient";
import { RenderElement } from "../render/RenderElement";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { ShurikenParticleMaterial } from "././ShurikenParticleMaterial";
import { ShurikenParticleRenderer } from "././ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "././ShurikenParticleSystem";
import { Burst } from "./module/Burst";
import { ColorOverLifetime } from "./module/ColorOverLifetime";
import { FrameOverTime } from "./module/FrameOverTime";
import { GradientAngularVelocity } from "./module/GradientAngularVelocity";
import { GradientColor } from "./module/GradientColor";
import { GradientDataInt } from "./module/GradientDataInt";
import { GradientDataNumber } from "./module/GradientDataNumber";
import { GradientSize } from "./module/GradientSize";
import { GradientVelocity } from "./module/GradientVelocity";
import { RotationOverLifetime } from "./module/RotationOverLifetime";
import { BoxShape } from "./module/shape/BoxShape";
import { CircleShape } from "./module/shape/CircleShape";
import { ConeShape } from "./module/shape/ConeShape";
import { HemisphereShape } from "./module/shape/HemisphereShape";
import { SphereShape } from "./module/shape/SphereShape";
import { SizeOverLifetime } from "./module/SizeOverLifetime";
import { StartFrame } from "./module/StartFrame";
import { TextureSheetAnimation } from "./module/TextureSheetAnimation";
import { VelocityOverLifetime } from "./module/VelocityOverLifetime";
import { ShuriKenParticle3DShaderDeclaration } from "./ShuriKenParticle3DShaderDeclaration";
/**
 * <code>ShuriKenParticle3D</code> 3D粒子。
 */
export class ShuriKenParticle3D extends RenderableSprite3D {
    /**
     * @private
     */
    static __init__() {
        ShuriKenParticle3D.shaderDefines = new ShaderDefines(RenderableSprite3D.shaderDefines);
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_BILLBOARD = ShuriKenParticle3D.shaderDefines.registerDefine("SPHERHBILLBOARD");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_STRETCHEDBILLBOARD = ShuriKenParticle3D.shaderDefines.registerDefine("STRETCHEDBILLBOARD");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_HORIZONTALBILLBOARD = ShuriKenParticle3D.shaderDefines.registerDefine("HORIZONTALBILLBOARD");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_VERTICALBILLBOARD = ShuriKenParticle3D.shaderDefines.registerDefine("VERTICALBILLBOARD");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_COLOROVERLIFETIME = ShuriKenParticle3D.shaderDefines.registerDefine("COLOROVERLIFETIME");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RANDOMCOLOROVERLIFETIME = ShuriKenParticle3D.shaderDefines.registerDefine("RANDOMCOLOROVERLIFETIME");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECONSTANT = ShuriKenParticle3D.shaderDefines.registerDefine("VELOCITYOVERLIFETIMECONSTANT");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMECURVE = ShuriKenParticle3D.shaderDefines.registerDefine("VELOCITYOVERLIFETIMECURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCONSTANT = ShuriKenParticle3D.shaderDefines.registerDefine("VELOCITYOVERLIFETIMERANDOMCONSTANT");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_VELOCITYOVERLIFETIMERANDOMCURVE = ShuriKenParticle3D.shaderDefines.registerDefine("VELOCITYOVERLIFETIMERANDOMCURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONCURVE = ShuriKenParticle3D.shaderDefines.registerDefine("TEXTURESHEETANIMATIONCURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_TEXTURESHEETANIMATIONRANDOMCURVE = ShuriKenParticle3D.shaderDefines.registerDefine("TEXTURESHEETANIMATIONRANDOMCURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIME = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIME");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMESEPERATE = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIMESEPERATE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECONSTANT = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIMECONSTANT");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMECURVE = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIMECURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCONSTANTS = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIMERANDOMCONSTANTS");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_ROTATIONOVERLIFETIMERANDOMCURVES = ShuriKenParticle3D.shaderDefines.registerDefine("ROTATIONOVERLIFETIMERANDOMCURVES");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVE = ShuriKenParticle3D.shaderDefines.registerDefine("SIZEOVERLIFETIMECURVE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMECURVESEPERATE = ShuriKenParticle3D.shaderDefines.registerDefine("SIZEOVERLIFETIMECURVESEPERATE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVES = ShuriKenParticle3D.shaderDefines.registerDefine("SIZEOVERLIFETIMERANDOMCURVES");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SIZEOVERLIFETIMERANDOMCURVESSEPERATE = ShuriKenParticle3D.shaderDefines.registerDefine("SIZEOVERLIFETIMERANDOMCURVESSEPERATE");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_RENDERMODE_MESH = ShuriKenParticle3D.shaderDefines.registerDefine("RENDERMODE_MESH");
        ShuriKenParticle3DShaderDeclaration.SHADERDEFINE_SHAPE = ShuriKenParticle3D.shaderDefines.registerDefine("SHAPE");
    }
    /**
     * 获取粒子系统。
     * @return  粒子系统。
     */
    get particleSystem() {
        return this._particleSystem;
    }
    /**
     * 获取粒子渲染器。
     * @return  粒子渲染器。
     */
    get particleRenderer() {
        return this._render;
    }
    /**
     * 创建一个 <code>Particle3D</code> 实例。
     * @param settings value 粒子配置。
     */
    constructor() {
        super(null);
        this._render = new ShurikenParticleRenderer(this);
        this._particleSystem = new ShurikenParticleSystem(this);
        var elements = this._render._renderElements;
        var element = elements[0] = new RenderElement();
        element.setTransform(this._transform);
        element.render = this._render;
        element.setGeometry(this._particleSystem);
        element.material = ShurikenParticleMaterial.defaultMaterial;
    }
    /**
     * @private
     */
    static _initStartLife(gradientData) {
        var gradient = new GradientDataNumber();
        var startLifetimesData = gradientData.startLifetimes;
        for (var i = 0, n = startLifetimesData.length; i < n; i++) {
            var valueData = startLifetimesData[i];
            gradient.add(valueData.key, valueData.value);
        }
        return gradient;
    }
    /**
     * @private
     */
    _initParticleVelocity(gradientData) {
        var gradient = new GradientDataNumber();
        var velocitysData = gradientData.velocitys;
        for (var i = 0, n = velocitysData.length; i < n; i++) {
            var valueData = velocitysData[i];
            gradient.add(valueData.key, valueData.value);
        }
        return gradient;
    }
    /**
     * @private
     */
    _initParticleColor(gradientColorData) {
        var gradientColor = new Gradient(4, 4);
        var alphasData = gradientColorData.alphas;
        var i, n;
        for (i = 0, n = alphasData.length; i < n; i++) {
            var alphaData = alphasData[i];
            if ((i === 3) && ((alphaData.key !== 1))) {
                alphaData.key = 1;
                console.log("GradientDataColor warning:the forth key is  be force set to 1.");
            }
            gradientColor.addColorAlpha(alphaData.key, alphaData.value);
        }
        var rgbsData = gradientColorData.rgbs;
        for (i = 0, n = rgbsData.length; i < n; i++) {
            var rgbData = rgbsData[i];
            var rgbValue = rgbData.value;
            if ((i === 3) && ((rgbData.key !== 1))) {
                rgbData.key = 1;
                console.log("GradientDataColor warning:the forth key is  be force set to 1.");
            }
            gradientColor.addColorRGB(rgbData.key, new Color(rgbValue[0], rgbValue[1], rgbValue[2], 1.0));
        }
        return gradientColor;
    }
    /**
     * @private
     */
    _initParticleSize(gradientSizeData) {
        var gradientSize = new GradientDataNumber();
        var sizesData = gradientSizeData.sizes;
        for (var i = 0, n = sizesData.length; i < n; i++) {
            var valueData = sizesData[i];
            gradientSize.add(valueData.key, valueData.value);
        }
        return gradientSize;
    }
    /**
     * @private
     */
    _initParticleRotation(gradientData) {
        var gradient = new GradientDataNumber();
        var angularVelocitysData = gradientData.angularVelocitys;
        for (var i = 0, n = angularVelocitysData.length; i < n; i++) {
            var valueData = angularVelocitysData[i];
            gradient.add(valueData.key, valueData.value / 180.0 * Math.PI);
        }
        return gradient;
    }
    /**
     * @private
     */
    _initParticleFrame(overTimeFramesData) {
        var overTimeFrame = new GradientDataInt();
        var framesData = overTimeFramesData.frames;
        for (var i = 0, n = framesData.length; i < n; i++) {
            var frameData = framesData[i];
            overTimeFrame.add(frameData.key, frameData.value);
        }
        return overTimeFrame;
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        super._parse(data, spriteMap);
        const anglelToRad = Math.PI / 180.0;
        var i, n;
        //Render
        var particleRender = this.particleRenderer;
        var material;
        var materialData = data.material;
        (materialData) && (material = Loader.getRes(materialData.path));
        particleRender.sharedMaterial = material;
        var meshPath = data.meshPath;
        (meshPath) && (particleRender.mesh = Loader.getRes(meshPath));
        particleRender.renderMode = data.renderMode;
        particleRender.stretchedBillboardCameraSpeedScale = data.stretchedBillboardCameraSpeedScale;
        particleRender.stretchedBillboardSpeedScale = data.stretchedBillboardSpeedScale;
        particleRender.stretchedBillboardLengthScale = data.stretchedBillboardLengthScale;
        particleRender.sortingFudge = data.sortingFudge ? data.sortingFudge : 0.0;
        //particleSystem
        var particleSystem = this.particleSystem;
        particleSystem.isPerformanceMode = data.isPerformanceMode;
        particleSystem.duration = data.duration;
        particleSystem.looping = data.looping;
        particleSystem.prewarm = data.prewarm;
        particleSystem.startDelayType = data.startDelayType;
        particleSystem.startDelay = data.startDelay;
        particleSystem.startDelayMin = data.startDelayMin;
        particleSystem.startDelayMax = data.startDelayMax;
        particleSystem.startLifetimeType = data.startLifetimeType;
        particleSystem.startLifetimeConstant = data.startLifetimeConstant;
        particleSystem.startLifeTimeGradient = ShuriKenParticle3D._initStartLife(data.startLifetimeGradient);
        particleSystem.startLifetimeConstantMin = data.startLifetimeConstantMin;
        particleSystem.startLifetimeConstantMax = data.startLifetimeConstantMax;
        particleSystem.startLifeTimeGradientMin = ShuriKenParticle3D._initStartLife(data.startLifetimeGradientMin);
        particleSystem.startLifeTimeGradientMax = ShuriKenParticle3D._initStartLife(data.startLifetimeGradientMax);
        particleSystem.startSpeedType = data.startSpeedType;
        particleSystem.startSpeedConstant = data.startSpeedConstant;
        particleSystem.startSpeedConstantMin = data.startSpeedConstantMin;
        particleSystem.startSpeedConstantMax = data.startSpeedConstantMax;
        particleSystem.threeDStartSize = data.threeDStartSize;
        particleSystem.startSizeType = data.startSizeType;
        particleSystem.startSizeConstant = data.startSizeConstant;
        var startSizeConstantSeparateArray = data.startSizeConstantSeparate;
        var startSizeConstantSeparateElement = particleSystem.startSizeConstantSeparate;
        startSizeConstantSeparateElement.x = startSizeConstantSeparateArray[0];
        startSizeConstantSeparateElement.y = startSizeConstantSeparateArray[1];
        startSizeConstantSeparateElement.z = startSizeConstantSeparateArray[2];
        particleSystem.startSizeConstantMin = data.startSizeConstantMin;
        particleSystem.startSizeConstantMax = data.startSizeConstantMax;
        var startSizeConstantMinSeparateArray = data.startSizeConstantMinSeparate;
        var startSizeConstantMinSeparateElement = particleSystem.startSizeConstantMinSeparate;
        startSizeConstantMinSeparateElement.x = startSizeConstantMinSeparateArray[0];
        startSizeConstantMinSeparateElement.y = startSizeConstantMinSeparateArray[1];
        startSizeConstantMinSeparateElement.z = startSizeConstantMinSeparateArray[2];
        var startSizeConstantMaxSeparateArray = data.startSizeConstantMaxSeparate;
        var startSizeConstantMaxSeparateElement = particleSystem.startSizeConstantMaxSeparate;
        startSizeConstantMaxSeparateElement.x = startSizeConstantMaxSeparateArray[0];
        startSizeConstantMaxSeparateElement.y = startSizeConstantMaxSeparateArray[1];
        startSizeConstantMaxSeparateElement.z = startSizeConstantMaxSeparateArray[2];
        particleSystem.threeDStartRotation = data.threeDStartRotation;
        particleSystem.startRotationType = data.startRotationType;
        particleSystem.startRotationConstant = data.startRotationConstant * anglelToRad;
        var startRotationConstantSeparateArray = data.startRotationConstantSeparate;
        var startRotationConstantSeparateElement = particleSystem.startRotationConstantSeparate;
        startRotationConstantSeparateElement.x = startRotationConstantSeparateArray[0] * anglelToRad;
        startRotationConstantSeparateElement.y = startRotationConstantSeparateArray[1] * anglelToRad;
        startRotationConstantSeparateElement.z = startRotationConstantSeparateArray[2] * anglelToRad;
        particleSystem.startRotationConstantMin = data.startRotationConstantMin * anglelToRad;
        particleSystem.startRotationConstantMax = data.startRotationConstantMax * anglelToRad;
        var startRotationConstantMinSeparateArray = data.startRotationConstantMinSeparate;
        var startRotationConstantMinSeparateElement = particleSystem.startRotationConstantMinSeparate;
        startRotationConstantMinSeparateElement.x = startRotationConstantMinSeparateArray[0] * anglelToRad;
        startRotationConstantMinSeparateElement.y = startRotationConstantMinSeparateArray[1] * anglelToRad;
        startRotationConstantMinSeparateElement.z = startRotationConstantMinSeparateArray[2] * anglelToRad;
        var startRotationConstantMaxSeparateArray = data.startRotationConstantMaxSeparate;
        var startRotationConstantMaxSeparateElement = particleSystem.startRotationConstantMaxSeparate;
        startRotationConstantMaxSeparateElement.x = startRotationConstantMaxSeparateArray[0] * anglelToRad;
        startRotationConstantMaxSeparateElement.y = startRotationConstantMaxSeparateArray[1] * anglelToRad;
        startRotationConstantMaxSeparateElement.z = startRotationConstantMaxSeparateArray[2] * anglelToRad;
        particleSystem.randomizeRotationDirection = data.randomizeRotationDirection;
        particleSystem.startColorType = data.startColorType;
        var startColorConstantArray = data.startColorConstant;
        var startColorConstantElement = particleSystem.startColorConstant;
        startColorConstantElement.x = startColorConstantArray[0];
        startColorConstantElement.y = startColorConstantArray[1];
        startColorConstantElement.z = startColorConstantArray[2];
        startColorConstantElement.w = startColorConstantArray[3];
        var startColorConstantMinArray = data.startColorConstantMin;
        var startColorConstantMinElement = particleSystem.startColorConstantMin;
        startColorConstantMinElement.x = startColorConstantMinArray[0];
        startColorConstantMinElement.y = startColorConstantMinArray[1];
        startColorConstantMinElement.z = startColorConstantMinArray[2];
        startColorConstantMinElement.w = startColorConstantMinArray[3];
        var startColorConstantMaxArray = data.startColorConstantMax;
        var startColorConstantMaxElement = particleSystem.startColorConstantMax;
        startColorConstantMaxElement.x = startColorConstantMaxArray[0];
        startColorConstantMaxElement.y = startColorConstantMaxArray[1];
        startColorConstantMaxElement.z = startColorConstantMaxArray[2];
        startColorConstantMaxElement.w = startColorConstantMaxArray[3];
        particleSystem.gravityModifier = data.gravityModifier;
        particleSystem.simulationSpace = data.simulationSpace;
        particleSystem.scaleMode = data.scaleMode;
        particleSystem.playOnAwake = data.playOnAwake;
        particleSystem.maxParticles = data.maxParticles;
        var autoRandomSeed = data.autoRandomSeed;
        (autoRandomSeed != null) && (particleSystem.autoRandomSeed = autoRandomSeed);
        var randomSeed = data.randomSeed;
        (randomSeed != null) && (particleSystem.randomSeed[0] = randomSeed);
        //Emission
        var emissionData = data.emission;
        var emission = particleSystem.emission;
        if (emissionData) {
            emission.emissionRate = emissionData.emissionRate;
            var burstsData = emissionData.bursts;
            if (burstsData)
                for (i = 0, n = burstsData.length; i < n; i++) {
                    var brust = burstsData[i];
                    emission.addBurst(new Burst(brust.time, brust.min, brust.max));
                }
            emission.enbale = emissionData.enable;
        }
        else {
            emission.enbale = false;
        }
        //Shape
        var shapeData = data.shape;
        if (shapeData) {
            var shape;
            switch (shapeData.shapeType) {
                case 0:
                    var sphereShape;
                    shape = sphereShape = new SphereShape();
                    sphereShape.radius = shapeData.sphereRadius;
                    sphereShape.emitFromShell = shapeData.sphereEmitFromShell;
                    sphereShape.randomDirection = shapeData.sphereRandomDirection;
                    break;
                case 1:
                    var hemiSphereShape;
                    shape = hemiSphereShape = new HemisphereShape();
                    hemiSphereShape.radius = shapeData.hemiSphereRadius;
                    hemiSphereShape.emitFromShell = shapeData.hemiSphereEmitFromShell;
                    hemiSphereShape.randomDirection = shapeData.hemiSphereRandomDirection;
                    break;
                case 2:
                    var coneShape;
                    shape = coneShape = new ConeShape();
                    coneShape.angle = shapeData.coneAngle * anglelToRad;
                    coneShape.radius = shapeData.coneRadius;
                    coneShape.length = shapeData.coneLength;
                    coneShape.emitType = shapeData.coneEmitType;
                    coneShape.randomDirection = shapeData.coneRandomDirection;
                    break;
                case 3:
                    var boxShape;
                    shape = boxShape = new BoxShape();
                    boxShape.x = shapeData.boxX;
                    boxShape.y = shapeData.boxY;
                    boxShape.z = shapeData.boxZ;
                    boxShape.randomDirection = shapeData.boxRandomDirection;
                    break;
                case 7:
                    var circleShape;
                    shape = circleShape = new CircleShape();
                    circleShape.radius = shapeData.circleRadius;
                    circleShape.arc = shapeData.circleArc * anglelToRad;
                    circleShape.emitFromEdge = shapeData.circleEmitFromEdge;
                    circleShape.randomDirection = shapeData.circleRandomDirection;
                    break;
                /**
                 * ------------------------临时调整，待日后完善-------------------------------------
                 */
                default:
                    var tempShape;
                    shape = tempShape = new CircleShape();
                    tempShape.radius = shapeData.circleRadius;
                    tempShape.arc = shapeData.circleArc * anglelToRad;
                    tempShape.emitFromEdge = shapeData.circleEmitFromEdge;
                    tempShape.randomDirection = shapeData.circleRandomDirection;
                    break;
            }
            shape.enable = shapeData.enable;
            particleSystem.shape = shape;
        }
        //VelocityOverLifetime
        var velocityOverLifetimeData = data.velocityOverLifetime;
        if (velocityOverLifetimeData) {
            var velocityData = velocityOverLifetimeData.velocity;
            var velocity;
            switch (velocityData.type) {
                case 0:
                    var constantData = velocityData.constant;
                    velocity = GradientVelocity.createByConstant(new Vector3(constantData[0], constantData[1], constantData[2]));
                    break;
                case 1:
                    velocity = GradientVelocity.createByGradient(this._initParticleVelocity(velocityData.gradientX), this._initParticleVelocity(velocityData.gradientY), this._initParticleVelocity(velocityData.gradientZ));
                    break;
                case 2:
                    var constantMinData = velocityData.constantMin;
                    var constantMaxData = velocityData.constantMax;
                    velocity = GradientVelocity.createByRandomTwoConstant(new Vector3(constantMinData[0], constantMinData[1], constantMinData[2]), new Vector3(constantMaxData[0], constantMaxData[1], constantMaxData[2]));
                    break;
                case 3:
                    velocity = GradientVelocity.createByRandomTwoGradient(this._initParticleVelocity(velocityData.gradientXMin), this._initParticleVelocity(velocityData.gradientXMax), this._initParticleVelocity(velocityData.gradientYMin), this._initParticleVelocity(velocityData.gradientYMax), this._initParticleVelocity(velocityData.gradientZMin), this._initParticleVelocity(velocityData.gradientZMax));
                    break;
            }
            var velocityOverLifetime = new VelocityOverLifetime(velocity);
            velocityOverLifetime.space = velocityOverLifetimeData.space;
            velocityOverLifetime.enbale = velocityOverLifetimeData.enable;
            particleSystem.velocityOverLifetime = velocityOverLifetime;
        }
        //ColorOverLifetime
        var colorOverLifetimeData = data.colorOverLifetime;
        if (colorOverLifetimeData) {
            var colorData = colorOverLifetimeData.color;
            var color;
            switch (colorData.type) {
                case 0:
                    var constColorData = colorData.constant;
                    color = GradientColor.createByConstant(new Vector4(constColorData[0], constColorData[1], constColorData[2], constColorData[3]));
                    break;
                case 1:
                    color = GradientColor.createByGradient(this._initParticleColor(colorData.gradient));
                    break;
                case 2:
                    var minConstColorData = colorData.constantMin;
                    var maxConstColorData = colorData.constantMax;
                    color = GradientColor.createByRandomTwoConstant(new Vector4(minConstColorData[0], minConstColorData[1], minConstColorData[2], minConstColorData[3]), new Vector4(maxConstColorData[0], maxConstColorData[1], maxConstColorData[2], maxConstColorData[3]));
                    break;
                case 3:
                    color = GradientColor.createByRandomTwoGradient(this._initParticleColor(colorData.gradientMin), this._initParticleColor(colorData.gradientMax));
                    break;
            }
            var colorOverLifetime = new ColorOverLifetime(color);
            colorOverLifetime.enbale = colorOverLifetimeData.enable;
            particleSystem.colorOverLifetime = colorOverLifetime;
        }
        //SizeOverLifetime
        var sizeOverLifetimeData = data.sizeOverLifetime;
        if (sizeOverLifetimeData) {
            var sizeData = sizeOverLifetimeData.size;
            var size;
            switch (sizeData.type) {
                case 0:
                    if (sizeData.separateAxes) {
                        size = GradientSize.createByGradientSeparate(this._initParticleSize(sizeData.gradientX), this._initParticleSize(sizeData.gradientY), this._initParticleSize(sizeData.gradientZ));
                    }
                    else {
                        size = GradientSize.createByGradient(this._initParticleSize(sizeData.gradient));
                    }
                    break;
                case 1:
                    if (sizeData.separateAxes) {
                        var constantMinSeparateData = sizeData.constantMinSeparate;
                        var constantMaxSeparateData = sizeData.constantMaxSeparate;
                        size = GradientSize.createByRandomTwoConstantSeparate(new Vector3(constantMinSeparateData[0], constantMinSeparateData[1], constantMinSeparateData[2]), new Vector3(constantMaxSeparateData[0], constantMaxSeparateData[1], constantMaxSeparateData[2]));
                    }
                    else {
                        size = GradientSize.createByRandomTwoConstant(sizeData.constantMin, sizeData.constantMax);
                    }
                    break;
                case 2:
                    if (sizeData.separateAxes) {
                        size = GradientSize.createByRandomTwoGradientSeparate(this._initParticleSize(sizeData.gradientXMin), this._initParticleSize(sizeData.gradientYMin), this._initParticleSize(sizeData.gradientZMin), this._initParticleSize(sizeData.gradientXMax), this._initParticleSize(sizeData.gradientYMax), this._initParticleSize(sizeData.gradientZMax));
                    }
                    else {
                        size = GradientSize.createByRandomTwoGradient(this._initParticleSize(sizeData.gradientMin), this._initParticleSize(sizeData.gradientMax));
                    }
                    break;
            }
            var sizeOverLifetime = new SizeOverLifetime(size);
            sizeOverLifetime.enbale = sizeOverLifetimeData.enable;
            particleSystem.sizeOverLifetime = sizeOverLifetime;
        }
        //RotationOverLifetime
        var rotationOverLifetimeData = data.rotationOverLifetime;
        if (rotationOverLifetimeData) {
            var angularVelocityData = rotationOverLifetimeData.angularVelocity;
            var angularVelocity;
            switch (angularVelocityData.type) {
                case 0:
                    if (angularVelocityData.separateAxes) {
                        var conSep = angularVelocityData.constantSeparate;
                        angularVelocity = GradientAngularVelocity.createByConstantSeparate(new Vector3(conSep[0] * anglelToRad, conSep[1] * anglelToRad, conSep[2] * anglelToRad));
                    }
                    else {
                        angularVelocity = GradientAngularVelocity.createByConstant(angularVelocityData.constant * anglelToRad);
                    }
                    break;
                case 1:
                    if (angularVelocityData.separateAxes) {
                        angularVelocity = GradientAngularVelocity.createByGradientSeparate(this._initParticleRotation(angularVelocityData.gradientX), this._initParticleRotation(angularVelocityData.gradientY), this._initParticleRotation(angularVelocityData.gradientZ));
                    }
                    else {
                        angularVelocity = GradientAngularVelocity.createByGradient(this._initParticleRotation(angularVelocityData.gradient));
                    }
                    break;
                case 2:
                    if (angularVelocityData.separateAxes) {
                        var minSep = angularVelocityData.constantMinSeparate; //TODO:Y是否要取负数
                        var maxSep = angularVelocityData.constantMaxSeparate; //TODO:Y是否要取负数
                        angularVelocity = GradientAngularVelocity.createByRandomTwoConstantSeparate(new Vector3(minSep[0] * anglelToRad, minSep[1] * anglelToRad, minSep[2] * anglelToRad), new Vector3(maxSep[0] * anglelToRad, maxSep[1] * anglelToRad, maxSep[2] * anglelToRad));
                    }
                    else {
                        angularVelocity = GradientAngularVelocity.createByRandomTwoConstant(angularVelocityData.constantMin * anglelToRad, angularVelocityData.constantMax * anglelToRad);
                    }
                    break;
                case 3:
                    if (angularVelocityData.separateAxes) {
                        //TODO:待补充
                    }
                    else {
                        angularVelocity = GradientAngularVelocity.createByRandomTwoGradient(this._initParticleRotation(angularVelocityData.gradientMin), this._initParticleRotation(angularVelocityData.gradientMax));
                    }
                    break;
            }
            var rotationOverLifetime = new RotationOverLifetime(angularVelocity);
            rotationOverLifetime.enbale = rotationOverLifetimeData.enable;
            particleSystem.rotationOverLifetime = rotationOverLifetime;
        }
        //TextureSheetAnimation
        var textureSheetAnimationData = data.textureSheetAnimation;
        if (textureSheetAnimationData) {
            var frameData = textureSheetAnimationData.frame;
            var frameOverTime;
            switch (frameData.type) {
                case 0:
                    frameOverTime = FrameOverTime.createByConstant(frameData.constant);
                    break;
                case 1:
                    frameOverTime = FrameOverTime.createByOverTime(this._initParticleFrame(frameData.overTime));
                    break;
                case 2:
                    frameOverTime = FrameOverTime.createByRandomTwoConstant(frameData.constantMin, frameData.constantMax);
                    break;
                case 3:
                    frameOverTime = FrameOverTime.createByRandomTwoOverTime(this._initParticleFrame(frameData.overTimeMin), this._initParticleFrame(frameData.overTimeMax));
                    break;
            }
            var startFrameData = textureSheetAnimationData.startFrame;
            var startFrame;
            switch (startFrameData.type) {
                case 0:
                    startFrame = StartFrame.createByConstant(startFrameData.constant);
                    break;
                case 1:
                    startFrame = StartFrame.createByRandomTwoConstant(startFrameData.constantMin, startFrameData.constantMax);
                    break;
            }
            var textureSheetAnimation = new TextureSheetAnimation(frameOverTime, startFrame);
            textureSheetAnimation.enable = textureSheetAnimationData.enable;
            var tilesData = textureSheetAnimationData.tiles;
            textureSheetAnimation.tiles = new Vector2(tilesData[0], tilesData[1]);
            textureSheetAnimation.type = textureSheetAnimationData.type;
            textureSheetAnimation.randomRow = textureSheetAnimationData.randomRow;
            var rowIndex = textureSheetAnimationData.rowIndex;
            (rowIndex !== undefined) && (textureSheetAnimation.rowIndex = rowIndex);
            textureSheetAnimation.cycles = textureSheetAnimationData.cycles;
            particleSystem.textureSheetAnimation = textureSheetAnimation;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _activeHierarchy(activeChangeComponents) {
        super._activeHierarchy(activeChangeComponents);
        (this.particleSystem.playOnAwake) && (this.particleSystem.play());
    }
    /**
     * @inheritDoc
     */
    /*override*/ _inActiveHierarchy(activeChangeComponents) {
        super._inActiveHierarchy(activeChangeComponents);
        (this.particleSystem.isAlive) && (this.particleSystem.simulate(0, true));
    }
    /**
     * @private
     */
    /*override*/ _cloneTo(destObject, srcSprite, dstSprite) {
        var destShuriKenParticle3D = destObject;
        var destParticleSystem = destShuriKenParticle3D._particleSystem;
        this._particleSystem.cloneTo(destParticleSystem);
        var destParticleRender = destShuriKenParticle3D._render;
        var particleRender = this._render;
        destParticleRender.sharedMaterials = particleRender.sharedMaterials;
        destParticleRender.enable = particleRender.enable;
        destParticleRender.renderMode = particleRender.renderMode;
        destParticleRender.mesh = particleRender.mesh;
        destParticleRender.stretchedBillboardCameraSpeedScale = particleRender.stretchedBillboardCameraSpeedScale;
        destParticleRender.stretchedBillboardSpeedScale = particleRender.stretchedBillboardSpeedScale;
        destParticleRender.stretchedBillboardLengthScale = particleRender.stretchedBillboardLengthScale;
        destParticleRender.sortingFudge = particleRender.sortingFudge;
        super._cloneTo(destObject, srcSprite, dstSprite); //父类函数在最后,组件应该最后赋值，否则获取材质默认值等相关函数会有问题
    }
    /**
     * <p>销毁此对象。</p>
     * @param	destroyChild 是否同时销毁子节点，若值为true,则销毁子节点，否则不销毁子节点。
     */
    /*override*/ destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._particleSystem.destroy();
        this._particleSystem = null;
    }
    /**
     * @private
     */
    _create() {
        return new ShuriKenParticle3D();
    }
}
