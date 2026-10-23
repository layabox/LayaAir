/** 普通静态 Mesh 的 TAA 示例：相机运动、细几何体、透明裁剪。 */
import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { TemporalAAQuality } from "laya/d3/postProcessEffect/TemporalAAEffect";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "laya/RenderEngine/RenderEnum/TextureFormat";
import { MaterialRenderMode } from "laya/resource/Material";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Texture } from "laya/resource/Texture";
import { Texture2D } from "laya/resource/Texture2D";

export class PostProcess_TAA {
    readonly ready: Promise<void>;
    scene: Scene3D;
    camera: Camera;
    output: RenderTexture;
    centerMesh: MeshSprite3D;
    cutoutMesh: MeshSprite3D;
    animateCamera = true;
    readonly root = new Sprite();
    private _time = 0;
    private _disposed = false;
    private _status: Text;
    private _view = new Sprite();
    private _meshes: Mesh[] = [];
    private _materials: UnlitMaterial[] = [];
    private _textures: Texture2D[] = [];

    constructor() { this.ready = this.start(); }

    private async start(): Promise<void> {
        await Laya.init(1100, 720);
        if (this._disposed) return;
        Laya.stage.scaleMode = Stage.SCALE_SHOWALL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Laya.stage.bgColor = "#101827";
        Laya.stage.addChild(this.root);
        this.root.on(Event.UNDISPLAY, this, this.destroy);
        this.label("TAA · ordinary Mesh / MRT motion vectors", 24, 14, 28);
        this.label("Thin geometry, alpha clipping and camera motion over stationary Mesh. No external assets.", 24, 52, 16);
        this._view.pos(24, 100).size(1052, 526);
        this.root.addChild(this._view);
        this.scene = Laya.stage.addChildAt(new Scene3D(), 0) as Scene3D;
        this.camera = this.scene.addChild(new Camera(0, 0.1, 50)) as Camera;
        this.camera.clearFlag = CameraClearFlags.SolidColor;
        this.camera.clearColor = new Color(0.04, 0.06, 0.09, 1);
        this.camera.msaa = false;
        this.camera.enableHDR = true;
        this.output = new RenderTexture(960, 480, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1, false, true);
        this.camera.renderTarget = this.output;
        this._view.texture = new Texture(this.output);
        this.setCameraPose(0);
        this.createScene();
        this.camera.taaSettings.quality = TemporalAAQuality.High;
        this.camera.taaSettings.sharpening = 0;
        this.camera.taa = true;
        this._status = this.label("", 24, 670, 15);
        this.button("TAA on / off", 24, () => this.camera.taa = !this.camera.taa);
        this.button("Quality", 175, () => this.camera.taaSettings.quality = (this.camera.taaSettings.quality + 1) % 5);
        this.button("RCAS 0 / 0.5 / 1", 326, () => this.camera.taaSettings.sharpening = (this.camera.taaSettings.sharpening + 0.5) % 1.5);
        this.button("Camera motion", 477, () => this.animateCamera = !this.animateCamera);
        this.button("Reset history", 628, () => this.camera.taaSettings.resetHistory());
        Laya.timer.frameLoop(1, this, this.update);
    }

    /** 供 GPU 测试复用场景。 */
    setCameraPose(time: number): void {
        this.camera.transform.position = new Vector3(Math.sin(time * 0.3) * 1.4, 2.6, 7.2);
        this.camera.transform.lookAt(new Vector3(0, 0.75, 0), new Vector3(0, 1, 0));
    }

    private createScene(): void {
        const box = PrimitiveMesh.createBox(1, 1, 1);
        const quad = PrimitiveMesh.createQuad(2.2, 2.2);
        this._meshes.push(box, quad);
        const white = this.material(new Color(0.86, 0.9, 0.94, 1));
        const dark = this.material(new Color(0.055, 0.075, 0.11, 1));
        const ground = this.addMesh(box, dark, 0, -0.15, 0);
        ground.transform.localScale = new Vector3(9, 0.2, 8);
        for (let i = 0; i < 40; i++) {
            const slat = this.addMesh(box, i % 2 ? dark : white, (i - 19.5) * 0.15, 1.15, -1.4);
            slat.transform.localScale = new Vector3(0.035, 2.3, 0.08);
            slat.transform.rotationEuler = new Vector3(0, 0, 13);
        }
        this.centerMesh = this.addMesh(box, this.material(new Color(0.95, 0.26, 0.075, 1)), 0, 0.55, 1.2);
        this.centerMesh.transform.localScale = new Vector3(0.9, 0.9, 0.9);
        const cutout = this.material(new Color(0.12, 0.85, 0.38, 1));
        cutout.materialRenderMode = MaterialRenderMode.RENDERMODE_CUTOUT;
        cutout.cull = RenderState.CULL_NONE;
        cutout.alphaTestValue = 0.5;
        const texture = new Texture2D(32, 32, TextureFormat.R8G8B8A8, false, false);
        const data = new Uint8Array(32 * 32 * 4);
        for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
            const p = (y * 32 + x) * 4;
            data[p] = data[p + 1] = data[p + 2] = 255;
            data[p + 3] = ((x >> 2) + (y >> 2)) % 2 ? 255 : 0;
        }
        texture.setPixelsData(data, false, false);
        texture.filterMode = FilterMode.Point;
        this._textures.push(texture);
        cutout.albedoTexture = texture;
        this.cutoutMesh = this.addMesh(quad, cutout, 2.3, 1.2, 0);
    }

    private material(color: Color): UnlitMaterial {
        const material = new UnlitMaterial();
        material.albedoColor = color;
        this._materials.push(material);
        return material;
    }

    private addMesh(mesh: Mesh, material: UnlitMaterial, x: number, y: number, z: number): MeshSprite3D {
        const sprite = this.scene.addChild(new MeshSprite3D(mesh)) as MeshSprite3D;
        sprite.meshRenderer.sharedMaterial = material;
        sprite.transform.position = new Vector3(x, y, z);
        return sprite;
    }

    private update(): void {
        this._time += Math.min(Laya.timer.delta, 50) / 1000;
        if (this.animateCamera) this.setCameraPose(this._time);
        this._status.text = `TAA ${this.camera.taa ? "on" : "off"}  |  Quality ${TemporalAAQuality[this.camera.taaSettings.quality]}  |  RCAS ${this.camera.taaSettings.sharpening}  |  history stores the unsharpened resolve`;
    }

    private label(text: string, x: number, y: number, fontSize: number): Text {
        const label = new Text();
        label.text = text; label.color = "#dce6f1"; label.fontSize = fontSize;
        label.pos(x, y).size(1052, 36);
        this.root.addChild(label);
        return label;
    }

    private button(text: string, x: number, action: () => void): void {
        const button = new Sprite();
        button.pos(x, 635).size(141, 29);
        button.graphics.drawRect(0, 0, 141, 29, "#27445c");
        const label = new Text();
        label.text = text; label.color = "#e5f0fb"; label.fontSize = 14;
        label.align = "center"; label.valign = "middle"; label.size(141, 29);
        label.mouseEnabled = false;
        button.addChild(label);
        button.on(Event.CLICK, this, action);
        this.root.addChild(button);
    }

    destroy(): void {
        if (this._disposed) return;
        this._disposed = true;
        Laya.timer.clearAll(this);
        this.root.offAllCaller(this);
        this._view.texture?.destroy(); this._view.texture = null;
        if (this.camera) this.camera.renderTarget = null;
        this.scene?.destroy(true);
        this.output?.destroy();
        for (const material of this._materials) material.destroy();
        for (const mesh of this._meshes) mesh.destroy();
        for (const texture of this._textures) texture.destroy();
        if (!this.root.destroyed) this.root.destroy(true);
    }
}
