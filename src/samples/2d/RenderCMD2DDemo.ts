import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
import { Mesh2D, VertexMesh2D } from "laya/resource/Mesh2D"
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { Mesh2DRender } from "laya/display/Scene2DSpecial/Mesh2DRender"
import { CommandBuffer2D } from "laya/display/Scene2DSpecial/RenderCMD2D/CommandBuffer2D"
import { Color } from "laya/maths/Color";
import { Utils3D } from "laya/d3/utils/Utils3D";
import { RenderTexture } from "laya/resource/RenderTexture";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Matrix } from "laya/maths/Matrix";
import { Vector4 } from "laya/maths/Vector4";
import { Texture } from "laya/resource/Texture";

export class RenderCMD2DDemo {
    Main: typeof Main = null;
    static cmd: CommandBuffer2D;
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

            let rtMesh = new RenderTexture(500, 500, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);

            let mesh = this.generateCircleVerticesAndUV(100, 100);

            var t = Laya.loader.getRes("res/apes/monkey2.png")._bitmap;

            let testMesh2DCMD = true;
            let testRenderElementCMD = true;
            let testBLitQuadRTCMD = true
            if (testMesh2DCMD) {//OK
                let cmd = RenderCMD2DDemo.cmd = new CommandBuffer2D("test");
                cmd.setRenderTarget(rtMesh as any, true, Color.YELLOW);
                let mat = Matrix.TEMP;
                mat.setMatrix(0, 0, 1, 1, 0, 0, 0, 0, 0);
                cmd.drawMesh(mesh, mat, t);
                cmd.apply(true);
                console.log(Utils3D.uint8ArrayToArrayBuffer(rtMesh));
            }
            let sp1: Sprite = new Sprite();
            sp1.texture = new Texture(rtMesh);
            sp1.pos(300, 10);
            sp1.scale(0.5, 0.5);
            this.Main.box2D.addChild(sp1);

            let rtMeshRender = new RenderTexture(500, 500, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
            if (testRenderElementCMD) {//OK
                var ape: Sprite = new Sprite();
                let mesh2Drender = ape.addComponent(Mesh2DRender);
                mesh2Drender.sharedMesh = mesh;
                mesh2Drender.color = Color.BLUE;
                mesh2Drender.texture = t;

                let cmd = RenderCMD2DDemo.cmd = new CommandBuffer2D("test");
                cmd.setRenderTarget(rtMeshRender as any, true, Color.YELLOW);
                let mat = new Matrix();
                mat.setTranslate(100, 100);
                cmd.drawRenderElement((mesh2Drender as any)._renderElements[0], mat);
                mat.setTranslate(100, 300);
                cmd.apply(true);
                console.log(Utils3D.uint8ArrayToArrayBuffer(rtMeshRender));
            }
            let sp2: Sprite = new Sprite();
            sp2.texture = new Texture(rtMeshRender);
            sp2.pos(600, 10);
            sp2.scale(0.5, 0.5);
            this.Main.box2D.addChild(sp2);

            let rtBlit = new RenderTexture(500, 500, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
            if (testBLitQuadRTCMD) {
                let cmd = RenderCMD2DDemo.cmd = new CommandBuffer2D("test");
                cmd.setRenderTarget(rtBlit as any, true, Color.YELLOW);
                cmd.blitTextureQuad(t, rtBlit as any, new Vector4(0, 0, 0.3, 0.3));
                cmd.blitTextureQuad(t, rtBlit as any, new Vector4(0.3, 0.3, 0.5, 0.5));
                cmd.blitTextureQuad(t, rtBlit as any, new Vector4(0.8, 0.8, 0.2, 0.2));
                cmd.apply(true);
                console.log(Utils3D.uint8ArrayToArrayBuffer(rtBlit));
            }
            let sp3: Sprite = new Sprite();
            sp3.texture = new Texture(rtBlit);
            sp3.pos(900, 10);
            sp3.scale(0.5, 0.5);
            this.Main.box2D.addChild(sp3);
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

