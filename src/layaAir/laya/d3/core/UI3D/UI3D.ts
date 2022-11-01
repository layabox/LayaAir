import { Sprite } from "../../../display/Sprite";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Matrix4x4 } from "../../math/Matrix4x4";
import { Ray } from "../../math/Ray";
import { Vector2 } from "../../math/Vector2";
import { Mesh } from "../../resource/models/Mesh";
import { PrimitiveMesh } from "../../resource/models/PrimitiveMesh";
import { BlinnPhongMaterial } from "../material/BlinnPhongMaterial";
import { Material } from "../material/Material";
import { UnlitMaterial } from "../material/UnlitMaterial";
import { BaseRender } from "../render/BaseRender";
import { RenderElement } from "../render/RenderElement";
import { SubMeshRenderElement } from "../render/SubMeshRenderElement";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { UI3DGeometry } from "./UI3DGeometry";

/**
 * <code>BaseCamera</code> 类用于创建摄像机的父类。
 */
export class UI3D extends BaseRender {
    //功能,将2DUI显示到3D面板上 并检测射线
    /**@internal */
    private _uisprite: Sprite;
    /**@internal */
    private _rendertexure2D: RenderTexture2D;
    /**@internal */
    private _geometry: UI3DGeometry;
    /**@internal 2D是否需要重新绘制*/
    private _needUpdate: boolean;

    /**
     * 3D渲染的UI节点
     */
    set sprite(value: Sprite) {
        this._uisprite = value;
        //TODO这里需要传入value设置的width，height
        this._resizeRT(value.width, value.height);
    }

    get sprite() {
        return this._uisprite;
    }

    /**
     * @internal
     */
    set scale(value: Vector2) {
        this._geometry.scale = value;
    }

    /**
     *  @internal
     */
    get scale(): Vector2 {
        return this._geometry.scale;
    }

    /**
     * @internal
     */
    set offset(value: Vector2) {
        this._geometry.offset = value;
    }

    /**
     *  @internal
     */
    get offset(): Vector2 {
        return this._geometry.offset;
    }

    constructor() {
        super();
    }

    /**
     * @internal add renderelement
     */
    private _addRenderElement() {
        var elements: RenderElement[] = this._renderElements;
        var material: Material = (<Material>this.sharedMaterials[0]);
        (material) || (material = BlinnPhongMaterial.defaultMaterial);
        var element: RenderElement = new RenderElement();
        element.setTransform((this.owner as Sprite3D)._transform);
        element.render = this;
        element.material = material;
        this._geometry = new UI3DGeometry(this);
        element.setGeometry(this._geometry);
        elements.push(element);
    }

    private _resizeRT(width: number, height: number) {
        if (!this._rendertexure2D) {
            this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
        } else {
            if (this._rendertexure2D.width == width && this._rendertexure2D.height == height) {
                this._rendertexure2D.destroy();
                this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
            }
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _calculateBoundingBox(): void {
        var worldMat: Matrix4x4 = this._transform.worldMatrix;
        this._geometry.bounds._tranform(worldMat, this._bounds);
    }

    /**
     * 更新Sprite的RT
     */
    _submitRT() {
        //判断是否需要重置
        this._uisprite && this._uisprite.drawToTexture(0, 0, 0, 0, this._rendertexure2D, true);
    }

    /**
     * @internal 
     * @param ray 
     * @returns 
     */
    _checkUIPos(ray: Ray) {
        //TODO

    }

    protected _onAdded(): void {
        super._onAdded();
        this._addRenderElement();
    }


    protected _onDisable(): void {
        super._onDisable();
        (this.owner.scene as Scene3D)._UI3DManager.add(this);
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        (this.owner.scene as Scene3D)._UI3DManager.remove(this);
    }

    /**
     * @internal
     */
    protected _onDestroy() {
        super._onDestroy();
    }

}

