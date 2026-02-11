import "laya/d3/core/scene/Scene3D";
import "laya/ModuleDef";
import "laya/d3/ModuleDef";
import "laya/d3/physics/ModuleDef";
import "laya/ui/ModuleDef";
import "laya/ani/ModuleDef";
import "laya/spine/ModuleDef";

import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { SpineTemplet } from "laya/spine/SpineTemplet";
import { Browser } from "laya/utils/Browser";
import { Stat } from "laya/utils/Stat";
import { Sprite } from "laya/display/Sprite";
import { Spine2DRenderNode } from "laya/spine/Spine2DRenderNode";
import { SpineBakeScript } from "laya/spine/SpineBakeScript";
import { SpineConst } from "laya/spine/SpineConst";
import { SpineAdapter } from "laya/spine/web/SpineAdapter";
import { JSSpineFactory } from "laya/spine/web/JSSpineFactory";
import { LayaEnv } from "LayaEnv";
import { NativeSpineFactory } from "laya/spine/native/NativeSpineFactory";
import { BaseRender2DType } from "laya/display/SpriteConst";
import { BatchManager } from "laya/RenderDriver/RenderModuleData/WebModuleData/2D/BatchManager";
import { SpineInstanceBatch } from "laya/spine/web/base/2d/batch/SpineInstanceBatch";
import { SpineNormalBatch } from "laya/spine/web/base/2d/batch/SpineNormalBatch";
import { SpineNormalRenderUpdater } from "laya/spine/web/base/optimize/SpineNormalRenderUpdater";
import { Event } from "laya/events/Event";
import { NativeSkeletonOptimise } from "laya/spine/native/NativeSkeletonOptimise";
import { ExternalSkin } from "laya/spine/ExternalSkin";
import { ExternalSkinItem } from "laya/spine/ExternalSkinItem";

export class SpineBoyMultipleDemo {
    private renderNodes: Spine2DRenderNode[] = [];
    // private skeletonUrl: string = "sample-resource/res/spine/42/celestial-circus-pro.skel";
    // private skeletonUrl: string = "sample-resource/res/spine/42/sedie.json";
    private skeletonUrl: string = "sample-resource/res/spine/42/spineboy-pro.skel";
    // private skeletonUrl: string = "sample-resource/res/spine/38/spineboy-pma.skel";
    private jsonSTR = "{\"bonesNums\":55,\"aniOffsetMap\":{\"textureWidth\":512,\"aim\":0,\"death\":330,\"hoverboard\":33000,\"idle\":39710,\"idle-turn\":50820,\"jump\":52690,\"run\":61600,\"run-to-idle\":66990,\"shoot\":68860,\"walk\":73150},\"simpPath\":\"spineboy-pma.ktx\"}";
    private ktxURL = "sample-resource/res/spine/38/spineboy-pma.ktx"
    private instanceCount: number = 800; 
    private spacingX: number = 60; 
    private spacingY: number = 30;
    private enableCache = true;
    private dynamic = true;

    constructor() {
        // SpineConst.VERSION = "3.8";

        Laya.init(1024, 768).then(async () => {
            Laya.stage.scaleMode = "full";
            Laya.stage.bgColor = "#2c3e50";
            Stat.show();

            Laya.stage.once("mousedown", async () => {
                console.log("mousedown")
                try {
                    const templet = await Laya.loader.load(this.skeletonUrl, Loader.SPINE) as SpineTemplet;
                    this.createMultipleInstances(templet);
                } catch (error) {
                    console.error("Failed to load Spine skeleton", error);
                }
            })
        });
    }

    private createMultipleInstances(templet: SpineTemplet): void {
        const startX = 0;
        const startY = 0;
        const stageWidth = Laya.stage.width;

        let currentX = startX;
        let currentY = startY;

        let json = JSON.parse(this.jsonSTR);
        json.simpPath = this.ktxURL;

        for (let i = 0; i < this.instanceCount; i++) {
            const sprite = new Sprite();
            Laya.stage.addChild(sprite);

            if (currentX + this.spacingX > stageWidth && i > 0) {
                currentX = startX;
                currentY += this.spacingY;
            }

            sprite.pos(currentX, currentY);

            const renderNode = sprite.addComponent(Spine2DRenderNode);
            renderNode.templet = templet;
            // renderNode.play(6, true, true);
            renderNode.play( "walk", true, true);
            // renderNode.play("hoverboard", true, true);
            if (this.dynamic) {
                // let bake = sprite.addComponent(SpineBakeScript);
                // bake.initBake(json);
            } else {
                renderNode.useFastRender = false; 
            }
            renderNode.enableCache = this.enableCache;

            this.renderNodes.push(renderNode);

            currentX += this.spacingX;
            if (!i) {
                //@ts-ignore
                window.ttt = renderNode;

                // let externalSkins: ExternalSkin[] = [];
                // let skin = new ExternalSkin;
                // let item = new ExternalSkinItem;
                // item.attachment = "rear-upper-arm";
                // item.skin = "default";
                // item.slot = "head";
                // skin.items = [item];
                // skin.templet = templet;
                // externalSkins[0] = skin;
                // renderNode.externalSkins = externalSkins;
            }

            renderNode.resetExternalSkin();
        }

    }
}
