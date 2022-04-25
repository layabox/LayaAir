import { ILaya3D } from "../../../../ILaya3D";
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { SingletonList } from "../../component/SingletonList";
import { MeshInstanceGeometry } from "../../graphics/MeshInstanceGeometry";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Vector4 } from "../../math/Vector4";
import { Mesh } from "../../resource/models/Mesh";
import { SubMesh } from "../../resource/models/SubMesh";
import { ShaderInstance } from "../../shader/ShaderInstance";
import { ShaderPass } from "../../shader/ShaderPass";
import { Camera } from "../Camera";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { SimpleSkinnedMeshRenderer } from "../SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "./BaseRender";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

export class InstanceRenderElement extends RenderElement{
    /** @internal */
	static maxInstanceCount: number = 1024;
    /**@internal */
    private static _pool: InstanceRenderElement[] = [];
    
    static create():InstanceRenderElement{
        let elemet = InstanceRenderElement._pool.length > 0 ? InstanceRenderElement._pool.pop() : new InstanceRenderElement();
        elemet._isInPool =false;
        return elemet;
    }
    /**@internal */
    _instanceBatchElementList:SingletonList<RenderElement>
    /**@internal */
    _isInPool:boolean;

    
    constructor(){
        super();
        this.setGeometry(new MeshInstanceGeometry(null));
        this._instanceBatchElementList = new SingletonList();
    }

    compileShader(context: IRenderContext3D) {
		var passes: ShaderPass[] = this._subShader._passes;
		this._renderElementOBJ._clearShaderInstance();
		for (var j: number = 0, m: number = passes.length; j < m; j++) {
			var pass: ShaderPass = passes[j];
			//NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
			if (pass._pipelineMode !== context.pipelineMode)
				continue;
			var comDef: DefineDatas = RenderElement._compileDefine;
			context.sceneShaderData._defineDatas.cloneTo(comDef);
			this.render && comDef.addDefineDatas(this.render._shaderValues._defineDatas);
			
			comDef.addDefineDatas(this._renderElementOBJ._materialShaderData._defineDatas);
            //add Instance Define
            comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
			
            var shaderIns: ShaderInstance = pass.withCompile(comDef);
			this._renderElementOBJ._addShaderInstance(shaderIns);
		}
	}


    _renderUpdatePre(context: RenderContext3D) {

		var sceneMark: number = ILaya3D.Scene3D._updateMark;
		var transform: Transform3D = this.transform;
		context.renderElement = this;
		//model local
		var modelDataRender: boolean = (!!this.render) ? (sceneMark !== this.render._sceneUpdateMark || this.renderType !== this.render._updateRenderType) : false;
		if (modelDataRender) {
			this.render._renderUpdate(context, transform);
			this.render._sceneUpdateMark = sceneMark;
            //Update Instance Data
            let mesh = (this._geometry as MeshInstanceGeometry).subMesh._mesh;
            this.updateInstanceData(mesh);
		}
		//camera
		var updateMark: number = Camera._updateMark;
		var updateRender: boolean = (!!this.render) ? (updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType) : false;
		if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
			this.render._renderUpdateWithCamera(context, transform);
			this.render._updateMark = updateMark;
			this.render._updateRenderType = this.renderType;
		}

		const subUbo = (!!this.render) ? this.render._subUniformBufferData : false;
		if (subUbo) {
			subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
		}
		//context.shader = this._renderElementOBJ._subShader;
		this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
		this._geometry._updateRenderParams(context);
		this.compileShader(context._contextOBJ);
        this._geometry.instanceCount = this._instanceBatchElementList.length;
	}

    updateInstanceData(mesh:Mesh){
        mesh._setInstanceBuffer();
        this._geometry.bufferState = mesh._instanceBufferState;
        switch (mesh._instanceBufferStateType) {
			case Mesh.MESH_INSTANCEBUFFER_TYPE_SIMPLEANIMATOR:
                var worldMatrixData: Float32Array = mesh.instanceWorldMatrixData;
				var insBatches = this._instanceBatchElementList;
				var elements = insBatches.elements;
                var count: number = insBatches.length;
                let bone = (elements[0].render as SimpleSkinnedMeshRenderer).rootBone;
                if(bone){
                    for (var i: number = 0; i < count; i++) {
                        var mat: Matrix4x4 = (((elements[i].render) as SimpleSkinnedMeshRenderer).rootBone as Sprite3D)._transform.worldMatrix;
                        worldMatrixData.set(mat.elements, i * 16);
                    }
                }
                else {
                    for (var i: number = 0; i < count; i++)
                        worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);
                }
                var worldBuffer: VertexBuffer3D = mesh._instanceWorldVertexBuffer;
                worldBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.   TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
                worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 16 * 4);
                var simpleAnimatorData: Float32Array = mesh.instanceSimpleAnimatorData;
                if (bone) {
                    for (var i: number = 0; i < count; i++) {
                        var render: SimpleSkinnedMeshRenderer = (elements[i].render) as SimpleSkinnedMeshRenderer;
                        render._computeAnimatorParamsData();
                        var simpleAnimatorParams: Vector4 = render._simpleAnimatorParams;
                        var offset: number = i * 4;
                        simpleAnimatorData[offset] = simpleAnimatorParams.x;
                        simpleAnimatorData[offset + 1] = simpleAnimatorParams.y;
                    }
                }
                else {
                    for (var i: number = 0; i < count; i++) {
                        simpleAnimatorData[offset] = 0;
                        simpleAnimatorData[offset + 1] = 0;
                    }
                }
                var simpleAnimatorBuffer: VertexBuffer3D = mesh._instanceSimpleAniVertexBuffer;
                simpleAnimatorBuffer.orphanStorage();
                simpleAnimatorBuffer.setData(simpleAnimatorData.buffer, 0, 0, count * 4 * 4);
                break;
            case Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL:
                var worldMatrixData: Float32Array = mesh.instanceWorldMatrixData;
                var insBatches = this._instanceBatchElementList;
                var elements: RenderElement[] = insBatches.elements;
                var count: number = insBatches.length;
                for (var i: number = 0; i < count; i++)
                    worldMatrixData.set(elements[i].transform.worldMatrix.elements, i * 16);
                var worldBuffer: VertexBuffer3D = mesh._instanceWorldVertexBuffer;
                worldBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.   TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
                worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 16 * 4);
                break;

        }
    }

    recover(): void {
        InstanceRenderElement._pool.push(this);
        this._isInPool = true;
    }
}