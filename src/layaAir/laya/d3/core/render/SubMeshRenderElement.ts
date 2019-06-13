import { Event } from "../../../events/Event";
import { LayaGL } from "../../../layagl/LayaGL";
import { MeshRenderDynamicBatchManager } from "../../graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "../../graphics/MeshRenderStaticBatchManager";
import { SubMeshInstanceBatch } from "../../graphics/SubMeshInstanceBatch";
import { SubMeshStaticBatch } from "../../graphics/SubMeshStaticBatch";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { VertexDeclaration } from "../../graphics/VertexDeclaration";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Quaternion } from "../../math/Quaternion";
import { Mesh } from "../../resource/models/Mesh";
import { SubMesh } from "../../resource/models/SubMesh";
import { Utils3D } from "../../utils/Utils3D";
import { GeometryElement } from "../GeometryElement";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "././BaseRender";
import { BatchMark } from "././BatchMark";
import { RenderContext3D } from "././RenderContext3D";
import { RenderElement } from "././RenderElement";
import { RenderQueue } from "././RenderQueue";
import { ILaya3D } from "../../../../ILaya3D";

/**
 * @private
 */
export class SubMeshRenderElement extends RenderElement {
	/** @private */
	private _dynamicWorldPositionNormalNeedUpdate: boolean;

	/** @private */
	_dynamicVertexBatch: boolean;
	/** @private */
	_dynamicMultiSubMesh: boolean;
	/** @private */
	_dynamicVertexCount: number;
	/** @private */
	_dynamicWorldPositions: Float32Array;
	/** @private */
	_dynamicWorldNormals: Float32Array;

	/** @private */
	staticBatchIndexStart: number;
	/** @private */
	staticBatchIndexEnd: number;
	/** @private */
	staticBatchElementList: SubMeshRenderElement[];

	/** @private */
	instanceSubMesh: SubMesh;
	/** @private */
	instanceBatchElementList: SubMeshRenderElement[];

	/** @private */
	vertexBatchElementList: SubMeshRenderElement[];
	/** @private */
	vertexBatchVertexDeclaration: VertexDeclaration;


	/**
	 * 创建一个 <code>SubMeshRenderElement</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		super();
		this._dynamicWorldPositionNormalNeedUpdate = true;
	}

	/**
	 * @private
	 */
	private _onWorldMatrixChanged(): void {
		this._dynamicWorldPositionNormalNeedUpdate = true;
	}

	/**
	 * @inheritDoc
	 */
	_computeWorldPositionsAndNormals(positionOffset: number, normalOffset: number, multiSubMesh: boolean, vertexCount: number): void {
		if (this._dynamicWorldPositionNormalNeedUpdate) {
			var subMesh: SubMesh = (<SubMesh>this._geometry);
			var vertexBuffer: VertexBuffer3D = subMesh._vertexBuffer;
			var vertexFloatCount: number = vertexBuffer.vertexDeclaration.vertexStride / 4;
			var oriVertexes: Float32Array = (<Float32Array>vertexBuffer.getData());
			var worldMat: Matrix4x4 = this._transform.worldMatrix;
			var rotation: Quaternion = this._transform.rotation;//TODO:是否换成矩阵
			var indices: Uint16Array = subMesh._indices;

			for (var i: number = 0; i < vertexCount; i++) {
				var index: number = multiSubMesh ? indices[i] : i;
				var oriOffset: number = index * vertexFloatCount;
				var bakeOffset: number = i * 3;
				Utils3D.transformVector3ArrayToVector3ArrayCoordinate(oriVertexes, oriOffset + positionOffset, worldMat, this._dynamicWorldPositions, bakeOffset);
				(normalOffset !== -1) && (Utils3D.transformVector3ArrayByQuat(oriVertexes, oriOffset + normalOffset, rotation, this._dynamicWorldNormals, bakeOffset));
			}

			this._dynamicWorldPositionNormalNeedUpdate = false;
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  setTransform(transform: Transform3D): void {
		if (this._transform !== transform) {
			(this._transform) && (this._transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatrixChanged));
			(transform) && (transform.on(Event.TRANSFORM_CHANGED, this, this._onWorldMatrixChanged));
			this._dynamicWorldPositionNormalNeedUpdate = true;
			this._transform = transform;
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  setGeometry(geometry: GeometryElement): void {
		if (this._geometry !== geometry) {
			var subMesh: SubMesh = (<SubMesh>geometry);
			var mesh: Mesh = subMesh._mesh;
			if (mesh) {//TODO:可能是StaticSubMesh
				var multiSubMesh: boolean = mesh._subMeshCount > 1;
				var dynBatVerCount: number = multiSubMesh ? subMesh._indexCount : mesh._vertexCount;
				if (dynBatVerCount <= ILaya3D.SubMeshDynamicBatch.maxAllowVertexCount) {
					var length: number = dynBatVerCount * 3;
					this._dynamicVertexBatch = true;
					this._dynamicWorldPositions = new Float32Array(length);
					this._dynamicWorldNormals = new Float32Array(length);
					this._dynamicVertexCount = dynBatVerCount;
					this._dynamicMultiSubMesh = multiSubMesh;
				} else {
					this._dynamicVertexBatch = false;
				}
			}
			this._geometry = geometry;
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
		var subMeshStaticBatch: SubMeshStaticBatch = (<SubMeshStaticBatch>this.staticBatch);
		var elements: any[] = queue.elements;
		if (subMeshStaticBatch) {
			var staManager: MeshRenderStaticBatchManager = ILaya3D.MeshRenderStaticBatchManager.instance;
			var staBatchMarks: BatchMark = staManager.getBatchOpaquaMark(this.render.lightmapIndex + 1, this.render.receiveShadow, this.material.id, subMeshStaticBatch._batchID);
			if (staManager._updateCountMark === staBatchMarks.updateMark) {
				var staBatchIndex: number = staBatchMarks.indexInList;
				if (staBatchMarks.batched) {
					elements[staBatchIndex].staticBatchElementList.push(this);
				} else {
					var staOriElement: SubMeshRenderElement = elements[staBatchIndex];
					var staOriRender: BaseRender = staOriElement.render;
					var staBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>staManager._getBatchRenderElementFromPool());
					staBatchElement.renderType = RenderElement.RENDERTYPE_STATICBATCH;
					staBatchElement.setGeometry(subMeshStaticBatch);
					staBatchElement.material = staOriElement.material;
					var staRootOwner: Sprite3D = subMeshStaticBatch.batchOwner;
					var staBatchTransform: Transform3D = staRootOwner ? staRootOwner._transform : null;
					staBatchElement.setTransform(staBatchTransform);
					staBatchElement.render = staOriRender;
					var staBatchList: SubMeshRenderElement[] = staBatchElement.staticBatchElementList;
					staBatchList.length = 0;
					staBatchList.push((<SubMeshRenderElement>staOriElement));
					staBatchList.push(this);
					elements[staBatchIndex] = staBatchElement;
					staBatchMarks.batched = true;
				}
			} else {
				staBatchMarks.updateMark = staManager._updateCountMark;
				staBatchMarks.indexInList = elements.length;
				staBatchMarks.batched = false;//是否已有大于两个的元素可合并
				elements.push(this);
			}
		} else if (this.material._shader._enableInstancing && LayaGL.layaGPUInstance.supportInstance()) {//需要支持Instance渲染才可用
			var subMesh: SubMesh = (<SubMesh>this._geometry);
			var insManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
			var insBatchMarks: BatchMark = insManager.getInstanceBatchOpaquaMark(this.render.lightmapIndex + 1, this.render.receiveShadow, this.material.id, subMesh._id);
			if (insManager._updateCountMark === insBatchMarks.updateMark) {
				var insBatchIndex: number = insBatchMarks.indexInList;
				if (insBatchMarks.batched) {
					var instanceBatchElementList: SubMeshRenderElement[] = elements[insBatchIndex].instanceBatchElementList;
					if (instanceBatchElementList.length === SubMeshInstanceBatch.instance.maxInstanceCount) {
						insBatchMarks.updateMark = insManager._updateCountMark;
						insBatchMarks.indexInList = elements.length;
						insBatchMarks.batched = false;//是否已有大于两个的元素可合并
						elements.push(this);
					} else {
						instanceBatchElementList.push(this);
					}
				} else {
					var insOriElement: SubMeshRenderElement = elements[insBatchIndex];
					var insOriRender: BaseRender = insOriElement.render;
					var insBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>insManager._getBatchRenderElementFromPool());//TODO:是否动态和静态方法可合并
					insBatchElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
					insBatchElement.setGeometry(SubMeshInstanceBatch.instance);
					insBatchElement.material = insOriElement.material;
					insBatchElement.setTransform(null);
					insBatchElement.render = insOriRender;
					insBatchElement.instanceSubMesh = subMesh;
					var insBatchList: SubMeshRenderElement[] = insBatchElement.instanceBatchElementList;
					insBatchList.length = 0;
					insBatchList.push((<SubMeshRenderElement>insOriElement));
					insBatchList.push(this);
					elements[insBatchIndex] = insBatchElement;
					insBatchMarks.batched = true;
				}
			} else {
				insBatchMarks.updateMark = insManager._updateCountMark;
				insBatchMarks.indexInList = elements.length;
				insBatchMarks.batched = false;//是否已有大于两个的元素可合并
				elements.push(this);
			}
		} else if (this._dynamicVertexBatch) {
			var verDec: VertexDeclaration = ((<SubMesh>this._geometry))._vertexBuffer.vertexDeclaration;
			var dynManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
			var dynBatchMarks: BatchMark = dynManager.getVertexBatchOpaquaMark(this.render.lightmapIndex + 1, this.render.receiveShadow, this.material.id, verDec.id);
			if (dynManager._updateCountMark === dynBatchMarks.updateMark) {
				var dynBatchIndex: number = dynBatchMarks.indexInList;
				if (dynBatchMarks.batched) {
					elements[dynBatchIndex].vertexBatchElementList.push(this);
				} else {
					var dynOriElement: SubMeshRenderElement = elements[dynBatchIndex];
					var dynOriRender: BaseRender = dynOriElement.render;
					var dynBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>dynManager._getBatchRenderElementFromPool());//TODO:是否动态和静态方法可合并
					dynBatchElement.renderType = RenderElement.RENDERTYPE_VERTEXBATCH;
					dynBatchElement.setGeometry(ILaya3D.SubMeshDynamicBatch.instance);
					dynBatchElement.material = dynOriElement.material;
					dynBatchElement.setTransform(null);
					dynBatchElement.render = dynOriRender;
					dynBatchElement.vertexBatchVertexDeclaration = verDec;
					var dynBatchList: SubMeshRenderElement[] = dynBatchElement.vertexBatchElementList;
					dynBatchList.length = 0;
					dynBatchList.push((<SubMeshRenderElement>dynOriElement));
					dynBatchList.push(this);
					elements[dynBatchIndex] = dynBatchElement;
					dynBatchMarks.batched = true;
				}
			} else {
				dynBatchMarks.updateMark = dynManager._updateCountMark;
				dynBatchMarks.indexInList = elements.length;
				dynBatchMarks.batched = false;//是否已有大于两个的元素可合并
				elements.push(this);
			}
		} else {
			elements.push(this);
		}
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
		var subMeshStaticBatch: SubMeshStaticBatch = (<SubMeshStaticBatch>this.staticBatch);
		var elements: any[] = queue.elements;
		if (subMeshStaticBatch) {
			var staManager: MeshRenderStaticBatchManager = ILaya3D.MeshRenderStaticBatchManager.instance;
			var staLastElement: RenderElement = queue.lastTransparentRenderElement;
			if (staLastElement) {
				var staLastRender: BaseRender = staLastElement.render;
				if (staLastElement._geometry._getType() !== this._geometry._getType() || staLastElement.staticBatch !== subMeshStaticBatch || staLastElement.material !== this.material || staLastRender.receiveShadow !== this.render.receiveShadow || staLastRender.lightmapIndex !== this.render.lightmapIndex) {
					elements.push(this);
					queue.lastTransparentBatched = false;
				} else {
					if (queue.lastTransparentBatched) {
						((<SubMeshRenderElement>elements[elements.length - 1])).staticBatchElementList.push((this));
					} else {
						var staBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>staManager._getBatchRenderElementFromPool());
						staBatchElement.renderType = RenderElement.RENDERTYPE_STATICBATCH;
						staBatchElement.setGeometry(subMeshStaticBatch);
						staBatchElement.material = staLastElement.material;
						var staRootOwner: Sprite3D = subMeshStaticBatch.batchOwner;
						var staBatchTransform: Transform3D = staRootOwner ? staRootOwner._transform : null;
						staBatchElement.setTransform(staBatchTransform);
						staBatchElement.render = this.render;
						var staBatchList: SubMeshRenderElement[] = staBatchElement.staticBatchElementList;
						staBatchList.length = 0;
						staBatchList.push((<SubMeshRenderElement>staLastElement));
						staBatchList.push(this);
						elements[elements.length - 1] = staBatchElement;
					}
					queue.lastTransparentBatched = true;
				}
			} else {
				elements.push(this);
				queue.lastTransparentBatched = false;
			}
		} else if (this.material._shader._enableInstancing && LayaGL.layaGPUInstance.supportInstance()) {//需要支持Instance渲染才可用
			var subMesh: SubMesh = (<SubMesh>this._geometry);
			var insManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
			var insLastElement: RenderElement = queue.lastTransparentRenderElement;
			if (insLastElement) {
				var insLastRender: BaseRender = insLastElement.render;
				if (insLastElement._geometry._getType() !== this._geometry._getType() || ((<SubMesh>insLastElement._geometry)) !== subMesh || insLastElement.material !== this.material || insLastRender.receiveShadow !== this.render.receiveShadow || insLastRender.lightmapIndex !== this.render.lightmapIndex) {
					elements.push(this);
					queue.lastTransparentBatched = false;
				} else {
					if (queue.lastTransparentBatched) {
						((<SubMeshRenderElement>elements[elements.length - 1])).instanceBatchElementList.push((this));
					} else {
						var insBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>insManager._getBatchRenderElementFromPool());
						insBatchElement.renderType = RenderElement.RENDERTYPE_INSTANCEBATCH;
						insBatchElement.setGeometry(SubMeshInstanceBatch.instance);
						insBatchElement.material = insLastElement.material;
						insBatchElement.setTransform(null);
						insBatchElement.render = this.render;
						insBatchElement.instanceSubMesh = subMesh;
						var insBatchList: SubMeshRenderElement[] = insBatchElement.instanceBatchElementList;
						insBatchList.length = 0;
						insBatchList.push((<SubMeshRenderElement>insLastElement));
						insBatchList.push(this);
						elements[elements.length - 1] = insBatchElement;
					}
					queue.lastTransparentBatched = true;
				}
			} else {
				elements.push(this);
				queue.lastTransparentBatched = false;
			}

		} else if (this._dynamicVertexBatch) {
			var verDec: VertexDeclaration = ((<SubMesh>this._geometry))._vertexBuffer.vertexDeclaration;
			var dynManager: MeshRenderDynamicBatchManager = ILaya3D.MeshRenderDynamicBatchManager.instance;
			var dynLastElement: RenderElement = queue.lastTransparentRenderElement;
			if (dynLastElement) {
				var dynLastRender: BaseRender = dynLastElement.render;
				if (dynLastElement._geometry._getType() !== this._geometry._getType() || ((<SubMesh>dynLastElement._geometry))._vertexBuffer._vertexDeclaration !== verDec || dynLastElement.material !== this.material || dynLastRender.receiveShadow !== this.render.receiveShadow || dynLastRender.lightmapIndex !== this.render.lightmapIndex) {
					elements.push(this);
					queue.lastTransparentBatched = false;
				} else {
					if (queue.lastTransparentBatched) {
						((<SubMeshRenderElement>elements[elements.length - 1])).vertexBatchElementList.push((this));
					} else {
						var dynBatchElement: SubMeshRenderElement = (<SubMeshRenderElement>dynManager._getBatchRenderElementFromPool());
						dynBatchElement.renderType = RenderElement.RENDERTYPE_VERTEXBATCH;
						dynBatchElement.setGeometry(ILaya3D.SubMeshDynamicBatch.instance);
						dynBatchElement.material = dynLastElement.material;
						dynBatchElement.setTransform(null);
						dynBatchElement.render = this.render;
						dynBatchElement.vertexBatchVertexDeclaration = verDec;
						var dynBatchList: SubMeshRenderElement[] = dynBatchElement.vertexBatchElementList;
						dynBatchList.length = 0;
						dynBatchList.push((<SubMeshRenderElement>dynLastElement));
						dynBatchList.push(this);
						elements[elements.length - 1] = dynBatchElement;
					}
					queue.lastTransparentBatched = true;
				}
			} else {
				elements.push(this);
				queue.lastTransparentBatched = false;
			}
		} else {
			elements.push(this);
		}
		queue.lastTransparentRenderElement = this;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  destroy(): void {
		super.destroy();
		this._dynamicWorldPositions = null;
		this._dynamicWorldNormals = null;
		this.staticBatch = null;
		this.staticBatchElementList = null;
		this.vertexBatchElementList = null;
		this.vertexBatchVertexDeclaration = null;
	}
}


