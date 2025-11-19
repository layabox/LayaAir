/**
 * @description
 * 在3D场景中展示Spine动画的示例
 * 仿照 Entrance.ts 实现，但使用3D场景和Spine3DRenderNode
 */
import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";

import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import { LayaGL } from "laya/layagl/LayaGL";
import { Loader } from "laya/net/Loader";
import { SpineTemplet } from "laya/spine/SpineTemplet";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { WebUnitRenderModuleDataFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/WebUnitRenderModuleDataFactory";
import { LengencyRenderEngine3DFactory } from "laya/RenderDriver/DriverDesign/3DRenderPass/LengencyRenderEngine3DFactory";
import { Web3DRenderModuleFactory } from "laya/RenderDriver/RenderModuleData/WebModuleData/3D/Web3DRenderModuleFactory";
import { WebGL3DRenderPassFactory } from "laya/RenderDriver/WebGLDriver/3DRenderPass/WebGL3DRenderPassFactory";
import { WebGLRenderDeviceFactory } from "laya/RenderDriver/WebGLDriver/RenderDevice/WebGLRenderDeviceFactory";
import { Laya3DRender } from "laya/d3/RenderObjs/Laya3DRender";
import { WebGLRender2DProcess } from "laya/RenderDriver/WebGLDriver/2DRenderPass/WebGLRender2DProcess";
import { Spine3DRenderNode } from "laya/spine/Spine3DRenderer";
import { SpineConst } from "laya/spine/SpineConst";
import { SpineAdapter } from "laya/spine/web/js/SpineAdapter";
import { Button } from "laya/ui/Button";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";

export class Spine3DDemo {

    private skeleton: Spine3DRenderNode | null = null;
    private sprite3D:Sprite3D | null = null;

    private skeletonInfos: Array<{ name: string; url: string }> = [
        { name: "spineboy-pma", url: "res/spine/38/spineboy-pma.skel" },
        { name: "hero_cwj_normal", url: "res/spine/38/hero_cwj_normal.skel" },
        { name: "zhugeliang_skill_1_loop", url: "res/spine/38/zhugeliang_skill_1_loop.skel" }
    ];

    private skeletonTemplets: Map<string, SpineTemplet> = new Map();

    private currentTempletIndex: number = 0;
    private currentAnimationIndex: number = 0;
    private currentSkinIndex: number = 0;

    private currentAnimationNames: string[] = [];
    private currentSkinNames: string[] = [];

    private templetButton: Button | null = null;
    private animationButton: Button | null = null;
    private skinButton: Button | null = null;
    private fastRenderButton: Button | null = null;

    private useFastRender: boolean = true;

    private buttonURL = "res/ui/button-7.png";
    private maxSpineSize: number = 600;

    private scene: Scene3D | null = null;
    private camera: Camera | null = null;

    constructor() {
        SpineConst.VERSION = "3.8";
        SpineAdapter;

        Laya.init(1024, 768).then(async () => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            let sizeString = Browser.getQueryString("size") || "1";
            let size: number = parseInt(sizeString);

            let enableCache = Browser.getQueryString("cache") || "false";
            let enableCacheBool = enableCache == "true";
            SpineConst.cacheSwitch = false;

            Laya.stage.bgColor = "#000000";
            Stat.show();

            // 创建3D场景
            this.scene = <Scene3D>Laya.stage.addChild(new Scene3D());
            this.scene.ambientColor = new Color(1, 1, 1);

            // 创建相机
            this.camera = <Camera>this.scene.addChild(new Camera(0, 0.1, 100));
            this.camera.transform.translate(new Vector3(0, 0, 3));
            this.camera.transform.lookAt(new Vector3(0, 0, 0) , Vector3.Up);
            // this.camera.transform.rotate(new Vector3(-10, 0, 0), true, false);
            this.camera.addComponent(CameraMoveScript);

            let mesh = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1));
            mesh.transform.position = new Vector3(1, 0, 0);
            this.scene.addChild(mesh);

            try {
                await this.preloadTemplets();
            } catch (error) {
                console.error("Spine 模板加载失败", error);
                return;
            }

            this.createRenderNodes(size);
            this.applyTemplet(this.currentTempletIndex);
            this.init();
            this.updateButtonLabels();
        });
    }

    private init(): void {
        let x = (Laya.stage.width - 150 * 4) / 2;
        let width = 150;
        let height = 60;
        let spacing = 100 + width;
        let y = 100;
        this.templetButton = this.creatButton(x, y, width, height, this, this.switchTemplet, "切换模板");
        this.animationButton = this.creatButton(x + spacing, y, width, height, this, this.play, "切换动画");
        this.skinButton = this.creatButton(x + spacing * 2, y, width, height, this, this.switchSkin, "切换皮肤");
        this.fastRenderButton = this.creatButton(x + spacing * 3, y, width, height, this, this.switchFastRender, "快速渲染");
    }

    private creatButton(x: number, y: number, width: number, height: number, call: any, handle: any, name: string): Button {
        let button = new Button();
        button.skin = this.buttonURL;
        button.label = name;
        button.on(Event.CLICK, call, handle);
        button.pos(x, y);
        button.width = 150;
        button.height = 60;
        button.labelColors = "#ffffff,#ffffff,#ffffff";
        Laya.stage.addChild(button);
        return button;
    }

    private play(): void {
        if (this.currentAnimationNames.length === 0) {
            return;
        }
        this.currentAnimationIndex = this.normalizeIndex(this.currentAnimationIndex + 1, this.currentAnimationNames.length);
        this.applyAnimation();
    }

    private async preloadTemplets(): Promise<void> {
        const tasks = this.skeletonInfos.map(async (info) => {
            const templet = await Laya.loader.load(info.url, Loader.SPINE) as SpineTemplet;
            this.skeletonTemplets.set(info.name, templet);
        });
        tasks.push(Laya.loader.load(this.buttonURL, Loader.IMAGE));
        await Promise.all(tasks);
    }

    private createRenderNodes(count: number): void {
        // 清理旧的节点
        if (this.sprite3D) {
            this.sprite3D.off(Event.STOPPED, this, this.play);
            this.sprite3D.destroy();
        }

        if (!this.scene) {
            return;
        }

        let scale = 0.01;
        // 创建3D精灵节点
        this.sprite3D = new Sprite3D();
        this.scene.addChild(this.sprite3D);
        this.sprite3D.transform.position = new Vector3(0,0,0);
        this.sprite3D.on(Event.STOPPED, this, this.play);
        this.sprite3D.transform.localScale = new Vector3(scale,scale,scale);

        this.skeleton = this.sprite3D.addComponent(Spine3DRenderNode);
    }

    private applyTemplet(index: number): void {
        const templet = this.getTempletByIndex(index);
        if (!templet) {
            console.warn("未找到指定索引的 Spine 模板", index);
            return;
        }

        this.currentTempletIndex = index;
        this.currentAnimationIndex = 0;
        this.currentSkinIndex = 0;

        this.currentAnimationNames = this.getAnimationNames(templet);
        this.currentSkinNames = this.getSkinNames(templet);

        this.skeleton.templet = templet;
        this.skeleton.useFastRender = this.useFastRender;

        this.applySkin();
        this.applyAnimation();

        /** @ts-ignore */
        window.skeleton = this.skeleton;
    }

    private applyAnimation(): void {
        if (this.currentAnimationNames.length === 0) {
            this.skeleton.stop();
            this.updateButtonLabels();
            return;
        }

        this.currentAnimationIndex = this.normalizeIndex(this.currentAnimationIndex, this.currentAnimationNames.length);
        const animationName = this.currentAnimationNames[this.currentAnimationIndex];
        this.skeleton.play(animationName, false, true);
        this.updateButtonLabels();
    }

    private applySkin(): void {
        if (this.currentSkinNames.length === 0) {
            this.currentSkinNames = ["default"];
        }
        this.currentSkinIndex = this.normalizeIndex(this.currentSkinIndex, this.currentSkinNames.length);
        const skinName = this.currentSkinNames[this.currentSkinIndex];
        this.skeleton.skinName = skinName;
        this.updateButtonLabels();
    }

    private switchTemplet(): void {
        if (this.skeletonInfos.length === 0) {
            return;
        }
        const nextIndex = this.normalizeIndex(this.currentTempletIndex + 1, this.skeletonInfos.length);
        this.applyTemplet(nextIndex);
    }

    private switchSkin(): void {
        if (this.currentSkinNames.length === 0) {
            return;
        }
        this.currentSkinIndex = this.normalizeIndex(this.currentSkinIndex + 1, this.currentSkinNames.length);
        this.applySkin();
    }

    private switchFastRender(): void {
        this.useFastRender = !this.useFastRender;
        this.skeleton.useFastRender = this.useFastRender;
        this.updateButtonLabels();
    }

    private updateButtonLabels(): void {
        const templetInfo = this.skeletonInfos[this.currentTempletIndex];
        const animationName = this.currentAnimationNames[this.currentAnimationIndex] ?? "无";
        const skinName = this.currentSkinNames[this.currentSkinIndex] ?? "无";

        if (this.templetButton) {
            const total = this.skeletonInfos.length;
            this.templetButton.label = `切换模板 (${templetInfo ? templetInfo.name : "无"} ${total ? `${this.currentTempletIndex + 1}/${total}` : ""})`;
        }
        if (this.animationButton) {
            const total = this.currentAnimationNames.length;
            this.animationButton.label = `切换动画 (${animationName}${total ? ` ${this.currentAnimationIndex + 1}/${total}` : ""})`;
        }
        if (this.skinButton) {
            const total = this.currentSkinNames.length;
            this.skinButton.label = `切换皮肤 (${skinName}${total ? ` ${this.currentSkinIndex + 1}/${total}` : ""})`;
        }
        if (this.fastRenderButton) {
            this.fastRenderButton.label = `快速渲染 (${this.useFastRender ? "开启" : "关闭"})`;
        }
    }

    private getTempletByIndex(index: number): SpineTemplet | undefined {
        const info = this.skeletonInfos[this.normalizeIndex(index, this.skeletonInfos.length)];
        if (!info) {
            return undefined;
        }
        return this.skeletonTemplets.get(info.name);
    }

    private getAnimationNames(templet: SpineTemplet): string[] {
        const count = templet.getAnimationCount();
        const names: string[] = [];
        for (let i = 0; i < count; i++) {
            const name = templet.getAniNameByIndex(i);
            if (name) {
                names.push(name);
            }
        }
        return names;
    }

    private getSkinNames(templet: SpineTemplet): string[] {
        const optimize: any = templet.optimize as any;
        const names: string[] = [];

        if (optimize) {
            if (Array.isArray(optimize.skinAttachArray)) {
                optimize.skinAttachArray.forEach((skin: any) => {
                    if (skin && skin.name) {
                        names.push(skin.name);
                    }
                });
            }

            if (optimize.data && Array.isArray(optimize.data.skins)) {
                optimize.data.skins.forEach((skin: any) => {
                    if (skin && skin.name) {
                        names.push(skin.name);
                    }
                });
            }
        }

        if (names.length === 0) {
            names.push("default");
        }

        return Array.from(new Set(names));
    }

    private normalizeIndex(index: number, length: number): number {
        if (length <= 0) {
            return 0;
        }
        const result = index % length;
        return result < 0 ? result + length : result;
    }
}

