import { Sprite } from "../../../display/Sprite";
import { Event } from "../../../events/Event";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { BaseTexture } from "../../../resource/BaseTexture";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Plane } from "../../math/Plane";
import { Ray } from "../../math/Ray";
import { Picker } from "../../utils/Picker";
import { BlinnPhongMaterial } from "../material/BlinnPhongMaterial";
import { Material } from "../material/Material";
import { BaseRender } from "../render/BaseRender";
import { RenderElement } from "../render/RenderElement";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { UI3DGeometry } from "./UI3DGeometry";

/**
 * <code>BaseCamera</code> 类用于创建摄像机的父类。
 */
export class UI3D extends BaseRender {
    static temp0: Vector3 = new Vector3();
    static temp1: Vector3 = new Vector3();
    static temp2: Vector3 = new Vector3();
    //功能,将2DUI显示到3D面板上 并检测射线
    /**@internal */
    private _uisprite: Sprite;
    /**@internal */
    private _rendertexure2D: RenderTexture2D;
    /**@internal */
    private _geometry: UI3DGeometry;
    /**@internal 2D是否需要重新绘制*/
    private _needUpdate: boolean;
    /**@internal */
    private _uiPlane: Plane;

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

    get UIRender():BaseTexture{
        return this._rendertexure2D;
    }

    constructor() {
        super();
        this._uiPlane = new Plane(new Vector3(), 0);
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
        let hitPoint = Picker.rayPlaneIntersection(ray, this._uiPlane);
        return hitPoint;
    }

    _changePlane() {
        let up = Vector3.Up;
        let right = Vector3.ForwardLH;
        let worldMat = (this.owner as Sprite3D).transform.worldMatrix;
        
    }

    protected _onAdded(): void {
        super._onAdded();
        this._addRenderElement();
        

    }


    protected _onDisable(): void {
        super._onDisable();
        (this.owner.scene as Scene3D)._UI3DManager.remove(this);
        (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED,this,this._changePlane);
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        (this.owner.scene as Scene3D)._UI3DManager.add(this);
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED,this,this._changePlane);
    }

    /**
     * @internal
     */
    protected _onDestroy() {
        super._onDestroy();
    }

}

