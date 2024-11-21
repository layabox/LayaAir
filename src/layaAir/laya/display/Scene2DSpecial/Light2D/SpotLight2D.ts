import { LayaGL } from "../../../layagl/LayaGL";
import { Color } from "../../../maths/Color";
import { Matrix } from "../../../maths/Matrix";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector3 } from "../../../maths/Vector3";
import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { RenderTargetFormat } from "../../../RenderEngine/RenderEnum/RenderTargetFormat";
import { WrapMode } from "../../../RenderEngine/RenderEnum/WrapMode";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Material } from "../../../resource/Material";
import { Mesh2D } from "../../../resource/Mesh2D";
import { RenderTexture } from "../../../resource/RenderTexture";
import { RenderTexture2D } from "../../../resource/RenderTexture2D";
import { Texture2D } from "../../../resource/Texture2D";
import { Browser } from "../../../utils/Browser";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { CommandBuffer2D } from "../RenderCMD2D/CommandBuffer2D";
import { DrawMesh2DCMD } from "../RenderCMD2D/DrawMesh2DCMD";
import { Set2DRTCMD } from "../RenderCMD2D/Set2DRenderTargetCMD";
import { BaseLight2D, Light2DType } from "./BaseLight2D";
import { Light2DManager } from "./Light2DManager";

/**
 * 聚灯光
 */
export class SpotLight2D extends BaseLight2D {
    private _innerRadius: number; //内圆半径（灯光不发生衰减的半径）
    private _outerRadius: number; //外圆半径（灯光照射最远半径）
    private _innerAngle: number; //内扇形张角（该角度内灯光不衰减）
    private _outerAngle: number; //外扇形张角（灯光最大角度）
    private _falloffIntensity: number = 1; //边缘衰减系数，数越大，边缘变淡越快（0-10）

    //用于生成灯光贴图
    private _cmdBuffer: CommandBuffer2D;
    private _cmdRT: Set2DRTCMD;
    private _cmdMesh: DrawMesh2DCMD;
    private _material: Material;

    constructor(innerRadius: number = 100, outerRadius: number = 200, innerAngle: number = 360, outerAngle: number = 360, falloff: number = 1) {
        super();
        this._type = Light2DType.Spot;
        this._innerAngle = innerAngle;
        this._outerAngle = outerAngle;
        this._innerRadius = innerRadius;
        this._outerRadius = outerRadius;
        this._falloffIntensity = falloff;
        this._limitParam();

        this._material = new Material();
        this._material.setShaderName('LightGen2D');
        this._material.setBoolByIndex(Shader3D.DEPTH_WRITE, false);
        this._material.setIntByIndex(Shader3D.DEPTH_TEST, RenderState.DEPTHTEST_OFF);
        this._material.setIntByIndex(Shader3D.BLEND, RenderState.BLEND_ENABLE_ALL);
        this._material.setIntByIndex(Shader3D.BLEND_EQUATION, RenderState.BLENDEQUATION_ADD);
        this._material.setIntByIndex(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
        this._material.setIntByIndex(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
        this._material.setIntByIndex(Shader3D.CULL, RenderState.CULL_NONE);
        this._cmdBuffer = new CommandBuffer2D('Light2DRender_Freeform'); //渲染灯光贴图的命令流
    }

    /**
     * @en Get inner circle radius
     * @zh 获取内圆半径
     */
    get innerRadius() {
        return this._innerRadius;
    }

    /**
     * @en Set inner circle radius
     * @param value Radius value
     * @zh 设置内圆半径
     * @param value 半径值
     */
    set innerRadius(value: number) {
        if (this._innerRadius !== value) {
            this._innerRadius = value;
            this._needUpdateLight = true;
            this._needUpdateLightLocalRange = true;
            this._needUpdateLightWorldRange = true;
            super._clearScreenCache();
            this._limitParam();
        }
    }

    /**
     * @en Get outer circle radius
     * @zh 获取外圆半径
     */
    get outerRadius() {
        return this._outerRadius;
    }

    /**
     * @en Set outer circle radius
     * @param value Radius value
     * @zh 设置外圆半径
     * @param value 半径值
     */
    set outerRadius(value: number) {
        if (this._outerRadius !== value) {
            this._outerRadius = value;
            this._needUpdateLight = true;
            this._needUpdateLightLocalRange = true;
            this._needUpdateLightWorldRange = true;
            super._clearScreenCache();
            this._limitParam();
        }
    }

    /**
     * @en Get inner fan angle
     * @zh 获取内扇形张角
     */
    get innerAngle() {
        return this._innerAngle;
    }

    /**
     * @en Set inner fan angle
     * @param value Angle value
     * @zh 设置内扇形张角
     * @param value 角度值
     */
    set innerAngle(value: number) {
        if (this._innerAngle !== value) {
            this._innerAngle = value;
            this._needUpdateLight = true;
            this._limitParam();
        }
    }

    /**
     * @en Get outer fan angle
     * @zh 获取外扇形张角
     */
    get outerAngle() {
        return this._outerAngle;
    }

    /**
     * @en Set outer fan angle
     * @param value Angle value
     * @zh 设置外扇形张角
     * @param value 角度值
     */
    set outerAngle(value: number) {
        if (this._outerAngle !== value) {
            this._outerAngle = value;
            this._needUpdateLight = true;
            this._limitParam();
        }
    }

    /**
     * @en Get the edge attenuation coefficient
     * @zh 获取边缘衰减系数
     */
    get falloffIntensity() {
        return this._falloffIntensity;
    }

    /**
     * @en Set the edge attenuation coefficient
     * @param value Attenuation value
     * @zh 设置边缘衰减系数
     * @param value 衰减系数值
     */
    set falloffIntensity(value: number) {
        if (this._falloffIntensity !== value) {
            this._falloffIntensity = value;
            this._needUpdateLight = true;
            this._limitParam();
        }
    }

    /**
     * @internal
     * 计算灯光范围（局部坐标）
     */
    protected _calcLocalRange() {
        super._calcLocalRange();
        const w = this._outerRadius * 2.1 * Browser.pixelRatio | 0;
        const h = this._outerRadius * 2.1 * Browser.pixelRatio | 0;
        this._localRange.x = (-0.5 * w) | 0;
        this._localRange.y = (-0.5 * h) | 0;
        this._localRange.width = w;
        this._localRange.height = h;
    }

    /**
     * @internal
     * 计算灯光范围（世界坐标）
     * @param screen 
     */
    protected _calcWorldRange(screen?: Rectangle) {
        super._calcWorldRange(screen);
        super._lightScaleAndRotation();

        //const sx = Math.abs((this.owner as Sprite).globalScaleX);
        //const sy = Math.abs((this.owner as Sprite).globalScaleY);
        const sx = Math.abs((this.owner as Sprite).scaleX); //改用局部放缩
        const sy = Math.abs((this.owner as Sprite).scaleY);
        const w = this._outerRadius * 2.1 * Browser.pixelRatio * Math.max(sx, sy) | 0;
        const h = this._outerRadius * 2.1 * Browser.pixelRatio * Math.max(sx, sy) | 0;
        this._worldRange.x = (-0.5 * w + (this.owner as Sprite).globalPosX * Browser.pixelRatio) | 0;
        this._worldRange.y = (-0.5 * h + (this.owner as Sprite).globalPosY * Browser.pixelRatio) | 0;
        this._worldRange.width = w;
        this._worldRange.height = h;
    }

    /**
     * @en Render light texture
     * @param scene Scene object
     * @zh 渲染灯光贴图
     * @param scene 场景对象
     */
    renderLightTexture(scene: Scene) {
        super.renderLightTexture(scene);
        if (this._needUpdateLight) {
            this._needUpdateLight = false;
            const width = this._localRange.width;
            const height = this._localRange.height;
            if (width === 0 || height === 0) return;
            if (!this._texLight || !(this._texLight instanceof RenderTexture2D)) {
                this._texLight = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8);
                this._texLight.wrapModeU = WrapMode.Clamp;
                this._texLight.wrapModeV = WrapMode.Clamp;
                (this._texLight as RenderTexture2D)._invertY = LayaGL.renderEngine._screenInvertY;
                if (!this._cmdRT)
                    this._cmdRT = Set2DRTCMD.create(this._texLight as RenderTexture, true, Color.BLACK, LayaGL.renderEngine._screenInvertY);
                else this._cmdRT.renderTexture = this._texLight as RenderTexture;
                if (Light2DManager.DEBUG)
                    console.log('create spot light texture', width, height);
            }
            else if (this._texLight.width !== width || this._texLight.height !== height) {
                this._texLight.destroy();
                this._texLight = new RenderTexture2D(width, height, RenderTargetFormat.R8G8B8A8);
                this._texLight.wrapModeU = WrapMode.Clamp;
                this._texLight.wrapModeV = WrapMode.Clamp;
                (this._texLight as RenderTexture2D)._invertY = LayaGL.renderEngine._screenInvertY;
                if (!this._cmdRT)
                    this._cmdRT = Set2DRTCMD.create(this._texLight as RenderTexture, true, Color.BLACK, LayaGL.renderEngine._screenInvertY);
                else this._cmdRT.renderTexture = this._texLight as RenderTexture;
                if (Light2DManager.DEBUG)
                    console.log('update spot light texture', width, height);
            }
            const mesh = this._createMesh(this._cmdMesh?.mesh, this._needToRecover);
            // if (!this._cmdMesh)
            //     this._cmdMesh = DrawMesh2DCMD.create(mesh, Matrix.EMPTY, Texture2D.whiteTexture, Color.WHITE, this._material);
            // else {
            //     if (this._cmdMesh.mesh)
            //         this._needToRecover.push(this._cmdMesh.mesh);
            //     this._cmdMesh.mesh = mesh;
            // }
            if (this._cmdMesh && this._cmdMesh.mesh)
                this._needToRecover.push(this._cmdMesh.mesh);
            this._cmdMesh = DrawMesh2DCMD.create(mesh, Matrix.EMPTY, Texture2D.whiteTexture, Color.WHITE, this._material);
            this._cmdBuffer.addCacheCommand(this._cmdRT);
            this._cmdBuffer.addCacheCommand(this._cmdMesh);
            this._cmdBuffer.apply(true);
            this._cmdBuffer.clear(false);
            this._needUpdateLightAndShadow = true;

            if (Light2DManager.DEBUG) {
                if (this.showLightTexture)
                    this._printTextureToConsoleAsBase64();
                console.log('update spot light texture');
            }
        }
    }

    /**
     * @internal
     * 限制参数范围
     */
    private _limitParam() {
        this._innerAngle = Math.max(Math.min(this._innerAngle, 360), 0);
        this._outerAngle = Math.max(Math.min(this._outerAngle, 360), 0);
        this._innerRadius = Math.max(Math.min(this._innerRadius, 10000), 1);
        this._outerRadius = Math.max(Math.min(this._outerRadius, 10000), 1);
        this._falloffIntensity = Math.max(Math.min(this._falloffIntensity, 10), 0);
        if (this._outerRadius < this._innerRadius)
            this._outerRadius = this._innerRadius;
        if (this._outerAngle < this._innerAngle)
            this._outerAngle = this._innerAngle;
    }

    /**
     * @internal
     * 创建灯光多边形
     * @param mesh 
     * @param recover 
     */
    private _createMesh(mesh?: Mesh2D, recover?: any[]) {
        const segments1 = Math.max(4, Math.min(64, this._innerAngle / 5 | 0));
        const segments2 = Math.max(2, Math.min(64, (this._outerAngle - this._innerAngle) / 10 | 0));
        const falloffStep = 10;
        const points: Vector3[] = [];
        const inds: number[] = [];

        //中心坐标
        const centerX = this._localRange.width / 2;
        const centerY = this._localRange.height / 2;

        //将度数转换为弧度
        const innerAngleRad = this._innerAngle * Math.PI / 180;
        const outerAngleRad = this._outerAngle * Math.PI / 180;

        //左转偏移90度
        const angleOffset = -Math.PI / 2;

        const _addFan = (startAngle: number, endAngle: number, leftU: number, rightU: number, segments: number) => {
            let start = points.length;

            //添加中心点
            points.push(new Vector3(centerX, centerY, 1));

            let s = segments + 1;
            let f = (rightU - leftU) / segments;
            let t = (endAngle - startAngle) / segments;
            let l = (this._outerRadius - this._innerRadius) / falloffStep;
            let r = this._innerRadius / falloffStep;

            //添加中心扇形
            for (let j = 0; j < falloffStep; j++) {
                for (let i = 0; i <= segments; i++) {
                    const angle = startAngle + t * i;
                    const rr = j === 0 ? 1 : r * (j + 1);
                    const x = centerX + rr * Math.cos(angle);
                    const y = centerY + rr * Math.sin(angle);
                    const u = Math.pow(leftU + f * i, this._falloffIntensity);
                    points.push(new Vector3(x, y, u));
                    if (i > 0) {
                        if (j === 0)
                            inds.push(start, start + i, start + i + 1);
                        else {
                            const ss = s * (j - 1);
                            inds.push(start + i + ss, start + i + s + ss, start + i + s + ss + 1);
                            inds.push(start + i + ss, start + i + s + ss + 1, start + i + ss + 1);
                        }
                    }
                }
            }
            start += s * (falloffStep - 1);

            //添加延伸部分
            for (let j = 0; j < falloffStep; j++) {
                for (let i = 0; i <= segments; i++) {
                    const angle = startAngle + t * i;
                    const x = centerX + (this._innerRadius + l * (j + 1)) * Math.cos(angle);
                    const y = centerY + (this._innerRadius + l * (j + 1)) * Math.sin(angle);
                    const u2 = Math.pow(leftU + f * i, this._falloffIntensity);
                    const u3 = Math.pow(1 - (j + 1) / falloffStep, this._falloffIntensity);
                    const u = u2 * u3;
                    points.push(new Vector3(x, y, u));
                    if (i > 0) {
                        const ss = s * j;
                        inds.push(start + i + ss, start + i + s + ss, start + i + s + ss + 1);
                        inds.push(start + i + ss, start + i + s + ss + 1, start + i + ss + 1);
                    }
                }
            }
        };

        _addFan(-outerAngleRad / 2 + angleOffset, -innerAngleRad / 2 + angleOffset, 0, 1, segments2); //左侧
        _addFan(-innerAngleRad / 2 + angleOffset, innerAngleRad / 2 + angleOffset, 1, 1, segments1); //中心
        _addFan(innerAngleRad / 2 + angleOffset, outerAngleRad / 2 + angleOffset, 1, 0, segments2); //右侧

        return this._makeOrUpdateMesh(points, inds, mesh, recover);
    }

    /**
     * @internal
     * 销毁
     */
    protected _onDestroy() {
        super._onDestroy();
        if (this._texLight) {
            this._texLight.destroy();
            this._texLight = null;
        }
    }
}