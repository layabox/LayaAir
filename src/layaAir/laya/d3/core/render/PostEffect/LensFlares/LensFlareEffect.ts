import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Color } from "laya/maths/Color";
import { Vector2 } from "laya/maths/Vector2";
import { BaseTexture } from "laya/resource/BaseTexture";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Vector3 } from "laya/maths/Vector3";
import { Camera } from "laya/d3/core/Camera";
import { Light, LightType } from "laya/d3/core/light/Light";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { Texture2D } from "laya/resource/Texture2D";
import { Vector4 } from "laya/maths/Vector4";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";
import { LensFlareShaderInit } from "./LensFlareShaderInit";
import { LensFlareCMD } from "./LensFlareCMD";
import { PostProcess } from "../../../../component/PostProcess";


/**
 * lens Flare Element
 * 光耀元素
 */
export class LensFlareElement {
    /**开启 */
    private _active: boolean;
    //Type
    private _type: string = "Image";
    /**@internal sourceTexture */
    texture: BaseTexture = Texture2D.whiteTexture;
    /**@internal */
    private _aspectRatio: boolean = false;
    //Color
    tint: Color = Color.WHITE;
    /**@internal */
    private _modulateByLightColor: boolean = false;
    /**@internal */
    private _intensity: number = 1;
    /**@internal */
    private _blendMode: any;
    //AxisTransform
    startPosition: number = 1;
    /**@internal */
    AngularOffset: number;//0-360°
    /**@internal */
    private _translationScale: Vector2 = new Vector2(1, 1);

    //elemet TODO
    //其他TODO
}

/**
 * lens Flare Data 
 * 资源数据
 */
export class lensFlareData {
    elements: LensFlareElement[] = [];
}

/**
 * lens Flare Element
 */
export class LensFlareEffect extends PostProcessEffect {

    /**
     * init Shader\Geometry
     */
    static init() {
        LensFlareElementGeomtry.init();
        LensFlareShaderInit.init();
    }

    /**@internal */
    private _tempV3: Vector3;

    /**@internal */
    private _tempV4: Vector4;

    /**@internal */
    private _flareCMDS: LensFlareCMD[];

    /**@internal */
    private _center: Vector2;

    /**@internal */
    private _rotate: number

    /**@internal */
    private _light: Light;

    /**
     * LensFlareData
     */
    set LensFlareData(value: lensFlareData) {
        this._flareCMDS.length = 0;//TODO Destory pre cmd
        for (let i = 0; i < value.elements.length; i++) {
            var cmd = new LensFlareCMD();
            cmd.lensFlareElement = value.elements[i];
            this._flareCMDS.push(cmd);
        }
    }


    /**
     * bind light
     */
    set bindLight(light: Light) {
        this._light = light;//TODO
    }

    constructor() {
        super();
        this._flareCMDS = [];
        this._flareCMDS.push(new LensFlareCMD());
        this._center = new Vector2();
        this._tempV3 = new Vector3();
        this._tempV4 = new Vector4();
    }

    /**
     * 计算直射光中心的
     * @param camera 
     */
    caculateDirCenter(camera: Camera) {
        //center caculate
        (this._light as DirectionLightCom)._direction.cloneTo(this._tempV3);
        Vector3.scale(this._tempV3, -10, this._tempV3);
        Vector3.add(camera.transform.position, this._tempV3, this._tempV3);
        Vector3.transformV3ToV4(this._tempV3, camera.projectionViewMatrix, this._tempV4);
        this._center.setValue(this._tempV4.x / this._tempV4.w, this._tempV4.y / this._tempV4.w);
        //angle caculatge
        var angle: number = Math.atan2(this._center.x, this._center.y) * 180 / Math.PI;
        angle = (angle < 0) ? angle + 360 : angle;
        angle = Math.round(angle);
        this._rotate = Math.PI * 2.0 - Math.PI / 180 * angle;
    }

    /**
     * 计算点光
     * @param camera 
     */
    caculatePointCenter(camera: Camera) {
        //TODO
    }

    /**
     * 计算spot光
     * @param value 
     */
    caculateSpotCenter(value: Vector2) {
        //TODO
    }

    /**
     * 渲染流程
     * @param context 
     * @returns 
     */
    render(context: PostProcessRenderContext) {
        var cmd: CommandBuffer = context.command;
        let source: RenderTexture = context.indirectTarget;
        cmd.setRenderTarget(source);
        switch (this._light.lightType) {
            case LightType.Directional:
                this.caculateDirCenter(context.camera);
                break;
            case LightType.Point:
                //TODO
                break;
            case LightType.Spot:
                //TODO
                break;
        }
        for (let i = 0; i < this._flareCMDS.length; i++) {
            this._flareCMDS[i].center = this._center;//set center
            this._flareCMDS[i].rotate = this._rotate;//set rotate
            cmd.addCustomCMD(this._flareCMDS[i]);
        }
        cmd.blitScreenQuad(source, context.destination);
    }

    /**
   * 释放Effect
   * @inheritDoc
   * @override
   */
    release(postprocess: PostProcess) {
        //TODO
    }
}