import { MathUtil } from "../../../maths/MathUtil";
import { Rand } from "../../math/Rand";
import { Vector2 } from "../../math/Vector2";
import { Vector3 } from "../../math/Vector3";
import { Vector4 } from "../../math/Vector4";
import { ColorOverLifetime } from "./module/ColorOverLifetime";
import { FrameOverTime } from "./module/FrameOverTime";
import { GradientColor } from "./module/GradientColor";
import { GradientDataNumber } from "./module/GradientDataNumber";
import { GradientSize } from "./module/GradientSize";
import { SizeOverLifetime } from "./module/SizeOverLifetime";
import { StartFrame } from "./module/StartFrame";
import { TextureSheetAnimation } from "./module/TextureSheetAnimation";
import { ShurikenParticleRenderer } from "./ShurikenParticleRenderer";
import { ShurikenParticleSystem } from "./ShurikenParticleSystem";

/**
 *  @internal
 */
export class ShurikenParticleData {
	/**@internal */
	private static _tempVector30: Vector3 = new Vector3();

	static startLifeTime: number;
	static startColor: Vector4 = new Vector4();
	static startSize: Float32Array = new Float32Array(3);
	static startRotation: Float32Array = new Float32Array(3);
	static startUVInfo: Float32Array = new Float32Array(4);

	constructor() {
	}

	/**
	 * @internal
	 */
	private static _getStartLifetimeFromGradient(startLifeTimeGradient: GradientDataNumber, emissionTime: number): number {
		for (var i: number = 1, n: number = startLifeTimeGradient.gradientCount; i < n; i++) {
			var key: number = startLifeTimeGradient.getKeyByIndex(i);
			if (key >= emissionTime) {
				var lastKey: number = startLifeTimeGradient.getKeyByIndex(i - 1);
				var age: number = (emissionTime - lastKey) / (key - lastKey);
				return MathUtil.lerp(startLifeTimeGradient.getValueByIndex(i - 1), startLifeTimeGradient.getValueByIndex(i), age)
			}
		}
		throw new Error("ShurikenParticleData: can't get value foam startLifeTimeGradient.");
	}

	/**
	 * @internal
	 */
	private static _randomInvertRoationArray(rotatonE: Vector3, outE: Vector3, randomizeRotationDirection: number, rand: Rand, randomSeeds: Uint32Array): void {
		var randDic: number;
		if (rand) {
			rand.seed = randomSeeds[6];
			randDic = rand.getFloat();
			randomSeeds[6] = rand.seed;
		} else {
			randDic = Math.random();
		}
		if (randDic < randomizeRotationDirection) {
			outE.x = -rotatonE.x;
			outE.y = -rotatonE.y;
			outE.z = -rotatonE.z;
		} else {
			outE.x = rotatonE.x;
			outE.y = rotatonE.y;
			outE.z = rotatonE.z;
		}
	}

	/**
	 * @internal
	 */
	private static _randomInvertRoation(rotaton: number, randomizeRotationDirection: number, rand: Rand, randomSeeds: Uint32Array): number {
		var randDic: number;
		if (rand) {
			rand.seed = randomSeeds[6];
			randDic = rand.getFloat();
			randomSeeds[6] = rand.seed;
		} else {
			randDic = Math.random();
		}
		if (randDic < randomizeRotationDirection)
			rotaton = -rotaton;
		return rotaton;
	}

	/**
	 * @internal
	 */
	static create(particleSystem: ShurikenParticleSystem, particleRender: ShurikenParticleRenderer): void {
		var autoRandomSeed: boolean = particleSystem.autoRandomSeed;
		var rand: Rand = particleSystem._rand;
		var randomSeeds: Uint32Array = particleSystem._randomSeeds;

		//StartColor
		switch (particleSystem.startColorType) {
			case 0:
				var constantStartColor: Vector4 = particleSystem.startColorConstant;
				ShurikenParticleData.startColor.x = constantStartColor.x;
				ShurikenParticleData.startColor.y = constantStartColor.y;
				ShurikenParticleData.startColor.z = constantStartColor.z;
				ShurikenParticleData.startColor.w = constantStartColor.w;
				break;
			case 2:
				if (autoRandomSeed) {
					Vector4.lerp(particleSystem.startColorConstantMin, particleSystem.startColorConstantMax, Math.random(), ShurikenParticleData.startColor);
				} else {
					rand.seed = randomSeeds[3];
					Vector4.lerp(particleSystem.startColorConstantMin, particleSystem.startColorConstantMax, rand.getFloat(), ShurikenParticleData.startColor);
					randomSeeds[3] = rand.seed;
				}
				break;
		}
		var colorOverLifetime: ColorOverLifetime = particleSystem.colorOverLifetime;
		if (colorOverLifetime && colorOverLifetime.enable) {
			var color: GradientColor = colorOverLifetime.color;
			switch (color.type) {
				case 0:
					ShurikenParticleData.startColor.x = ShurikenParticleData.startColor.x * color.constant.x;
					ShurikenParticleData.startColor.y = ShurikenParticleData.startColor.y * color.constant.y;
					ShurikenParticleData.startColor.z = ShurikenParticleData.startColor.z * color.constant.z;
					ShurikenParticleData.startColor.w = ShurikenParticleData.startColor.w * color.constant.w;
					break;
				case 2:
					var colorRandom: number;
					if (autoRandomSeed) {
						colorRandom = Math.random();
					} else {
						rand.seed = randomSeeds[10];
						colorRandom = rand.getFloat();
						randomSeeds[10] = rand.seed;
					}
					var minConstantColor: Vector4 = color.constantMin;
					var maxConstantColor: Vector4 = color.constantMax;
					ShurikenParticleData.startColor.x = ShurikenParticleData.startColor.x * MathUtil.lerp(minConstantColor.x, maxConstantColor.x, colorRandom);
					ShurikenParticleData.startColor.y = ShurikenParticleData.startColor.y * MathUtil.lerp(minConstantColor.y, maxConstantColor.y, colorRandom);
					ShurikenParticleData.startColor.z = ShurikenParticleData.startColor.z * MathUtil.lerp(minConstantColor.z, maxConstantColor.z, colorRandom);
					ShurikenParticleData.startColor.w = ShurikenParticleData.startColor.w * MathUtil.lerp(minConstantColor.w, maxConstantColor.w, colorRandom);
					break;
			}
		}

		//StartSize
		var particleSize: Float32Array = ShurikenParticleData.startSize;
		switch (particleSystem.startSizeType) {
			case 0:
				if (particleSystem.threeDStartSize) {
					var startSizeConstantSeparate: Vector3 = particleSystem.startSizeConstantSeparate;
					particleSize[0] = startSizeConstantSeparate.x;
					particleSize[1] = startSizeConstantSeparate.y;
					particleSize[2] = startSizeConstantSeparate.z;
				} else {
					particleSize[0] = particleSize[1] = particleSize[2] = particleSystem.startSizeConstant;
				}
				break;
			case 2:
				if (particleSystem.threeDStartSize) {
					var startSizeConstantMinSeparate: Vector3 = particleSystem.startSizeConstantMinSeparate;
					var startSizeConstantMaxSeparate: Vector3 = particleSystem.startSizeConstantMaxSeparate;
					if (autoRandomSeed) {
						particleSize[0] = MathUtil.lerp(startSizeConstantMinSeparate.x, startSizeConstantMaxSeparate.x, Math.random());
						particleSize[1] = MathUtil.lerp(startSizeConstantMinSeparate.y, startSizeConstantMaxSeparate.y, Math.random());
						particleSize[2] = MathUtil.lerp(startSizeConstantMinSeparate.z, startSizeConstantMaxSeparate.z, Math.random());
					} else {
						rand.seed = randomSeeds[4];
						particleSize[0] = MathUtil.lerp(startSizeConstantMinSeparate.x, startSizeConstantMaxSeparate.x, rand.getFloat());
						particleSize[1] = MathUtil.lerp(startSizeConstantMinSeparate.y, startSizeConstantMaxSeparate.y, rand.getFloat());
						particleSize[2] = MathUtil.lerp(startSizeConstantMinSeparate.z, startSizeConstantMaxSeparate.z, rand.getFloat());
						randomSeeds[4] = rand.seed;
					}
				} else {
					if (autoRandomSeed) {
						particleSize[0] = particleSize[1] = particleSize[2] = MathUtil.lerp(particleSystem.startSizeConstantMin, particleSystem.startSizeConstantMax, Math.random());
					} else {
						rand.seed = randomSeeds[4];
						particleSize[0] = particleSize[1] = particleSize[2] = MathUtil.lerp(particleSystem.startSizeConstantMin, particleSystem.startSizeConstantMax, rand.getFloat());
						randomSeeds[4] = rand.seed;
					}
				}
				break;
		}

		var sizeOverLifetime: SizeOverLifetime = particleSystem.sizeOverLifetime;
		if (sizeOverLifetime && sizeOverLifetime.enable && sizeOverLifetime.size.type === 1) {
			var size: GradientSize = sizeOverLifetime.size;
			if (size.separateAxes) {
				if (autoRandomSeed) {
					particleSize[0] = particleSize[0] * MathUtil.lerp(size.constantMinSeparate.x, size.constantMaxSeparate.x, Math.random());
					particleSize[1] = particleSize[1] * MathUtil.lerp(size.constantMinSeparate.y, size.constantMaxSeparate.y, Math.random());
					particleSize[2] = particleSize[2] * MathUtil.lerp(size.constantMinSeparate.z, size.constantMaxSeparate.z, Math.random());
				} else {
					rand.seed = randomSeeds[11];
					particleSize[0] = particleSize[0] * MathUtil.lerp(size.constantMinSeparate.x, size.constantMaxSeparate.x, rand.getFloat());
					particleSize[1] = particleSize[1] * MathUtil.lerp(size.constantMinSeparate.y, size.constantMaxSeparate.y, rand.getFloat());
					particleSize[2] = particleSize[2] * MathUtil.lerp(size.constantMinSeparate.z, size.constantMaxSeparate.z, rand.getFloat());
					randomSeeds[11] = rand.seed;
				}
			} else {
				var randomSize: number;
				if (autoRandomSeed) {
					randomSize = MathUtil.lerp(size.constantMin, size.constantMax, Math.random());
				} else {
					rand.seed = randomSeeds[11];
					randomSize = MathUtil.lerp(size.constantMin, size.constantMax, rand.getFloat());
					randomSeeds[11] = rand.seed;
				}
				particleSize[0] = particleSize[0] * randomSize;
				particleSize[1] = particleSize[1] * randomSize;
				particleSize[2] = particleSize[2] * randomSize;
			}
		}

		//StartRotation//TODO:renderMode2、3模式都不需要旋转，是否移除。
		var renderMode: number = particleRender.renderMode;
		if (renderMode !== 1) {
			switch (particleSystem.startRotationType) {
				case 0:
					if (particleSystem.threeDStartRotation) {
						var startRotationConstantSeparate: Vector3 = particleSystem.startRotationConstantSeparate;
						var randomRotationE: Vector3 = ShurikenParticleData._tempVector30;
						ShurikenParticleData._randomInvertRoationArray(startRotationConstantSeparate, randomRotationE, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
						ShurikenParticleData.startRotation[0] = randomRotationE.x;
						ShurikenParticleData.startRotation[1] = randomRotationE.y;
						if (renderMode !== 4)
							ShurikenParticleData.startRotation[2] = -randomRotationE.z;
						else
							ShurikenParticleData.startRotation[2] = randomRotationE.z;
					} else {
						ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(particleSystem.startRotationConstant, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
						ShurikenParticleData.startRotation[1] = 0;
						ShurikenParticleData.startRotation[2] = 0;//需要置0,否则上次缓存影响数据。TODO:mesh模式下使用Z,但是这里为什么是X
					}
					break;
				case 2:
					if (particleSystem.threeDStartRotation) {
						var startRotationConstantMinSeparate: Vector3 = particleSystem.startRotationConstantMinSeparate;
						var startRotationConstantMaxSeparate: Vector3 = particleSystem.startRotationConstantMaxSeparate;
						var lerpRoationE: Vector3 = ShurikenParticleData._tempVector30;
						if (autoRandomSeed) {
							lerpRoationE.x = MathUtil.lerp(startRotationConstantMinSeparate.x, startRotationConstantMaxSeparate.x, Math.random());
							lerpRoationE.y = MathUtil.lerp(startRotationConstantMinSeparate.y, startRotationConstantMaxSeparate.y, Math.random());
							lerpRoationE.z = MathUtil.lerp(startRotationConstantMinSeparate.z, startRotationConstantMaxSeparate.z, Math.random());
						} else {
							rand.seed = randomSeeds[5];
							lerpRoationE.x = MathUtil.lerp(startRotationConstantMinSeparate.x, startRotationConstantMaxSeparate.x, rand.getFloat());
							lerpRoationE.y = MathUtil.lerp(startRotationConstantMinSeparate.y, startRotationConstantMaxSeparate.y, rand.getFloat());
							lerpRoationE.z = MathUtil.lerp(startRotationConstantMinSeparate.z, startRotationConstantMaxSeparate.z, rand.getFloat());
							randomSeeds[5] = rand.seed;
						}
						ShurikenParticleData._randomInvertRoationArray(lerpRoationE, lerpRoationE, particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
						ShurikenParticleData.startRotation[0] = lerpRoationE.x;
						ShurikenParticleData.startRotation[1] = lerpRoationE.y;
						if (renderMode !== 4)
							ShurikenParticleData.startRotation[2] = -lerpRoationE.z;
						else
							ShurikenParticleData.startRotation[2] = lerpRoationE.z;
					} else {
						if (autoRandomSeed) {
							ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(MathUtil.lerp(particleSystem.startRotationConstantMin, particleSystem.startRotationConstantMax, Math.random()), particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
						} else {
							rand.seed = randomSeeds[5];
							ShurikenParticleData.startRotation[0] = ShurikenParticleData._randomInvertRoation(MathUtil.lerp(particleSystem.startRotationConstantMin, particleSystem.startRotationConstantMax, rand.getFloat()), particleSystem.randomizeRotationDirection, autoRandomSeed ? null : rand, randomSeeds);
							randomSeeds[5] = rand.seed;
						}
					}
					break;
			}
		}

		//StartLifetime
		switch (particleSystem.startLifetimeType) {
			case 0:
				ShurikenParticleData.startLifeTime = particleSystem.startLifetimeConstant;
				break;
			case 1:
				ShurikenParticleData.startLifeTime = ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradient, particleSystem.emissionTime);
				break;
			case 2:
				if (autoRandomSeed) {
					ShurikenParticleData.startLifeTime = MathUtil.lerp(particleSystem.startLifetimeConstantMin, particleSystem.startLifetimeConstantMax, Math.random());
				} else {
					rand.seed = randomSeeds[7];
					ShurikenParticleData.startLifeTime = MathUtil.lerp(particleSystem.startLifetimeConstantMin, particleSystem.startLifetimeConstantMax, rand.getFloat());
					randomSeeds[7] = rand.seed;
				}
				break;
			case 3:
				var emissionTime: number = particleSystem.emissionTime;
				if (autoRandomSeed) {
					ShurikenParticleData.startLifeTime = MathUtil.lerp(ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMin, emissionTime), ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMax, emissionTime), Math.random());
				} else {
					rand.seed = randomSeeds[7];
					ShurikenParticleData.startLifeTime = MathUtil.lerp(ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMin, emissionTime), ShurikenParticleData._getStartLifetimeFromGradient(particleSystem.startLifeTimeGradientMax, emissionTime), rand.getFloat());
					randomSeeds[7] = rand.seed;
				}
				break;
		}


		//StartUV
		var textureSheetAnimation: TextureSheetAnimation = particleSystem.textureSheetAnimation;
		var enableSheetAnimation: boolean = textureSheetAnimation && textureSheetAnimation.enable;
		if (enableSheetAnimation) {
			var title: Vector2 = textureSheetAnimation.tiles;
			var titleX: number = title.x, titleY: number = title.y;
			var subU: number = 1.0 / titleX, subV: number = 1.0 / titleY;

			var startFrameCount: number;
			var startFrame: StartFrame = textureSheetAnimation.startFrame;
			switch (startFrame.type) {
				case 0://常量模式
					startFrameCount = startFrame.constant;
					break;
				case 1://随机双常量模式
					if (autoRandomSeed) {
						startFrameCount = MathUtil.lerp(startFrame.constantMin, startFrame.constantMax, Math.random());
					} else {
						rand.seed = randomSeeds[14];
						startFrameCount = MathUtil.lerp(startFrame.constantMin, startFrame.constantMax, rand.getFloat());
						randomSeeds[14] = rand.seed;
					}
					break;
			}

			var frame: FrameOverTime = textureSheetAnimation.frame;
			var cycles: number = textureSheetAnimation.cycles;
			switch (frame.type) {
				case 0:
					startFrameCount += frame.constant * cycles;
					break;
				case 2:
					if (autoRandomSeed) {
						startFrameCount += MathUtil.lerp(frame.constantMin, frame.constantMax, Math.random()) * cycles;
					} else {
						rand.seed = randomSeeds[15];
						startFrameCount += MathUtil.lerp(frame.constantMin, frame.constantMax, rand.getFloat()) * cycles;
						randomSeeds[15] = rand.seed;
					}
					break;
			}

			var startRow: number = 0;//TODO:case 2 没处理
			switch (textureSheetAnimation.type) {
				case 0://Whole Sheet
					startRow = Math.floor(startFrameCount / titleX);
					break;
				case 1://Singal Row
					if (textureSheetAnimation.randomRow) {
						if (autoRandomSeed) {
							startRow = Math.floor(Math.random() * titleY);

						} else {
							rand.seed = randomSeeds[13];
							startRow = Math.floor(rand.getFloat() * titleY);
							randomSeeds[13] = rand.seed;
						}
					} else {
						startRow = textureSheetAnimation.rowIndex;
					}
					break;
			}

			var startCol: number = Math.floor(startFrameCount % titleX);
			ShurikenParticleData.startUVInfo = ShurikenParticleData.startUVInfo;
			ShurikenParticleData.startUVInfo[0] = subU;
			ShurikenParticleData.startUVInfo[1] = subV;
			ShurikenParticleData.startUVInfo[2] = startCol * subU;
			ShurikenParticleData.startUVInfo[3] = startRow * subV;
		} else {
			ShurikenParticleData.startUVInfo = ShurikenParticleData.startUVInfo;
			ShurikenParticleData.startUVInfo[0] = 1.0;
			ShurikenParticleData.startUVInfo[1] = 1.0;
			ShurikenParticleData.startUVInfo[2] = 0.0;
			ShurikenParticleData.startUVInfo[3] = 0.0;
		}

	}

}


