import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D"
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { Mesh2DRender } from "laya/display/Scene2DSpecial/Mesh2DRender"
export class Mesh2DRenderDemo {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.showApe();
        });

    }

    private showApe(): void {
        Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {

            var t = Laya.loader.getRes("res/apes/monkey2.png")._bitmap;
            var ape: Sprite = new Sprite();
            let mesh2Drender = ape.addComponent(Mesh2DRender);
            mesh2Drender.shareMesh = this.generateCircleVerticesAndUV(100, 100);
            mesh2Drender.texture = t;
            // ape.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape);
            ape.pos(300, 300);
        });
    }

    /**
     * 生成一个圆形
     * @param radius 
     * @param numSegments 
     * @returns 
     */
    private generateCircleVerticesAndUV(radius: number, numSegments: number): Mesh2D {
        const twoPi = Math.PI * 2;
        let vertexs = new Float32Array((numSegments + 1) * 5);
        let index = new Uint16Array((numSegments + 1) * 3);
        var pos = 0;
        for (let i = 0; i < numSegments; i++, pos += 5) {
            const angle = twoPi * i / numSegments;
            var x = vertexs[pos + 0] = radius * Math.cos(angle);
            var y = vertexs[pos + 1] = radius * Math.sin(angle);
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

        for (var i = 1, ibIndex = 0; i < numSegments; i++, ibIndex += 3) {
            index[ibIndex] = i;
            index[ibIndex + 1] = i - 1;
            index[ibIndex + 2] = numSegments;
        }
        index[ibIndex] = numSegments - 1;
        index[ibIndex + 1] = 0;
        index[ibIndex + 2] = numSegments;
        var declaration = VertexMesh2D.getVertexDeclaration(["POSITION,UV"], false)[0];
        let mesh2D = Mesh2D.createMesh2DByPrimitive([vertexs], [declaration], index, IndexFormat.UInt16, [{ length: index.length, start: 0 }]);
        return mesh2D;
    }
}

