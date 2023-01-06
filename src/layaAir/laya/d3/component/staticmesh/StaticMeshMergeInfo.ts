
import { VertexDeclaration } from "../../../RenderEngine/VertexDeclaration";
import { MeshRenderer } from "../../core/MeshRenderer";
import { Sprite3D } from "../../core/Sprite3D";
import { Mesh } from "../../resource/models/Mesh";


declare module "../../core/MeshRenderer" {
    export interface MeshRenderer {
        getMesh: () => Mesh;
    }
}

MeshRenderer.prototype.getMesh = function () {
    // @ts-ignore
    return this._mesh;
}

/**
 * @internal
 */
export class StaticMeshMergeInfo {

    static create(render: MeshRenderer) {

        let mesh = render.getMesh();
        let owner = <Sprite3D>render.owner;

        let info = new StaticMeshMergeInfo();
        info.lightmapIndex = render.lightmapIndex;
        info.receiveShadow = render.receiveShadow;
        info.vertexDec = mesh ? mesh.getVertexDeclaration() : null;
        // info.invertFrontFace = owner ? owner.transform._isFrontFaceInvert : false;
        return info;
    }

    receiveShadow: boolean;

    lightmapIndex: number;

    vertexDec: VertexDeclaration;

    // invertFrontFace: boolean;

    private _renders: MeshRenderer[];
    public get renders(): MeshRenderer[] {
        return this._renders;
    }

    vertexCount: number;
    indexCount: number;

    private constructor() {
        this._renders = [];
        this.vertexCount = 0;
        this.indexCount = 0;
    }

    match(render: MeshRenderer): boolean {

        let mesh = render.getMesh();
        let owner = <Sprite3D>render.owner;

        let match = true;

        match = match && this.lightmapIndex == render.lightmapIndex;
        match = match && this.receiveShadow == render.receiveShadow;
        match = match && this.vertexDec == mesh.getVertexDeclaration();
        // match = match && this.invertFrontFace == owner.transform._isFrontFaceInvert;
        return match;
    }

    addElement(render: MeshRenderer) {
        this.renders.push(render);
        let mesh = render.getMesh();
        this.vertexCount += mesh.vertexCount;
        this.indexCount += mesh.indexCount;
    }

    destroy() {
        this._renders = null;
    }
}