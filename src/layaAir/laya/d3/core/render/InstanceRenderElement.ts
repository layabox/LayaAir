import { ILaya3D } from "../../../../ILaya3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector4 } from "../../../maths/Vector4";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SingletonList } from "../../../utils/SingletonList";
import { MeshInstanceGeometry } from "../../graphics/MeshInstanceGeometry";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { InstanceRenderElementOBJ } from "../../RenderObjs/RenderObj/InstanceRenderElementOBJ";
import { Mesh } from "../../resource/models/Mesh";
import { Camera } from "../Camera";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { SimpleSkinnedMeshRenderer } from "../SimpleSkinnedMeshRenderer";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { BaseRender } from "./BaseRender";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

export class InstanceRenderElement extends RenderElement {
    /** @internal */
    static maxInstanceCount: number = 1024;
    /**@internal */
    private static _pool: InstanceRenderElement[] = [];

    static create(): InstanceRenderElement {
        let elemet = InstanceRenderElement._pool.length > 0 ? InstanceRenderElement._pool.pop() : new InstanceRenderElement();
        elemet._isInPool = false;
        elemet.clear();
        return elemet;
    }
    /**@internal */
    _instanceBatchElementList: SingletonList<RenderElement>
    /**@internal */
    _isInPool: boolean;
    /**
     * @internal
     * 判断是否需要更新数据 
     * */
    _isUpdataData: boolean;
    /** @internal */
    _invertFrontFace: boolean;
    /**@internal recover renderData*/
    private oriRendertype: number;
    /**@internal */
    private _InvertFront: boolean = false;

    constructor() {
        super();
        this.setGeometry(new MeshInstanceGeometry(null));
        this._instanceBatchElementList = new SingletonList();
        this._isUpdataData = true;
        this._invertFrontFace = false;
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        return this._invertFrontFace;
    }

    set InvertFront(value: boolean) {
        this._InvertFront = value;

    }

    protected _createRenderElementOBJ() {
        this._renderElementOBJ = Laya3DRender.renderOBJCreate.createInstanceRenderElement();
    }

    compileShader(context: IRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
        // this._renderElementOBJ._clearShaderInstance();
        // for (var j: number = 0, m: number = passes.length; j < m; j++) {
        //     var pass: ShaderPass = passes[j];
        //     //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
        //     if (pass._pipelineMode !== context.pipelineMode)
        //         continue;
        //     var comDef: DefineDatas = RenderElement._compileDefine;

        //     // todo
        //     context.sceneShaderData._defineDatas.cloneTo(comDef);
        //     if (this.render) {
        //         comDef.addDefineDatas(this.render._shaderValues._defineDatas);
        //         pass.nodeCommonMap = this.render._commonUniformMap;
        //     } else {
        //         pass.nodeCommonMap = null;
        //     }


        //     comDef.addDefineDatas(this._renderElementOBJ._materialShaderData._defineDatas);
        //     //add Instance Define
        //     comDef.add(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);

        //     var shaderIns: ShaderInstance = pass.withCompile(comDef);
        //     this._renderElementOBJ._addShaderInstance(shaderIns);
        // }
    }


    _renderUpdatePre(context: RenderContext3D) {
        // var sceneMark: number = ILaya3D.Scene3D._updateMark;
        // var transform: Transform3D = this.transform;
        // context.renderElement = this;
        // //model local
        // var modelDataRender: boolean = (!!this.render) ? (sceneMark !== this.render._sceneUpdateMark || this.renderType !== this.render._updateRenderType) : false;
        // if (modelDataRender) {
        //     this.render._renderUpdate(context, transform);
        //     this.render._sceneUpdateMark = sceneMark;
        // }
        // //camera
        // var updateMark: number = Camera._updateMark;
        // if (true) {//此处处理更新为裁剪和合并后的，可避免浪费
        //     this.render._renderUpdateWithCamera(context, transform);
        //     this.oriRendertype = this.render._updateRenderType
        //     this.render._updateMark = updateMark;
        //     this.render._updateRenderType = this.renderType;
        //     if (this._isUpdataData) {
        //         let mesh = (this._geometry as MeshInstanceGeometry).subMesh._mesh;
        //         this.updateInstanceData(mesh);
        //         this._isUpdataData = false;
        //     }
        // }

        // const subUbo = (!!this.render) ? this.render._subUniformBufferData : false;
        // if (subUbo) {
        //     subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
        // }
        // this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
        // this._geometry._updateRenderParams(context);
        // this.compileShader(context._contextOBJ);
        // this._geometry.instanceCount = this._instanceBatchElementList.length;
        // this._renderElementOBJ._invertFront = this.getInvertFront();
    }

    updateInstanceData(mesh: Mesh) {
        // s
    }

    clear() {
        this._instanceBatchElementList.length = 0;
    }
    recover(): void {
        // InstanceRenderElement._pool.push(this);
        // this.render._updateRenderType = this.oriRendertype;
        // this._isInPool = true;
    }
}