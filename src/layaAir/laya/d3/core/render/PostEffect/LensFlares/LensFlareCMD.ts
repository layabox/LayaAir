import { RenderState } from "../../../../../RenderDriver/RenderModuleData/Design/RenderState";
import { Vector2 } from "../../../../../maths/Vector2";
import { Material, MaterialRenderMode } from "../../../../../resource/Material";
import { Stat } from "../../../../../utils/Stat";
import { Utils } from "../../../../../utils/Utils";
import { Laya3DRender } from "../../../../RenderObjs/Laya3DRender";
import { Camera } from "../../../Camera";
import { Transform3D } from "../../../Transform3D";
import { RenderContext3D } from "../../RenderContext3D";
import { RenderElement } from "../../RenderElement";
import { CommandBuffer } from "../../command/CommandBuffer";
import { LensFlareElement, LensFlareEffect } from "./LensFlareEffect";
import { LensFlareElementGeomtry } from "./LensFlareGeometry";

/**
 * @en Represents lens flare command
 * @zh 表示镜头光晕指令
 */
export class LensFlareCMD {

    /**@internal geoemtry */
    private _lensFlareGeometry: LensFlareElementGeomtry;

    /**@internal renderElement*/
    private _renderElement: RenderElement;

    /**@internal */
    private _materials: Material;

    /**@internal */
    private _transform3D: Transform3D;

    /**@internal */
    private _lensFlareElementData: LensFlareElement;

    private _instanceCount: number = 1;
    /**
     * @en The number of instances drawn
     * @zh instance绘制的个数 
     */
    public get instanceCount(): number {
        return this._instanceCount;
    }
    public set instanceCount(value: number) {
        this._instanceCount = value;
    }



    /**
     * @ignore
     * @en Constructor method, initialize instance.
     * @zh 构造方法，初始化实例
     */
    constructor() {
        this._transform3D = Laya3DRender.Render3DModuleDataFactory.createTransform(null);
        this._renderElement = new RenderElement();
        this._renderElement._renderElementOBJ.isRender = true;
        this._lensFlareGeometry = new LensFlareElementGeomtry();
        this._renderElement.setTransform(this._transform3D);
        this._renderElement.setGeometry(this._lensFlareGeometry);
        this._initMaterial();
    }

    /**
     * init material
     */
    private _initMaterial() {
        this._materials = new Material();
        this._materials.lock = true;
        this._materials.setShaderName("LensFlare");
        this._materials.materialRenderMode = MaterialRenderMode.RENDERMODE_ADDTIVE;
        this._materials.depthTest = RenderState.DEPTHTEST_ALWAYS;
        this._materials.cull = RenderState.CULL_NONE;
        this._renderElement.material = this._materials;
        //this._renderElement.renderSubShader = this._materials.shader.getSubShaderAt(0);
        this._renderElement.subShaderIndex = 0;
    }

    /**
     * @internal
     * @en The center position of the lens flare effect.
     * @zh 镜头光晕效果的中心位置。
     */
    set center(value: Vector2) {
        this._materials.setVector2("u_FlareCenter", value);
    }

    /**
     * @internal
     * @en The rotation angle of the lens flare effect.
     * @zh 镜头光晕效果的旋转角度。
     */
    set rotate(value: number) {
        this._materials.setFloat("u_rotate", value);
    }

    /**
     * @internal
     * @en The lens flare element data.
     * @zh 镜头光晕元素数据
     */
    get lensFlareElement(): LensFlareElement {
        return this._lensFlareElementData;
    }

    set lensFlareElement(value: LensFlareElement) {
        this._lensFlareElementData = value;
        this.applyElementData();
    }


    /**
     * @en apply element Data
     * @zh 应用元素数据
     */
    applyElementData() {
        //根据LensFlareElement更新数据
        this._materials.setTexture("u_FlareTexture", this._lensFlareElementData.texture);
        this._materials.setColor("u_Tint", this._lensFlareElementData.tint);
        this._materials.setFloat("u_TintIntensity", this._lensFlareElementData.intensity);
        this._materials.setVector2("u_Postionoffset", this._lensFlareElementData.positionOffset);
        this._materials.setFloat("u_Angularoffset", this._lensFlareElementData.angularOffset);
        if (this._lensFlareElementData.autoRotate) {
            this._materials.addDefine(LensFlareEffect.SHADERDEFINE_AUTOROTATE);
        } else {
            this._materials.removeDefine(LensFlareEffect.SHADERDEFINE_AUTOROTATE);
        }
        //其他TODO

        //更新InstanceBuffer
        this._lensFlareGeometry.instanceCount = 1;//TODO
        // startPos、angular、scaleX、scaleY
        let testFloat = new Float32Array([this._lensFlareElementData.startPosition, Utils.toAngle(this._lensFlareElementData.rotation), this._lensFlareElementData.scale.x, this._lensFlareElementData.scale.y]);//TODO        
        // instanceBuffer set
        this._lensFlareGeometry.instanceBuffer.setData(testFloat.buffer, 0, 0, testFloat.length * 4);//TODO
    }

    /**
     * @inheritDoc
     * @override
     * @en Execute the command.
     * @zh 执行命令
     */
    run(cmd: CommandBuffer): void {
        var context = RenderContext3D._instance;
        this._materials.setFloat("u_aspectRatio", context.camera.viewport.height / context.camera.viewport.width);
        cmd.drawRenderElement(this._renderElement);
    }

    /**
     * @internal
     * @en recover command
     * @zh 回收命令
     */
    recover(): void {
        //TODO
    }

    /**
     * @internal
     * @en Destroy command
     * @zh 销毁命令
     */
    destroy(): void {
        this._materials.lock = false;
        this._materials.destroy();
    }
}