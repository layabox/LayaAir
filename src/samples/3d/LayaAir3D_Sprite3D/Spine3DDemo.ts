import { Laya } from "Laya";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { SpineTemplet } from "laya/spine/SpineTemplet";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Spine3DRenderer } from "laya/spine/Spine3DRenderer";
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
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";

export class Spine3DDemo {

    private skeleton: Spine3DRenderer;
    private sprite3D:Sprite3D;

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

    private templetButton: Button;
    private animationButton: Button;
    private skinButton: Button;
    private fastRenderButton: Button;
    private billboardButton: Button;

    private useFastRender: boolean = true;
    private enableBillboard: boolean = false;

    private buttonURL = "res/ui/button-7.png";
    private maxSpineSize: number = 600;

    private scene: Scene3D;
    private camera: Camera;
    private mesh: MeshSprite3D;
    private scale = 0.01;

    private _boundsLine: PixelLineSprite3D;

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

            this._createWorld();

            let tasks = this.skeletonInfos.map(async (info) => {
                let templet = await Laya.loader.load(info.url, Loader.SPINE) as SpineTemplet;
                this.skeletonTemplets.set(info.name, templet);
            });
            tasks.push(Laya.loader.load(this.buttonURL, Loader.IMAGE));

            await Promise.all(tasks);

            this.sprite3D = new Sprite3D();
            this.scene.addChild(this.sprite3D);
            this.sprite3D.on(Event.STOPPED, this, this.play);
            this.sprite3D.transform.localScale = new Vector3(this.scale,this.scale,this.scale);

            this.skeleton = this.sprite3D.addComponent(Spine3DRenderer);

            this.initUI();
            this.applyTemplet(this.currentTempletIndex);
        });
    }

    private _createWorld() {
        this.scene = <Scene3D>Laya.stage.addChild(new Scene3D());
        this.scene.ambientColor = new Color(1, 1, 1);

        this.camera = <Camera>this.scene.addChild(new Camera(0, 0.1, 100));
        this.camera.transform.translate(new Vector3(0, 0, 3));
        this.camera.transform.lookAt(new Vector3(0, 0, 0) , Vector3.Up);
        this.camera.addComponent(CameraMoveScript);

        let sphere = new MeshSprite3D(PrimitiveMesh.createSphere());
        this.scene.addChild(sphere);
        
        let line = new PixelLineSprite3D(100);
        this.scene.addChild(line);
        line.addLine(new Vector3(0, 0, 0), new Vector3(10, 0, 0), Color.RED, Color.RED);
        line.addLine(new Vector3(0, 0, 0), new Vector3(0, 10, 0), Color.GREEN, Color.GREEN);
        line.addLine(new Vector3(0, 0, 0), new Vector3(0, 0, 10), Color.BLUE, Color.BLUE);

        let boundsLine = new PixelLineSprite3D(100);
        this.scene.addChild(boundsLine);
        this._boundsLine = boundsLine;

        Laya.timer.frameLoop(1, this, this._drawBounds);
    }

    private _drawBounds(): void {
        if (!this.skeleton) {
            return;
        }
        let bounds = this.skeleton.bounds;
        this._boundsLine.clear();
        this._boundsLine.addLine(new Vector3(bounds.min.x, bounds.min.y, bounds.min.z), new Vector3(bounds.max.x, bounds.min.y, bounds.min.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.min.x, bounds.min.y, bounds.min.z), new Vector3(bounds.min.x, bounds.max.y, bounds.min.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.min.x, bounds.min.y, bounds.min.z), new Vector3(bounds.min.x, bounds.min.y, bounds.max.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.min.y, bounds.min.z), new Vector3(bounds.max.x, bounds.max.y, bounds.min.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.min.y, bounds.min.z), new Vector3(bounds.max.x, bounds.min.y, bounds.max.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.min.y, bounds.max.z), new Vector3(bounds.max.x, bounds.max.y, bounds.max.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.max.y, bounds.min.z), new Vector3(bounds.max.x, bounds.max.y, bounds.max.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.max.y, bounds.min.z), new Vector3(bounds.min.x, bounds.max.y, bounds.min.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.max.y, bounds.max.z), new Vector3(bounds.min.x, bounds.max.y, bounds.max.z), Color.RED, Color.RED);
        this._boundsLine.addLine(new Vector3(bounds.max.x, bounds.max.y, bounds.max.z), new Vector3(bounds.max.x, bounds.min.y, bounds.max.z), Color.RED, Color.RED);
    }

    private initUI(): void {
        let x = (Laya.stage.width - 150 * 4) / 2;
        let width = 150;
        let height = 60;
        let spacing = 100 + width;
        let y = 100;
        this.templetButton = this.creatButton(x, y, width, height, this, this.switchTemplet, "切换模板");
        this.animationButton = this.creatButton(x + spacing, y, width, height, this, this.play, "切换动画");
        this.skinButton = this.creatButton(x + spacing * 2, y, width, height, this, this.switchSkin, "切换皮肤");
        this.fastRenderButton = this.creatButton(x + spacing * 3, y, width, height, this, this.switchFastRender, "快速渲染");
        this.billboardButton = this.creatButton(x + spacing * 4, y, width, height, this, this.switchBillboard, "面向相机");

        this.updateButtonLabels();
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

    private applyTemplet(index: number): void {
        let templet = this.getTempletByIndex(index);
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
        this.skeleton.play(this.currentAnimationNames[this.currentAnimationIndex], false, true);
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
        let nextIndex = this.normalizeIndex(this.currentTempletIndex + 1, this.skeletonInfos.length);
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

    private switchBillboard(): void {
        this.enableBillboard = !this.enableBillboard;
        if (this.skeleton) {
            this.skeleton.billboard = this.enableBillboard;
        }
        this.updateButtonLabels();
    }

    private updateButtonLabels(): void {
        let templetInfo = this.skeletonInfos[this.currentTempletIndex];
        let animationName = this.currentAnimationNames[this.currentAnimationIndex] ?? "无";
        let skinName = this.currentSkinNames[this.currentSkinIndex] ?? "无";

        let skeletonTotal = this.skeletonInfos.length;
        let animationTotal = this.currentAnimationNames.length;
        let skinTotal = this.currentSkinNames.length;

        this.templetButton.label = `切换模板 (${templetInfo ? templetInfo.name : "无"} ${skeletonTotal ? `${this.currentTempletIndex + 1}/${skeletonTotal}` : ""})`;
        this.animationButton.label = `切换动画 (${animationName}${animationTotal ? ` ${this.currentAnimationIndex + 1}/${animationTotal}` : ""})`;
        this.skinButton.label = `切换皮肤 (${skinName}${skinTotal ? ` ${this.currentSkinIndex + 1}/${skinTotal}` : ""})`;
        this.fastRenderButton.label = `快速渲染 (${this.useFastRender ? "开启" : "关闭"})`;
        this.billboardButton.label = `面向相机 (${this.enableBillboard ? "开启" : "关闭"})`;
    }

    private getTempletByIndex(index: number): SpineTemplet | undefined {
        let info = this.skeletonInfos[this.normalizeIndex(index, this.skeletonInfos.length)];
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
        return index % length;
    }
}

