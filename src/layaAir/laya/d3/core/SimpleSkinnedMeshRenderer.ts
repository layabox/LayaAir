import { Event } from "../../events/Event";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
import { SubMeshRenderElement } from "./render/SubMeshRenderElement";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { BaseRenderType, IBaseRenderNode, ISimpleSkinRenderNode } from "../../RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { RenderContext3D } from "./render/RenderContext3D";
import { SimpleSkinnedMeshSprite3D } from "./SimpleSkinnedMeshSprite3D";

export class SimpleSkinnedMeshRenderer extends SkinnedMeshRenderer {
    // /**@internal 解决循环引用 */
    // static SIMPLE_SIMPLEANIMATORTEXTURE: number;
    // /**@internal 解决循环引用*/
    // static SIMPLE_SIMPLEANIMATORPARAMS: number;
    // /**@internal 解决循环引用*/
    // static SIMPLE_SIMPLEANIMATORTEXTURESIZE: number;

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

    /**@internal */
    _baseRenderNode: IBaseRenderNode;
    //解决编译bug TODO
    private _ownerSimpleRenderNode: ISimpleSkinRenderNode;

    /**
     * @internal
     * @en The animator texture
     * @zh 动画帧贴图
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
        this._baseRenderNode.shaderData.setTexture(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURE, value);
        value._addReference();
        this._baseRenderNode.shaderData.setNumber(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORTEXTURESIZE, this._simpleAnimatorTextureSize);
    }

    /**
     * @internal
     * @en The animator params
     * @zh 设置动画帧数参数
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


    protected _isISkinRenderNode(): any {
        return null;
    }

    /**
     * @ignore
     * @en Creates an instance of SimpleSkinnedMeshRenderer.
     * @zh 创建一个 SimpleSkinnedMeshRenderer 的实例。
     */
    constructor() {
        super();
        this._simpleAnimatorParams = new Vector4();
        this._simpleAnimatorOffset = new Vector2();
        this._baseRenderNode.shaderData.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_SIMPLEBONE);
        this._baseRenderNode.shaderData.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
        this._baseRenderNode.renderNodeType = BaseRenderType.SimpleSkinRender;
        this._baseRenderNode.shaderData.setVector(SimpleSkinnedMeshSprite3D.SIMPLE_SIMPLEANIMATORPARAMS, new Vector4());
    }

    /**
     * @internal
     * @protected
     * @returns 
     */
    protected _createBaseRenderNode(): IBaseRenderNode {
        this._ownerSimpleRenderNode = Laya3DRender.Render3DModuleDataFactory.createSimpleSkinRenderNode();
        return this._ownerSimpleRenderNode;
    }

    /**
     * @internal
     * @protected
     * @returns 
     */
    protected _getcommonUniformMap(): string[] {
        return ["Sprite3D", "SimpleSkinnedMesh"];
    }

    protected _computeSkinnedData(): void {
        this._computeAnimatorParamsData();
    }

    /**
     * @perfTag PerformanceDefine.T_SkinBoneUpdate
     * @en Update the render state of the skinned mesh.
     * @param context The 3D render context
     * @zh 更新蒙皮网格的渲染状态。
     * @param context 3D 渲染上下文。
     */
    renderUpdate(context: RenderContext3D): void {
        super.renderUpdate(context);
        this._computeSkinnedData();
    }

    /**
     *@inheritDoc
     *@override
     *@internal
     */
    _createRenderElement() {
        let renderelement = new SubMeshRenderElement();
        return renderelement;

    }

    /**
     * @internal
     */
    _computeAnimatorParamsData(): void {
        if (this._cacheMesh) {
            this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
            this._simpleAnimatorParams.y = Math.round(this._simpleAnimatorOffset.y) * this._bonesNums * 4;

            this._ownerSimpleRenderNode.setSimpleAnimatorParams(this._simpleAnimatorParams);
        }
    }

    /**
     * @en Set custom data
     * @param value1 Custom data 1
     * @param value2 Custom data 2
     * @zh 自定义数据
     * @param value1 自定义数据1
     * @param value2 自定义数据1
     */
    setCustomData(value1: number, value2: number = 0) {
        this._simpleAnimatorParams.z = value1;
        this._simpleAnimatorParams.w = value2;
        this._ownerSimpleRenderNode.setSimpleAnimatorParams(this._simpleAnimatorParams);
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
        this._setRenderElements();

    }
    
    /**
     * @internal
     * 克隆到目标
     * @param dest 目标 
     */
    _cloneTo(dest: SimpleSkinnedMeshRenderer): void {
        let render = dest as SimpleSkinnedMeshRenderer;
        render.simpleAnimatorOffset = this.simpleAnimatorOffset;
        render.simpleAnimatorTexture = this.simpleAnimatorTexture;
        render._bonesNums = this._bonesNums;
        super._cloneTo(dest);
    }

    /**
     * @internal
     * @protected
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