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
import { Material, MaterialRenderMode } from "../../../resource/Material";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { BaseRender } from "../render/BaseRender";
import { RenderContext3D } from "../render/RenderContext3D";
import { RenderElement } from "../render/RenderElement";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { Transform3D } from "../Transform3D";
import { UI3DGeometry } from "./UI3DGeometry";
import { Event } from "../../../events/Event";
import { UnlitMaterial } from "../material/UnlitMaterial";
import { Prefab } from "../../../resource/HierarchyResource";
import { InputManager } from "../../../events/InputManager";
import { NodeFlags } from "../../../Const";
import { ILaya } from "../../../../ILaya";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { LayaEnv } from "../../../../LayaEnv";

/**
 * <code>BaseCamera</code> 类用于创建摄像机的父类。
 */
export class UI3D extends BaseRender {
    /**@intrtnal */
    static TempMatrix = new Matrix4x4();
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
    private _ui3DMat: Material;
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
    private _prefab: Prefab;
    /**@internal 计算矩阵*/
    private _matrix: Matrix4x4;
    /**@internal 缩放 */
    private _scale: Vector3;
    /**@internal */
    static _ray: Ray = new Ray(new Vector3(), new Vector3());

    /**
     * 3D渲染的UI节点
     */
    set sprite(value: Sprite) {
        if (value == this._uisprite)
            return;
        this._uisprite = value;
        this._shellSprite.removeChildren(0, this._shellSprite.numChildren - 1);
        if (value)
            this._shellSprite.addChild(value);
        this._resizeRT();
        this.boundsChange = true;
    }

    get sprite() {
        return this._uisprite;
    }

    /**
     * IDE
     * 3D渲染的UI预制体
     */
    set prefab(value: Prefab) {
        this._prefab = value;
        if (value)
            this.sprite = <Sprite>value.create();
        else
            this.sprite = null;
    }

    get prefab() {
        return this._prefab;
    }

    /**
     * UI3DmeshScale
     */
    set scale(value: Vector2) {
        if (value.x <= 0 || value.y <= 0)
            return;
        value.cloneTo(this._size);
        this._resizeRT();
        this.boundsChange = true;
        this._scale.setValue(value.x, value.y, 1);
    }

    get scale() {
        return this._size;
    }

    /**
     * UI渲染模式
     */
    set renderMode(value: MaterialRenderMode) {
        this.sharedMaterial.materialRenderMode = value;
        this.boundsChange = true;
    }


    get renderMode(): MaterialRenderMode {
        if (!this.sharedMaterial)
            this.sharedMaterial = this._ui3DMat;
        return this.sharedMaterial.materialRenderMode;
    }

    /**
     * UI剔除模式
     */
    set cull(value: number) {
        this.sharedMaterial && (this.sharedMaterial.cull = value);
    }


    get cull(): number {
        let mat = this.sharedMaterial;
        if (!mat) {
            mat = this._ui3DMat;
        }
        return mat.cull;
    }


    /**
     * 分辨率比例
     */
    get resolutionRate() {
        return this._resolutionRate;
    }

    set resolutionRate(value: number) {
        if (value <= 0)
            return
        if (this._resolutionRate == value)
            return
        this._resolutionRate = value;
        this._resizeRT();
    }

    /**
     * 面向相机模式
     */
    get billboard() {
        return this._view;
    }

    set billboard(value: boolean) {
        this._view = value;
        this._sizeChange = true;
        this.boundsChange = true;
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
     * 实例化一个UI3D
     */
    constructor() {
        super();
        this._uiPlane = new Plane(new Vector3(), 0);
        this._size = new Vector2(1, 1);
        this._resolutionRate = 128;
        this._shellSprite = new Sprite();
        this._shellSprite.name = "UI3D";
        this._shellSprite._setBit(NodeFlags.DISPLAYED_INSTAGE, true);
        this._shellSprite._setBit(NodeFlags.ACTIVE_INHIERARCHY, true);
        this._shellSprite._parent = ILaya.stage;
        this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
        this._ui3DMat = new UnlitMaterial();
        this._ui3DMat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
        this._ui3DMat.cull = RenderState.CULL_BACK;
        this._matrix = new Matrix4x4();
        this._scale = new Vector3(1.0, 1.0, 1.0);
    }

    /**
     * @internal add renderelement
     */
    private _addRenderElement() {
        var elements: RenderElement[] = this._renderElements;
        this._setMaterialTexture();
        var material: Material = (<Material>this.sharedMaterial);
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
            this._rendertexure2D._invertY = true;
        } else {
            if (this._rendertexure2D.width != width || this._rendertexure2D.height != height) {
                this._rendertexure2D.destroy();
                this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
                this._rendertexure2D._invertY = true;
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
        if (this.billboard) {
            this._sizeChange = false;
            let camera = (this.owner.scene as Scene3D).cullInfoCamera;
            Matrix4x4.createAffineTransformation(this._transform.position, camera.transform.rotation, this._scale, this._matrix);
        } else if (this._sizeChange) {
            this._sizeChange = false;
            this._transform.worldMatrix.cloneTo(this._matrix);
        }
    }

    /**
    * 分析碰撞点
    * @param hit 
    */
    private _parseHit(ray: Ray) {
        let _tempRay = UI3D._ray;
        let u, v;
        if (!this._uisprite || !LayaEnv.isPlaying) return null;
        this._matrix.invert(UI3D.TempMatrix);
        Vector3.transformCoordinate(ray.origin, UI3D.TempMatrix, _tempRay.origin);
        Vector3.TransformNormal(ray.direction, UI3D.TempMatrix, _tempRay.direction);
        _tempRay.direction.normalize();

        let normalizeHitWidth = 0;
        let normalizeHitHeight = 0;

        let t = -_tempRay.origin.z / _tempRay.direction.z;
        if (t < 0) {
            return null;
        }
        else {
            u = _tempRay.origin.x + t * _tempRay.direction.x;
            v = _tempRay.origin.y + t * _tempRay.direction.y;
        }

        normalizeHitWidth = u + 0.5;
        normalizeHitHeight = v + 0.5;

        let cx = normalizeHitWidth * this._rendertexure2D.width;
        let cy = (1.0 - normalizeHitHeight) * this._rendertexure2D.height;

        // drawCircle to test
        // UI3D.DEBUG && this._uisprite && this._shellSprite.graphics.drawCircle(cx, cy, 10, "#e53d30");

        let target = InputManager.inst.getSpriteUnderPoint(this._uisprite, cx, cy);
        if (target)
            return target;
        else
            return null;
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
    _getCameraDistance(rayOri: Vector3): number {
        return Vector3.distance(rayOri, (this.owner as Sprite3D).transform.position);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    _renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        this._applyReflection();
        this._setShaderValue(Sprite3D.WORLDMATRIX, ShaderDataType.Matrix4x4, this._matrix);
        this._worldParams.x = transform.getFrontFaceValue();
        this._setShaderValue(Sprite3D.WORLDINVERTFRONT, ShaderDataType.Vector4, this._worldParams);
    }

    /** 
     * @internal
     * 更新Sprite的RT
     */
    _submitRT() {
        //判断是否需要重置
        this._rendertexure2D && this._shellSprite.drawToTexture(this._rendertexure2D.width, this._rendertexure2D.height, 0, 0, this._rendertexure2D);
        this._setMaterialTexture();
    }

    /**
     * @internal
     * 设置材质纹理
     */
    _setMaterialTexture() {
        if (!this.sharedMaterial)
            this.sharedMaterial = this._ui3DMat;
        if (!this.sharedMaterial.hasDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE)) {
            this.sharedMaterial.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
        }
        this.sharedMaterial.setTexture(this._bindPropertyName, this._rendertexure2D);
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
        return this._parseHit(ray);
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
        (this.owner as Sprite3D).transform.off(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
        (this.owner.scene as Scene3D)._UI3DManager.remove(this);
    }

    /**
     * @internal
     */
    protected _onEnable(): void {
        super._onEnable();
        (this.owner.scene as Scene3D)._UI3DManager.add(this);
        (this.owner as Sprite3D).transform.on(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
        this._transByRotate();
    }

    /**
     * @internal
     */
    protected _onDestroy() {
        super._onDestroy();
        this._rendertexure2D && this._rendertexure2D.destroy();
        this._uisprite && this._uisprite.destroy();
        this._shellSprite && this._shellSprite.destroy();
        this._ui3DMat && this._ui3DMat.destroy();
        this._resolutionRate = null;
        this._uiPlane = null;
        this._size = null;
        this._scale = null;
        this._matrix = null;
    }

    private _transByRotate() {
        if (!this.billboard) {
            this._sizeChange = true;
        }
        this.boundsChange = true;
    }
}

