// import { TrailFilter } from "./TrailFilter";
// import { TrailRenderer } from "./TrailRenderer";
// import { FloatKeyframe } from "../FloatKeyframe"
// import { Gradient } from "../Gradient"
// import { RenderableSprite3D } from "../RenderableSprite3D"
// import { Material } from "../../../resource/Material";
// import { Node } from "../../../display/Node"
// import { Loader } from "../../../net/Loader"
// import { Sprite3D } from "../Sprite3D";
// import { Color } from "../../../maths/Color";

// /**
//  * <code>TrailSprite3D</code> 类用于创建拖尾渲染精灵。
//  */
// export class TrailSprite3D extends RenderableSprite3D {
// 	/**
// 	 * @internal
// 	 */
// 	static __init__(): void { }

// 	/** @internal */
// 	private _geometryFilter: TrailFilter;

// 	/**
// 	 * Trail过滤器。
// 	 */
// 	get trailFilter(): TrailFilter {
// 		return (<TrailFilter>this._geometryFilter);
// 	}

// 	/**
// 	 * Trail渲染器。
// 	 */
// 	get trailRenderer(): TrailRenderer {
// 		return (<TrailRenderer>this._render);
// 	}

// 	constructor(name: string = null) {
// 		super(name);
// 		this._render = this.addComponent(TrailRenderer);
// 		this._geometryFilter = (this._render as TrailRenderer)._trailFilter;
// 	}

// 	/**
// 	 * @inheritDoc
// 	 * @override
// 	 * @internal
// 	 */
// 	_parse(data: any, spriteMap: any): void {
// 		super._parse(data, spriteMap);
// 		var render: TrailRenderer = (<TrailRenderer>this._render);
// 		var filter: TrailFilter = (<TrailFilter>this._geometryFilter);
// 		var i: number, j: number;
// 		var materials: any[] = data.materials;
// 		if (materials) {
// 			var sharedMaterials: Material[] = render.sharedMaterials;
// 			var materialCount: number = materials.length;
// 			sharedMaterials.length = materialCount;
// 			for (i = 0; i < materialCount; i++)
// 				sharedMaterials[i] = Loader.getRes(materials[i].path);
// 			render.sharedMaterials = sharedMaterials;
// 		}
// 		//时间
// 		filter.time = data.time;
// 		//最小顶点距离
// 		filter.minVertexDistance = data.minVertexDistance;
// 		filter.widthMultiplier = data.widthMultiplier;
// 		filter.textureMode = data.textureMode;
// 		(data.alignment != null) && (filter.alignment = data.alignment);
// 		//widthCurve
// 		var widthCurve: FloatKeyframe[] = [];
// 		var widthCurveData: any[] = data.widthCurve;
// 		for (i = 0, j = widthCurveData.length; i < j; i++) {
// 			var trailkeyframe: FloatKeyframe = new FloatKeyframe();
// 			trailkeyframe.time = widthCurveData[i].time;
// 			trailkeyframe.inTangent = widthCurveData[i].inTangent;
// 			trailkeyframe.outTangent = widthCurveData[i].outTangent;
// 			trailkeyframe.value = widthCurveData[i].value;
// 			widthCurve.push(trailkeyframe);
// 		}
// 		filter.widthCurve = widthCurve;
// 		//colorGradient
// 		var colorGradientData: any = data.colorGradient;
// 		var colorKeys: any[] = colorGradientData.colorKeys;
// 		var alphaKeys: any[] = colorGradientData.alphaKeys;
// 		var colorGradient: Gradient = new Gradient(colorKeys.length, alphaKeys.length);
// 		colorGradient.mode = colorGradientData.mode;

// 		for (i = 0, j = colorKeys.length; i < j; i++) {
// 			var colorKey: any = colorKeys[i];
// 			colorGradient.addColorRGB(colorKey.time, new Color(colorKey.value[0], colorKey.value[1], colorKey.value[2], 1.0));
// 		}

// 		for (i = 0, j = alphaKeys.length; i < j; i++) {
// 			var alphaKey: any = alphaKeys[i];
// 			colorGradient.addColorAlpha(alphaKey.time, alphaKey.value);
// 		}
// 		filter.colorGradient = colorGradient;
// 	}

// 	/**
// 	 * @inheritDoc
// 	 * @override
// 	 * @internal
// 	 */
// 	_cloneTo(destObject: any, srcSprite: Node, dstSprite: Node): void {
// 		super._cloneTo(destObject, srcSprite, dstSprite);
// 	}

// 	clear(): void {
// 		(this._render as TrailRenderer).clear();
// 	}

// 	/**
// 	 * @internal
// 	 */
// 	protected _create(): Node {
// 		return new Sprite3D();
// 	}
// }

