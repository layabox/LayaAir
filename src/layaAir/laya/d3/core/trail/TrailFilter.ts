import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { TrailMaterial } from "./TrailMaterial";
import { TrailRenderer } from "./TrailRenderer";
import { Sprite3D } from "../Sprite3D";
import { Vector3 } from "../../../maths/Vector3";
import { RenderElement } from "../render/RenderElement";
import { TrailShaderCommon } from "../../../display/RenderFeatureComman/Trail/TrailShaderCommon";
import { TrailGeometry } from "../../../display/RenderFeatureComman/Trail/TrailGeometry";
import { TrailBaseFilter } from "../../../display/RenderFeatureComman/TrailBaseFilter";

/**
 * @en Enum for trail alignment options.
 * @zh 拖尾对齐方式枚举。
 */
export enum TrailAlignment {
	/**
	 * @en Align the trail to face the camera.
	 * @zh 使拖尾面向摄像机。
	 */
	View,
	/**
	 * @en Align the trail with the direction of the component
	 * @zh 使拖尾与组件的方向对齐。
	 */
	TransformZ
}

/**
 * @en The TrailFilter class is used to create a trailing filter.
 * @zh TrailFilter 类用于创建拖尾过滤器。
 */
export class TrailFilter extends TrailBaseFilter {
	/**
	 * @en The trail alignment.
	 * @zh 轨迹准线。
	 */
	alignment: TrailAlignment = TrailAlignment.View;

	/**@internal */
	_ownerRender: TrailRenderer;
	/** @ignore */
	constructor(owner: TrailRenderer) {
		super(owner._baseRenderNode.shaderData);
		this._ownerRender = owner;
		this.addRenderElement();
	}
	
	/**
	 * @internal
	 * @en Adds a render element to the renderer.
	 * @zh 向渲染器添加渲染元素。
	 */
	addRenderElement(): void {
		var render: TrailRenderer = (<TrailRenderer>this._ownerRender);
		var elements: RenderElement[] = render._renderElements;
		var material: TrailMaterial = (<TrailMaterial>render.sharedMaterials[0]);
		(material) || (material = TrailMaterial.defaultMaterial);
		var element: RenderElement = new RenderElement();
		element.setTransform((this._ownerRender.owner as Sprite3D)._transform);
		element.render = render;
		element.material = material;
		//element.renderSubShader = element.material.shader.getSubShaderAt(0);
		
		element._renderElementOBJ.geometry = this._trialGeometry._geometryElementOBj;
		elements.push(element);
	}

	/**
	 * @internal
	 */
	_update(state: RenderContext3D): void {
		var render: BaseRender = this._ownerRender;
		const scene = this._ownerRender.owner.scene
		if (!scene)
			return;
		this._curtime += scene.timer._delta / 1000;
		//设置颜色
		render._baseRenderNode.shaderData.setNumber(TrailShaderCommon.CURTIME, this._curtime);
		//现在的位置记录
		var curPos: Vector3 = (this._ownerRender.owner as Sprite3D).transform.position;

		this._trialGeometry._updateDisappear(this._curtime, this._time);
		if (!Vector3.equals(this._lastPosition, curPos)) {
			if ((this._trialGeometry._endIndex - this._trialGeometry._activeIndex) === 0) {
				this._trialGeometry._addTrailByFirstPosition(curPos, this._curtime);
			} else {
				var delVector3: Vector3 = TrailGeometry._tempVector36;
				var pointAtoBVector3: Vector3 = TrailGeometry._tempVector35;
				switch (this.alignment) {
					case TrailAlignment.View:
						var cameraMatrix = state.camera.viewMatrix;
						Vector3.transformCoordinate(curPos, cameraMatrix, TrailGeometry._tempVector33);
						Vector3.transformCoordinate(this._trialGeometry._lastFixedVertexPosition, cameraMatrix, TrailGeometry._tempVector34);
						Vector3.subtract(TrailGeometry._tempVector33, TrailGeometry._tempVector34, delVector3);
						Vector3.cross(TrailGeometry._tempVector33, delVector3, pointAtoBVector3);
						break;
					case TrailAlignment.TransformZ:
						Vector3.subtract(curPos, this._trialGeometry._lastFixedVertexPosition, delVector3);
						var forward: Vector3 = TrailGeometry._tempVector33;
						(this._ownerRender.owner as Sprite3D).transform.getForward(forward);
						Vector3.cross(delVector3, forward, pointAtoBVector3);//实时更新模式需要和view一样根据当前forward重新计算
						break;
				}

				Vector3.normalize(pointAtoBVector3, pointAtoBVector3);
				Vector3.scale(pointAtoBVector3, this._widthMultiplier / 2, pointAtoBVector3);

				var delLength: number = Vector3.scalarLength(delVector3);
				this._trialGeometry._addTrailByNextPosition(curPos, this._curtime, this._minVertexDistance, pointAtoBVector3, delLength)
			}
		}
		this._trialGeometry._updateVertexBufferUV(this._colorGradient, this._textureMode);
		//克隆到lastPosition
		curPos.cloneTo(this._lastPosition);

		if (this._trialGeometry._disappearBoundsMode) {
			//caculate boundBox
			var bounds = this._ownerRender.bounds;
			var min: Vector3, max: Vector3;
			var sprite3dPosition: Vector3 = (this._ownerRender.owner as Sprite3D).transform.position;
			bounds.setMin(sprite3dPosition);
			bounds.setMax(sprite3dPosition);
			min = bounds.getMin();
			max = bounds.getMax();
			let _vertices1 = this._trialGeometry._vertices1;
			for (var i: number = this._trialGeometry._activeIndex; i < this._trialGeometry._endIndex; i++) {
				var posOffset = this._trialGeometry._floatCountPerVertices1 * 2 * i;
				var pos: Vector3 = TrailGeometry._tempVector35;
				var up: Vector3 = TrailGeometry._tempVector33;
				var side: Vector3 = TrailGeometry._tempVector34;

				pos.setValue(_vertices1[posOffset + 0], _vertices1[posOffset + 1], _vertices1[posOffset + 2]);
				up.setValue(_vertices1[posOffset + 3], _vertices1[posOffset + 4], _vertices1[posOffset + 5]);

				Vector3.add(pos, up, side);
				Vector3.min(side, min, min);
				Vector3.max(side, max, max);
				Vector3.subtract(pos, up, side);
				Vector3.min(side, min, min);
				Vector3.max(side, max, max);
			}
			bounds.setMin(min);
			bounds.setMax(max);
			this._trialGeometry._disappearBoundsMode = false;
		}

		this._trialGeometry._updateRenderParams();
	}
}

