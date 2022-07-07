import { MeshRenderStaticBatchManager } from "../graphics/MeshRenderStaticBatchManager"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Mesh } from "../resource/models/Mesh"
import { Material } from "./material/Material"
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial"
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration"
import { BaseRender } from "./render/BaseRender"
import { RenderContext3D } from "./render/RenderContext3D"
import { RenderElement } from "./render/RenderElement"
import { SubMeshRenderElement } from "./render/SubMeshRenderElement"
import { RenderableSprite3D } from "./RenderableSprite3D"
import { Sprite3D } from "./Sprite3D"
import { Transform3D } from "./Transform3D"
import { ShaderDataType } from "./render/command/SetShaderDataCMD"
import { MeshFilter } from "./MeshFilter"
import { Component } from "../../components/Component"
import { StaticBatchManager } from "../graphics/StaticBatchManager"
import { DynamicBatchManager } from "../graphics/DynamicBatchManager"
import { MeshRenderDynamicBatchManager } from "../graphics/MeshRenderDynamicBatchManager"
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D"
import { ShaderDefine } from "../../RenderEngine/RenderShader/ShaderDefine"
import { SubMesh } from "../resource/models/SubMesh"
import { VertexElement } from "../graphics/VertexElement"
import { VertexMesh } from "../graphics/Vertex/VertexMesh"
import { ShaderData } from "../../RenderEngine/RenderShader/ShaderData"

/**
 * <code>MeshRenderer</code> 类用于网格渲染器。
 */
export class MeshRenderer extends BaseRender {
	/** @internal */
	protected _revertStaticBatchDefineUV1: boolean = false;
	/** @internal */
	protected _projectionViewWorldMatrix: Matrix4x4;
	/** @internal */
	protected _mesh: Mesh;

	/**
	 * @internal
	 */
	static __init__(): void {
		MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0 = Shader3D.getDefineByName("UV");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR = Shader3D.getDefineByName("COLOR");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1 = Shader3D.getDefineByName("UV1");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE = Shader3D.getDefineByName("GPU_INSTANCE");
		MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION = Shader3D.getDefineByName("SPECCUBE_BOX_PROJECTION");
		StaticBatchManager._registerManager(MeshRenderStaticBatchManager.instance);
		DynamicBatchManager._registerManager(MeshRenderDynamicBatchManager.instance);
	}


	/**
	 * 创建一个新的 <code>MeshRender</code> 实例。
	 */
	constructor() {
		super();
		this._projectionViewWorldMatrix = new Matrix4x4();
	}

	/**
	 * @internal
	 */
	_createRenderElement(): RenderElement {
		return new SubMeshRenderElement();
	}

	/**
	 * @internal
	 */
	_onEnable(): void {
		super._onEnable();
		const filter = this.owner.getComponent(MeshFilter) as MeshFilter;
		filter._enabled && this._onMeshChange(filter.sharedMesh);
	}

	/**
	 * @internal
	 */
	protected _onDisable(): void {
		super._onDisable();
	}

	/**
	 * @internal
	 */
	protected _onDestroy(): void {
		super._onDestroy();
	}

	/**
	 * @internal
	 * @param mesh 
	 * @param out 
	 */
	protected _getMeshDefine(mesh: Mesh, out: Array<ShaderDefine>): number {
		out.length = 0;
		var define: number;
		for (var i: number = 0, n: number = mesh._subMeshes.length; i < n; i++) {
			var subMesh: SubMesh = (<SubMesh>mesh.getSubMesh(i));
			var vertexElements: any[] = subMesh._vertexBuffer._vertexDeclaration._vertexElements;
			for (var j: number = 0, m: number = vertexElements.length; j < m; j++) {
				var vertexElement: VertexElement = vertexElements[j];
				var name: number = vertexElement._elementUsage;
				switch (name) {
					case VertexMesh.MESH_COLOR0:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
						break
					case VertexMesh.MESH_TEXTURECOORDINATE0:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
						break;
					case VertexMesh.MESH_TEXTURECOORDINATE1:
						out.push(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
						break;
				}
			}
		}
		return define;
	}

	protected _changeVertexDefine(mesh: Mesh) {
		var defineDatas: ShaderData = this._shaderValues;
		var lastValue: Mesh = this._mesh;
		if (lastValue) {
			this._getMeshDefine(lastValue, MeshFilter._meshVerticeDefine);
			for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
				defineDatas.removeDefine(MeshFilter._meshVerticeDefine[i]);
		}
		if (mesh) {
			this._getMeshDefine(mesh, MeshFilter._meshVerticeDefine);
			for (var i: number = 0, n: number = MeshFilter._meshVerticeDefine.length; i < n; i++)
				defineDatas.addDefine(MeshFilter._meshVerticeDefine[i]);
		}

	}

	/**
	 * @internal
	 */
	_onMeshChange(mesh: Mesh): void {
		if (mesh && this._mesh != mesh) {
			this._changeVertexDefine(mesh);
			this._mesh = mesh;
			var count: number = mesh.subMeshCount;
			this._renderElements.length = count;
			for (var i: number = 0; i < count; i++) {
				var renderElement: RenderElement = this._renderElements[i];
				if (!renderElement) {
					var material: Material = this.sharedMaterials[i];
					renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
					this.owner && renderElement.setTransform((this.owner as Sprite3D)._transform);
					renderElement.render = this;
					renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
				}
				renderElement.setGeometry(mesh.getSubMesh(i));
			}

		} else if (!mesh) {
			this._renderElements.length = 0;
			this._mesh = null;
			this._changeVertexDefine(null);
		}
		this._boundsChange = true;
		// if (this._octreeNode && this._indexInOctreeMotionList === -1) {
		// 	this._octreeNode.getManagerNode().addMotionObject(this);
		// }
	}


	/**
	 * @internal
	 * 开启多材质 多element模式
	 */
	updateMulPassRender(): void {
		const filter = this.owner.getComponent(MeshFilter);
		if (!filter)
			return;
		const mesh = filter.sharedMesh;
		if (mesh) {
			var subCount: number = mesh.subMeshCount;
			var matCount = this._sharedMaterials.length;
			if (subCount > matCount) {
				let count = subCount
				this._renderElements.length = count;
				for (var i: number = 0; i < count; i++) {
					var renderElement: RenderElement = this._renderElements[i];
					if (!renderElement) {
						var material: Material = this.sharedMaterials[i];
						renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
						renderElement.setTransform((this.owner as Sprite3D)._transform);
						renderElement.render = this;
						renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
					}
					renderElement.setGeometry(mesh.getSubMesh(i));
				}
			} else {
				let count = matCount;
				this._renderElements.length = count;
				for (var i: number = 0; i < count; i++) {
					var renderElement: RenderElement = this._renderElements[i];
					if (!renderElement) {
						var material: Material = this.sharedMaterials[i];
						renderElement = this._renderElements[i] = this._renderElements[i] ? this._renderElements[i] : this._createRenderElement();
						renderElement.setTransform((this.owner as Sprite3D)._transform);
						renderElement.render = this;
						renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
					}
				}
				renderElement.setGeometry(mesh.getSubMesh(count % subCount));
			}

		} else {
			this._renderElements.length = 0;
		}
		this._boundsChange = true;
		// if (this._octreeNode && this._indexInOctreeMotionList === -1) {
		// 	this._octreeNode.getManagerNode().addMotionObject(this);
		// }
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _calculateBoundingBox(): void {
		var sharedMesh: Mesh = this._mesh;
		if (sharedMesh) {
			var worldMat: Matrix4x4 = ((<Sprite3D>this.owner)).transform.worldMatrix;
			sharedMesh.bounds._tranform(worldMat, this._bounds);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdate(context: RenderContext3D, transform: Transform3D): void {
		this._applyLightMapParams();
		var element: SubMeshRenderElement = <SubMeshRenderElement>context.renderElement;
		switch (element.renderType) {
			case RenderElement.RENDERTYPE_NORMAL:
				this._setShaderValue(Sprite3D.WORLDMATRIX, transform.worldMatrix);
				break;
			case RenderElement.RENDERTYPE_STATICBATCH:
				if (transform)
					this._setShaderValue(Sprite3D.WORLDMATRIX, transform.worldMatrix);
				else
					this._setShaderValue(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
				if (!this._shaderValues.hasDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1)) {
					this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
					this._revertStaticBatchDefineUV1 = true;
				}
				else {
					this._revertStaticBatchDefineUV1 = false;
				}
				this._setShaderValue(RenderableSprite3D.LIGHTMAPSCALEOFFSET, BaseRender._defaultLightmapScaleOffset);
				this._subUniformBufferData && (this._subUniformBufferData._needUpdate = true);//静态合并的时候需要调整lightmapoffest
				break;
			case RenderElement.RENDERTYPE_VERTEXBATCH:
				this._setShaderValue(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
				break;
			case RenderElement.RENDERTYPE_INSTANCEBATCH:
				// var worldMatrixData: Float32Array = SubMeshInstanceBatch.instance.instanceWorldMatrixData;
				// var insBatches: SingletonList<SubMeshRenderElement> = element.instanceBatchElementList;
				// var elements: SubMeshRenderElement[] = insBatches.elements;
				// var count: number = insBatches.length;
				// for (var i: number = 0; i < count; i++)
				// 	worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);

				// var worldBuffer: VertexBuffer3D = SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer;
				// worldBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.   TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
				// worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 16 * 4);
				// this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
				break;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		if (projectionView) {//TODO:是否移除MVP
			var element: SubMeshRenderElement = (<SubMeshRenderElement>context.renderElement);
			switch (element.renderType) {
				case RenderElement.RENDERTYPE_NORMAL:
				case RenderElement.RENDERTYPE_STATICBATCH:
				case RenderElement.RENDERTYPE_VERTEXBATCH:
					if (transform) {
						Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
						this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
					} else {
						this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
					}
					break;
			}
		}
	}
	/**
	 * @internal
	 * @override
	 */
	_revertBatchRenderUpdate(context: RenderContext3D): void {
		var element: SubMeshRenderElement = (<SubMeshRenderElement>context.renderElement);
		switch (element.renderType) {
			case RenderElement.RENDERTYPE_STATICBATCH:
				if (this._revertStaticBatchDefineUV1)
					this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
				this._shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, this.lightmapScaleOffset);
				break;
			case RenderElement.RENDERTYPE_INSTANCEBATCH:
				this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
				break;
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	destroy(): void {
		(this._isPartOfStaticBatch) && (MeshRenderStaticBatchManager.instance._removeRenderSprite(this));
		super.destroy();
	}

	/**
	 * @override
	 * @param dest 
	 */
	_cloneTo(dest: Component): void {
		super._cloneTo(dest);
	}
}


