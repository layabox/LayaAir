import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { LayaGL } from "laya/layagl/LayaGL";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { RenderCapable } from "laya/RenderEngine/RenderEnum/RenderCapable";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { BaseTexture } from "laya/resource/BaseTexture";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Texture } from "laya/resource/Texture";

/** 共享场景和预览；附件申请由各示例负责。 */
export class MRTDemoBase {
    camera: Camera;
    scene: Scene3D;
    root = new Sprite();
    status: Text;
    output: RenderTexture;
    renderers: MeshRenderer[] = [];
    onDispose: () => void;
    rotating = true;
    private _disposed = false;
    private _main = new Sprite();
    private _views: Sprite[] = [];
    private _labels: Text[] = [];
    private _hints: Text[] = [];
    private _meshes: Mesh[] = [];
    private _materials: PBRStandardMaterial[] = [];
    private _buttonX = 24;

    async init(title: string, description: string, mainOutputLabel: string = "相机最终输出 · 官方 PBR 光照"): Promise<boolean> {
        await Laya.init(0, 0);
        if (this._disposed) return false;
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Laya.stage.bgColor = "#0b1120";
        this.root.graphics.drawRect(0, 0, 1280, 800, "#0b1120");
        Laya.stage.addChild(this.root);
        this.root.on(Event.UNDISPLAY, this, () => this.onDispose ? this.onDispose() : this.destroy());
        this.label(title, 24, 18, 1232, 32, 26, "#f1f5f9");
        this.label(description, 24, 61, 1232, 43, 16, "#a8bdd3");
        this.label(mainOutputLabel, 24, 161, 710, 26, 18, "#e2e8f0");
        this._main.pos(24, 196).size(710, 474);
        this.root.addChild(this._main);
        for (let i = 0; i < 4; i++) {
            const x = 754 + (i % 2) * 254, y = 159 + Math.floor(i / 2) * 258;
            const card = new Sprite();
            card.pos(x, y);
            card.graphics.drawRect(0, 0, 242, 246, "#142237");
            this.root.addChild(card);
            const label = this.label("等待附件", x + 9, y + 9, 224, 28, 15, "#67e8f9");
            const view = new Sprite();
            view.pos(x + 6, y + 43).size(230, 154);
            this.root.addChild(view);
            const hint = this.label("当前没有绑定纹理", x + 9, y + 202, 224, 39, 13, "#a8bdd3");
            this._labels.push(label); this._views.push(view); this._hints.push(hint);
        }
        this.status = this.label("初始化中…", 24, 698, 1232, 62, 16, "#fcd34d");
        this.label("旋转物体可观察附件变化；右侧直接采样 GPU 附件，没有用固定图片模拟。", 24, 768, 1232, 24, 14, "#94a3b8");
        Laya.stage.on(Event.RESIZE, this, this.resize);
        this.resize();
        if (!LayaGL.renderEngine.getCapable(RenderCapable.MRT)) {
            this.setStatus("此示例需要 WebGL2 或 WebGPU 的 MRT 支持。");
            return false;
        }
        this.scene = new Scene3D();
        Laya.stage.addChildAt(this.scene, 0);
        this.scene.ambientColor = new Color(0.23, 0.27, 0.34, 1);
        this.camera = this.scene.addChild(new Camera(0, 0.1, 30)) as Camera;
        this.camera.transform.position = new Vector3(5.5, 3.8, 7.5);
        this.camera.transform.lookAt(new Vector3(0, 0.65, 0), new Vector3(0, 1, 0));
        this.camera.clearFlag = CameraClearFlags.SolidColor;
        this.camera.clearColor = new Color(0.035, 0.055, 0.09, 1);
        this.camera.msaa = false;
        // 普通外部 RT 只负责最终展示；Camera 是否申请内部 MRT 由每个示例决定。
        this.output = RenderTexture.createFromPool(720, 480, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1, false, true);
        this.camera.renderTarget = this.output;
        this.bind(this._main, this.output);
        const sun = this.scene.addChild(new Sprite3D("方向光")) as Sprite3D;
        sun.transform.rotationEuler = new Vector3(-38, -32, 0);
        const light = sun.addComponent(DirectionLightCom);
        light.color = new Color(1, 0.91, 0.79, 1);
        light.intensity = 2.8;
        this.createObjects();
        Laya.timer.frameLoop(1, this, this.animate);
        return true;
    }

    addButton(text: string, handler: () => void): Sprite {
        const width = Math.min(220, Math.max(125, text.length * 14 + 24));
        const button = new Sprite();
        button.pos(this._buttonX, 115).size(width, 32);
        button.graphics.drawRect(0, 0, width, 32, "#244b68");
        this.root.addChild(button);
        const label = new Text();
        label.text = text; label.font = "Microsoft YaHei"; label.fontSize = 14;
        label.color = "#e0f2fe"; label.align = "center"; label.valign = "middle";
        label.size(width, 32); label.mouseEnabled = false;
        button.addChild(label);
        button.on(Event.CLICK, this, handler);
        this._buttonX += width + 10;
        return button;
    }

    setStatus(text: string): void { if (this.status && this.status.text !== text) this.status.text = text; }

    setPreview(slot: number, texture: BaseTexture | null, title: string, hint: string): void {
        if (!this._views[slot] || this._disposed) return;
        this._labels[slot].text = title;
        this._hints[slot].text = hint;
        this.bind(this._views[slot], texture, true);
    }

    private bind(view: Sprite, bitmap: BaseTexture | null, flipY: boolean = false): void {
        if (view.texture?.bitmap === bitmap || (!view.texture && !bitmap)) return;
        const previous = view.texture;
        view.texture = bitmap ? new Texture(bitmap, flipY ? Texture.INV_UV : Texture.DEF_UV) : null;
        // 仅销毁 2D 包装，不能销毁借用的 MRT 附件或其 owner。
        previous?.destroy();
    }

    private label(text: string, x: number, y: number, width: number, height: number, size: number, color: string): Text {
        const label = new Text();
        label.text = text; label.font = "Microsoft YaHei"; label.fontSize = size;
        label.color = color; label.wordWrap = true; label.pos(x, y).size(width, height);
        this.root.addChild(label);
        return label;
    }

    private createObjects(): void {
        const sphere = PrimitiveMesh.createSphere(0.57, 32, 24);
        const box = PrimitiveMesh.createBox(1.05, 1.05, 1.05);
        const plane = PrimitiveMesh.createPlane(8, 6);
        this._meshes.push(sphere, box, plane);
        const colors = [new Color(0.9, 0.16, 0.08, 1), new Color(0.12, 0.65, 0.85, 1), new Color(0.9, 0.62, 0.13, 1)];
        for (let row = 0; row < 2; row++) for (let col = 0; col < 3; col++) {
            const node = this.scene.addChild(new MeshSprite3D(col === 1 ? box : sphere)) as MeshSprite3D;
            node.transform.position = new Vector3((col - 1) * 1.75, 0.6, (row - 0.5) * 1.85);
            const material = new PBRStandardMaterial();
            material.albedoColor = colors[col]; material.metallic = row ? 0.85 : 0.05;
            material.smoothness = 0.15 + col * 0.37;
            node.meshRenderer.sharedMaterial = material;
            this.renderers.push(node.meshRenderer); this._materials.push(material);
        }
        const ground = this.scene.addChild(new MeshSprite3D(plane)) as MeshSprite3D;
        const material = new PBRStandardMaterial();
        material.albedoColor = new Color(0.22, 0.28, 0.35, 1); material.metallic = 0; material.smoothness = 0.2;
        ground.meshRenderer.sharedMaterial = material;
        this.renderers.push(ground.meshRenderer); this._materials.push(material);
    }

    private animate(): void {
        if (this.rotating) for (let i = 0; i < 6; i++)
            this.renderers[i].owner.transform.rotate(new Vector3(0, Laya.timer.delta * 0.018, 0), true, false);
    }

    private resize(): void {
        const scale = Math.min(Laya.stage.width / 1280, Laya.stage.height / 800);
        this.root.scale(scale, scale).pos((Laya.stage.width - 1280 * scale) / 2, (Laya.stage.height - 800 * scale) / 2);
    }

    destroy(): void {
        if (this._disposed) return;
        this._disposed = true;
        Laya.timer.clearAll(this);
        Laya.stage.offAllCaller(this);
        this.root.offAllCaller(this);
        this.bind(this._main, null);
        for (const view of this._views) this.bind(view, null);
        if (this.camera) this.camera.renderTarget = null;
        this.scene?.destroy(true);
        for (const material of this._materials) material.destroy();
        for (const mesh of this._meshes) mesh.destroy();
        if (this.output) RenderTexture.recoverToPool(this.output);
        if (!this.root.destroyed) this.root.destroy(true);
    }
}
