import { Event } from "../../../events/Event";
import { SubMesh } from "../../resource/models/SubMesh";
import { GeometryElement } from "../GeometryElement";
import { Transform3D } from "../Transform3D";
import { RenderElement } from "./RenderElement";
import { SingletonList } from "../../../utils/SingletonList";
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";

/**
 * @internal
 */
export class SubMeshRenderElement extends RenderElement {

	/** @internal */
	private _dynamicWorldPositionNormalNeedUpdate: boolean;

	/** @internal */
	staticBatchIndexStart: number;
	/** @internal */
	staticBatchIndexEnd: number;
	/** @internal */
	staticBatchElementList: SingletonList<SubMeshRenderElement>;

	/** @internal */
	instanceSubMesh: SubMesh;
	/** @internal */
	instanceBatchElementList: SingletonList<SubMeshRenderElement>;

	/** @internal */
	vertexBatchElementList: SingletonList<SubMeshRenderElement>;
	/** @internal */
	vertexBatchVertexDeclaration: VertexDeclaration;


	/**
	 * 创建一个 <code>SubMeshRenderElement</code> 实例。
	 */
	constructor() {
		super();
		this._dynamicWorldPositionNormalNeedUpdate = true;
		this._canBatch = true;
	}

	/**
	 * @internal
	 */
	private _onWorldMatrixChanged(): void {
		this._dynamicWorldPositionNormalNeedUpdate = true;
	}

	// /**
	//  * @inheritDoc
	//  */
	// _computeWorldPositionsAndNormals(positionOffset: number, normalOffset: number, multiSubMesh: boolean, vertexCount: number): void {
	// 	if (this._dynamicWorldPositionNormalNeedUpdate) {
	// 		var subMesh: SubMesh = (<SubMesh>this._geometry);
	// 		var vertexBuffer: VertexBuffer3D = subMesh._vertexBuffer;
	// 		var vertexFloatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
	// 		var oriVertexes: Float32Array = vertexBuffer.getFloat32Data();
	// 		var worldMat: Matrix4x4 = this._transform.worldMatrix;
	// 		var rotation: Quaternion = this._transform.rotation;//TODO:是否换成矩阵
	// 		var indices = subMesh._indices;

	// 		for (var i: number = 0; i < vertexCount; i++) {
	// 			var index: number = multiSubMesh ? indices[i] : i;
	// 			var oriOffset: number = index * vertexFloatCount;
	// 			var bakeOffset: number = i * 3;
	// 			Utils3D.transformVector3ArrayToVector3ArrayCoordinate(oriVertexes, oriOffset + positionOffset, worldMat, this._dynamicWorldPositions, bakeOffset);
	// 			(normalOffset !== -1) && (Utils3D.transformVector3ArrayByQuat(oriVertexes, oriOffset + normalOffset, rotation, this._dynamicWorldNormals, bakeOffset));
	// 		}

	// 		this._dynamicWorldPositionNormalNeedUpdate = false;
	// 	}
	// }

	/**
	 * @inheritDoc
	 * @override
	 */
	setTransform(transform: Transform3D): void {
		if (this.transform !== transform) {
			(this.transform) && (this.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatrixChanged));
			(transform) && (transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatrixChanged));
			this._dynamicWorldPositionNormalNeedUpdate = true;
			this.transform = transform;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	setGeometry(geometry: GeometryElement): void {
		if (this._geometry !== geometry) {
			this._geometry = geometry;
			this._renderElementOBJ._geometry = geometry._geometryElementOBj;
		}
	}

	// /**
	//  * @inheritDoc
	//  * @override
	//  */
	// addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
	// 	var subMeshStaticBatch: SubMeshStaticBatch = (<SubMeshStaticBatch>this.staticBatch);
	// 	var queueElements: SingletonList<RenderElement> = queue.elements;
	// 	var elements: any[] = queueElements.elements;
	// 	//TODO:这里的还需要根据反射探针来修改一下合并相关
	// 	if (subMeshStaticBatch && (!this.render._probReflection || this.render._probReflection._isScene) && SubMeshRenderElement.enableStaticBatch) {
	// 		var staManager: MeshRenderStaticBatchManager = ILaya3D.MeshRenderStaticBatchManager.instance;
	// 		var staBatchMarks: BatchMark = staManager.getBatchOpaquaMark(this.render.lightmapIndex + 1, this.render.receiveShadow, this.material.id, subMeshStaticBatch._batchID);
	// 		if (staManager._updateCountMark === staBatchMarks.updateMark) {
	// 			var staBatchIndex: number = staBatchMarks.indexInList;
	// 			if (staBatchMarks.batched) {
	// 				elements[staBatchIndex].staticBatchElementList.add(this);
	// 			} else {
	// 				var staOriElement: SubMeshRenderElement = elements[staBatchIndex];
	// 				var staOriRender: BaseRender = staOriElement.render;
	// 				var staBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>staManager._getBatchRenderElementFromPool());
	// 				staBatchElement.renderType = RenderElement.RENDERTYPE_STATICBATCH;
	// 				staBatchElement.setGeometry(subMeshStaticBatch);
	// 				staBatchElement.material = staOriElement.material;
	// 				var staRootOwner: Sprite3D = subMeshStaticBatch.batchOwner;
	// 				var staBatchTransform: Transform3D = staRootOwner ? staRootOwner._transform : null;
	// 				staBatchElement.setTransform(staBatchTransform);
	// 				staBatchElement.render = staOriRender;
	// 				staBatchElement.renderSubShader = staOriElement.renderSubShader;
	// 				var staBatchList: SingletonList<SubMeshRenderElement> = staBatchElement.staticBatchElementList;
	// 				staBatchList.length = 0;
	// 				staBatchList.add((<SubMeshRenderElement>staOriElement));
	// 				staBatchList.add(this);
	// 				elements[staBatchIndex] = staBatchElement;
	// 				staBatchMarks.batched = true;
	// 			}
	// 		} else {
	// 			staBatchMarks.updateMark = staManager._updateCountMark;
	// 			staBatchMarks.indexInList = queueElements.length;
	// 			staBatchMarks.batched = false;//是否已有大于两个的元素可合并
	// 			queueElements.add(this);
	// 		}
	// 	} else if (SubMeshRenderElement.enableDynamicBatch && this.renderSubShader._owner._enableInstancing && LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance) && this.render.lightmapIndex < 0 && (!this.render._probReflection || this.render._probReflection._isScene)) {//需要支持Instance渲染才可用,暂不支持光照贴图//不是Scene反射探针的不能合并TODO：这里需要重新判断
	// 		var subMesh: SubMesh = (<SubMesh>this._geometry);
	// 		var insManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
	// 		var insBatchMarks: BatchMark = insManager.getInstanceBatchOpaquaMark(this.render.receiveShadow, this.material.id, subMesh._id, this._transform._isFrontFaceInvert);
	// 		if (insManager._updateCountMark === insBatchMarks.updateMark) {
	// 			var insBatchIndex: number = insBatchMarks.indexInList;
	// 			if (insBatchMarks.batched) {
	// 				var instanceBatchElementList: SingletonList<SubMeshRenderElement> = elements[insBatchIndex].instanceBatchElementList;
	// 				if (instanceBatchElementList.length === SubMeshInstanceBatch.maxInstanceCount) {
	// 					insBatchMarks.updateMark = insManager._updateCountMark;
	// 					insBatchMarks.indexInList = queueElements.length;
	// 					insBatchMarks.batched = false;//是否已有大于两个的元素可合并
	// 					queueElements.add(this);
	// 				} else {
	// 					instanceBatchElementList.add(this);
	// 				}
	// 			} else {
	// 				var insOriElement: SubMeshRenderElement = elements[insBatchIndex];
	// 				var insOriRender: BaseRender = insOriElement.render;
	// 				var insBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>insManager._getBatchRenderElementFromPool());//TODO:是否动态和静态方法可合并
	// 				insBatchElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
	// 				insBatchElement.setGeometry(SubMeshInstanceBatch.instance);
	// 				insBatchElement.material = insOriElement.material;
	// 				insBatchElement.setTransform(null);
	// 				insBatchElement.render = insOriRender;
	// 				insBatchElement.instanceSubMesh = subMesh;
	// 				insBatchElement.renderSubShader = insOriElement.renderSubShader;
	// 				var insBatchList: SingletonList<SubMeshRenderElement> = insBatchElement.instanceBatchElementList;
	// 				insBatchList.length = 0;
	// 				insBatchList.add((<SubMeshRenderElement>insOriElement));
	// 				insBatchList.add(this);
	// 				elements[insBatchIndex] = insBatchElement;
	// 				insBatchMarks.batched = true;
	// 			}
	// 		} else {
	// 			insBatchMarks.updateMark = insManager._updateCountMark;
	// 			insBatchMarks.indexInList = queueElements.length;
	// 			insBatchMarks.batched = false;//是否已有大于两个的元素可合并
	// 			queueElements.add(this);
	// 		}
	// 		//} else if (this._dynamicVertexBatch&&SubMeshRenderElement.enableDynamicBatch) {
	// 	} else {
	// 		queueElements.add(this);
	// 	}
	// }

	// /**
	//  * @inheritDoc
	//  * @override
	//  */
	// addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
	// 	var subMeshStaticBatch: SubMeshStaticBatch = (<SubMeshStaticBatch>this.staticBatch);
	// 	var queueElements: SingletonList<RenderElement> = queue.elements;
	// 	var elements: any[] = queueElements.elements;
	// 	if (subMeshStaticBatch && SubMeshRenderElement.enableStaticBatch) {
	// 		var staManager: MeshRenderStaticBatchManager = ILaya3D.MeshRenderStaticBatchManager.instance;
	// 		var staLastElement: RenderElement = queue.lastTransparentRenderElement;
	// 		if (staLastElement) {
	// 			var staLastRender: BaseRender = staLastElement.render;
	// 			if (staLastElement._geometry._getType() !== this._geometry._getType() || staLastElement.staticBatch !== subMeshStaticBatch || staLastElement.material !== this.material || staLastRender.receiveShadow !== this.render.receiveShadow || staLastRender.lightmapIndex !== this.render.lightmapIndex) {
	// 				queueElements.add(this);
	// 				queue.lastTransparentBatched = false;
	// 			} else {
	// 				if (queue.lastTransparentBatched) {
	// 					(<SubMeshRenderElement>elements[queueElements.length - 1]).staticBatchElementList.add((this));
	// 				} else {
	// 					var staBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>staManager._getBatchRenderElementFromPool());
	// 					staBatchElement.renderType = RenderElement.RENDERTYPE_STATICBATCH;
	// 					staBatchElement.setGeometry(subMeshStaticBatch);
	// 					staBatchElement.material = staLastElement.material;
	// 					var staRootOwner: Sprite3D = subMeshStaticBatch.batchOwner;
	// 					var staBatchTransform: Transform3D = staRootOwner ? staRootOwner._transform : null;
	// 					staBatchElement.setTransform(staBatchTransform);
	// 					staBatchElement.render = this.render;
	// 					staBatchElement.renderSubShader = staLastElement.renderSubShader;
	// 					var staBatchList: SingletonList<SubMeshRenderElement> = staBatchElement.staticBatchElementList;
	// 					staBatchList.length = 0;
	// 					staBatchList.add((<SubMeshRenderElement>staLastElement));
	// 					staBatchList.add(this);
	// 					elements[queueElements.length - 1] = staBatchElement;
	// 				}
	// 				queue.lastTransparentBatched = true;
	// 			}
	// 		} else {
	// 			queueElements.add(this);
	// 			queue.lastTransparentBatched = false;
	// 		}
	// 	} else if (SubMeshRenderElement.enableDynamicBatch && this.renderSubShader._owner._enableInstancing && LayaGL.renderEngine.getCapable(RenderCapable.DrawElement_Instance) && this.render.lightmapIndex < 0 && (!this.render._probReflection || this.render._probReflection._isScene)) {//需要支持Instance渲染才可用，暂不支持光照贴图
	// 		var subMesh: SubMesh = (<SubMesh>this._geometry);
	// 		var insManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
	// 		var insLastElement: RenderElement = queue.lastTransparentRenderElement;
	// 		if (insLastElement) {
	// 			var insLastRender: BaseRender = insLastElement.render;
	// 			if (insLastElement._geometry._getType() !== this._geometry._getType() || ((<SubMesh>insLastElement._geometry)) !== subMesh || insLastElement.material !== this.material || insLastRender.receiveShadow !== this.render.receiveShadow) {
	// 				queueElements.add(this);
	// 				queue.lastTransparentBatched = false;
	// 			} else {
	// 				if (queue.lastTransparentBatched) {
	// 					var instanceBatchElementList: SingletonList<SubMeshRenderElement> = elements[queueElements.length - 1].instanceBatchElementList;
	// 					if (instanceBatchElementList.length === SubMeshInstanceBatch.maxInstanceCount) {
	// 						queueElements.add(this);
	// 						queue.lastTransparentBatched = false;
	// 					} else {
	// 						instanceBatchElementList.add(this);
	// 						queue.lastTransparentBatched = true;
	// 					}
	// 				} else {
	// 					var insBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>insManager._getBatchRenderElementFromPool());
	// 					insBatchElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
	// 					insBatchElement.setGeometry(SubMeshInstanceBatch.instance);
	// 					insBatchElement.material = insLastElement.material;
	// 					insBatchElement.setTransform(null);
	// 					insBatchElement.render = this.render;
	// 					insBatchElement.instanceSubMesh = subMesh;
	// 					insBatchElement.renderSubShader = insLastElement.renderSubShader;
	// 					var insBatchList: SingletonList<SubMeshRenderElement> = insBatchElement.instanceBatchElementList;
	// 					insBatchList.length = 0;
	// 					insBatchList.add((<SubMeshRenderElement>insLastElement));
	// 					insBatchList.add(this);
	// 					elements[queueElements.length - 1] = insBatchElement;
	// 					queue.lastTransparentBatched = true;
	// 				}
	// 			}
	// 		} else {
	// 			queueElements.add(this);
	// 			queue.lastTransparentBatched = false;
	// 		}

	// 	} else {
	// 		queueElements.add(this);
	// 	}
	// 	queue.lastTransparentRenderElement = this;
	// }

	getInvertFront(): boolean {
		switch (this.renderType) {
			case RenderElement.RENDERTYPE_NORMAL:
				return this.transform._isFrontFaceInvert;
			case RenderElement.RENDERTYPE_STATICBATCH:
			case RenderElement.RENDERTYPE_VERTEXBATCH:
				return false;
			case RenderElement.RENDERTYPE_INSTANCEBATCH:
				return this.instanceBatchElementList.elements[0].transform._isFrontFaceInvert;
			default:
				throw "SubMeshRenderElement: unknown renderType";
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		this.staticBatch = null;
		this.instanceSubMesh = null;
		this.staticBatchElementList && this.staticBatchElementList.destroy();
		this.instanceBatchElementList && this.instanceBatchElementList.destroy();
		this.vertexBatchElementList && this.vertexBatchElementList.destroy();
		this.vertexBatchVertexDeclaration = null;
	}
}


