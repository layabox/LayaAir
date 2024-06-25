import { Laya } from "Laya";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyPanoramicMaterial } from "laya/d3/core/material/SkyPanoramicMaterial";
import { AmbientMode } from "laya/d3/core/scene/AmbientMode";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Material } from "laya/resource/Material";
import { TextureCube } from "laya/resource/TextureCube";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Vector3 } from "laya/maths/Vector3";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { Color } from "laya/maths/Color";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { MeshFilter } from "laya/d3/core/MeshFilter";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Transform3D } from "laya/d3/core/Transform3D";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { LightMode } from "laya/d3/core/light/Light";

export class PBRCoatMaterialDemo {
    /**全景天空盒地址 */
    public skyMatPath = "res/threeDimen/LayaScene_DamagedHelmetScene/Conventional/Assets/LayaSkyMaterial.lmat";
    /**ibl环境贴图地址 */
    public sceneIBLTexPath = "res/threeDimen/LayaScene_DamagedHelmetScene/Conventional/Assets/DamagedHelmetScene/DamagedHelmetScene.ktx";
    /**场景 */
    public scene: Scene3D;
    /**相机 */
    public camera: Camera;
    /**行 */
    public row: number = 2;
    /**列 */
    public col: number = 6;
    static _tempPos: Vector3 = new Vector3();
    /**球位置偏移 */
    public offset: Vector3 = new Vector3(0, 1.5, 0);
    /**材质颜色 */
    public color: Color = new Color(186 / 255, 110 / 255, 64 / 255, 1.0);
    constructor() {
        Laya.init(0, 0).then(() => {
            Stat.show();
            Shader3D.debugMode = true;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            this.initScene();
        });
    }

    /**初始化场景 */
    initScene(): void {
        this.scene = new Scene3D();
        Laya.stage.addChild(this.scene);
        this.camera = new Camera(0, 0.1, 100);
        this.camera.addComponent(CameraMoveScript);
        this.camera.transform.localRotationEuler = new Vector3(-4, -180, 0);
        this.camera.transform.position = new Vector3(0.0, 0.82, 0.0);
        this.scene.addChild(this.camera);
        this.camera.clearFlag = CameraClearFlags.Sky;
        let directionLight: Sprite3D = new Sprite3D();
        let dirLightCom: DirectionLightCom = directionLight.addComponent(DirectionLightCom);
        dirLightCom.color = new Color(0.6, 0.6, 0.6);
        dirLightCom.intensity = 1.0;
        dirLightCom.lightmapBakedType = LightMode.realTime;
        directionLight.transform.position = new Vector3(5, 5, 5);
        directionLight.transform.localRotationEuler = new Vector3(-4, -180, 0);
        this.scene.addChild(directionLight);
        this.loadSkyMatAndIBLTex();
    }

    /**加载天空盒与ibl环境贴图 */
    loadSkyMatAndIBLTex(): void {
        Material.load(this.skyMatPath, Handler.create(this, (mat: SkyPanoramicMaterial) => {
            let skyRender: SkyRenderer = this.scene.skyRenderer;
            skyRender.mesh = SkyBox.instance;
            skyRender.material = mat;
            mat.exposure = 1.6;
            Laya.loader.load(this.sceneIBLTexPath, Loader.TEXTURECUBE).then((tex: TextureCube) => {
                this.scene.ambientMode = AmbientMode.SphericalHarmonics;
                this.scene.sceneReflectionProb.iblTex = tex;
                this.addPBRCoatSphere();
            });
        }));
    }

    /**添加PBR清漆球 */
    addPBRCoatSphere(): void {
        let sphereMesh: Mesh = PrimitiveMesh.createSphere(0.25, 32, 32);
        const width: number = this.col * 0.5;
        const height: number = this.row * 0.5;
        for (var i: number = 0, n: number = this.col; i < n; i++) {//diffenent smoothness
            for (var j: number = 0, m: number = this.row; j < m; j++) {//diffenent metallic
                var smoothness: number = 0.0;
                var metallic: number = 1.0;
                if (j == 1) {
                    var state = true;
                    var coat = i / (m - 1) * (1 / this.col);
                    var coatR = 0.0;
                }
                else {
                    var state = false;
                    var coat = 0.0;
                    var coatR = 0.0;
                }

                var pos: Vector3 = PBRCoatMaterialDemo._tempPos;
                pos.setValue(-width / 2 + i * width / (n - 1), height / 2 - j * height / (m - 1), 3.0);
                Vector3.add(this.offset, pos, pos);
                this.PBRCoatMat(sphereMesh, pos, this.scene, this.color, smoothness, metallic, coat, coatR, state);
            }
        }
    }

    /**PBR清漆球材质
     * @sphereMesh 球体网格
     * @position 球体位置
     * @scene 场景
     * @color 球体颜色
     * @smoothness 球体平滑度
     * @metallic 球体金属度
     * @coat 球体清漆度
     * @coatR 球体清漆粗糙度
     * @state 球体是否有清漆
     */
    PBRCoatMat(sphereMesh: Mesh, position: Vector3, scene: Scene3D, color: Color, smoothness: number, metallic: number, coat: number, coatR: number, state: boolean): PBRStandardMaterial {
        var mat: PBRStandardMaterial = new PBRStandardMaterial();
        mat.albedoColor = color;
        mat.smoothness = smoothness;
        mat.metallic = metallic;
        mat.clearCoatEnable = state;
        if (state) {
            mat.clearCoat = coat;
            mat.clearCoatRoughness = coatR;
        }
        var meshSprite: Sprite3D = new Sprite3D();
        let meshfilter: MeshFilter = meshSprite.addComponent(MeshFilter);
        meshfilter.sharedMesh = sphereMesh;
        let meshrender: MeshRenderer = meshSprite.addComponent(MeshRenderer);
        meshrender.sharedMaterial = mat;
        var transform: Transform3D = meshSprite.transform;
        transform.localPosition = position;
        scene.addChild(meshSprite);
        return mat;
    }
}