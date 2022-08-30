import { Event } from "../../events/Event";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
import { RenderContext3D } from "./render/RenderContext3D";
import { Transform3D } from "./Transform3D";
import { SubMeshRenderElement } from "./render/SubMeshRenderElement";
import { Sprite3D } from "./Sprite3D";
import { RenderElement } from "./render/RenderElement";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
import { Vector4 } from "../math/Vector4";
import { Vector2 } from "../math/Vector2";
import { Component } from "../../components/Component";
import { ShaderDataType } from "../../RenderEngine/RenderShader/ShaderData";

export class SimpleSkinnedMeshRenderer extends SkinnedMeshRenderer {
    /**@internal 解决循环引用 */
    static SIMPLE_SIMPLEANIMATORTEXTURE: number;
    /**@internal 解决循环引用*/
    static SIMPLE_SIMPLEANIMATORPARAMS: number;
    /**@internal 解决循环引用*/
    static SIMPLE_SIMPLEANIMATORTEXTURESIZE: number;

    /**@internal */
    private _simpleAnimatorTexture: Texture2D;
    /**@internal */
    _simpleAnimatorParams: Vector4;
    /**@internal */
    private _simpleAnimatorTextureSize: number;
    /**@internal  x simpleAnimation offset,y simpleFrameOffset*/
    private _simpleAnimatorOffset: Vector2;
    /**@internal */
    _bonesNums: number;

    /**
     * @internal
     * 设置动画帧贴图
     */
    get simpleAnimatorTexture(): Texture2D {
        return this._simpleAnimatorTexture;
    }

    /**
     * @internal
     */
    set simpleAnimatorTexture(value: Texture2D) {
        this._simpleAnimatorTexture = value;
        this._simpleAnimatorTextureSize = value.width;
        this._shaderValues.setTexture(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURE, value);
        value._addReference();
        this._shaderValues.setNumber(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
    }

    /**
     * @internal
     * 设置动画帧数参数
     */
    get simpleAnimatorOffset(): Vector2 {
        return this._simpleAnimatorOffset;
    }

    /**
     * @internal
     */
    set simpleAnimatorOffset(value: Vector2) {
        value.cloneTo(this._simpleAnimatorOffset);
    }


    /**
     * 创建一个 <code>SkinnedMeshRender</code> 实例。
     */
    constructor() {
        super();
        this._simpleAnimatorParams = new Vector4();
        this._simpleAnimatorOffset = new Vector2();
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_SIMPLEBONE);
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
    }

    /**
     *@inheritDoc
     *@override
     *@internal
     */
    _createRenderElement() {
        let renderelement = new SubMeshRenderElement();
        return renderelement as any;
    }

    /**
     * @internal
     */
    _computeAnimatorParamsData(): void {
        if (this._cacheMesh) {
            this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
            this._simpleAnimatorParams.y = Math.round(this._simpleAnimatorOffset.y) * this._bonesNums * 4;
        }
    }

    /**
    *@inheritDoc
    *@override
    *@internal
    */
    _onMeshChange(value: Mesh): void {
        this._onSkinMeshChange(value);
        if (!value)
            return;
        this._cacheMesh = (<Mesh>value);

    }
    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        var element: SubMeshRenderElement = <SubMeshRenderElement>context.renderElement;
        switch (element.renderType) {
            case RenderElement.RENDERTYPE_NORMAL:
                if (this.rootBone) {
                    var worldMat: Matrix4x4 = (this.rootBone as Sprite3D).transform.worldMatrix;
                    if (this._subUniformBufferData) {
                        let oriMat = this._shaderValues.getMatrix4x4(Sprite3D.WORLDMATRIX);
                        this._subUniformBufferData._needUpdate = oriMat ? !oriMat.equalsOtherMatrix(worldMat) : true;
                    }
                    this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, worldMat);
                } else {
                    this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, transform.worldMatrix);
                }
                this._computeAnimatorParamsData();
                this._shaderValues.setVector(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORPARAMS, this._simpleAnimatorParams);
                break;
        }
    }
    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
    }

    _cloneTo(dest: Component): void {
        let render = dest as SimpleSkinnedMeshRenderer;
        render.simpleAnimatorOffset = this.simpleAnimatorOffset;
        render.simpleAnimatorTexture = this.simpleAnimatorTexture;
        render._bonesNums = this._bonesNums;
        super._cloneTo(dest);
    }

    /**
     * 删除节点
     */
    protected _onDestroy() {
        if (this._cacheRootBone)
            (!this._cacheRootBone._destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        (this._simpleAnimatorTexture) && this._simpleAnimatorTexture._removeReference();
        this._simpleAnimatorTexture = null;
        super._onDestroy();
    }
}