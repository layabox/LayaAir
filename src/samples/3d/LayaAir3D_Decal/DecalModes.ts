/** Industrial material study: the same projectors, rendered with either technique.
 * 工业材质示例：同一组投射器可使用两种贴花技术渲染。 */
import { Laya } from "Laya";
import { Camera, CameraClearFlags, DecalMode } from "laya/d3/core/Camera";
import { DecalProjector } from "laya/d3/component/DecalProjector";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { ShadowMode } from "laya/d3/core/light/ShadowMode";
import { ShadowCascadesMode } from "laya/d3/core/light/ShadowCascadesMode";
import { DecalMaterial } from "laya/d3/core/material/DecalMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PostProcess } from "laya/d3/core/render/postProcessBase/PostProcess";
import { ColorGradEffect, ToneMappingType } from "laya/d3/postProcessEffect/ColorGradEffect";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Text } from "laya/display/Text";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureFormat } from "laya/RenderEngine/RenderEnum/TextureFormat";
import { Resource } from "laya/resource/Resource";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Texture } from "laya/resource/Texture";
import { TextureCube } from "laya/resource/TextureCube";
import { Loader } from "laya/net/Loader";
import { DecalShowcaseTextures, DecalShowcaseTextureSet } from "./DecalShowcaseTextures";
import { FlowingWaterDecalMaterial } from "./FlowingWaterDecalMaterial";
import { DecalInspector } from "./DecalInspector";

type DecalTextureChannel = "albedo" | "normal" | "maos";
const decalNames = ["磨损编号 07", "警示条·跨底材", "警示条·钢板", "油渍", "流动水渍"];
const decalChannels: DecalTextureChannel[] = ["albedo", "normal", "maos"];

export class DecalModes {
    private _root = new Sprite();
    private _scene: Scene3D;
    private _camera: Camera;
    private _output: RenderTexture;
    private _preview: Sprite;
    private _status: Text;
    private _lightNode: Sprite3D;
    private _receiver: MeshSprite3D;
    private _waterWall: MeshSprite3D;
    private _waterMaterial: FlowingWaterDecalMaterial;
    private _waterPaused = false;
    private _waterTime = 0;
    private _projectors: DecalProjector[] = [];
    private _materials: DecalMaterial[] = [];
    private _inspector: DecalInspector;
    private _selectedDecalIndex = 4;
    private _decalBoundsVisible = true;
    private _decalTextureVisible = true;
    private _decalTextureChannel: DecalTextureChannel = "albedo";
    private _controlButtons: Sprite[] = [];
    private _resources: Resource[] = [];
    private _mode = DecalMode.DBuffer;
    private _surfaceOnly = false;
    private _enabled = true;
    private _rotatingLight = false;
    private _moving = false;
    private _time = 0;
    private _disposed = false;
    private _shell = !!(window as any).__decalPreviewShell;
    private _yaw = 0.30;
    private _pitch = 0.80;
    private _distance = 15.0;
    private _dragging = false;
    private _mouseX = 0;
    private _mouseY = 0;

    constructor() { void this.start(); }

    private async start(): Promise<void> {
        await Laya.init(0, 0);
        if (this._disposed) return;
        Laya.stage.scaleMode = Stage.SCALE_FULL;
        Laya.stage.screenMode = Stage.SCREEN_NONE;
        Laya.stage.bgColor = "#171916";
        Laya.stage.addChild(this._root);
        this._root.on(Event.UNDISPLAY, this, this.destroy);
        this._preview = new Sprite();
        this._root.addChild(this._preview);
        if (!this._shell) this.createControls();
        this._scene = Laya.stage.addChildAt(new Scene3D(), 0) as Scene3D;
        this._scene.ambientColor = new Color(0.27, 0.29, 0.33, 1);
        this._scene.reflectionIntensity = 0.75;
        this._camera = this._scene.addChild(new Camera(0, 0.1, 60)) as Camera;
        this._camera.fieldOfView = 35;
        this._camera.clearFlag = CameraClearFlags.SolidColor;
        this._camera.clearColor = new Color(0.095, 0.105, 0.09, 1);
        this._camera.msaa = false;
        this._camera.enableHDR = true;
        const post = this._camera.postProcess = new PostProcess();
        const grade = new ColorGradEffect();
        grade.toneMapping = ToneMappingType.ACES;
        grade.enableColorAdjust = true;
        grade.postExposure = 1.15;
        post.addEffect(grade);
        this._camera.taa = true;
        this._lightNode = this.addLight("Large warm key", new Vector3(-51, -30, 0), new Color(1, 0.98, 0.93), 2.8);
        const key = this._lightNode.getComponent(DirectionLightCom);
        key.shadowMode = ShadowMode.SoftLow;
        key.shadowDistance = 28;
        key.shadowResolution = 2048;
        key.shadowCascadesMode = ShadowCascadesMode.NoCascades;
        key.shadowDepthBias = 0.45;
        key.shadowNormalBias = 0.5;
        key.shadowStrength = 0.82;
        this.addLight("Cool studio fill", new Vector3(-28, 145, 0), new Color(0.78, 0.87, 1), 0.85);
        this.addLight("Soft edge light", new Vector3(-35, -145, 0), new Color(1, 0.97, 0.88), 0.7);
        this.createEnvironment();
        this.createReceivers();
        this.createProjectors();
        this._inspector = new DecalInspector(this._root);
        this.selectDecal(this._selectedDecalIndex);
        this.setMode(this._mode);
        this.resize();
        this._preview.on(Event.MOUSE_DOWN, this, this.beginOrbit);
        Laya.stage.on(Event.MOUSE_UP, this, this.endOrbit);
        Laya.stage.on(Event.MOUSE_MOVE, this, this.orbit);
        Laya.stage.on(Event.RESIZE, this, this.resize);
        window.addEventListener("decal-preview-resize", this.resizeFromShell);
        Laya.timer.frameLoop(1, this, this.animate);
        if (this._shell) {
            const cube = await Laya.loader.load("/decal-assets/studio-ibl.ktx", Loader.TEXTURECUBE) as TextureCube;
            if (cube && !this._disposed) {
                this._scene.iblTex = cube;
                this._scene.iblTexRGBD = true;
                this._scene.reflectionIntensity = 0.7;
            }
        }
    }

    private addLight(name: string, euler: Vector3, color: Color, intensity: number): Sprite3D {
        const node = this._scene.addChild(new Sprite3D(name)) as Sprite3D;
        node.transform.rotationEuler = euler;
        const light = node.addComponent(DirectionLightCom);
        light.color = color; light.intensity = intensity;
        return node;
    }

    private createEnvironment(): void {
        const size = 64, faces: Uint8Array[] = [];
        for (let face = 0; face < 6; face++) {
            const pixels = new Uint8Array(size * size * 4);
            for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
                const p = (y * size + x) * 4;
                const softbox = Math.exp(-((x - 29) ** 2 / 100 + (y - 20) ** 2 / 550));
                const value = (face === 2 ? 105 : face === 3 ? 22 : 42) + softbox * (face === 0 || face === 5 ? 140 : 65);
                pixels[p] = value; pixels[p + 1] = value * 0.98; pixels[p + 2] = value * 0.92; pixels[p + 3] = 255;
            }
            faces.push(pixels);
        }
        const cube = new TextureCube(size, TextureFormat.R8G8B8A8, true, true);
        cube.setPixelsData(faces, false, false); cube.filterMode = FilterMode.Trilinear;
        this._scene.iblTex = cube; this._scene.iblTexRGBD = false;
        this._resources.push(cube);
    }

    private textures(kind: "concrete" | "metal" | "stencil" | "hazard" | "oil"): DecalShowcaseTextureSet {
        const maps = DecalShowcaseTextures[kind](512);
        this._resources.push(maps.albedo, maps.normal, maps.maos);
        return maps;
    }

    private material(color: Color, metallic: number, smoothness: number, maps?: DecalShowcaseTextureSet): PBRStandardMaterial {
        const material = new PBRStandardMaterial();
        material.albedoColor = color; material.metallic = metallic; material.smoothness = smoothness;
        if (maps) {
            material.albedoTexture = maps.albedo; material.normalTexture = maps.normal; material.normalTextureScale = 0.65;
            material.metallicGlossTexture = maps.maos; material.occlusionTexture = maps.maos;
        }
        this._resources.push(material);
        return material;
    }

    private object(mesh: Mesh, position: Vector3, material: PBRStandardMaterial): MeshSprite3D {
        const object = this._scene.addChild(new MeshSprite3D(mesh)) as MeshSprite3D;
        object.transform.position = position;
        object.meshRenderer.sharedMaterial = material;
        object.meshRenderer.receiveShadow = true; object.meshRenderer.castShadow = true;
        this._resources.push(mesh);
        return object;
    }

    private createReceivers(): void {
        const concrete = this.textures("concrete"), metal = this.textures("metal");
        const ground = this.material(new Color(0.60, 0.63, 0.67), 0, 0.30, concrete);
        ground.tilingOffset = new Vector4(4, 4, 0, 0);
        this.object(PrimitiveMesh.createPlane(35, 35, 1, 1), new Vector3(0, -0.52, 0), ground).meshRenderer.castShadow = false;
        const chassis = this.material(new Color(0.10, 0.12, 0.105), 0.55, 0.48);
        this.object(this.roundedBox(8.4, 0.45, 5.7, 0.09), new Vector3(0, -0.22, 0), chassis);
        const stone = this.material(new Color(0.96, 0.96, 0.96), 0, 0.75, concrete);
        stone.tilingOffset = new Vector4(2, 2, 0, 0);
        this.object(this.roundedBox(3.9, 0.3, 5.05, 0.055), new Vector3(-2.02, 0.14, 0), stone);
        const steel = this.material(new Color(0.82, 0.86, 0.81), 0.86, 0.87, metal);
        this.object(this.roundedBox(3.9, 0.3, 5.05, 0.055), new Vector3(2.02, 0.14, 0), steel);
        const cream = this.material(new Color(0.68, 0.70, 0.61), 0.16, 0.40);
        this._receiver = this.object(this.roundedBox(2.65, 0.26, 0.72, 0.09), new Vector3(-1.95, 0.42, 1.45), cream);
        const polished = this.material(new Color(0.77, 0.80, 0.74), 0.94, 0.9);
        this.object(PrimitiveMesh.createCylinder(0.82, 0.16, 64), new Vector3(1.8, 0.38, 0.5), chassis);
        this.object(PrimitiveMesh.createSphere(0.72, 48, 32), new Vector3(1.8, 1.12, 0.5), polished);
        const inset = this.material(new Color(0.12, 0.14, 0.12), 0.5, 0.45);
        for (const x of [-3.85, 3.85]) for (const z of [-2.3, 2.3])
            this.object(PrimitiveMesh.createCylinder(0.09, 0.035, 12), new Vector3(x, 0.32, z), inset);
        for (let i = 0; i < 5; i++)
            this.object(this.roundedBox(0.075, 0.025, 0.75, 0.01), new Vector3(-3.55 + i * 0.18, 0.307, 1.93), inset);

        // A vertical receiver makes gravity-driven wet streaks visible next to
        // the horizontal paint and oil study. The front plane is world z=2.35.
        // 在水平喷漆和油渍旁放置竖直接收面，展示受重力影响的水痕；
        // 墙面正面位于世界坐标 z=2.35。
        const wallFrame = this.material(new Color(0.14, 0.17, 0.17), 0.78, 0.52);
        this.object(this.roundedBox(7.75, 2.96, 0.3, 0.055), new Vector3(0, 1.85, 2.52), wallFrame);
        const wallSurface = this.material(new Color(0.82, 0.86, 0.83), 0, 0.38, concrete);
        wallSurface.tilingOffset = new Vector4(2, 1, 0, 0);
        this._waterWall = this.object(this.roundedBox(7.4, 2.7, 0.18, 0.025), new Vector3(0, 1.85, 2.44), wallSurface);
        this.object(this.roundedBox(7.5, 0.12, 0.27, 0.035), new Vector3(0, 3.18, 2.2), wallFrame);
        this.object(this.roundedBox(7.65, 0.13, 0.48, 0.035), new Vector3(0, 0.52, 2.16), wallFrame);
        for (const x of [-3.53, 3.53]) for (const y of [0.64, 3.04]) {
            const bolt = this.object(PrimitiveMesh.createCylinder(0.045, 0.04, 16), new Vector3(x, y, 2.32), inset);
            bolt.transform.rotationEuler = new Vector3(90, 0, 0);
        }
    }

    private projector(name: string, maps: DecalShowcaseTextureSet, position: Vector3, size: Vector3, sort: number, mipBias: number = 0.75): DecalProjector {
        const node = this._scene.addChild(new Sprite3D(name)) as Sprite3D;
        node.transform.position = position; node.transform.rotationEuler = new Vector3(90, 0, 0);
        const projector = node.addComponent(DecalProjector);
        projector.size = size; projector.pivot = new Vector3(0, 0, size.z * 0.5);
        projector.sortOrder = sort; projector.drawDistance = 60;
        projector.startAngleFade = 70; projector.endAngleFade = 88;
        const material = new DecalMaterial();
        material.albedoTexture = maps.albedo; material.albedoColor = Color.WHITE;
        material.normalTexture = maps.normal; material.normalTextureScale = 0.75;
        material.metallicGlossTexture = maps.maos; material.occlusionTexture = maps.maos; material.smoothness = 1;
        // Fine paint erosion needs a slightly wider footprint at grazing angles.
        // Keep the engine material default at zero for other source textures.
        // 细小漆面侵蚀纹理在掠射角下需要稍宽的采样覆盖范围；
        // 引擎材质默认值仍为零，以适配其他源贴图。
        material.mipBias = mipBias;
        projector.material = material;
        this._projectors.push(projector); this._materials.push(material); this._resources.push(material);
        return projector;
    }

    private createProjectors(): void {
        const stencil = this.textures("stencil"), hazard = this.textures("hazard"), oil = this.textures("oil");
        const number = this.projector("Worn ivory 07", stencil, new Vector3(-1.95, 3, 0.3), new Vector3(3.1, 3.75, 3.3), 10);
        number.uvScale.setValue(-1, -1); number.uvOffset.setValue(1, 1);
        this.projector("Safety paint across both materials", hazard, new Vector3(0, 3, -1.78), new Vector3(7.35, 0.63, 3.3), 20);
        this.projector("Worn safety badge", hazard, new Vector3(2, 3, 1.8), new Vector3(2.8, 0.48, 3.3), 21);
        this.projector("Oil on satin steel", oil, new Vector3(1.5, 3, -0.6), new Vector3(3, 2.9, 3.3), 30, 0);
        const waterNode = this._scene.addChild(new Sprite3D("Noise-driven downward water streaks")) as Sprite3D;
        waterNode.transform.position = new Vector3(0, 1.85, 2);
        const water = waterNode.addComponent(DecalProjector);
        water.size = new Vector3(6.9, 2.35, 0.65);
        water.pivot = new Vector3(0, 0, 0.325);
        water.sortOrder = 40; water.drawDistance = 60;
        water.startAngleFade = 65; water.endAngleFade = 85;
        this._waterMaterial = new FlowingWaterDecalMaterial();
        water.material = this._waterMaterial;
        this._projectors.push(water); this._resources.push(this._waterMaterial);
        this.updateMaterials();
    }

    private updateMaterials(): void {
        for (let i = 0; i < this._materials.length; i++) {
            const material = this._materials[i];
            material.albedoOpacity = this._surfaceOnly ? 0 : i === 3 ? 0.60 : 1;
            material.normalOpacity = i === 3 ? 0.16 : 0.35;
            material.maosOpacity = i === 3 ? 1 : this._surfaceOnly ? 0.95 : 0.8;
        }
        if (this._waterMaterial) {
            this._waterMaterial.albedoOpacity = this._surfaceOnly ? 0 : 0.68;
            this._waterMaterial.normalOpacity = 0.8;
            this._waterMaterial.maosOpacity = 0.95;
        }
        this.refresh();
    }

    setMode(mode: DecalMode): void { this._mode = mode; if (this._camera) this._camera.decalMode = mode; this.refresh(); }
    setSurfaceOnly(value: boolean): void { this._surfaceOnly = value; this.updateMaterials(); }
    setEnabled(value: boolean): void { this._enabled = value; this._projectors.forEach(p => p.enabled = value); this.refresh(); }
    setRotatingLight(value: boolean): void { this._rotatingLight = value; }
    setMoving(value: boolean): void { this._moving = value; }
    setFlowingWaterPaused(value: boolean): void { this._waterPaused = value; }
    setFlowingWaterTime(seconds: number): void {
        if (!isFinite(seconds) || seconds < 0) throw new RangeError("Water time must be finite and nonnegative.");
        this._waterTime = seconds;
        if (this._waterMaterial) this._waterMaterial.time = seconds;
    }

    selectDecal(index: number): void {
        if (!Number.isInteger(index) || index < 0 || index >= decalNames.length)
            throw new RangeError("Decal selection must be an index from 0 to 4.");
        this._selectedDecalIndex = index;
        this._inspector?.select(this._projectors[index], this._decalTextureChannel);
        this.refresh();
    }
    setDecalBoundsVisible(value: boolean): void {
        this._decalBoundsVisible = value;
        if (this._inspector) this._inspector.showBounds = value;
    }
    setDecalTextureVisible(value: boolean): void {
        this._decalTextureVisible = value;
        this.layoutInspector();
    }
    setDecalTextureChannel(channel: DecalTextureChannel): void {
        if (!decalChannels.includes(channel)) throw new RangeError("Unknown decal texture channel.");
        this._decalTextureChannel = channel;
        this._inspector?.select(this._projectors[this._selectedDecalIndex], channel);
        this.refresh();
    }
    getDecalInspectorInfo() {
        const projector = this._projectors[this._selectedDecalIndex];
        if (!projector) return null;
        const center = new Vector3();
        Vector3.transformCoordinate(projector.pivot, projector.owner.transform.worldMatrix, center);
        const position = projector.owner.transform.position, size = projector.size;
        const names = { albedo: "颜色", normal: "法线", maos: "MAOS（R 金属 / G AO / A 光滑度）" };
        return {
            index: this._selectedDecalIndex, name: decalNames[this._selectedDecalIndex], channel: this._decalTextureChannel,
            source: projector.material === this._waterMaterial ? "程序噪声 / 实时 GPU 预览"
                : "512 × 512 / 原始" + names[this._decalTextureChannel] + "贴图",
            position: [center.x, center.y, center.z], origin: [position.x, position.y, position.z],
            size: [size.x, size.y, size.z]
        };
    }

    private layoutInspector(): void {
        if (!this._inspector) return;
        this._inspector.showBounds = this._decalBoundsVisible;
        const rect = this._shell ? (window as any).__decalTextureViewport : {
            x: Math.max(12, Laya.stage.width - 196), y: this._preview.y + 58, width: 172, height: 142
        };
        this._inspector.showTexture = this._decalTextureVisible && !!rect;
        if (rect) this._inspector.setPreviewRect(rect.x, rect.y, rect.width, rect.height);
    }

    private refresh(): void {
        if (this._status) this._status.text = DecalMode[this._mode] + "  /  " + (this._enabled ? "ON" : "OFF") + "  /  " + decalNames[this._selectedDecalIndex]
            + "  /  " + this._decalTextureChannel;
    }

    private createControls(): void {
        this.label("DECAL  /  MATERIAL STUDIES", 24, 18, 900, 40, 25, "#eeede4");
        const options: [string, () => void][] = [["Off", () => this.setMode(DecalMode.Off)], ["ScreenSpace", () => this.setMode(DecalMode.ScreenSpace)],
            ["DBuffer", () => this.setMode(DecalMode.DBuffer)], ["仅表面属性", () => this.setSurfaceOnly(!this._surfaceOnly)],
            ["贴花开关", () => this.setEnabled(!this._enabled)], ["移动光照", () => this.setRotatingLight(!this._rotatingLight)],
            ["水渍流动", () => this.setFlowingWaterPaused(!this._waterPaused)],
            ["贴花方框", () => this.setDecalBoundsVisible(!this._decalBoundsVisible)],
            ["切换贴花", () => this.selectDecal((this._selectedDecalIndex + 1) % this._projectors.length)],
            ["切换贴图", () => this.setDecalTextureChannel(decalChannels[(decalChannels.indexOf(this._decalTextureChannel) + 1) % decalChannels.length])]];
        options.forEach(([text, handler], i) => {
            const button = new Sprite(); button.size(124, 34);
            this._controlButtons.push(button);
            button.graphics.drawRoundRect(0, 0, 124, 34, 5, 5, 5, 5, "#30342d"); this._root.addChild(button);
            const label = new Text(); label.text = text; label.fontSize = 14; label.color = "#eeede4";
            label.align = "center"; label.valign = "middle"; label.size(124, 34); label.mouseEnabled = false;
            button.addChild(label); button.on(Event.CLICK, this, handler);
        });
        this._status = this.label("", 24, 121, 1100, 25, 12, "#c8d174");
    }

    private label(text: string, x: number, y: number, width: number, height: number, size: number, color: string): Text {
        const label = new Text(); label.text = text; label.pos(x, y).size(width, height);
        label.fontSize = size; label.color = color; this._root.addChild(label); return label;
    }

    private readonly resizeFromShell = () => this.resize();
    private resize(): void {
        if (!this._camera || this._disposed) return;
        const rect = this._shell && (window as any).__decalViewport;
        const columns = Math.max(1, Math.floor((Laya.stage.width - 48) / 132));
        const controlsEnd = 76 + Math.ceil(this._controlButtons.length / columns) * 42;
        if (!this._shell) {
            this._controlButtons.forEach((button, i) => button.pos(24 + i % columns * 132, 76 + Math.floor(i / columns) * 42));
            this._status.y = controlsEnd + 3;
        }
        const x = rect ? rect.x : 0, y = rect ? rect.y : controlsEnd + 38;
        const width = Math.max(1, rect ? rect.width : Laya.stage.width);
        const height = Math.max(1, rect ? rect.height : Laya.stage.height - y);
        // SCALE_FULL + SCREEN_NONE keeps CSS viewport units in logical stage
        // units. Stage scale is the actual logical-to-canvas backing ratio,
        // which can differ from devicePixelRatio when retina is disabled.
        // SCALE_FULL + SCREEN_NONE 使 CSS 视口单位与舞台逻辑单位一致。
        // 舞台缩放表示逻辑坐标到画布实际像素的比例；
        // 关闭 retina 时，该比例可能与 devicePixelRatio 不同。
        const scaleX = Math.max(0.00001, Math.abs(Laya.stage.scaleX));
        const scaleY = Math.max(0.00001, Math.abs(Laya.stage.scaleY));
        const left = Math.round(x * scaleX), top = Math.round(y * scaleY);
        const rw = Math.max(1, Math.round((x + width) * scaleX) - left);
        const rh = Math.max(1, Math.round((y + height) * scaleY) - top);
        // Align both edges to backing pixels, so the final 2D presentation
        // samples the camera RT 1:1 rather than rescaling a non-mipmapped RT.
        // 将两侧边缘对齐到画布实际像素，使最终 2D 显示按 1:1 采样相机 RT，
        // 避免缩放未生成 mipmap 的 RT。
        this._preview.pos(left / scaleX, top / scaleY).size(rw / scaleX, rh / scaleY);
        if (!this._output || this._output.width !== rw || this._output.height !== rh) {
            const old = this._output, oldTexture = this._preview.texture;
            this._camera.renderTarget = null; this._preview.texture = null; oldTexture?.destroy();
            this._output = RenderTexture.createFromPool(rw, rh, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1, false, true);
            this._camera.renderTarget = this._output; this._preview.texture = new Texture(this._output);
            if (old) RenderTexture.recoverToPool(old);
        }
        this.updateCamera();
        this.layoutInspector();
    }

    private updateCamera(): void {
        if (!this._output) return;
        const aspect = this._output.width / this._output.height;
        const distance = this._distance * Math.max(1, 1.15 / aspect), horizontal = Math.cos(this._pitch) * distance;
        this._camera.transform.position = new Vector3(Math.sin(this._yaw) * horizontal, Math.sin(this._pitch) * distance, -Math.cos(this._yaw) * horizontal);
        this._camera.transform.lookAt(new Vector3(0, 0.9, 0), new Vector3(0, 1, 0));
    }

    private beginOrbit(): void { this._dragging = true; this._mouseX = Laya.stage.mouseX; this._mouseY = Laya.stage.mouseY; }
    private endOrbit(): void { this._dragging = false; }
    private orbit(): void {
        if (!this._dragging) return;
        const x = Laya.stage.mouseX, y = Laya.stage.mouseY;
        this._yaw -= (x - this._mouseX) * 0.006;
        this._pitch = Math.max(0.35, Math.min(1.22, this._pitch + (y - this._mouseY) * 0.005));
        this._mouseX = x; this._mouseY = y; this.updateCamera();
    }

    private animate(): void {
        this._time += Laya.timer.delta * 0.001;
        if (!this._waterPaused && this._waterMaterial) {
            this._waterTime += Laya.timer.delta * 0.001;
            this._waterMaterial.time = this._waterTime;
        }
        if (this._rotatingLight) this._lightNode.transform.rotationEuler = new Vector3(-51, -30 + Math.sin(this._time * 0.45) * 65, 0);
        if (this._moving) this._receiver.transform.position = new Vector3(-1.95 + Math.sin(this._time * 0.7) * 0.32, 0.42, 1.45);
        this._inspector?.update();
    }

    /** Rounded edges catch light; tangent data supports actual normal-map detail.
     * 圆角用于承接高光，切线数据支持法线贴图的真实细节。 */
    private roundedBox(width: number, height: number, depth: number, radius: number): Mesh {
        const half = [width / 2, height / 2, depth / 2];
        radius = Math.min(radius, ...half);
        const faces = [[1, 1, 0, 1, 2, 1], [1, -1, 0, 1, 2, -1], [2, -1, 0, 1, 1, 1],
            [2, 1, 0, -1, 1, 1], [0, 1, 2, 1, 1, 1], [0, -1, 2, -1, 1, 1]];
        const vertices: number[] = [], indices: number[] = [], segments = 9;
        for (const [axis, sign, uAxis, uSign, vAxis, vSign] of faces) {
            const base = vertices.length / 12;
            const coordinate = (i: number, extent: number) => i < 5 ? -extent + radius * i / 4 : extent - radius * (9 - i) / 4;
            for (let y = 0; y <= segments; y++) for (let x = 0; x <= segments; x++) {
                const p = [0, 0, 0]; p[axis] = sign * half[axis];
                p[uAxis] = coordinate(x, half[uAxis]) * uSign; p[vAxis] = coordinate(y, half[vAxis]) * vSign;
                const core = p.map((value, i) => Math.max(-half[i] + radius, Math.min(half[i] - radius, value)));
                const n = p.map((value, i) => value - core[i]);
                const length = Math.hypot(...n); for (let i = 0; i < 3; i++) n[i] /= length;
                const tangent = [0, 0, 0]; tangent[uAxis] = uSign;
                const dot = tangent[0] * n[0] + tangent[1] * n[1] + tangent[2] * n[2];
                for (let i = 0; i < 3; i++) tangent[i] -= n[i] * dot;
                const tl = Math.hypot(...tangent); for (let i = 0; i < 3; i++) tangent[i] /= tl;
                vertices.push(core[0] + n[0] * radius, core[1] + n[1] * radius, core[2] + n[2] * radius,
                    n[0], n[1], n[2], (p[uAxis] / half[uAxis] * uSign + 1) / 2, (p[vAxis] / half[vAxis] * vSign + 1) / 2,
                    tangent[0], tangent[1], tangent[2], -1);
            }
            for (let y = 0; y < segments; y++) for (let x = 0; x < segments; x++) {
                const i = base + y * (segments + 1) + x;
                indices.push(i, i + 1, i + segments + 2, i, i + segments + 2, i + segments + 1);
            }
        }
        return PrimitiveMesh._createMesh(VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV,TANGENT"), new Float32Array(vertices), new Uint16Array(indices));
    }

    destroy(): void {
        if (this._disposed) return;
        this._disposed = true; window.removeEventListener("decal-preview-resize", this.resizeFromShell);
        Laya.timer.clearAll(this); Laya.stage?.offAllCaller(this); this._root.offAllCaller(this);
        this._inspector?.dispose();
        if (this._preview?.texture) { const texture = this._preview.texture; this._preview.texture = null; texture.destroy(); }
        if (this._camera) this._camera.renderTarget = null;
        this._scene?.destroy(true);
        for (const resource of this._resources.slice().reverse()) resource.destroy();
        this._resources.length = this._projectors.length = this._materials.length = 0;
        this._controlButtons.length = 0;
        if (this._output) RenderTexture.recoverToPool(this._output);
        if (!this._root.destroyed) this._root.destroy(true);
    }
}

