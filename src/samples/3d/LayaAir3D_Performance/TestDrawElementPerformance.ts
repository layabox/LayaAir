import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { Material } from "laya/resource/Material";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { Stat } from "laya/utils/Stat";

export class TestDrawElementPerformance {

    // 目标立方体数量
    public currentCubeCount = 0;
    public gridSize = 24;
    // 初始网格大小
    public spacing = 2;
    // 间距
    public startPosition = new Vector3(0, 0, 0);

    private sprite3D: Sprite3D;
    private scene: Scene3D;
    private cubes: Sprite3D[] = [];
    constructor() {
        Laya.init(0, 0).then(() => {
            Stat.show();
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            //Stat.show();
            this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));

            var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)));
            camera.transform.position= new Vector3(0, 7, 27);
            camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
            camera.addComponent(CameraMoveScript);
            camera.clearColor = new Color(0.2, 0.2, 0.2, 1.0);

            let directlightSprite = new Sprite3D();
            let dircom = directlightSprite.addComponent(DirectionLightCom);
            this.scene.addChild(directlightSprite);
            //设置平行光的方向
            var mat: Matrix4x4 = directlightSprite.transform.worldMatrix;
            mat.setForward(new Vector3(-1.0, -1.0, -1.0));
            directlightSprite.transform.worldMatrix = mat;

            this.sprite3D = new Sprite3D();

            //正方体
            var box: MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
            box.transform.position = new Vector3(0.0, 1.0, 2.5);
            box.transform.rotate(new Vector3(0, 0, 0), false, false);
            var mat1: BlinnPhongMaterial = new BlinnPhongMaterial();
            //漫反射贴图
            Texture2D.load("res/threeDimen/texture/layabox.png", Handler.create(this, function (texture: Texture2D): void {
                //在U方向上使用WRAPMODE_CLAMP
                texture.wrapModeU = WrapMode.Clamp;
                //在V方向使用WRAPMODE_REPEAT
                texture.wrapModeV = WrapMode.Repeat;
                //设置过滤方式
                texture.filterMode = FilterMode.Bilinear;
                //设置各向异性等级
                texture.anisoLevel = 2;

                mat1.albedoTexture = texture;
                //修改材质贴图的平铺和偏移
                var tilingOffset: Vector4 = mat1.tilingOffset;
                tilingOffset.setValue(3, 3, 0.0, 0.0);
                mat1.tilingOffset = tilingOffset;

                box.meshRenderer.material = mat1 as Material;

                this.generateCubes();
            }));
        });

    }


    // 生成立方体
    generateCubes() {
        this.startPosition = new Vector3(
            this.gridSize * this.spacing / 2,
            this.gridSize * this.spacing / 2,
            -10
        );
        const scene = this.scene;
        const totalCubes = Math.pow(this.gridSize, 3);
        for (let x = 0; x < this.gridSize; x++) {
            for (let y = 0; y < this.gridSize; y++) {
                for (let z = 0; z < this.gridSize; z++) {
                    const pos = new Vector3(
                        this.startPosition.x - x * this.spacing,
                        this.startPosition.y - y * this.spacing,
                        this.startPosition.z - z * this.spacing
                    );
                    let cube;
                    // if (this.cubePrefab) {
                    cube = new MeshSprite3D(PrimitiveMesh.createBox(1, 1, 1));
                    this.setCubeColor(cube, x, y, z);
                    // }
                    cube.transform.position = pos;
                    scene.addChild(cube);

                    this.cubes.push(cube);
                }
            }
        }
        this.currentCubeCount = totalCubes;
    }

    setCubeColor(cube: any, x: number, y: number, z: number) {
        const meshRenderer = cube.getComponent(MeshRenderer);
        if (meshRenderer) {
            meshRenderer.material = new BlinnPhongMaterial();
            meshRenderer.material.setColor("u_DiffuseColor", new Color(
                x / this.gridSize,
                y / this.gridSize,
                z / this.gridSize,
                1
            ));
        }
    }
}