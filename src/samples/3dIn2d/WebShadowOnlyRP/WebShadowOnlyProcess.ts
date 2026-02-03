import { Camera } from "../../../layaAir/laya/d3/core/Camera";
import { ShadowMode } from "../../../layaAir/laya/d3/core/light/ShadowMode";
import { Scene3D } from "../../../layaAir/laya/d3/core/scene/Scene3D";
import { IRender3DProcess, IRenderContext3D } from "../../../layaAir/laya/RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../../layaAir/laya/RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebDirCascadeShadowRP } from "../../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebShadowRP/WebDirCascadeShadowRP";
import { WebBaseSpotRP } from "../../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebShadowRP/WebBaseSpotRP";
import { Config3D } from "../../../layaAir/Config3D";
import { Cluster } from "../../../layaAir/laya/d3/graphics/renderPath/Cluster";
import { ICameraNodeData } from "../../../layaAir/laya/RenderDriver/RenderModuleData/Design/3D/I3DRenderModuleData";
import { WebDirectLight } from "../../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebDirectLight";
import { WebCameraNodeData } from "../../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebModuleData";
import { WebSpotLight } from "../../../layaAir/laya/RenderDriver/RenderModuleData/WebModuleData/3D/WebSpotLight";

/**
 * WebShadowOnlyProcess - 阴影专用渲染流程
 *
 * 该类实现了只渲染阴影贴图的轻量级渲染流程，跳过所有几何体/精灵的屏幕渲染。
 * 主要用于 Bridge3DCamera，在2D场景中为3D对象生成阴影。
 *
 * @implements {IRender3DProcess}
 */
export class WebShadowOnlyProcess implements IRender3DProcess {

    /** 方向光阴影渲染管线 */
    private _dirShadowRP: WebDirCascadeShadowRP;

    /** 聚光灯阴影渲染管线 */
    private _spotShadowRP: WebBaseSpotRP;

    /** 场景渲染管理器引用 */
    render3DManager: ISceneRenderManager;

    /**
     * 构造函数
     */
    constructor() {
        this._dirShadowRP = new WebDirCascadeShadowRP();
        this._spotShadowRP = new WebBaseSpotRP();
    }

    /**
     * 阴影专用渲染方法
     *
     * 该方法只执行阴影通道渲染，跳过所有前向渲染和后期处理。
     *
     * @param context 渲染上下文
     * @param camera 相机
     */
    fowardRender(context: IRenderContext3D, camera: Camera): void {
        const scene = camera._scene as Scene3D;

        if (!scene) {
            console.warn("WebShadowOnlyProcess: Scene is null");
            return;
        }

        // 3. 如果启用多光源，更新光照集群
        if (Config3D._multiLighting) {
            Cluster.instance.update(camera, scene);
        }

        // 4. 检查是否需要渲染阴影（根据更新频率）
        const enableShadow = (Scene3D._updateMark % scene._ShadowMapupdateFrequency === 0);
        if (!enableShadow) {
            return;
        }

        // 5. 添加必要的 uniform maps
        context.preDrawUniformMaps.add("Scene3D");
        context.preDrawUniformMaps.add("Global");

        // 6. 渲染方向光阴影
        const mainDirLight = scene._mainDirectionLight;
        const needDirectionShadow = mainDirLight && mainDirLight.shadowMode !== ShadowMode.None;

        if (needDirectionShadow) {
            // 设置方向光阴影渲染数据
            this._dirShadowRP.setRPData(
                mainDirLight._dataModule as WebDirectLight,
                camera._renderDataModule as WebCameraNodeData,
                context
            );

            // 设置剔除信息
            this._dirShadowRP.setCameraCullInfo(this.render3DManager);

            // 更新阴影状态
            this._dirShadowRP.update(context);

            // 执行阴影渲染
            this._dirShadowRP.render(context, this.render3DManager);

            // 应用阴影资源到场景
            this._dirShadowRP.useRPResource(context);

            // 添加阴影 uniform map
            context.preDrawUniformMaps.add("Shadow");
        } else {
            this._dirShadowRP.unuseRPResource(context);
        }

        // 7. 渲染聚光灯阴影
        const mainSpotLight = scene._mainSpotLight;
        const needSpotShadow = mainSpotLight && mainSpotLight.shadowMode !== ShadowMode.None;

        if (needSpotShadow) {
            // 设置聚光灯阴影渲染数据
            this._spotShadowRP.setRPData(
                mainSpotLight._dataModule as WebSpotLight,
                context
            );

            // 设置剔除信息
            this._spotShadowRP.setCameraCullInfo(this.render3DManager);

            // 更新阴影状态
            this._spotShadowRP.update(context);

            // 执行阴影渲染
            this._spotShadowRP.render(context, this.render3DManager);

            // 应用阴影资源到场景
            this._spotShadowRP.useRPResource(context);

            // 添加阴影 uniform map
            if (!needDirectionShadow) {
                context.preDrawUniformMaps.add("Shadow");
            }
        } else {
            this._spotShadowRP.unuseRPResource(context);
        }

        // 8. 如果没有任何阴影，移除 Shadow uniform map
        if (!needDirectionShadow && !needSpotShadow) {
            context.preDrawUniformMaps.delete("Shadow");
        }

        // 注意：这里不执行前向渲染通道（mainRenderpass.render）
        // 也不执行后期处理（postProcess）
        // 只渲染阴影贴图
    }

    /**
     * 销毁资源
     */
    destroy(): void {
        if (this._dirShadowRP) {
            this._dirShadowRP.destory();
            this._dirShadowRP = null;
        }

        if (this._spotShadowRP) {
            this._spotShadowRP.destory();
            this._spotShadowRP = null;
        }

        this.render3DManager = null;
    }
}
