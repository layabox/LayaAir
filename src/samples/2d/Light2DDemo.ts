import { Laya } from "Laya";
import { Script } from "laya/components/Script";
import { Scene } from "laya/display/Scene";
import { Camera2D } from "laya/display/Scene2DSpecial/Camera2D";
import { ShadowFilterType } from "laya/display/Scene2DSpecial/Light2D/BaseLight2D";
import { FreeformLight2D } from "laya/display/Scene2DSpecial/Light2D/FreeformLight2D";
import { LightOccluder2D } from "laya/display/Scene2DSpecial/Light2D/LightOccluder2D";
import { SpotLight2D } from "laya/display/Scene2DSpecial/Light2D/SpotLight2D";
import { SpriteLight2D } from "laya/display/Scene2DSpecial/Light2D/SpriteLight2D";
import { DirectionLight2D } from "laya/display/Scene2DSpecial/Light2D/DirectionLight2D";
import { Mesh2DRender } from "laya/display/Scene2DSpecial/Mesh2DRender";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector2 } from "laya/maths/Vector2";
import { Loader } from "laya/net/Loader";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D";
import { Browser } from "laya/utils/Browser";
import { Main } from "../Main";
import { WrapMode } from "laya/RenderEngine/RenderEnum/WrapMode";
import { Texture } from "laya/resource/Texture";
import { Texture2D } from "laya/resource/Texture2D";
import { Stat } from "laya/utils/Stat";
import { PolygonPoint2D } from "laya/display/Scene2DSpecial/Light2D/PolygonPoint2D";

export class Light2DDemo {
    useWebGPU: boolean = false;
    Main: typeof Main = null;

    scene: Scene;
    camera: Camera2D;
    mousePoint: Vector2 = new Vector2();

    constructor(mainClass: typeof Main) {
        this.Main = mainClass;
        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;
            Laya.stage.scaleMode = Stage.SCALE_FULL;
            Laya.stage.bgColor = "#232628";
            Stat.show();
            this._createScene(); //创建场景
        });
    }

    private _createScene(): void {
        this.scene = this.Main.box2D.addChild(new Scene());
        this.camera = new Camera2D();

        Laya.loader.load("res/light.png", Loader.IMAGE).then(() => {
            const tex: Texture = Laya.loader.getRes("res/light.png");
            tex.bitmap.wrapModeU = WrapMode.Clamp;
            tex.bitmap.wrapModeV = WrapMode.Clamp;

            const spriteLightD1 = this.scene.addChild(new Sprite());
            const lightD1 = spriteLightD1.addComponent(DirectionLight2D);
            lightD1.directionAngle = 30;
            lightD1.color = new Color(0.5, 0.5, 0.5, 1);
            lightD1.shadowColor = new Color(0, 0.5, 0, 1);
            lightD1.shadowFilterType = ShadowFilterType.None;
            lightD1.layerMask = 1;
            lightD1.shadowEnable = true;
            //lightD1.addComponent(editDirectionLight);

            const spriteLight1 = this.scene.addChild(new Sprite());
            const light1 = spriteLight1.addComponent(SpriteLight2D);
            spriteLight1.x = 500;
            spriteLight1.y = 800;
            spriteLight1.scale(5, 5);
            light1.color = new Color(1, 1, 1, 1);
            light1.shadowColor = new Color(1, 1, 0, 1);
            light1.shadowFilterType = ShadowFilterType.None;
            light1.spriteTexture = tex.bitmap as Texture2D;
            light1.layerMask = 1;
            light1.shadowEnable = true;
            //light1.showLightTexture = true;
            //light1.addComponent(editSpriteLight);

            const spriteLight2 = this.scene.addChild(new Sprite());
            const light2 = spriteLight2.addComponent(FreeformLight2D);
            const ox = 0;
            const oy = 0;
            const poly = new PolygonPoint2D();
            poly.addPoint(-100 + ox, -100 + oy);
            poly.addPoint(0 + ox, -50 + oy);
            poly.addPoint(100 + ox, -100 + oy);
            poly.addPoint(100 + ox, 100 + oy);
            poly.addPoint(0 + ox, 150 + oy);
            poly.addPoint(-100 + ox, 100 + oy);
            light2.polyPoints = poly.points;
            spriteLight2.x = 200;
            spriteLight2.y = 300;
            light2.intensity = 1;
            light2.color = new Color(0, 1, 1, 1);
            light2.shadowColor = new Color(1, 0, 0, 1);
            light2.shadowStrength = 0.5;
            light2.shadowFilterType = ShadowFilterType.None;
            light2.falloffRange = 0.5;
            light2.layerMask = 1;
            light2.shadowEnable = true;
            //light2.showLightTexture = true;
            //spriteLight2.addComponent(testMove);
            spriteLight2.addComponent(lightRotate);
            //spriteLight2.addComponent(editFreeform);

            const spriteLight3 = this.scene.addChild(new Sprite());
            const light3 = spriteLight3.addComponent(SpotLight2D);
            spriteLight3.x = 500;
            spriteLight3.y = 500;
            spriteLight3.rotation = 0;
            light3.innerRadius = 300;
            light3.outerRadius = 400;
            light3.innerAngle = 60;
            light3.outerAngle = 125;
            light3.intensity = 1;
            light3.color = new Color(1, 1, 1, 1);
            light3.shadowColor = new Color(0, 1, 0, 1);
            light3.shadowStrength = 0.5;
            light3.shadowFilterType = ShadowFilterType.PCF5;
            light3.shadowFilterSmooth = 5;
            light3.layerMask = 1;
            light3.shadowEnable = true;
            //light3.showLightTexture = true;
            //spriteLight3.addComponent(testMove);
            //spriteLight3.addComponent(lightRotate);
            //spriteLight3.addComponent(spotParam);

            const spriteLight4 = this.scene.addChild(new Sprite());
            const light4 = spriteLight4.addComponent(SpotLight2D);
            spriteLight4.x = 2000;
            spriteLight4.y = 400;
            spriteLight4.rotation = 90;
            light4.innerRadius = 300;
            light4.outerRadius = 400;
            light4.innerAngle = 60;
            light4.outerAngle = 125;
            light4.intensity = 1;
            light4.color = new Color(1, 1, 0, 1);
            light4.shadowColor = new Color(0, 1, 1, 1);
            light4.shadowStrength = 0.5;
            light4.shadowFilterType = ShadowFilterType.PCF9;
            light4.shadowFilterSmooth = 5;
            light4.layerMask = 1;
            light4.shadowEnable = true;

            const spriteLight5 = this.scene.addChild(new Sprite());
            const light5 = spriteLight5.addComponent(SpotLight2D);
            spriteLight5.x = 3000;
            spriteLight5.y = 1000;
            spriteLight5.rotation = 180;
            light4.innerRadius = 200;
            light4.outerRadius = 400;
            light4.innerAngle = 30;
            light4.outerAngle = 90;
            light5.intensity = 1;
            light5.color = new Color(0, 1, 1, 1);
            light5.shadowColor = new Color(0, 1, 1, 1);
            light5.shadowStrength = 0.5;
            light5.shadowFilterType = ShadowFilterType.None;
            light5.shadowFilterSmooth = 5;
            light5.layerMask = 1;
            light5.shadowEnable = true;
        });

        Laya.loader.load("res/bg2.png", Loader.IMAGE).then(() => {
            const tex = Laya.loader.getRes("res/bg2.png");
            const bk = this.scene.addChild(new Sprite());
            const mesh2Drender = bk.addComponent(Mesh2DRender);
            mesh2Drender.shareMesh = this.generateRectVerticesAndUV(100000, 100000);
            mesh2Drender.texture = tex;
            mesh2Drender.lightReceive = true;
            bk.x = -50000;
            bk.y = -50000;
            Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
                const tex = Laya.loader.getRes("res/apes/monkey2.png");
                const ape = this.scene.addChild(new Sprite());
                const mesh2Drender = ape.addComponent(Mesh2DRender);
                mesh2Drender.shareMesh = this.generateRectVerticesAndUV(110, 145);
                mesh2Drender.texture = tex;
                mesh2Drender.lightReceive = true;
                ape.x = 500;
                ape.y = 300;

                const ls = ape.addComponent(LightOccluder2D);
                const poly = new PolygonPoint2D();
                poly.addPoint(55, 3);
                poly.addPoint(68, 15);
                poly.addPoint(78, 25);
                poly.addPoint(83, 40);
                poly.addPoint(85, 60);
                poly.addPoint(95, 70);
                poly.addPoint(100, 80);
                poly.addPoint(105, 90);
                poly.addPoint(107, 100);
                poly.addPoint(105, 110);
                poly.addPoint(105, 120);
                poly.addPoint(100, 130);
                poly.addPoint(95, 140);
                poly.addPoint(80, 142);
                poly.addPoint(70, 130);
                poly.addPoint(55, 120);
                poly.addPoint(40, 130);
                poly.addPoint(30, 142);
                poly.addPoint(15, 140);
                poly.addPoint(10, 130);
                poly.addPoint(5, 120);
                poly.addPoint(5, 110);
                poly.addPoint(3, 100);
                poly.addPoint(5, 90);
                poly.addPoint(10, 80);
                poly.addPoint(15, 70);
                poly.addPoint(25, 60);
                poly.addPoint(27, 40);
                poly.addPoint(32, 25);
                poly.addPoint(42, 15);
                ls.polyPoints = poly.points;
                ls.canInLight = false;
                ls.outside = false;

                ape.addComponent(testMove);
                ape.addChild(this.camera);
                //this.testDrag(this.camera);
                //this.testLimit(this.camera);
                //this.testSmooth(this.camera);
                this.camera.isMain = true;

                // const light2 = ape.addChild(new FreeformLight2D());
                // const ox = 50;
                // const oy = -20;
                // light2.addPoint(-100 + ox, -100 + oy);
                // light2.addPoint(100 + ox, -100 + oy);
                // light2.addPoint(100 + ox, 100 + oy);
                // light2.addPoint(0 + ox, 150 + oy);
                // light2.addPoint(-100 + ox, 100 + oy);
                // light2.x = -50;
                // light2.y = 100;
                // light2.color = new Color(1, 1, 1, 1);
                // light2.shadowColor = new Color(1, 0, 0, 1);
                // light2.shadowStrength = 0.5;
                // light2.falloff = 0.5;
                // light2.layerMask = 1;
                // light2.shadowEnable = true;
                // light2.showLightTexture = true;

                // const spriteLight3 = this.scene.addChild(new Sprite());
                // const light3 = spriteLight3.addComponent(SpotLight2D);
                // spriteLight3.x = 55;
                // spriteLight3.y = 0;
                // spriteLight3.rotation = -90;
                // light3.innerRadius = 200;
                // light3.outerRadius = 300;
                // light3.innerAngle = 60;
                // light3.outerAngle = 125;
                // light3.color = new Color(0.85, 1, 0.85, 1);
                // light3.shadowColor = new Color(1, 0, 0, 1);
                // light3.shadowStrength = 0.5;
                // light3.layerMask = 1;
                // light3.shadowEnable = true;
                // //light3.showLightTexture = true;
                // spriteLight3.addComponent(lightRotate);
            });

            const ape: Sprite = new Sprite();
            this.scene.addChild(ape);
            ape.loadImage("res/apes/monkey1.png");
            ape.x = 50;
            ape.y = 50;
            //ape.width = 100;
            //ape.height = 100;
        });
    }

    private testDrag(camera: Camera2D) {
        camera.dragHorizontalEnable = true;
        camera.dragVerticalEnable = true;
        camera.drag_Bottom = 0.5;
        camera.drag_Top = 0.5;
        camera.drag_Left = 0.5;
        camera.drag_Right = 0.5;
    }

    private testLimit(camera: Camera2D) {
        camera.limit_Left = -1000;
        camera.limit_Right = 3000;
        camera.limit_Top = -1000;
        camera.limit_Buttom = 3000;
    }

    private testSmooth(camera: Camera2D) {
        camera.positionSmooth = true;
        camera.positionSpeed = 0.5;
    }

    /**
     * 生成一个圆形
     * @param radius 
     * @param numSegments 
     * @returns 
     */
    private generateCircleVerticesAndUV(radius: number, numSegments: number): Mesh2D {
        const twoPi = Math.PI * 2;
        const vertexs = new Float32Array((numSegments + 1) * 5);
        const index = new Uint16Array((numSegments + 1) * 3);
        let pos = 0;
        for (let i = 0; i < numSegments; i++, pos += 5) {
            const angle = twoPi * i / numSegments;
            const x = vertexs[pos + 0] = radius * Math.cos(angle);
            const y = vertexs[pos + 1] = radius * Math.sin(angle);
            vertexs[pos + 2] = 0;

            // 计算UV坐标
            vertexs[pos + 3] = 0.5 + x / (2 * radius); // 将x从[-radius, radius]映射到[0,1]
            vertexs[pos + 4] = 0.5 + y / (2 * radius); // 将y从[-radius, radius]映射到[0,1]
        }
        //add center
        vertexs[pos] = 0;
        vertexs[pos + 1] = 0;
        vertexs[pos + 2] = 0;
        vertexs[pos + 3] = 0.5;
        vertexs[pos + 4] = 0.5;

        let ibIndex = 0;
        for (let i = 1; i < numSegments; i++, ibIndex += 3) {
            index[ibIndex] = i;
            index[ibIndex + 1] = i - 1;
            index[ibIndex + 2] = numSegments;
        }
        index[ibIndex] = numSegments - 1;
        index[ibIndex + 1] = 0;
        index[ibIndex + 2] = numSegments;
        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Mesh2D.createMesh2DByPrimitive([vertexs], [declaration], index, IndexFormat.UInt16, [{ length: index.length, start: 0 }]);
        return mesh2D;
    }

    /**
     * 生成一个矩形
     * @param width 
     * @param height 
     * @returns 
     */
    private generateRectVerticesAndUV(width: number, height: number): Mesh2D {
        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);
        let index = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;

        vertices[index++] = width;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 0;

        vertices[index++] = width;
        vertices[index++] = height;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 1;

        vertices[index++] = 0;
        vertices[index++] = height;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;

        index = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = 3;

        indices[index++] = 1;
        indices[index++] = 2;
        indices[index++] = 3;

        const declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        const mesh2D = Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
        return mesh2D;
    }
}

export class lightRotate extends Script {
    onUpdate(): void {
        (this.owner as Sprite).rotation += 1;
    }
}

export class testMove extends Script {
    /**
     * 键盘按下时执行
     * @param 鼠标事件
     */
    onKeyDown(evt: Event): void {
        //console.log(evt.keyCode);
        const speed = 10;
        const angle = 5;
        switch (evt.keyCode) {
            case 87: //w
                (this.owner as Sprite).y -= speed;
                break;
            case 83: //s
                (this.owner as Sprite).y += speed;
                break;
            case 65: //a
                (this.owner as Sprite).x -= speed;
                break;
            case 68: //d
                (this.owner as Sprite).x += speed;
                break;
            case 32: //space
                (this.owner as Sprite).rotation += angle;
                break;
            case 33: //pgup
                (this.owner as Sprite).scaleX *= 1.1;
                break;
            case 34: //pgdn
                (this.owner as Sprite).scaleX /= 1.1;
                break;
        }
    }
}

// export class spotParam extends Script {
//     outerRadius = 0;
//     outerAngle = 0;
//     /**
//      * 键盘按下时执行
//      * @param 鼠标事件
//      */
//     // onKeyDown(evt: Event): void {
//     //     const speed = 10;
//     //     const angle = 5;
//     //     switch (evt.keyCode) {
//     //         case 87: //w
//     //             (this.owner as SpotLight2D).outerRadius -= speed;
//     //             break;
//     //         case 83: //s
//     //             (this.owner as SpotLight2D).outerRadius += speed;
//     //             break;
//     //         case 65: //a
//     //             (this.owner as SpotLight2D).innerRadius -= speed;
//     //             break;
//     //         case 68: //d
//     //             (this.owner as SpotLight2D).innerRadius += speed;
//     //             break;
//     //         case 33: //pgup
//     //             (this.owner as SpotLight2D).outerAngle -= angle;
//     //             break;
//     //         case 34: //pgdn
//     //             (this.owner as SpotLight2D).outerAngle += angle;
//     //             break;
//     //     }
//     // }

//     onAwake(): void {
//         this.outerRadius = (this.owner as SpotLight2D).outerRadius;
//         this.outerAngle = (this.owner as SpotLight2D).outerAngle;
//     }

//     onUpdate(): void {
//         (this.owner as SpotLight2D).outerRadius = this.outerRadius + Math.sin(Laya.timer.currTimer * 0.01) * 50;
//         (this.owner as SpotLight2D).outerAngle = this.outerAngle + Math.sin(Laya.timer.currTimer * 0.01) * 20;
//     }
// }

// export class editFreeform extends Script {
//     /**
//      * 键盘按下时执行
//      * @param 鼠标事件
//      */
//     onKeyDown(evt: Event): void {
//         switch (evt.keyCode) {
//             case 87: //w
//                 (this.owner as FreeformLight2D).addPoint(150, 0, 3);
//                 break;
//             case 83: //s
//                 (this.owner as FreeformLight2D).updatePoint(200, 50, 3);
//                 break;
//         }
//     }

//     onUpdate(): void {
//     }
// }

// export class editSpriteLight extends Script {
//     /**
//      * 键盘按下时执行
//      * @param 鼠标事件
//      */
//     onKeyDown(evt: Event): void {
//         switch (evt.keyCode) {
//             case 87: //w
//                 (this.owner as SpriteLight2D).width = 1000;
//                 break;
//             case 83: //s
//                 (this.owner as SpriteLight2D).height = 1000;
//                 break;
//         }
//     }

//     onUpdate(): void {
//     }
// }

// export class editDirectionLight extends Script {
//     /**
//      * 键盘按下时执行
//      * @param 鼠标事件
//      */
//     onKeyDown(evt: Event): void {
//         switch (evt.keyCode) {
//             case 87: //w
//                 (this.owner as DirectionLight2D).directionAngle += 10;
//                 break;
//             case 83: //s
//                 (this.owner as DirectionLight2D).directionAngle -= 10;
//                 break;
//         }
//     }

//     onUpdate(): void {
//     }
// }