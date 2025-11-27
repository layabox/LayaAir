/**
 * @description
 * 简化版 LargeTexManager 测试用例
 */
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Vector4 } from "laya/maths/Vector4";
import { Main } from "./../Main";
import { LargeTexManager } from "../../layaAir/laya/large/LargeTexManager";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Box } from "laya/ui/Box";
import { Label } from "laya/ui/Label";
import { Texture } from "laya/resource/Texture";
import { Event } from "laya/events/Event";
import { Stat } from "laya/utils/Stat";
import { LayaGL } from "laya/layagl/LayaGL";
import { StatElement } from "laya/layagl/StatisticsContext";
import { Button } from "laya/ui/Button";
import { LargeTexProcessor } from "laya/large/LargeTexProcessor";

export class Sprite_LargeTexManager_Simple {
    Main: typeof Main = null;
    private largeTexManager: LargeTexManager;
    private textures: Texture[] = [];
    private texture2ds: Texture2D[] = [];
    private originalUV : Float32Array[] = [];

    private _sprites: Sprite[] = [];
    private _container: Box;
    private _drawCallLabel: Label;
    private _stepLabel: Label;
    private _stepIndex = 0;
    private _stepStrs = [
        "点击开始,合成大图",
        "点击开始,更新Texture",
        "更新完成"
    ]
    

    constructor(maincls: typeof Main) {
        this.Main = maincls;
        Laya.init(1280, 720).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.initLargeTexManager();
            this.loadAndMergeTextures();
        });
    }

    /**
     * 初始化大图合集管理器
     */
    private initLargeTexManager(): void {
        // 创建大图合集管理器
        this.largeTexManager = new LargeTexManager(
            [1024, 1024],  // 大纹理尺寸 512x512
            2,            // 最多2张大纹理
            16,           // 小纹理单元尺寸 16x16
            1,            // 小纹理扩边尺寸 1像素
            RenderTargetFormat.R8G8B8A8  // RGBA格式
        );
        
        this.largeTexManager.name = "SimpleLargeTex";
        this.largeTexManager.immediately = true;
        this.largeTexManager.gammaCorrection = 2.2;
        
        console.log("LargeTexManager 初始化完成");
    }

    /**
     * 加载图片并合并到大图合集中
     */
    private loadAndMergeTextures(): void {
        // 加载多张图片进行测试
        const loadUrls = [
            "res/apes/monkey1.png",
            "res/apes/monkey2.png",
            {url:"atlas/comp.atlas", type: Loader.ATLAS}
        ];

        const imageUrls = [
            "res/apes/monkey1.png",
            "atlas/comp/image.png"
        ];
        Laya.loader.load(loadUrls, Loader.IMAGE).then(() => {
            this.start(imageUrls);
        }).catch((error) => {
            console.error("图片加载失败:", error);
        });
    }

   

    private start(imageUrls: string[]): void {
        for (const url of imageUrls) {
            const texture = Laya.loader.getRes(url, Loader.IMAGE) as Texture;
            if (texture) {
                this.textures.push(texture);
                this.texture2ds.push(texture.bitmap as Texture2D);
                this.originalUV.push((texture.uv as Float32Array).slice());
                console.log(texture, texture.bitmap);
            }
        }

        let currentY = 0;
        this._container = new Box();
        this._container.pos(50, 50);
        this.Main.box2D.addChild(this._container);

        for (const texture of this.textures) {
            const sprite = new Sprite();
            // sprite.texture = texture;
            sprite.graphics.drawTexture(texture, 0, 0);
            this._container.addChild(sprite);
            sprite.pos(0, currentY);
            currentY += texture.height + 60;
            this._sprites.push(sprite);
            // 添加标签显示信息
            const label = this.createLabel(this._container, `尺寸: ${texture.width}x${texture.height}`, 0, currentY - 30, 16, "#ffff00");
            this._container.addChild(label);
        }
       
        let label = this.createLabel(this._container, `DrawCall: ${0}`, 0, 400, 24, "#ffff00");
        this._drawCallLabel = label;
        this._stepLabel = this.createLabel(this._container, this._stepStrs[0], 0, 424, 24, "#ffff00");
        Laya.timer.frameLoop(1, this, this.showDrawCall);
        Laya.stage.on(Event.CLICK, this, this.step);
    }

    private step(): void {
        // this._sprites.forEach((sprite) => {
        //     sprite.destroy();
        // });

        // this._sprites = [];
        // LargeTexProcessor.cleanupUnused();

        // return
        this._stepIndex++;

        if (this._stepIndex === 1) {
            this.mergeTexturesToLargeTex();
        } else if (this._stepIndex === 2) {
            this.repaceLoaderTexture();
        } else {
            this._stepIndex = 0;
            Laya.stage.off(Event.CLICK, this, this.step);
        }

        this._stepLabel.text = this._stepStrs[this._stepIndex];
    }

    private showDrawCall(): void {
        let drawCall = LayaGL.statAgent.getElementData(StatElement.CT_DrawCall);
        this._drawCallLabel.text = `DrawCall: ${drawCall}`;
    }

    /**
     * 将多张图片合并到大图合集中并创建精灵
     */
    private mergeTexturesToLargeTex(): void {
        // 将纹理合并到大图合集中
        let success = false;
        let largeTextureIndex = -1;
        
        for (let i = 0; i < this.textures.length; i++) {
            let texture = this.texture2ds[i];

            console.log(`正在合并纹理 ${i + 1}: ID=${texture.id}, 尺寸=${texture.width}x${texture.height}`);
            
            const result = this.largeTexManager.addTexture(texture, 1.0, -1, null, false);
            if (result >= 0) {
                largeTextureIndex = result;
                success = true;
                console.log(`纹理 ${i + 1} 成功合并到大图合集，大纹理编号: ${result}`);
            } else {
                console.error(`纹理 ${i + 1} 合并到大图合集失败`);
            }
        }
        
        if (success) {
            this.createSpritesFromLargeTex(largeTextureIndex);
        } else {
            console.error("所有纹理合并到大图合集失败");
        }
    }
    
    /**
     * 从大图合集中创建多个精灵
     */
    private createSpritesFromLargeTex( largeTextureIndex: number): void {
        let currentY = 0;
        let currentX = 150;
        let maxHeight = 0;

        for (let i = 0; i < this.textures.length; i++) {
            const texture2d = this.texture2ds[i];
            const otexture = this.textures[i];
            // 从大图合集中获取纹理和UV坐标
            const textureOut = this.largeTexManager.getTexture(texture2d.id, largeTextureIndex);
            
            if (textureOut && textureOut.texture) {
                // 创建精灵
                const sprite = new Sprite();
                sprite.pos(currentX, currentY);
                this._container.addChild(sprite);
                let texture = new Texture(textureOut.texture, null, otexture.width, otexture.height);
                texture.width = otexture.width;
                texture.height = otexture.height;
                this._repaceTexture(texture, this.originalUV[i], textureOut);
                texture.rotate = true;
                sprite.graphics.drawTexture(texture, 0, 0);

                // 添加UV信息标签
                const uvLabel = this.createLabel(this._container, `UV:\nx:${textureOut.texItem.x},\ny:${textureOut.texItem.y},\nw:${textureOut.texItem.w},\nh:${textureOut.texItem.h}`, currentX + sprite.width + 10, currentY, 12, "#00ff00");
                this._container.addChild(uvLabel);

                currentY += texture.height + 60;
                maxHeight = Math.max(maxHeight, texture.height);
            } else {
                console.error(`无法从大图合集中获取纹理 ${i + 1}`);
            }
        }   

        // 显示大图合集信息
        this.showLargeTexInfo(this._container, 400, 0);
    }

    /**
     * 显示大图合集信息
     */
    private showLargeTexInfo(container: Box, x:number  , y: number): void {

        const infoLabel = this.createLabel(container, `大图合集信息:`, x, y, 18, "#ffffff");
        container.addChild(infoLabel);

        const usageRate = this.largeTexManager.getLoadUsageRate() * 100;
        const usageLabel = this.createLabel(container, `使用率: ${usageRate.toFixed(2)}%`, x, y + 20, 14, "#00ffff");
        container.addChild(usageLabel);

        const gpuMemory = this.largeTexManager.calculateGpuMemory();
        const memoryLabel = this.createLabel(container, `GPU内存使用: ${(gpuMemory / 1024 / 1024).toFixed(2)} MB`, x, y + 40, 14, "#ff00ff");
        container.addChild(memoryLabel);

        let sprite = new Sprite();
        sprite.pos(x, y + 60);
        container.addChild(sprite);
        let texture = new Texture(this.largeTexManager.largeTexs[0]);
        // sprite.texture = texture;
        sprite.graphics.drawTexture(texture, 0, 0);
        sprite.size(512,512);
    }

    private repaceLoaderTexture() {
        for (let i = 0; i < this.textures.length; i++) {
            let originalTexture = this.texture2ds[i];
            let textureOut = this.largeTexManager.getTexture(originalTexture.id, 0);
            this._repaceTexture(this.textures[i], this.originalUV[i], textureOut);
        }
    }

    private _repaceTexture(texture: Texture, uv: Float32Array, textureOut: any): void {
        let oSWidth = texture.sourceWidth;
        let oSHeight = texture.sourceHeight;
        let oWidth = texture.width;
        let oHeight = texture.height;
        let x = textureOut.texItem.x;
        let y = textureOut.texItem.y;
        let w = textureOut.texItem.w;
        let h = textureOut.texItem.h;
        let nuv: Float32Array;
        if (uv === Texture.DEF_UV) {
            nuv = Float32Array.from([
                x, y, 
                x + w, y, 
                x + w, y + h, 
                x, y + h
            ]);
        } else {
            let ox = uv[0];
            let oy = uv[1];
            let owidth = uv[2] - ox;
            let oheight = uv[5] - oy;
            let nx = x + ox * w;
            let ny = y + oy * h;
            let nwidth = owidth * w;
            let nheight = oheight * h;
            nuv = Float32Array.from([
                nx, ny, 
                nx + nwidth, ny, 
                nx + nwidth, ny + nheight, 
                nx, ny + nheight
            ]);
        }
        texture.setTo(textureOut.texture, nuv, oSWidth, oSHeight);
        texture.width = oWidth;
        texture.height = oHeight;
    }

    createLabel(container: Box, text: string, x: number, y: number , fontSize: number = 14, color: string = "#ffffff"): Label {
        const label = new Label();
        label.text = text;
        label.fontSize = fontSize;
        label.color = color;
        label.pos(x, y);
        // container.addChild(label);
        label.zIndex = 2;
        return label;
    }

    /**
     * 销毁资源
     */
    destroy(): void {
        if (this.largeTexManager) {
            this.largeTexManager.destroy();
        }
    }
}
