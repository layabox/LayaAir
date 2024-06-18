import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { VertexDeclaration } from "../../RenderEngine/VertexDeclaration";
import { LayaGL } from "../../layagl/LayaGL";
import { Context, IGraphicCMD } from "../../renders/Context"
import { Material } from "../../resource/Material";
import { Pool } from "../../utils/Pool"

export class DrawGeoCmd implements IGraphicCMD {
    static ID: string = "DrawGeoCmd";

    geo: IRenderGeometryElement;

    material: Material;

    /**@private */
    static create(geo: IRenderGeometryElement, material: Material): DrawGeoCmd {
        var cmd: DrawGeoCmd = Pool.getItemByClass("DrawGeoCmd" + material.id, DrawGeoCmd);
        cmd.init(geo, material);
        return cmd;
    }

    static creatGEO(decl: VertexDeclaration, vbArray: Float32Array, vblen: number, ibArray: Uint16Array, iblen: number) {
        let geo = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        let mesh = LayaGL.renderDeviceFactory.createBufferState();
        geo.bufferState = mesh;
        let vb = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
        vb.vertexDeclaration = decl;
        let ib = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        mesh.applyState([vb], ib)
        geo.indexFormat = IndexFormat.UInt16;
        //let vb = mesh._vertexBuffers[0];
        //let ib = mesh._bindedIndexBuffer;
        vb.setDataLength(vblen);
        vb.setData(vbArray.buffer, 0, 0, vblen)
        ib._setIndexDataLength(iblen)
        ib._setIndexData(new Uint16Array(ibArray.buffer, 0, iblen / 2), 0)
        geo.clearRenderParams();
        geo.setDrawElemenParams(iblen / 2, 0);
        return geo;
    }

    init(geo: IRenderGeometryElement, material: Material): void {
        this.material = material;
        this.geo = geo;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        Pool.recover("DrawGeoCmd" + this.material.id, this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawGeo(this.geo, this.material, gx, gy);
    }

    /**@private */
    get cmdID(): string {
        return DrawGeoCmd.ID;
    }
}
