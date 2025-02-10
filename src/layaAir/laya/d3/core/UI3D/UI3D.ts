import { Sprite } from "../../../display/Sprite";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector2 } from "../../../maths/Vector2";
import { Vector3 } from "../../../maths/Vector3";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { BaseTexture } from "../../../resource/BaseTexture";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Ray } from "../../math/Ray";
import { Material, MaterialRenderMode } from "../../../resource/Material";
import { MeshSprite3DShaderDeclaration } from "../MeshSprite3DShaderDeclaration";
import { BaseRender } from "../render/BaseRender";
import { RenderElement } from "../render/RenderElement";
import { Scene3D } from "../scene/Scene3D";
import { Sprite3D } from "../Sprite3D";
import { UI3DGeometry } from "./UI3DGeometry";
import { Event } from "../../../events/Event";
import { UnlitMaterial } from "../material/UnlitMaterial";
import { Prefab } from "../../../resource/HierarchyResource";
import { InputManager } from "../../../events/InputManager";
import { NodeFlags } from "../../../Const";
import { ILaya } from "../../../../ILaya";
import { RenderContext3D } from "../render/RenderContext3D";
import { Vector4 } from "../../../maths/Vector4";
import { LayaEnv } from "../../../../LayaEnv";
import { IRenderContext3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { LayaGL } from "../../../layagl/LayaGL";
import { Camera } from "../Camera";
import { Quaternion } from "../../../maths/Quaternion";
import { Utils } from "../../../utils/Utils";

/**
 * @en UI3D class, used to create 3D UI components.
 * @zh UI3D类，用于创建3D UI组件。
 */
export class UI3D extends BaseRender {

    /**@internal */
    static DEBUG: boolean = false;
    /**@internal */
    static _ray: Ray = new Ray(new Vector3(), new Vector3());

    //功能,将2DUI显示到3D面板上 并检测射线
    private _shellSprite: Sprite;
    /** UISprite*/
    private _uisprite: Sprite;

    private _ui3DMat: Material;

    private _rendertexure2D: RenderTexture2D;

    private _geometry: UI3DGeometry;

    private _size: Vector2;

    private _sizeChange: boolean = true;

    private _resolutionRate: number;

    private _view: boolean = true;

    private _bindPropertyName: string = "u_AlbedoTexture";

    private _hit: boolean = false;

    private _prefab: Prefab;
    /** 计算矩阵*/
    private _matrix: Matrix4x4;
    /** 缩放 */
    private _scale: Vector3;

    private _cameraSpace: boolean = false;

    private _camera: Camera;


    protected _worldParams: Vector4 = new Vector4();

    private _cameraPlaneDistance: number;

    /**
     * @en UI nodes for 3D rendering
     * @zh 3D渲染的UI节点
     */
    get sprite() {
        return this._uisprite;
    }

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

    /**
     * IDE
     * @en The 3D rendering UI prefab.
     * @zh 3D渲染的UI预制体。
     */
    get prefab() {
        return this._prefab;
    }

    set prefab(value: Prefab) {
        this._prefab = value;
        if (value)
            this.sprite = <Sprite>value.create();
        else
            this.sprite = null;
    }


    /**
     * @en Mesh scale for 3D UI.
     * @zh 3D UI的网格缩放。
     */
    get scale() {
        return this._size;
    }

    set scale(value: Vector2) {
        if (value.x <= 0 || value.y <= 0 || (Vector2.equals(value, this._size)))
            return;
        value.cloneTo(this._size);
        this._resizeRT();
        this.boundsChange = true;
        this._scale.setValue(value.x, value.y, 1);
    }



    /**
     * @en The UI render mode.
     * @zh UI渲染模式。
     */
    get renderMode(): MaterialRenderMode {
        if (!this.sharedMaterial)
            this.sharedMaterial = this._ui3DMat;
        return this.sharedMaterial.materialRenderMode;
    }

    set renderMode(value: MaterialRenderMode) {
        this.sharedMaterial.materialRenderMode = value;
        this.boundsChange = true;
    }


    /**
     * @en The UI culling mode.
     * @zh UI剔除模式。
     */
    get cull(): number {
        let mat = this.sharedMaterial;
        if (!mat) {
            mat = this._ui3DMat;
        }
        return mat.cull;
    }

    set cull(value: number) {
        this.sharedMaterial && (this.sharedMaterial.cull = value);
    }


    /**
     * @en The resolution rate.
     * @zh 分辨率比例。
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
     * @en The UI3D component is billboard mode.
     * @zh 面向相机模式
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
     * @en Detect mouse events, disable optimization performance, enable to trigger mouse events.
     * @zh 检测鼠标事件，关闭优化性能，开启可以触发鼠标事件
     */
    get enableHit() {
        return this._hit;
    }

    set enableHit(value: boolean) {
        this._hit = value;
    }

    /**
     * @en use the mode that fits the camera
     * @zh 是否使用贴合相机的模式
     */
    set cameraSpace(value: boolean) {
        if (this._cameraSpace == value) {
            return;
        }
        this._cameraSpace = value;
        this._resizeRT();
    }
    get cameraSpace() {
        return this._cameraSpace;
    }

    /**
     * @en In cameraSpace mode, the distance from the camera
     * @zh cameraSpace模式下，距离相机的距离
     */
    set cameraPlaneDistance(value: number) {
        value = Math.max(0, value);
        this._cameraPlaneDistance = value;

    }
    get cameraPlaneDistance() {
        return this._cameraPlaneDistance;
    }

    /**
     * @en Camera bind in cameraSpace mode
     * @zh cameraSpace模式下绑定的相机
     */
    set attachCamera(value: Camera) {
        if (this._camera == value)
            return;
        this._camera = value;
        this._resizeRT();
    }

    get attachCamera() {
        return this._camera;
    }


    /** @ignore 
     * @en constructor method, initialize 3D UI.
     * @zh 构造方法，初始化3D UI。
    */
    constructor() {
        super();
        this._size = new Vector2(1, 1);
        this._resolutionRate = 128;
        this._shellSprite = new Sprite();
        this._shellSprite.name = "UI3D";
        this._shellSprite._setBit(NodeFlags.DISPLAYED_INSTAGE, true);
        this._shellSprite._setBit(NodeFlags.ACTIVE_INHIERARCHY, true);
        this._shellSprite._parent = ILaya.stage;
        this._baseRenderNode.shaderData.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);

        this._matrix = new Matrix4x4();
        this._scale = new Vector3(1.0, 1.0, 1.0);
    }

    private _creatDefaultMat() {
        if (this._ui3DMat) return;
        this._ui3DMat = new UnlitMaterial();
        this._ui3DMat.materialRenderMode = MaterialRenderMode.RENDERMODE_OPAQUE;
        this._ui3DMat.cull = RenderState.CULL_BACK;
    }

    /**
     * @internal add renderelement
     */
    private _addRenderElement() {
        var elements: RenderElement[] = this._renderElements;
        if (!this.sharedMaterial) {
            this._creatDefaultMat();
            this.sharedMaterial = this._ui3DMat;
        }
        this._setMaterialTexture();
        var material: Material = this.sharedMaterial;
        var element: RenderElement = new RenderElement();
        element.setTransform(this.owner._transform);
        element.render = this;
        element.material = material;
        element.renderSubShader = element.material.shader.getSubShaderAt(0);
        this._geometry = new UI3DGeometry(this);
        element.setGeometry(this._geometry);
        elements.push(element);

        this._setRenderElements();

        this.geometryBounds = this._geometry.bounds;
    }

    private _isCameraSpaceMode() {
        return this._cameraSpace && this._camera;
    }

    /**
   * 分析碰撞点
   * @param hit 
   */
    private _parseHit(ray: Ray) {
        let _tempRay = UI3D._ray;
        let u, v;
        if (!this._uisprite || !LayaEnv.isPlaying) return null;
        this._matrix.invert(tempMatrix);
        Vector3.transformCoordinate(ray.origin, tempMatrix, _tempRay.origin);
        Vector3.TransformNormal(ray.direction, tempMatrix, _tempRay.direction);
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
     * @internal
     */
    private _resizeRT() {
        let width;
        let height;
        if (this._isCameraSpaceMode()) {
            width = this._camera.viewport.width;
            height = this._camera.viewport.height;
        } else {
            width = this._size.x * this._resolutionRate;
            height = this._size.y * this._resolutionRate;
        }
        let invertY = !LayaGL.renderEngine._screenInvertY;

        if (!this._rendertexure2D) {
            this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
            this._rendertexure2D._invertY = invertY;
        } else {
            if (this._rendertexure2D.width != width || this._rendertexure2D.height != height) {
                this._rendertexure2D.destroy();
                this._rendertexure2D = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
                this._rendertexure2D._invertY = invertY;
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
        if (this._isCameraSpaceMode()) {
            this.boundsChange = true;
            let cameraforward = Vector3.TEMP;
            let rotate = Quaternion.TEMP;
            let scale = tempVec3;
            let camera = this._camera;
            camera.transform.getForward(cameraforward);
            cameraforward = cameraforward.normalize()
            Vector3.scale(cameraforward, this._cameraPlaneDistance, cameraforward);
            Vector3.add(camera.transform.position, cameraforward, cameraforward);
            camera.transform.rotation.cloneTo(rotate);
            if (camera.orthographic) {
                scale.setValue(camera.orthographicVerticalSize * camera.aspectRatio, camera.orthographicVerticalSize, 1);
            } else {

                let height = Math.tan(Utils.toRadian(camera.fieldOfView / 2)) * this._cameraPlaneDistance * 2;
                scale.setValue(height * camera.aspectRatio, height, 1);
            }
            Matrix4x4.createAffineTransformation(cameraforward, rotate, scale, this._matrix);
        } else {
            if (this.billboard) {
                this._sizeChange = false;
                let camera = this.owner.scene.cullInfoCamera;
                Matrix4x4.createAffineTransformation(this._transform.position, camera.transform.rotation, this._scale, this._matrix);
            } else if (this._sizeChange) {
                this._sizeChange = false;
                this._transform.worldMatrix.cloneTo(this._matrix);
            }
        }
    }



    /**
     * @en Get the UI rendering texture.
     * @zh 获得ui渲染图
     */
    getUITexture(): BaseTexture {
        return this._rendertexure2D;
    }

    /**
     * @internal
     * get camera distance
     * @param rayOri 
     * @returns 
     */
    _getCameraDistance(rayOri: Vector3): number {
        return Vector3.distance(rayOri, this.owner.transform.position);
    }

    /**
     * @internal
     */
    _renderUpdate(context: IRenderContext3D): void {
        let shaderData = this._baseRenderNode.shaderData;
        shaderData.setMatrix4x4(Sprite3D.WORLDMATRIX, this._matrix);
        let transform = this.owner.transform;
        let worldParams = this._worldParams;
        worldParams.x = transform.getFrontFaceValue();
        shaderData.setVector(Sprite3D.WORLDINVERTFRONT, worldParams);
    }

    /**
     * @internal
     * @param context 
     */
    renderUpdate(context: RenderContext3D): void {
        this._renderElements.forEach(element => {
            let geometry = element._geometry;
            element._renderElementOBJ.isRender = geometry._prepareRender(context);
            geometry._updateRenderParams(context)
        })
    }

    /** 
     * @internal
     * 更新Sprite的RT
     */
    _submitRT() {
        //判断是否需要重置
        if (this._shellSprite._needRepaint()) {
            this._rendertexure2D && this._shellSprite.drawToRenderTexture2D(this._rendertexure2D.width, this._rendertexure2D.height, 0, 0, this._rendertexure2D, false);
            this._setMaterialTexture();
        }
    }

    /**
     * @internal
     * 设置材质纹理
     */
    _setMaterialTexture() {
        if (this._rendertexure2D) {
            this.sharedMaterial.addDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE);
            this.sharedMaterial.setTexture(this._bindPropertyName, this._rendertexure2D);
        } else {
            this.sharedMaterial.removeDefine(UnlitMaterial.SHADERDEFINE_ALBEDOTEXTURE)
        }


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
     * @internal
     */
    _calculateBoundingBox(): void {
        //var worldMat: Matrix4x4 = this._transform.worldMatrix;
        this._geometry.bounds._tranform(this._matrix, this._bounds);
    }

    protected _onAdded(): void {
        super._onAdded();
        this._addRenderElement();
    }
    protected _onDisable(): void {
        super._onDisable();
        this.owner.transform.off(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
        this.owner.scene._UI3DManager.remove(this);
    }
    protected _onEnable(): void {
        super._onEnable();
        this.owner.scene._UI3DManager.add(this);
        this.owner.transform.on(Event.TRANSFORM_CHANGED, this, this._transByRotate);//如果为合并BaseRender,owner可能为空
        this._transByRotate();
    }

    protected _onDestroy() {
        super._onDestroy();
        this._rendertexure2D && this._rendertexure2D.destroy();
        this._shellSprite && (this._shellSprite._parent = null);
        this._uisprite && this._uisprite.destroy();
        this._shellSprite && this._shellSprite.destroy();
        this._ui3DMat && this._ui3DMat.destroy();
        this._resolutionRate = null;
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

const tempMatrix = new Matrix4x4();
const tempVec3 = new Vector3();