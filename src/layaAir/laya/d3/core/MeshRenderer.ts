import { SingletonList } from "../component/SingletonList"
import { MeshRenderStaticBatchManager } from "../graphics/MeshRenderStaticBatchManager"
import { SubMeshInstanceBatch } from "../graphics/SubMeshInstanceBatch"
import { BoundFrustum } from "../math/BoundFrustum"
import { Matrix4x4 } from "../math/Matrix4x4"
import { Mesh } from "../resource/models/Mesh"
import { Material } from "./material/Material"
import { BlinnPhongMaterial } from "./material/BlinnPhongMaterial"
import { MeshSprite3D } from "./MeshSprite3D"
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration"
import { BaseRender } from "./render/BaseRender"
import { RenderContext3D } from "./render/RenderContext3D"
import { RenderElement } from "./render/RenderElement"
import { SubMeshRenderElement } from "./render/SubMeshRenderElement"
import { RenderableSprite3D } from "./RenderableSprite3D"
import { Sprite3D } from "./Sprite3D"
import { Transform3D } from "./Transform3D"
import { VertexBuffer3D } from "../graphics/VertexBuffer3D"
import { ReflectionProbeMode, ReflectionProbe } from "./reflectionProbe/ReflectionProbe"
import { TextureCube } from "../resource/TextureCube"

/**
 * <code>MeshRenderer</code> 类用于网格渲染器。
 */
export class MeshRenderer extends BaseRender {
	/** @internal */
	protected _revertStaticBatchDefineUV1: boolean = false;
	/** @internal */
	protected _projectionViewWorldMatrix: Matrix4x4;

	/**
	 * 创建一个新的 <code>MeshRender</code> 实例。
	 */
	constructor(owner: RenderableSprite3D) {
		super(owner);
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
	_onMeshChange(mesh: Mesh): void {
		if (mesh) {
			var count: number = mesh.subMeshCount;
			this._renderElements.length = count;
			for (var i: number = 0; i < count; i++) {
				var renderElement: RenderElement = this._renderElements[i];
				if (!renderElement) {
					var material: Material = this.sharedMaterials[i];
					renderElement = this._renderElements[i] = this._createRenderElement();
					renderElement.setTransform(this._owner._transform);
					renderElement.render = this;
					renderElement.material = material ? material : BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
				}
				renderElement.setGeometry(mesh.getSubMesh(i));
			}
		} else {
			this._renderElements.length = 0;
		}
		this._boundsChange = true;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	protected _calculateBoundingBox(): void {
		var sharedMesh: Mesh = ((<MeshSprite3D>this._owner)).meshFilter.sharedMesh;
		if (sharedMesh) {
			var worldMat: Matrix4x4 = ((<MeshSprite3D>this._owner)).transform.worldMatrix;
			sharedMesh.bounds._tranform(worldMat, this._bounds);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
		if (boundFrustum)
			return boundFrustum.intersects(this.bounds._getBoundBox());
		else
			return true;
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
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
				break;
			case RenderElement.RENDERTYPE_STATICBATCH:
				if (transform)
					this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
				else
					this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
				if (!this._shaderValues.hasDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1)) {
					this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV1);
					this._revertStaticBatchDefineUV1 = true;
				}
				else {
					this._revertStaticBatchDefineUV1 = false;
				}
				this._shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, BaseRender._defaultLightmapScaleOffset);
				break;
			case RenderElement.RENDERTYPE_VERTEXBATCH:
				this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
				break;
			case RenderElement.RENDERTYPE_INSTANCEBATCH:
				var worldMatrixData: Float32Array = SubMeshInstanceBatch.instance.instanceWorldMatrixData;
				var insBatches: SingletonList<SubMeshRenderElement> = element.instanceBatchElementList;
				var elements: SubMeshRenderElement[] = insBatches.elements;
				var count: number = insBatches.length;
				for (var i: number = 0; i < count; i++)
					worldMatrixData.set(elements[i]._transform.worldMatrix.elements, i * 16);

				var worldBuffer: VertexBuffer3D = SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer;
				worldBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.   TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
				worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 16 * 4);
				this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
				break;
		}
		//更新反射探针	
		if(!this._probReflection)
		return;
		if(this._reflectionMode==ReflectionProbeMode.off){
			this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
			this._shaderValues.setVector(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS,ReflectionProbe.defaultTextureHDRDecodeValues);
			this._shaderValues.setTexture(RenderableSprite3D.REFLECTIONTEXTURE,TextureCube.blackTexture);
		}
		else{
			if(!this._probReflection.boxProjection){
				this._shaderValues.removeDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
				
			}
			else{
				this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_SPECCUBE_BOX_PROJECTION);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEPOSITION,this._probReflection.probePosition);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMAX,this._probReflection.boundsMax);
				this._shaderValues.setVector3(RenderableSprite3D.REFLECTIONCUBE_PROBEBOXMIN,this._probReflection.boundsMin);
			}
			this._shaderValues.setTexture(RenderableSprite3D.REFLECTIONTEXTURE,this._probReflection.reflectionTexture);
			this._shaderValues.setVector(RenderableSprite3D.REFLECTIONCUBE_HDR_PARAMS,this._probReflection.reflectionHDRParams);
			
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
				// case RenderElement.RENDERTYPE_INSTANCEBATCH:
				// 	var mvpMatrixData: Float32Array = SubMeshInstanceBatch.instance.instanceMVPMatrixData;
				// 	var insBatches: SingletonList<SubMeshRenderElement> = element.instanceBatchElementList;
				// 	var elements: SubMeshRenderElement[] = insBatches.elements;
				// 	var count: number = insBatches.length;
				// 	for (var i: number = 0; i < count; i++) {
				// 		var worldMat: Matrix4x4 = elements[i]._transform.worldMatrix;
				// 		//Utils3D.mulMatrixByArray(projectionView.elements, 0, worldMat.elements, 0, mvpMatrixData, i * 16);
				// 	}
				// 	var mvpBuffer: VertexBuffer3D = SubMeshInstanceBatch.instance.instanceMVPMatrixBuffer;
				// 	mvpBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.  TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
				// 	mvpBuffer.setData(mvpMatrixData.buffer, 0, 0, count * 16 * 4);
				// 	break;
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
	_destroy(): void {
		(this._isPartOfStaticBatch) && (MeshRenderStaticBatchManager.instance._removeRenderSprite(this._owner));
		super._destroy();
	}
}


