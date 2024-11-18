import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { BaseTexture } from "../../../resource/BaseTexture";
import { VertexMesh2D, Mesh2D } from "../../../resource/Mesh2D";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { Mesh2DRender } from "../Mesh2DRender";

/**
 * 用于显示渲染目标
 */
export class ShowRenderTarget {
    private _sprite: Sprite;
    private _render: Mesh2DRender; //二维网格渲染器

    constructor(scene: Scene, tex: BaseTexture, x: number, y: number, width: number, height: number) {
        this._sprite = scene.addChild(new Sprite());
        this._render = this._sprite.addComponent(Mesh2DRender);
        this._render.lightReceive = false;
        if (tex) this._render.texture = tex;
        this._render.shareMesh = this._genMesh(x, y, width, height);
    }

    /**
     * @en Set render target
     * @zh 设置待显示的渲染目标
     * @param rt 
     */
    setRenderTarget(rt: BaseTexture) {
        this._render.texture = rt;
    }

    /**
     * @en Generate the mesh
     * @zh 生成网格
     */
    private _genMesh(x: number, y: number, width: number, height: number) {
        const vertices = new Float32Array(4 * 5);
        const indices = new Uint16Array(2 * 3);

        let index = 0;
        vertices[index++] = x;
        vertices[index++] = y;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 1;

        vertices[index++] = x + width;
        vertices[index++] = y;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 1;

        vertices[index++] = x + width;
        vertices[index++] = y + height;
        vertices[index++] = 0;
        vertices[index++] = 1;
        vertices[index++] = 0;

        vertices[index++] = x;
        vertices[index++] = y + height;
        vertices[index++] = 0;
        vertices[index++] = 0;
        vertices[index++] = 0;

        index = 0;
        indices[index++] = 0;
        indices[index++] = 1;
        indices[index++] = 3;

        indices[index++] = 1;
        indices[index++] = 2;
        indices[index++] = 3;

        const declaration = VertexMesh2D.getVertexDeclaration(['POSITION,UV'], false)[0];
        return Mesh2D.createMesh2DByPrimitive([vertices], [declaration], indices, IndexFormat.UInt16, [{ length: indices.length, start: 0 }]);
    }
}