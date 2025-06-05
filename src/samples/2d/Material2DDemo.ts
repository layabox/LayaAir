/**
description
 这是一个2D自定义着色器和材质的演示demo，包含图像渲染和着色器效果
 */
import { Laya } from "Laya"
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Stat } from "laya/utils/Stat";
import { Main } from "../Main";
import { Scene } from "laya/display/Scene";
import { Material } from "laya/resource/Material";
import { Graphics } from "laya/display/Graphics";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Color } from "laya/maths/Color";
import { BlendModeHandler } from "laya/webgl/canvas/BlendMode";

export class Material2DDemo {
    Main: typeof Main = null;
    scene: Scene;

    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(0, 0).then(() => {
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.screenMode = Stage.SCREEN_NONE;
            Stat.show();
            Laya.stage.bgColor = "#232628";
            //提前加载CustomShader1与其对应的material
            let res: string[] = ["res/shaders/2d/custom2DShader_1.shader", "res/apes/monkey3.png"];
            this.scene = new Scene();
            this.Main.box2D.addChild(this.scene);
            Laya.loader.load(res).then(() => {
                this.set2DCustomMaterial();
            });
        });
    }

    set2DCustomMaterial(): void {
        // 自定义shader与全局2D uniform变量使用
        let customShaderSp = new Sprite();
        customShaderSp.loadImage("res/apes/monkey3.png");
        this.scene.addChild(customShaderSp);
        this.loadCustom2DShader(customShaderSp);

        // 自定义2d材质使用
        Laya.loader.load("res/2DRender/customMaterial_1.lmat").then((mat: Material) => {
            let customMaterialSp = new Sprite();
            customMaterialSp.pos(200, 0);
            this.scene.addChild(customMaterialSp);
            customMaterialSp.loadImage("res/apes/monkey3.png");
            BlendModeHandler.initBlendMode(mat.shaderData);
            customMaterialSp.graphics.material = mat;
        });
    }

    loadCustom2DShader(sp: Sprite): void {
        Laya.loader.load("res/shaders/2d/custom2DShader_0.shader").then(() => {
            let mat = new Material();
            mat.setShaderName("custom2DShader_0");
            let define = Shader3D.getDefineByName("TEXTUREVS");
            mat.addDefine(define);
            BlendModeHandler.initBlendMode(mat.shaderData);
            // 设置2D全局uniform变量
            Graphics.add2DGlobalUniformData(Shader3D.propertyNameToID("u_GlobalColor"), "u_GlobalColor", ShaderDataType.Color);
            this.scene.setglobalRenderData(Shader3D.propertyNameToID("u_GlobalColor"), ShaderDataType.Color, new Color(0.0, 1.0, 0.0, 1.0));
            sp.graphics.material = mat;
        });
    }
}