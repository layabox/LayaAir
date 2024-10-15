import { LayaGL } from "../../layagl/LayaGL";
import { Matrix3x3 } from "../../maths/Matrix3x3";
import { Point } from "../../maths/Point";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { RenderTexture } from "../../resource/RenderTexture";
import { RenderState2D } from "../../webgl/utils/RenderState2D";
import { Node } from "../Node";
import { Scene } from "../Scene";
import { Sprite } from "../Sprite";
export enum AnchoreMode {
    DragCenter,
    FixedTopLeft
}
export class Camera2D extends Sprite {
    /**@internal */
    static shaderValueInit() {
        if (!Scene.scene2DUniformMap) {
            //Scene.scene2DUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("scene2D");
            Scene.scene2DUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal"); //名称保持一致 //兼容Light2D
        }
        let scene2DUniformMap = Scene.scene2DUniformMap;
        Camera2D.VIEW2D = Shader3D.propertyNameToID("u_view2D");
        scene2DUniformMap.addShaderUniform(Camera2D.VIEW2D, "u_view2D", ShaderDataType.Matrix3x3);
        Camera2D.SHADERDEFINE_CAMERA2D = Shader3D.getDefineByName("CAMERA2D");
    }
    /**@internal */
    static VIEW2D: number;
    /**@internal */
    static SHADERDEFINE_CAMERA2D: ShaderDefine;
    /**@internal */
    private _cameraPos: Vector2 = new Vector2();
    /**@internal */
    private _cameraSmoothPos: Vector2 = new Vector2();
    /**@internal */
    private _firstUpdate: boolean = true;
    /**@internal */
    private _cameraMatrix: Matrix3x3 = new Matrix3x3();
    /**@internal */
    private _cameraInvertMatrix: Matrix3x3 = new Matrix3x3();
    /**@internal */
    private _ignoreRotation: boolean = true;
    /**@internal */
    private _limit_Left: number;
    /**@internal */
    private _limit_Right: number;
    /**@internal */
    private _limit_Buttom: number;
    /**@internal */
    private _limit_Top: number;
    /**@internal */
    private _dragHorizontalEnable: boolean;
    /**@internal */
    private _dragVerticalEnable: boolean;
    /**@internal */
    private _drag_Left: number;//0-1
    /**@internal */
    private _drag_Right: number;
    /**@internal */
    private _drag_Top: number;
    /**@internal */
    private _drag_Bottom: number;
    /**@internal */
    private _positionSmooth: boolean;
    /**@internal */
    private _positionSpeed: number;//
    /**@internal TODO*/
    _renderTarget: RenderTexture;
    /**@internal */
    _isMain: boolean;
    /**@internal */
    _cameraRotation: number;//angle 


    /**
     * @en Whether to ignore rotation, if the value is true, the rotation value of camera2d will always be 0
     * @returns The x coordinate value.
     * @zh 是否忽略旋转，如果值是true，camera2d的旋转值始终为0
     * @returns 忽略旋转的值
     */
    public get ignoreRotation(): boolean {
        return this._ignoreRotation;
    }
    public set ignoreRotation(value: boolean) {
        this._ignoreRotation = value;
    }

    /**
    * @en Scnene's main camera? Only one main camera can be used in a scene
    * @returns value
    * @zh cnene的主摄像机，一个Scene中只能由一个主摄像机
    * @returns 是否为主相机
    */
    public get isMain(): boolean {
        return this._isMain;
    }
    public set isMain(value: boolean) {
        if (this.scene) {
            if (value) {
                this.scene._specialManager._setMainCamera(this);
            }
            else {
                (this.scene._specialManager._mainCamera == this) && this.scene._specialManager._setMainCamera(null);
            }
        } else {
            this._isMain = value;
        }
    }

    /**@internal TODO*/
    zoom: Vector2;
    /**@internal */
    _rect: Vector4;


    public get limit_Left(): number {
        return this._limit_Left;
    }

    public set limit_Left(value: number) {
        this._limit_Left = value;
    }

    public get limit_Right(): number {
        return this._limit_Right;
    }

    public set limit_Right(value: number) {
        this._limit_Right = value;
    }

    public get limit_Buttom(): number {
        return this._limit_Buttom;
    }

    public set limit_Buttom(value: number) {
        this._limit_Buttom = value;
    }

    public get limit_Top(): number {
        return this._limit_Top;
    }

    public set limit_Top(value: number) {
        this._limit_Top = value;
    }

    public get positionSmooth(): boolean {
        return this._positionSmooth;
    }
    public set positionSmooth(value: boolean) {
        this._positionSmooth = value;
    }

    public get positionSpeed(): number {
        return this._positionSpeed;
    }
    public set positionSpeed(value: number) {
        this._positionSpeed = value;
    }

    rotationSmooth: boolean;//TODO
    rotationSpeed: number;//0-1

    public get dragHorizontalEnable(): boolean {
        return this._dragHorizontalEnable;
    }

    public set dragHorizontalEnable(value: boolean) {
        this._dragHorizontalEnable = value;
    }

    public get dragVerticalEnable(): boolean {
        return this._dragVerticalEnable;
    }
    public set dragVerticalEnable(value: boolean) {
        this._dragVerticalEnable = value;
    }

    public get drag_Left(): number {
        return this._drag_Left;
    }
    public set drag_Left(value: number) {
        this._drag_Left = value;
    }

    public get drag_Right(): number {
        return this._drag_Right;
    }
    public set drag_Right(value: number) {
        this._drag_Right = value;
    }

    public get drag_Top(): number {
        return this._drag_Top;
    }
    public set drag_Top(value: number) {
        this._drag_Top = value;
    }

    public get drag_Bottom(): number {
        return this._drag_Bottom;
    }
    public set drag_Bottom(value: number) {
        this._drag_Bottom = value;
    }


    visiableLayer: number;//TODO


    private _viewRect: Vector2 = new Vector2();

    getCameraPos(){
        return this._cameraPos;
    }

    /**
     * @internal
     */
    _setBelongScene(scene: Node): void {
        super._setBelongScene(scene);
        if (this._isMain) {
            this.scene._specialManager._setMainCamera(this);
        }
    }

    /**
     * @internal
     */
    _setUnBelongScene(): void {
        this.scene._specialManager._setMainCamera(null);
        super._setUnBelongScene();
    }

    /**
     * TODO 功能
     * Camera 的cull功能
     * rotationSmooth、rotationSpeed功能
     * visiableLayer渲染层功能
     * zoom功能
     * RenderTarget功能
     */
    constructor() {
        super();
        this.limit_Left = -10000000;
        this.limit_Right = 10000000;
        this.limit_Top = -10000000;
        this.limit_Buttom = 10000000;
        this.drag_Left = 0.2;//0-1
        this.drag_Right = 0.2;
        this.drag_Top = 0.2;
        this.drag_Bottom = 0.2;
        this.positionSmooth = false;
        this._rect = new Vector4();
    }
    /**
     * 获得viewPort大小
     * @returns 
     */
    private _getScreenSize(): Vector2 {
        this._viewRect.setValue(RenderState2D.width, RenderState2D.height);
        return this._viewRect;
    }


    /**
     * @internal
     * @returns 
     */
    _getCameraTransform(): Matrix3x3 {
        //用来计算camera的矩阵
        let viewport = this._getScreenSize();
        let curPosPoint = Point.TEMP;
        this.getGlobalPos(curPosPoint);
        let extendHorizental = viewport.x * 0.5;
        let extendVertical = viewport.y * 0.5
        if (!this._firstUpdate) {
            //drag
            if (this.dragHorizontalEnable) {
                this._cameraPos.x = Math.min(this._cameraPos.x, curPosPoint.x + extendHorizental * this.drag_Left);
                this._cameraPos.x = Math.max(this._cameraPos.x, curPosPoint.x - extendHorizental * this.drag_Right);
            } else {
                this._cameraPos.x = curPosPoint.x;
            }
            if (this.dragVerticalEnable) {
                this._cameraPos.y = Math.min(this._cameraPos.y, curPosPoint.y + extendVertical * this.drag_Top);
                this._cameraPos.y = Math.max(this._cameraPos.y, curPosPoint.y - extendVertical * this.drag_Bottom);
            } else {
                this._cameraPos.y = curPosPoint.y;
            }

            let sceneRect_left = this._cameraPos.x - extendHorizental;
            let sceneRect_right = sceneRect_left + viewport.x;
            let sceneRect_top = this._cameraPos.y - extendVertical;
            let sceneRect_bottom = sceneRect_top + viewport.y;

            //limit
            if (sceneRect_left < this.limit_Left) {
                this._cameraPos.x -= sceneRect_left - this.limit_Left;
            }

            if (sceneRect_right > this.limit_Right) {
                this._cameraPos.x -= sceneRect_right - this.limit_Right;
            }

            if (sceneRect_bottom > this.limit_Buttom) {
                this._cameraPos.y -= sceneRect_bottom - this.limit_Buttom;
            }
            if (sceneRect_top < this.limit_Top) {
                this._cameraPos.y -= sceneRect_top - this.limit_Top;
            }

            if (this.positionSmooth) {
                let speed = Math.min(1.0, this.positionSpeed * 0.16);
                let transX = Math.floor((this._cameraPos.x - this._cameraSmoothPos.x) * speed);
                let transY = Math.floor((this._cameraPos.y - this._cameraSmoothPos.y) * speed);

                this._cameraSmoothPos.x += transX;
                this._cameraSmoothPos.y += transY;
            } else {
                this._cameraSmoothPos.x = this._cameraPos.x;
                this._cameraSmoothPos.y = this._cameraPos.y;
            }
        } else {
            this._cameraSmoothPos.x = this._cameraPos.x = curPosPoint.x;
            this._cameraSmoothPos.y = this._cameraPos.y = curPosPoint.y;
            this._firstUpdate = false;
        }


        if (!this.ignoreRotation) {
            if (this.rotationSmooth) {
                //TODO
            } else {
                this._cameraRotation = this.globalRotation;
            }
        } else {
            this._cameraRotation = 0;
        }
        this._rect.setValue(this._cameraSmoothPos.x - extendHorizental, this._cameraSmoothPos.x + extendHorizental, this._cameraSmoothPos.y - extendVertical, this._cameraSmoothPos.y + extendVertical)
        Matrix3x3.createMatreixFromValue(this._cameraSmoothPos, this._cameraRotation, Vector2.ONE, this._cameraMatrix);
        this._cameraMatrix.invert(this._cameraInvertMatrix);
        return this._cameraInvertMatrix;
    }
}