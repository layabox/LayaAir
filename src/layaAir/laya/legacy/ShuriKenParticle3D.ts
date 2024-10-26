import { Gradient } from "../d3/core/Gradient";
import { Burst } from "../d3/core/particleShuriKen/module/Burst";
import { ColorOverLifetime } from "../d3/core/particleShuriKen/module/ColorOverLifetime";
import { Emission } from "../d3/core/particleShuriKen/module/Emission";
import { FrameOverTime } from "../d3/core/particleShuriKen/module/FrameOverTime";
import { GradientAngularVelocity } from "../d3/core/particleShuriKen/module/GradientAngularVelocity";
import { GradientColor } from "../d3/core/particleShuriKen/module/GradientColor";
import { GradientDataInt } from "../d3/core/particleShuriKen/module/GradientDataInt";
import { GradientDataNumber } from "../d3/core/particleShuriKen/module/GradientDataNumber";
import { GradientSize } from "../d3/core/particleShuriKen/module/GradientSize";
import { GradientVelocity } from "../d3/core/particleShuriKen/module/GradientVelocity";
import { RotationOverLifetime } from "../d3/core/particleShuriKen/module/RotationOverLifetime";
import { BaseShape } from "../d3/core/particleShuriKen/module/shape/BaseShape";
import { BoxShape } from "../d3/core/particleShuriKen/module/shape/BoxShape";
import { CircleShape } from "../d3/core/particleShuriKen/module/shape/CircleShape";
import { ConeShape } from "../d3/core/particleShuriKen/module/shape/ConeShape";
import { HemisphereShape } from "../d3/core/particleShuriKen/module/shape/HemisphereShape";
import { SphereShape } from "../d3/core/particleShuriKen/module/shape/SphereShape";
import { SizeOverLifetime } from "../d3/core/particleShuriKen/module/SizeOverLifetime";
import { StartFrame } from "../d3/core/particleShuriKen/module/StartFrame";
import { TextureSheetAnimation } from "../d3/core/particleShuriKen/module/TextureSheetAnimation";
import { VelocityOverLifetime } from "../d3/core/particleShuriKen/module/VelocityOverLifetime";
import { ShuriKenParticle3D } from "../d3/core/particleShuriKen/ShuriKenParticle3D";
import { ShurikenParticleMaterial } from "../d3/core/particleShuriKen/ShurikenParticleMaterial";
import { ShurikenParticleRenderer } from "../d3/core/particleShuriKen/ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "../d3/core/particleShuriKen/ShurikenParticleSystem";
import { Color } from "../maths/Color";
import { Vector2 } from "../maths/Vector2";
import { Vector3 } from "../maths/Vector3";
import { Vector4 } from "../maths/Vector4";
import { Loader } from "../net/Loader";
import { Texture } from "../resource/Texture";

ShuriKenParticle3D && (function () {
    let old_parse = ShuriKenParticle3D.prototype._parse;
    ShuriKenParticle3D.prototype._parse = function (this: ShuriKenParticle3D, data: any, spriteMap: any): void {
        old_parse.call(this, data, spriteMap);

        if (data.main) {
            var particleSystem: ShurikenParticleSystem = this.particleSystem;
            var particleRender: ShurikenParticleRenderer = this.particleRenderer;
            _parseModule(particleRender, data.renderer);//Renderer
            _parseModule(particleSystem, data.main);//particleSystem
            _parseModule(particleSystem.emission, data.emission);//Emission

            //Shape
            var shapeData: any = data.shape;
            if (shapeData) {
                var shape: BaseShape;
                switch (shapeData.shapeType) {
                    case 0:
                        shape = new SphereShape();
                        break;
                    case 1:
                        shape = new HemisphereShape();
                        break;
                    case 2:
                        shape = new ConeShape();
                        break;
                    case 3:
                        shape = new BoxShape();
                        break;
                    case 7:
                        shape = new CircleShape();
                        break;
                    default:
                        throw "ShuriKenParticle3D:unknown shape type.";
                }
                _parseModule(shape, shapeData);
                particleSystem.shape = shape;
            }

            //VelocityOverLifetime
            var velocityOverLifetimeData: any = data.velocityOverLifetime;
            if (velocityOverLifetimeData) {
                var velocityData: any = velocityOverLifetimeData.velocity;
                var velocity: GradientVelocity;
                switch (velocityData.type) {
                    case 0:
                        var constantData: any[] = velocityData.constant;
                        velocity = GradientVelocity.createByConstant(constantData ? new Vector3(constantData[0], constantData[1], constantData[2]) : new Vector3(0, 0, 0));
                        break;
                    case 1:
                        velocity = GradientVelocity.createByGradient(_initParticleVelocity(velocityData.gradientX), _initParticleVelocity(velocityData.gradientY), _initParticleVelocity(velocityData.gradientZ));
                        break;
                    case 2:
                        var constantMinData: any[] = velocityData.constantMin;
                        var constantMaxData: any[] = velocityData.constantMax;
                        velocity = GradientVelocity.createByRandomTwoConstant(constantMinData ? new Vector3(constantMinData[0], constantMinData[1], constantMinData[2]) : new Vector3(0, 0, 0), constantMaxData ? new Vector3(constantMaxData[0], constantMaxData[1], constantMaxData[2]) : new Vector3(0, 0, 0));
                        break;
                    case 3:
                        velocity = GradientVelocity.createByRandomTwoGradient(_initParticleVelocity(velocityData.gradientXMin), _initParticleVelocity(velocityData.gradientXMax), _initParticleVelocity(velocityData.gradientYMin), _initParticleVelocity(velocityData.gradientYMax), _initParticleVelocity(velocityData.gradientZMin), _initParticleVelocity(velocityData.gradientZMax));
                        break;
                }
                var velocityOverLifetime: VelocityOverLifetime = new VelocityOverLifetime(velocity);
                _parseModule(velocityOverLifetime, velocityOverLifetimeData);
                particleSystem.velocityOverLifetime = velocityOverLifetime;
            }

            //ColorOverLifetime
            var colorOverLifetimeData: any = data.colorOverLifetime;

            if (colorOverLifetimeData) {
                var colorData: any = colorOverLifetimeData.color;
                let maxKeyCount = colorData.maxKeyCount;
                var color: GradientColor;
                switch (colorData.type) {
                    case 0:
                        var constColorData: any[] = colorData.constant;
                        color = GradientColor.createByConstant(constColorData ? new Vector4(constColorData[0], constColorData[1], constColorData[2], constColorData[3]) : new Vector4(0, 0, 0, 0));
                        break;
                    case 1:
                        color = GradientColor.createByGradient(_initParticleColor(colorData.gradient, maxKeyCount));
                        break;
                    case 2:
                        var minConstColorData: any[] = colorData.constantMin;
                        var maxConstColorData: any[] = colorData.constantMax;
                        color = GradientColor.createByRandomTwoConstant(minConstColorData ? new Vector4(minConstColorData[0], minConstColorData[1], minConstColorData[2], minConstColorData[3]) : new Vector4(0, 0, 0, 0), minConstColorData ? new Vector4(maxConstColorData[0], maxConstColorData[1], maxConstColorData[2], maxConstColorData[3]) : new Vector4(0, 0, 0, 0));
                        break;
                    case 3:
                        color = GradientColor.createByRandomTwoGradient(_initParticleColor(colorData.gradientMin, maxKeyCount), _initParticleColor(colorData.gradientMax, maxKeyCount));
                        break;
                }
                var colorOverLifetime: ColorOverLifetime = new ColorOverLifetime(color);
                _parseModule(colorOverLifetime, colorOverLifetimeData);
                particleSystem.colorOverLifetime = colorOverLifetime;
            }

            //SizeOverLifetime
            var sizeOverLifetimeData: any = data.sizeOverLifetime;
            if (sizeOverLifetimeData) {
                var sizeData: any = sizeOverLifetimeData.size;
                var size: GradientSize;
                switch (sizeData.type) {
                    case 0:
                        if (sizeData.separateAxes) {
                            size = GradientSize.createByGradientSeparate(_initParticleSize(sizeData.gradientX), _initParticleSize(sizeData.gradientY), _initParticleSize(sizeData.gradientZ));
                        } else {
                            size = GradientSize.createByGradient(_initParticleSize(sizeData.gradient));
                        }
                        break;
                    case 1:
                        if (sizeData.separateAxes) {
                            var constantMinSeparateData: any[] = sizeData.constantMinSeparate;
                            var constantMaxSeparateData: any[] = sizeData.constantMaxSeparate;
                            size = GradientSize.createByRandomTwoConstantSeparate(constantMinSeparateData ? new Vector3(constantMinSeparateData[0], constantMinSeparateData[1], constantMinSeparateData[2]) : new Vector3(0, 0, 0), constantMaxSeparateData ? new Vector3(constantMaxSeparateData[0], constantMaxSeparateData[1], constantMaxSeparateData[2]) : new Vector3(0, 0, 0));
                        } else {
                            size = GradientSize.createByRandomTwoConstant(sizeData.constantMin || 0, sizeData.constantMax || 0);
                        }
                        break;
                    case 2:
                        if (sizeData.separateAxes) {
                            size = GradientSize.createByRandomTwoGradientSeparate(_initParticleSize(sizeData.gradientXMin), _initParticleSize(sizeData.gradientYMin), _initParticleSize(sizeData.gradientZMin), _initParticleSize(sizeData.gradientXMax), _initParticleSize(sizeData.gradientYMax), _initParticleSize(sizeData.gradientZMax));
                        } else {
                            size = GradientSize.createByRandomTwoGradient(_initParticleSize(sizeData.gradientMin), _initParticleSize(sizeData.gradientMax));
                        }
                        break;
                }
                var sizeOverLifetime: SizeOverLifetime = new SizeOverLifetime(size);
                _parseModule(sizeOverLifetime, sizeOverLifetimeData);
                particleSystem.sizeOverLifetime = sizeOverLifetime;
            }

            //RotationOverLifetime
            var rotationOverLifetimeData: any = data.rotationOverLifetime;
            if (rotationOverLifetimeData) {
                var angularVelocityData: any = rotationOverLifetimeData.angularVelocity;
                var angularVelocity: GradientAngularVelocity;
                switch (angularVelocityData.type) {
                    case 0:
                        if (angularVelocityData.separateAxes) {
                            var conSep: any[] = angularVelocityData.constantSeparate;
                            angularVelocity = GradientAngularVelocity.createByConstantSeparate(conSep ? new Vector3(conSep[0], conSep[1], conSep[2]) : new Vector3(0, 0, Math.PI / 4));
                        } else {
                            angularVelocity = GradientAngularVelocity.createByConstant(angularVelocityData.constant || Math.PI / 4);
                        }
                        break;
                    case 1:
                        if (angularVelocityData.separateAxes) {
                            angularVelocity = GradientAngularVelocity.createByGradientSeparate(_initParticleRotation(angularVelocityData.gradientX), _initParticleRotation(angularVelocityData.gradientY), _initParticleRotation(angularVelocityData.gradientZ));
                        } else {
                            angularVelocity = GradientAngularVelocity.createByGradient(_initParticleRotation(angularVelocityData.gradient));
                        }
                        break;
                    case 2:
                        if (angularVelocityData.separateAxes) {
                            var minSep: any[] = angularVelocityData.constantMinSeparate;//TODO:Y是否要取负数
                            var maxSep: any[] = angularVelocityData.constantMaxSeparate;//TODO:Y是否要取负数
                            angularVelocity = GradientAngularVelocity.createByRandomTwoConstantSeparate(minSep ? new Vector3(minSep[0], minSep[1], minSep[2]) : new Vector3(0, 0, 0), maxSep ? new Vector3(maxSep[0], maxSep[1], maxSep[2]) : new Vector3(0, 0, Math.PI / 4));
                        } else {
                            angularVelocity = GradientAngularVelocity.createByRandomTwoConstant(angularVelocityData.constantMin || 0, angularVelocityData.constantMax || Math.PI / 4);
                        }
                        break;
                    case 3:
                        if (angularVelocityData.separateAxes) {
                            //TODO:待补充
                        } else {
                            angularVelocity = GradientAngularVelocity.createByRandomTwoGradient(_initParticleRotation(angularVelocityData.gradientMin), _initParticleRotation(angularVelocityData.gradientMax));
                        }
                        break;
                }
                var rotationOverLifetime: RotationOverLifetime = new RotationOverLifetime(angularVelocity);
                _parseModule(rotationOverLifetime, rotationOverLifetimeData);
                particleSystem.rotationOverLifetime = rotationOverLifetime;
            }

            //TextureSheetAnimation
            var textureSheetAnimationData: any = data.textureSheetAnimation;
            if (textureSheetAnimationData) {
                var frameData: any = textureSheetAnimationData.frame;
                var frameOverTime: FrameOverTime;
                switch (frameData.type) {
                    case 0:
                        frameOverTime = FrameOverTime.createByConstant(frameData.constant);
                        break;
                    case 1:
                        frameOverTime = FrameOverTime.createByOverTime(_initParticleFrame(frameData.overTime));
                        break;
                    case 2:
                        frameOverTime = FrameOverTime.createByRandomTwoConstant(frameData.constantMin, frameData.constantMax);
                        break;
                    case 3:
                        frameOverTime = FrameOverTime.createByRandomTwoOverTime(_initParticleFrame(frameData.overTimeMin), _initParticleFrame(frameData.overTimeMax));
                        break;
                }
                var startFrameData: any = textureSheetAnimationData.startFrame;
                var startFrame: StartFrame;
                switch (startFrameData.type) {
                    case 0:
                        startFrame = StartFrame.createByConstant(startFrameData.constant);
                        break;
                    case 1:
                        startFrame = StartFrame.createByRandomTwoConstant(startFrameData.constantMin, startFrameData.constantMax);
                        break;
                }
                var textureSheetAnimation: TextureSheetAnimation = new TextureSheetAnimation(frameOverTime, startFrame);
                _parseModule(textureSheetAnimation, textureSheetAnimationData);
                particleSystem.textureSheetAnimation = textureSheetAnimation;
            }
        }
        else {//legacy
            _parseOld.call(this, data);
        }
    };
})();

function _parseOld(this: ShuriKenParticle3D, data: any): void {
    const anglelToRad: number = Math.PI / 180.0;
    var i: number, n: number;

    //Render
    var particleRender: ShurikenParticleRenderer = this.particleRenderer;
    var material: ShurikenParticleMaterial;

    var materialData: any = data.material;
    (materialData) && (material = Loader.getRes(materialData.path));

    particleRender.sharedMaterial = material;
    var meshPath: string = data.meshPath;
    (meshPath) && (particleRender.mesh = Loader.getRes(meshPath));

    particleRender.renderMode = data.renderMode;
    particleRender.stretchedBillboardCameraSpeedScale = data.stretchedBillboardCameraSpeedScale;
    particleRender.stretchedBillboardSpeedScale = data.stretchedBillboardSpeedScale;
    particleRender.stretchedBillboardLengthScale = data.stretchedBillboardLengthScale;
    particleRender.sortingFudge = data.sortingFudge ? data.sortingFudge : 0.0;

    //particleSystem
    var particleSystem: ShurikenParticleSystem = this.particleSystem;
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
    particleSystem.startLifeTimeGradient = _initStartLife(data.startLifetimeGradient);
    particleSystem.startLifetimeConstantMin = data.startLifetimeConstantMin;
    particleSystem.startLifetimeConstantMax = data.startLifetimeConstantMax;
    particleSystem.startLifeTimeGradientMin = _initStartLife(data.startLifetimeGradientMin);
    particleSystem.startLifeTimeGradientMax = _initStartLife(data.startLifetimeGradientMax);

    particleSystem.startSpeedType = data.startSpeedType;
    particleSystem.startSpeedConstant = data.startSpeedConstant;
    particleSystem.startSpeedConstantMin = data.startSpeedConstantMin;
    particleSystem.startSpeedConstantMax = data.startSpeedConstantMax;

    //parse Drag TODO:

    particleSystem.threeDStartSize = data.threeDStartSize;
    particleSystem.startSizeType = data.startSizeType;
    particleSystem.startSizeConstant = data.startSizeConstant;
    var startSizeConstantSeparateArray: any[] = data.startSizeConstantSeparate;
    var startSizeConstantSeparateElement: Vector3 = particleSystem.startSizeConstantSeparate;
    startSizeConstantSeparateElement.x = startSizeConstantSeparateArray[0];
    startSizeConstantSeparateElement.y = startSizeConstantSeparateArray[1];
    startSizeConstantSeparateElement.z = startSizeConstantSeparateArray[2];
    particleSystem.startSizeConstantMin = data.startSizeConstantMin;
    particleSystem.startSizeConstantMax = data.startSizeConstantMax;
    var startSizeConstantMinSeparateArray: any[] = data.startSizeConstantMinSeparate;
    var startSizeConstantMinSeparateElement: Vector3 = particleSystem.startSizeConstantMinSeparate;
    startSizeConstantMinSeparateElement.x = startSizeConstantMinSeparateArray[0];
    startSizeConstantMinSeparateElement.y = startSizeConstantMinSeparateArray[1];
    startSizeConstantMinSeparateElement.z = startSizeConstantMinSeparateArray[2];
    var startSizeConstantMaxSeparateArray: any[] = data.startSizeConstantMaxSeparate;
    var startSizeConstantMaxSeparateElement: Vector3 = particleSystem.startSizeConstantMaxSeparate;
    startSizeConstantMaxSeparateElement.x = startSizeConstantMaxSeparateArray[0];
    startSizeConstantMaxSeparateElement.y = startSizeConstantMaxSeparateArray[1];
    startSizeConstantMaxSeparateElement.z = startSizeConstantMaxSeparateArray[2];

    particleSystem.threeDStartRotation = data.threeDStartRotation;
    particleSystem.startRotationType = data.startRotationType;
    particleSystem.startRotationConstant = data.startRotationConstant * anglelToRad;
    var startRotationConstantSeparateArray: any[] = data.startRotationConstantSeparate;
    var startRotationConstantSeparateElement: Vector3 = particleSystem.startRotationConstantSeparate;
    startRotationConstantSeparateElement.x = startRotationConstantSeparateArray[0] * anglelToRad;
    startRotationConstantSeparateElement.y = startRotationConstantSeparateArray[1] * anglelToRad;
    startRotationConstantSeparateElement.z = startRotationConstantSeparateArray[2] * anglelToRad;
    particleSystem.startRotationConstantMin = data.startRotationConstantMin * anglelToRad;
    particleSystem.startRotationConstantMax = data.startRotationConstantMax * anglelToRad;
    var startRotationConstantMinSeparateArray: any[] = data.startRotationConstantMinSeparate;
    var startRotationConstantMinSeparateElement: Vector3 = particleSystem.startRotationConstantMinSeparate;
    startRotationConstantMinSeparateElement.x = startRotationConstantMinSeparateArray[0] * anglelToRad;
    startRotationConstantMinSeparateElement.y = startRotationConstantMinSeparateArray[1] * anglelToRad;
    startRotationConstantMinSeparateElement.z = startRotationConstantMinSeparateArray[2] * anglelToRad;
    var startRotationConstantMaxSeparateArray: any[] = data.startRotationConstantMaxSeparate;
    var startRotationConstantMaxSeparateElement: Vector3 = particleSystem.startRotationConstantMaxSeparate;
    startRotationConstantMaxSeparateElement.x = startRotationConstantMaxSeparateArray[0] * anglelToRad;
    startRotationConstantMaxSeparateElement.y = startRotationConstantMaxSeparateArray[1] * anglelToRad;
    startRotationConstantMaxSeparateElement.z = startRotationConstantMaxSeparateArray[2] * anglelToRad;

    particleSystem.randomizeRotationDirection = data.randomizeRotationDirection;

    particleSystem.startColorType = data.startColorType;
    var startColorConstantArray: any[] = data.startColorConstant;
    var startColorConstantElement: Vector4 = particleSystem.startColorConstant;
    startColorConstantElement.x = startColorConstantArray[0];
    startColorConstantElement.y = startColorConstantArray[1];
    startColorConstantElement.z = startColorConstantArray[2];
    startColorConstantElement.w = startColorConstantArray[3];
    var startColorConstantMinArray: any[] = data.startColorConstantMin;
    var startColorConstantMinElement: Vector4 = particleSystem.startColorConstantMin;
    startColorConstantMinElement.x = startColorConstantMinArray[0];
    startColorConstantMinElement.y = startColorConstantMinArray[1];
    startColorConstantMinElement.z = startColorConstantMinArray[2];
    startColorConstantMinElement.w = startColorConstantMinArray[3];
    var startColorConstantMaxArray: any[] = data.startColorConstantMax;
    var startColorConstantMaxElement: Vector4 = particleSystem.startColorConstantMax;
    startColorConstantMaxElement.x = startColorConstantMaxArray[0];
    startColorConstantMaxElement.y = startColorConstantMaxArray[1];
    startColorConstantMaxElement.z = startColorConstantMaxArray[2];
    startColorConstantMaxElement.w = startColorConstantMaxArray[3];

    particleSystem.gravityModifier = data.gravityModifier;

    particleSystem.simulationSpace = data.simulationSpace;
    (data.simulationSpeed !== undefined) && (particleSystem.simulationSpeed = data.simulationSpeed);

    particleSystem.scaleMode = data.scaleMode;

    particleSystem.playOnAwake = data.playOnAwake;
    particleSystem.maxParticles = data.maxParticles;

    var autoRandomSeed: any = data.autoRandomSeed;
    (autoRandomSeed != null) && (particleSystem.autoRandomSeed = autoRandomSeed);
    var randomSeed: any = data.randomSeed;
    (randomSeed != null) && (particleSystem.randomSeed[0] = randomSeed);

    //Emission
    var emissionData: any = data.emission;
    var emission: Emission = particleSystem.emission;
    if (emissionData) {
        emission.emissionRate = emissionData.emissionRate;
        var burstsData: any[] = emissionData.bursts;
        if (burstsData)
            for (i = 0, n = burstsData.length; i < n; i++) {
                var brust: any = burstsData[i];
                emission.addBurst(new Burst(brust.time, brust.min, brust.max));
            }
        emission.enable = emissionData.enable;
    } else {
        emission.enable = false;
    }

    //Shape
    var shapeData: any = data.shape;
    if (shapeData) {
        var shape: BaseShape;
        switch (shapeData.shapeType) {
            case 0:
                var sphereShape: SphereShape;
                shape = sphereShape = new SphereShape();
                sphereShape.radius = shapeData.sphereRadius;
                sphereShape.emitFromShell = shapeData.sphereEmitFromShell;
                sphereShape.randomDirection = shapeData.sphereRandomDirection;
                break;
            case 1:
                var hemiSphereShape: HemisphereShape;
                shape = hemiSphereShape = new HemisphereShape();
                hemiSphereShape.radius = shapeData.hemiSphereRadius;
                hemiSphereShape.emitFromShell = shapeData.hemiSphereEmitFromShell;
                hemiSphereShape.randomDirection = shapeData.hemiSphereRandomDirection;
                break;
            case 2:
                var coneShape: ConeShape;
                shape = coneShape = new ConeShape();
                coneShape.angle = shapeData.coneAngle * anglelToRad;
                coneShape.radius = shapeData.coneRadius;
                coneShape.length = shapeData.coneLength;
                coneShape.emitType = shapeData.coneEmitType;
                coneShape.randomDirection = shapeData.coneRandomDirection;
                break;
            case 3:
                var boxShape: BoxShape;
                shape = boxShape = new BoxShape();
                boxShape.x = shapeData.boxX;
                boxShape.y = shapeData.boxY;
                boxShape.z = shapeData.boxZ;
                boxShape.randomDirection = shapeData.boxRandomDirection;
                break;
            case 7:
                var circleShape: CircleShape;
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
                var tempShape: CircleShape;
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
    var velocityOverLifetimeData: any = data.velocityOverLifetime;
    if (velocityOverLifetimeData) {
        var velocityData: any = velocityOverLifetimeData.velocity;
        var velocity: GradientVelocity;
        switch (velocityData.type) {
            case 0:
                var constantData: any[] = velocityData.constant;
                velocity = GradientVelocity.createByConstant(new Vector3(constantData[0], constantData[1], constantData[2]));
                break;
            case 1:
                velocity = GradientVelocity.createByGradient(_initParticleVelocity(velocityData.gradientX), _initParticleVelocity(velocityData.gradientY), _initParticleVelocity(velocityData.gradientZ));
                break;
            case 2:
                var constantMinData: any[] = velocityData.constantMin;
                var constantMaxData: any[] = velocityData.constantMax;
                velocity = GradientVelocity.createByRandomTwoConstant(new Vector3(constantMinData[0], constantMinData[1], constantMinData[2]), new Vector3(constantMaxData[0], constantMaxData[1], constantMaxData[2]));
                break;
            case 3:
                velocity = GradientVelocity.createByRandomTwoGradient(_initParticleVelocity(velocityData.gradientXMin), _initParticleVelocity(velocityData.gradientXMax), _initParticleVelocity(velocityData.gradientYMin), _initParticleVelocity(velocityData.gradientYMax), _initParticleVelocity(velocityData.gradientZMin), _initParticleVelocity(velocityData.gradientZMax));
                break;
        }
        var velocityOverLifetime: VelocityOverLifetime = new VelocityOverLifetime(velocity);
        velocityOverLifetime.space = velocityOverLifetimeData.space;
        velocityOverLifetime.enable = velocityOverLifetimeData.enable;
        particleSystem.velocityOverLifetime = velocityOverLifetime;
    }

    //ColorOverLifetime
    var colorOverLifetimeData: any = data.colorOverLifetime;
    if (colorOverLifetimeData) {
        var colorData: any = colorOverLifetimeData.color;
        var color: GradientColor;
        switch (colorData.type) {
            case 0:
                var constColorData: any[] = colorData.constant;
                color = GradientColor.createByConstant(new Vector4(constColorData[0], constColorData[1], constColorData[2], constColorData[3]));
                break;
            case 1:
                color = GradientColor.createByGradient(_initParticleColor(colorData.gradient));
                break;
            case 2:
                var minConstColorData: any[] = colorData.constantMin;
                var maxConstColorData: any[] = colorData.constantMax;
                color = GradientColor.createByRandomTwoConstant(new Vector4(minConstColorData[0], minConstColorData[1], minConstColorData[2], minConstColorData[3]), new Vector4(maxConstColorData[0], maxConstColorData[1], maxConstColorData[2], maxConstColorData[3]));
                break;
            case 3:
                color = GradientColor.createByRandomTwoGradient(_initParticleColor(colorData.gradientMin), _initParticleColor(colorData.gradientMax));
                break;
        }
        var colorOverLifetime: ColorOverLifetime = new ColorOverLifetime(color);
        colorOverLifetime.enable = colorOverLifetimeData.enable;
        particleSystem.colorOverLifetime = colorOverLifetime;
    }

    //SizeOverLifetime
    var sizeOverLifetimeData: any = data.sizeOverLifetime;
    if (sizeOverLifetimeData) {
        var sizeData: any = sizeOverLifetimeData.size;
        var size: GradientSize;
        switch (sizeData.type) {
            case 0:
                if (sizeData.separateAxes) {
                    size = GradientSize.createByGradientSeparate(_initParticleSize(sizeData.gradientX), _initParticleSize(sizeData.gradientY), _initParticleSize(sizeData.gradientZ));
                } else {
                    size = GradientSize.createByGradient(_initParticleSize(sizeData.gradient));
                }
                break;
            case 1:
                if (sizeData.separateAxes) {
                    var constantMinSeparateData: any[] = sizeData.constantMinSeparate;
                    var constantMaxSeparateData: any[] = sizeData.constantMaxSeparate;
                    size = GradientSize.createByRandomTwoConstantSeparate(new Vector3(constantMinSeparateData[0], constantMinSeparateData[1], constantMinSeparateData[2]), new Vector3(constantMaxSeparateData[0], constantMaxSeparateData[1], constantMaxSeparateData[2]));
                } else {
                    size = GradientSize.createByRandomTwoConstant(sizeData.constantMin, sizeData.constantMax);
                }
                break;
            case 2:
                if (sizeData.separateAxes) {
                    size = GradientSize.createByRandomTwoGradientSeparate(_initParticleSize(sizeData.gradientXMin), _initParticleSize(sizeData.gradientYMin), _initParticleSize(sizeData.gradientZMin), _initParticleSize(sizeData.gradientXMax), _initParticleSize(sizeData.gradientYMax), _initParticleSize(sizeData.gradientZMax));
                } else {
                    size = GradientSize.createByRandomTwoGradient(_initParticleSize(sizeData.gradientMin), _initParticleSize(sizeData.gradientMax));
                }
                break;
        }
        var sizeOverLifetime: SizeOverLifetime = new SizeOverLifetime(size);
        sizeOverLifetime.enable = sizeOverLifetimeData.enable;
        particleSystem.sizeOverLifetime = sizeOverLifetime;
    }

    //RotationOverLifetime
    var rotationOverLifetimeData: any = data.rotationOverLifetime;
    if (rotationOverLifetimeData) {
        var angularVelocityData: any = rotationOverLifetimeData.angularVelocity;
        var angularVelocity: GradientAngularVelocity;
        switch (angularVelocityData.type) {
            case 0:
                if (angularVelocityData.separateAxes) {
                    var conSep: any[] = angularVelocityData.constantSeparate;
                    angularVelocity = GradientAngularVelocity.createByConstantSeparate(new Vector3(conSep[0] * anglelToRad, conSep[1] * anglelToRad, conSep[2] * anglelToRad));
                } else {
                    angularVelocity = GradientAngularVelocity.createByConstant(angularVelocityData.constant * anglelToRad);
                }
                break;
            case 1:
                if (angularVelocityData.separateAxes) {
                    angularVelocity = GradientAngularVelocity.createByGradientSeparate(_initParticleRotation(angularVelocityData.gradientX), _initParticleRotation(angularVelocityData.gradientY), _initParticleRotation(angularVelocityData.gradientZ));
                } else {
                    angularVelocity = GradientAngularVelocity.createByGradient(_initParticleRotation(angularVelocityData.gradient));
                }
                break;
            case 2:
                if (angularVelocityData.separateAxes) {
                    var minSep: any[] = angularVelocityData.constantMinSeparate;//TODO:Y是否要取负数
                    var maxSep: any[] = angularVelocityData.constantMaxSeparate;//TODO:Y是否要取负数
                    angularVelocity = GradientAngularVelocity.createByRandomTwoConstantSeparate(new Vector3(minSep[0] * anglelToRad, minSep[1] * anglelToRad, minSep[2] * anglelToRad), new Vector3(maxSep[0] * anglelToRad, maxSep[1] * anglelToRad, maxSep[2] * anglelToRad));
                } else {
                    angularVelocity = GradientAngularVelocity.createByRandomTwoConstant(angularVelocityData.constantMin * anglelToRad, angularVelocityData.constantMax * anglelToRad);
                }
                break;
            case 3:
                if (angularVelocityData.separateAxes) {
                    //TODO:待补充
                } else {
                    angularVelocity = GradientAngularVelocity.createByRandomTwoGradient(_initParticleRotation(angularVelocityData.gradientMin), _initParticleRotation(angularVelocityData.gradientMax));
                }
                break;
        }
        var rotationOverLifetime: RotationOverLifetime = new RotationOverLifetime(angularVelocity);
        rotationOverLifetime.enable = rotationOverLifetimeData.enable;
        particleSystem.rotationOverLifetime = rotationOverLifetime;
    }

    //TextureSheetAnimation
    var textureSheetAnimationData: any = data.textureSheetAnimation;
    if (textureSheetAnimationData) {
        var frameData: any = textureSheetAnimationData.frame;
        var frameOverTime: FrameOverTime;
        switch (frameData.type) {
            case 0:
                frameOverTime = FrameOverTime.createByConstant(frameData.constant);
                break;
            case 1:
                frameOverTime = FrameOverTime.createByOverTime(_initParticleFrame(frameData.overTime));
                break;
            case 2:
                frameOverTime = FrameOverTime.createByRandomTwoConstant(frameData.constantMin, frameData.constantMax);
                break;
            case 3:
                frameOverTime = FrameOverTime.createByRandomTwoOverTime(_initParticleFrame(frameData.overTimeMin), _initParticleFrame(frameData.overTimeMax));
                break;
        }
        var startFrameData: any = textureSheetAnimationData.startFrame;
        var startFrame: StartFrame;
        switch (startFrameData.type) {
            case 0:
                startFrame = StartFrame.createByConstant(startFrameData.constant);
                break;
            case 1:
                startFrame = StartFrame.createByRandomTwoConstant(startFrameData.constantMin, startFrameData.constantMax);
                break;
        }
        var textureSheetAnimation: TextureSheetAnimation = new TextureSheetAnimation(frameOverTime, startFrame);
        textureSheetAnimation.enable = textureSheetAnimationData.enable;
        var tilesData: any[] = textureSheetAnimationData.tiles;
        textureSheetAnimation.tiles = new Vector2(tilesData[0], tilesData[1]);
        textureSheetAnimation.type = textureSheetAnimationData.type;
        textureSheetAnimation.randomRow = textureSheetAnimationData.randomRow;
        var rowIndex: any = textureSheetAnimationData.rowIndex;
        (rowIndex !== undefined) && (textureSheetAnimation.rowIndex = rowIndex);
        textureSheetAnimation.cycles = textureSheetAnimationData.cycles;
        particleSystem.textureSheetAnimation = textureSheetAnimation;
    }
}

function _initParticleColor(gradientColorData: any, maxkeyCount: number = 4): Gradient {
    var gradientColor: Gradient = new Gradient();
    if (!gradientColorData) {
        gradientColor.addColorAlpha(0, 1);
        gradientColor.addColorAlpha(1, 1);
        gradientColor.addColorRGB(0, new Color(1.0, 1.0, 1.0, 1.0));
        gradientColor.addColorRGB(1, new Color(1.0, 1.0, 1.0, 1.0));
    }
    else {
        var alphasData: any[] = gradientColorData.alphas;
        var i: number, n: number;
        if (!alphasData) {//兼容默认值
            gradientColor.addColorAlpha(0, 1);
            gradientColor.addColorAlpha(1, 1);
        }
        else {
            for (i = 0, n = alphasData.length; i < n; i++) {
                if (i == maxkeyCount - 1 && n > maxkeyCount) {
                    i = n - 1;
                    console.warn(`GradientDataColor warning:alpha data length is large than ${maxkeyCount}, will ignore the middle data.`);
                }
                var alphaData: any = alphasData[i];
                gradientColor.addColorAlpha(alphaData.key, alphaData.value);
            }
        }

        var rgbsData: any[] = gradientColorData.rgbs;
        if (!rgbsData) {//兼容默认值
            gradientColor.addColorRGB(0, new Color(1.0, 1.0, 1.0, 1.0));
            gradientColor.addColorRGB(1, new Color(1.0, 1.0, 1.0, 1.0));
        }
        else {
            for (i = 0, n = rgbsData.length; i < n; i++) {
                if (i == maxkeyCount - 1 && n > maxkeyCount) {
                    i = n - 1;
                    console.warn(`GradientDataColor warning:rgb data length is large than ${maxkeyCount}, will ignore the middle data.`);
                }
                var rgbData: any = rgbsData[i];
                var rgbValue: any[] = rgbData.value;
                gradientColor.addColorRGB(rgbData.key, new Color(rgbValue[0], rgbValue[1], rgbValue[2], 1.0));
            }
        }
    }
    return gradientColor;
}

function _initParticleFrame(overTimeFramesData: any): GradientDataInt {
    var overTimeFrame: GradientDataInt = new GradientDataInt();
    if (overTimeFramesData) {
        var framesData: any[] = overTimeFramesData.frames;
        for (var i: number = 0, n: number = framesData.length; i < n; i++) {
            var frameData: any = framesData[i];
            overTimeFrame.add(frameData.key, frameData.value);
        }
    }
    else {
        overTimeFrame.add(0, 0);
        overTimeFrame.add(1, 1);
    }

    return overTimeFrame;
}

function _initStartLife(gradientData: any): GradientDataNumber {
    var gradient: GradientDataNumber = new GradientDataNumber();
    var startLifetimesData: any[] = gradientData.startLifetimes;
    for (var i: number = 0, n: number = startLifetimesData.length; i < n; i++) {
        var valueData: any = startLifetimesData[i];
        gradient.add(valueData.key, valueData.value);
    }
    return gradient
}

function _initParticleVelocity(gradientData: any): GradientDataNumber {
    var gradient: GradientDataNumber = new GradientDataNumber();
    var velocitysData: any[] = gradientData.velocitys;
    for (var i: number = 0, n: number = velocitysData.length; i < n; i++) {
        var valueData: any = velocitysData[i];
        gradient.add(valueData.key, valueData.value);
    }
    return gradient;
}

function _initParticleSize(gradientSizeData: any): GradientDataNumber {
    var gradientSize: GradientDataNumber = new GradientDataNumber();
    if (gradientSizeData) {
        var sizesData: any[] = gradientSizeData.sizes;
        for (var i: number = 0, n: number = sizesData.length; i < n; i++) {
            var valueData: any = sizesData[i];
            gradientSize.add(valueData.key, valueData.value);
        }
    }
    else {
        gradientSize.add(0, 0);
        gradientSize.add(1, 1);
    }
    return gradientSize;
}

function _initParticleRotation(gradientData: any): GradientDataNumber {
    var gradient: GradientDataNumber = new GradientDataNumber();
    var angularVelocitysData: any[] = gradientData.angularVelocitys;
    for (var i: number = 0, n: number = angularVelocitysData.length; i < n; i++) {
        var valueData: any = angularVelocitysData[i];
        gradient.add(valueData.key, valueData.value / 180.0 * Math.PI);
    }
    return gradient;
}


function _parseModule(module: any, moduleData: any): void {
    for (var t in moduleData) {
        switch (t) {
            case "bases":
                var bases = moduleData.bases;
                for (var k in bases)
                    module[k] = bases[k];
                break;
            case "vector2s":
                var vector2s = moduleData.vector2s;
                for (var k in vector2s) {
                    var vec2: Vector2 = module[k];
                    var vec2Data: number[] = vector2s[k];
                    vec2.setValue(vec2Data[0], vec2Data[1]);
                    module[k] = vec2;
                }
                break;
            case "vector3s":
                var vector3s = moduleData.vector3s;
                for (var k in vector3s) {
                    var vec3: Vector3 = module[k];
                    var vec3Data: number[] = vector3s[k];
                    vec3.setValue(vec3Data[0], vec3Data[1], vec3Data[2]);
                    module[k] = vec3;
                }
                break;
            case "vector4s":
                var vector4s = moduleData.vector4s;
                for (var k in vector4s) {
                    var vec4: Vector4 = module[k];
                    var vec4Data: number[] = vector4s[k];
                    vec4.setValue(vec4Data[0], vec4Data[1], vec4Data[2], vec4Data[3]);
                    module[k] = vec4;
                }
                break;
            case "gradientDataNumbers":
                var gradientDataNumbers: object = moduleData.gradientDataNumbers;
                for (var k in gradientDataNumbers) {
                    var gradientNumber: GradientDataNumber = module[k];
                    var gradientNumberData: any[] = moduleData[k];
                    for (var i: number = 0, n: number = gradientNumberData.length; i < n; i++) {
                        var valueData: any = gradientNumberData[i];
                        gradientNumber.add(valueData.key, valueData.value);
                    }
                    module[k] = gradientNumber;
                }
                break;
            case "resources":
                var resources: any = moduleData.resources;
                for (var k in resources) {
                    let res = Loader.getRes(resources[k]);
                    if (res && (res instanceof Texture)) {
                        res = res.bitmap;
                    }
                    module[k] = res;
                }
                break;
            case "bursts":
                var burstsData: any[] = moduleData.bursts;
                for (var i: number = 0, n: number = burstsData.length; i < n; i++) {
                    var brust: any = burstsData[i];
                    module.addBurst(new Burst(brust.time, brust.min, brust.max));
                }
                break;
            case "randomSeed":
                module.randomSeed[0] = moduleData.randomSeed;
                break;
            case "shapeType"://TODO:remove in the fulther
            case "type":
            case "color":
            case "size":
            case "frame":
            case "startFrame":
            case "angularVelocity":
            case "velocity":
                break;
            default:
                throw "ShurikenParticle3D:unknown type.";
        }
    }
}
