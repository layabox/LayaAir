import { Sprite } from "../../../display/Sprite";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { BaseTexture } from "../../../resource/BaseTexture";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Plane } from "../../math/Plane";
import { Ray } from "../../math/Ray";
import { Picker } from "../../utils/Picker";
import { Utils3D } from "../../utils/Utils3D";
import { Material, MaterialRenderMode } from "../material/Material";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { SubMeshRenderElement } from "../render/SubMeshRenderElement";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { UI3DGeometry } from "./UI3DGeometry";
import { Event } from "../../../events/Event";
import { UnlitMaterial } from "../material/UnlitMaterial";

/**
 * <code>BaseCamera</code> 类用于创建摄像机的父类。
 */
export class UI3D extends BaseRender {
    /**@internal */
    static temp0: Vector3 = new Vector3();
    /**@internal */
    static temp1: Vector3 = new Vector3();
    /**@internal */
    static temp2: Vector3 = new Vector3();
    /**@internal */
    static DEBUG: boolean = false;
    //功能,将2DUI显示到3D面板上 并检测射线
    private _shellSprite: Sprite;
    /**@internal UISprite*/
    private _uisprite: Sprite;
    /**@internal */
    private _rendertexure2D: RenderTexture2D;
    /**@internal */
    private _geometry: UI3DGeometry;
    /**@internal 2D是否需要重新绘制*/
    private _needUpdate: boolean;
    /**@internal */
    private _uiPlane: Plane;
    /**@internal */
    private _size: Vector2;
    /**@internal */
    private _offset: Vector2;
    /**@internal */
    private _sizeChange: boolean = true;
    /**@internal */
    private _resolutionRate: number;
    /**@internal */
    private _view: boolean = true;
    /**@internal */
    private _bindPropertyName: string = "u_AlbedoTexture";
    /**@internal */
    private _hit: boolean = false;
    /**@internal */
    private _occlusion: boolean = false;

    /**
     * 3D渲染的UI节点
     */
    set sprite(value: Sprite) {
        if (value == this._uisprite)
            return;

        this._uisprite = value;
        this._shellSprite.removeChildren(0, this._shellSprite.numChildren - 1);
        this._shellSprite.addChild(value);
        this._resizeRT();
    }

    get sprite() {
        return this._uisprite;
    }

    /**
     * UI3DmeshSize
     */
    set UI3DSize(value: Vector2) {
        if (Vector2.equals(value, this._size))
            return;
        value.cloneTo(this._size);
        this._resizeRT();
        this.boundsChange = true;
        this._sizeChange = true;
    }

    get UI3DSize() {
        return this._size;
    }

    /**
     * UI渲染模式
     */
    set renderMode(value: MaterialRenderMode) {
        this.sharedMaterials[0].materialRenderMode = value;
    }


    get renderMode(): number {
        if (!this.sharedMaterials[0])
            this.sharedMaterials[0] = new UnlitMaterial();
        return this.sharedMaterials[0].materialRenderMode;
    }

    /**
     * UI3D偏移
     */
    set UI3DOffset(value: Vector2) {
        if (Vector2.equals(value, this._offset))
            return;
        value.cloneTo(this._offset);
        this.boundsChange = true;
        this._sizeChange = true;
    }

    get UI3DOffset() {
        return this._offset;
    }

    /**
     * 分辨率比例
     */
    get resolutionRate() {
        return this._resolutionRate;
    }

    set resolutionRate(value: number) {
        if (this._resolutionRate == value)
            return
        this._resolutionRate = value;
        this._resizeRT();
    }

    /**
     * 面向相机 模式
     */
    get view() {
        return this._view
    }

    set view(value: boolean) {
        this._view = value;
    }

    /**
     * 检测鼠标事件(关闭优化性能)，开启可以触发鼠标事件
     */
    get enableHit() {
        return this._hit;
    }

    set enableHit(value: boolean) {
        this._hit = value;
    }

    /**
     * 遮挡,碰到2D射线会停止
     */
    get occlusion() {
        return this._occlusion;
    }

    set occlusion(value: boolean) {
        this._occlusion = value;
    }

    /**
     * 实例化一个UI3D
     */
    constructor() {
        super();
        this._uiPlane = new Plane(new Vector3(), 0);
        this._size = new Vector2(1, 1);
        this._offset = new Vector2(0, 0);
        this._resolutionRate = 128;
        this._shellSprite = new Sprite();
        this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
    }

    /**
     * @internal add renderelement
     */
    private _addRenderElement() {
        var elements: RenderElement[] = this._renderElements;
        this._setMaterialTexture();
        var material: Material = (<Material>this.sharedMaterials[0]);
        var element: RenderElement = new RenderElement();
        element.setTransform((this.owner as Sprite3D)._transform);
        element.render = this;
        element.material = material;
        this._geometry = new UI3DGeometry(this);
        element.setGeometry(this._geometry);
        elements.push(element);
    }

    /**
     * @internal
     */
    private _resizeRT() {
        let width = this._size.x * this._resolutionRate;
        let height = this._size.y * this._resolutionRate;
        if (!this._rendertexure2D) {
            this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
        } else {
            if (this._rendertexure2D.width != width || this._rendertexure2D.height != height) {
                this._rendertexure2D.destroy();
                this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
                this._setMaterialTexture();
            }
        }
        this._submitRT();
    }

    /**
     * @internal
     */
    onPreRender(): void {
        //this._geometry
        if (this.view || this._sizeChange) {
            this._sizeChange = false;
            if (this.view) {
                let camera = (this.owner.scene as Scene3D).cullInfoCamera;
                this._geometry._resizeViewVertexData(this._size, this._offset, camera._forward, camera._up, this.view, (this.owner as Sprite3D).transform.position);
            } else {
                this._geometry._resizeWorldVertexData(this._size, this._offset, (this.owner as Sprite3D).transform.worldMatrix);
            }
        }

        //reset plane
        this._updatePlane();
        this._calculateBoundingBox();
    }

    private _updatePlane() {
        let posArray = this._geometry._positionArray;
        Plane.createPlaneBy3P(posArray[0], posArray[1], posArray[2], this._uiPlane);
    }

    /**
    * 分析碰撞点
    * @param hit 
    */
    private _parseHit(hit: Vector3) {
        let WV = UI3D.temp0;
        let HV = UI3D.temp1;
        let Dir = UI3D.temp2;
        let posArray = this._geometry._positionArray;
        if (Utils3D.PointinTriangle(posArray[0], posArray[1], posArray[2], hit) || Utils3D.PointinTriangle(posArray[3], posArray[2], posArray[1], hit)) {
            Vector3.subtract(posArray[2], posArray[3], WV);
            Vector3.subtract(posArray[2], posArray[0], HV);
            Vector3.subtract(posArray[2], hit, Dir);
            Vector3.normalize(WV, WV);
            Vector3.normalize(HV, HV);
            let normalizeHitWidth = Math.abs(Vector3.dot(WV, Dir));    // dot 也就是在宽度上百分比 0 ~ 1
            let normalizeHitHeight = Math.abs(Vector3.dot(HV, Dir));    // dot 这个时在高度上的百分比 0 ~ 1

            // drawCircle to test
            UI3D.DEBUG && this._uisprite && this._shellSprite.graphics.drawCircle(normalizeHitWidth * this._rendertexure2D.width, normalizeHitHeight * this._rendertexure2D.height, 10, "#e53d30");
            //谷主 TODO 绑定2D事件

            return true;
        }
        return false
    }

    /**
     * 获得ui渲染图
     */
    getUITexture(): BaseTexture {
        return this._rendertexure2D;
    }

    /**
     * get camera distance
     * @param rayOri 
     * @returns 
     */
    _getCameraDistane(rayOri: Vector3): number {
        return Vector3.distance(rayOri, (this.owner as Sprite3D).transform.position);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        this._applyLightMapParams();
        this._applyReflection();
        var element: SubMeshRenderElement = <SubMeshRenderElement>context.renderElement;
        // 这里不需要区分，已经将顶点进行转换了直接使用默认矩阵
        this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, Matrix4x4.DEFAULT);
        return;
    }

    /** 
     * @internal
     * 更新Sprite的RT
     */
    _submitRT() {
        //判断是否需要重置
        this._uisprite && this._shellSprite.drawToTexture(this._rendertexure2D.width, this._rendertexure2D.height, 0, 0, this._rendertexure2D, true);
        this._setMaterialTexture();
    }

    /**
     * @internal
     * 设置材质纹理
     */
    _setMaterialTexture() {
        if(!this._sharedMaterials[0])
            this._sharedMaterials[0] = new UnlitMaterial();
        if(!this._sharedMaterials[0].hasDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE)){
            this._sharedMaterials[0].addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this._sharedMaterials[0].setTexture(this._bindPropertyName, this._rendertexure2D);
     }

    /**
     * 检测UI事件
     * @internal 
     * @param ray 
     * @returns 
     */
    _checkUIPos(ray: Ray) {
        if (!this.enableHit)
            return false;
        let hitPoint = Picker.rayPlaneIntersection(ray, this._uiPlane);
        if (hitPoint) {
            return this._parseHit(hitPoint);
        } else {
            return false;
        }
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    protected _calculateBoundingBox(): void {
        var worldMat: Matrix4x4 = this._transform.worldMatrix;
        this._geometry.bounds.cloneTo(this._bounds);
    }

    /**
     * @internal
     */
    protected _onAdded(): void {
        super._onAdded();
        this._addRenderElement();
    }

    /**
     * @internal
     */
    protected _onDisable(): void {
        super._onDisable();
        (this.owner.scene as Scene3D)._UI3DManager.remove(this);
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        (this.owner.scene as Scene3D)._UI3DManager.add(this);
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
    }

    /**
     * @internal
     */
    protected _onDestroy() {
        super._onDestroy();
        (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
    }

    private _transByRotate() {
        if (!this.view)
            this._sizeChange = true;
    }
}

