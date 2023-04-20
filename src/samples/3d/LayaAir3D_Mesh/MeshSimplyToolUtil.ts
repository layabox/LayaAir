import { BufferUsage } from "laya/RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "laya/RenderEngine/RenderEnum/IndexFormat";
import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { LayaGL } from "laya/layagl/LayaGL";

export class MeshSimplifyToolUtil {
    tool: any;
    constructor() {
        this.tool = (window as any).MeshoptSimplifier;
    }

    /**
     * 简化Mesh
     * @param mesh 
     * @param targetRate 0-1
     * @param lockBorder 边界是否保存
     */
    simplyfyMesh(mesh: Mesh, targetRate: number, lockBorder: boolean = true): Mesh {
        targetRate = Math.min(Math.max(targetRate, 0.01), 1.0);
        //@ts-ignore
        let state = mesh._bufferState;
        //@ts-ignore
        let vb = mesh._vertexBuffer;
        let vbPos = new Float32Array(vb.getFloat32Data());
        let vbPos8 = new Uint8Array(vb.getUint8Data());
        let stride = vb.vertexDeclaration.vertexStride / 4;
        let stridebyte = vb.vertexDeclaration.vertexStride;
        let ib = new Uint16Array(state._bindedIndexBuffer._buffer);
        //@ts-ignore
        let submeshs = mesh._subMeshes;
        let submeshSimplyIBs: Array<Uint16Array | Float32Array> = [];
        for (let i = 0, n = submeshs.length; i < n; i++) {
            let submesh = submeshs[i];
            let spliceib = ib.slice(submesh._indexStart, submesh._indexStart + submesh.indexCount);
            try {
                submeshSimplyIBs.push((this.simplyfiyIb(vbPos, spliceib, stride, targetRate, lockBorder) as any)[0]);
            } catch {
                //失败了
                return null;
            }
        }
        // //@ts-ignore
        // return PrimitiveMesh._createMesh(vb.vertexDeclaration, vbPos, submeshSimplyIBs[0] as any);
        let newibdatas: Array<number> = [];
        //拼接新ib
        for (let i = 0, n = submeshSimplyIBs.length; i < n; i++) {
            newibdatas = newibdatas.concat(new Array(...submeshSimplyIBs[i]));
        }

        let newvbDatas = [];
        //拼接新vb
        for (let i = 0, n = vbPos8.length / stridebyte; i < n; i++) {
            if (newibdatas.indexOf(i) != -1) {
                for (let ii = i * stridebyte , nn = (i + 1) * stridebyte ; ii < nn; ii++)
                    newvbDatas.push(vbPos8[ii]);
            }
        }


        //@ts-ignore
        //return PrimitiveMesh._createMesh(vb.vertexDeclaration, new Float32Array(new Uint8Array(newvbDatas).buffer), this.compressIndex(newibdatas));
        return this.createNewMesh(mesh,new Float32Array(new Uint8Array(newvbDatas).buffer), vb.vertexDeclaration,this.compressIndex(newibdatas),submeshSimplyIBs);
    }

    /**
     * 根据压缩率输出压缩IB
     * @param vb 顶点
     * @param ib 
     * @param vbDeclar 
     * @param targetRate 
     * @param lockBorder 
     * @returns 
     */
    private simplyfiyIb(vb: Float32Array, ib: Uint16Array | Float32Array, vbDeclar: number, targetRate: number, lockBorder: boolean = true): Uint16Array | Float32Array {
        let target = ib.length * targetRate;
        target -= target % 3;
        let newib = this.tool.simplify(ib, vb, vbDeclar,target, 0.01, lockBorder ? ["LockBorder"] : null);
        return newib;
    }

    private compressIndex(ib: Array<number>): Uint16Array {
        if (ib.length > 65536) {
            //float32Array TODO
        }
        let sorlist = ib.slice(0,ib.length);
        //去重
        sorlist = Array.from(new Set(sorlist));
        sorlist = sorlist.sort((a,b)=>{
            return a-b;
        });
        for (let i = 0, n = ib.length; i < n; i++) {
            ib[i] = sorlist.indexOf(ib[i]);
        }

        // var res = this.tool.compactMesh(uint);
        // var map = res[0];
        // for (let i = 0, n = ib.length; i < n; i++) {
        //     ib[i] = map[ib[i]];
        // }
        return new Uint16Array(ib);
    }

    //TODO SKin LOD
    //TODO BlendShape LOD 
    private createNewMesh(orimesh:Mesh,vb,vertexDeclaration,ib,ibArray:Array<Uint16Array | Float32Array>){
        let mesh = orimesh.clone() as Mesh;
        var vertexBuffer: VertexBuffer3D = LayaGL.renderOBJCreate.createVertexBuffer3D(vb.length * 4, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
		vertexBuffer.setData(vb.buffer);
        //@ts-ignore
        mesh._vertexBuffer = vertexBuffer;
		//@ts-ignore
        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
		var indexBuffer: IndexBuffer3D = LayaGL.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, ib.length, BufferUsage.Static, true);
		indexBuffer.setData(ib);
		//@ts-ignore
        mesh._indexBuffer = indexBuffer;
        //@ts-ignore
        mesh._setBuffer(vertexBuffer, indexBuffer);
        //@ts-ignore
        let submeshs = mesh._subMeshes;
        let start = 0;
        for(let i = 0;i<submeshs.length;i++){
            let submesh = submeshs[i]
            submesh._vertexBuffer = vertexBuffer;
		    submesh._indexBuffer = indexBuffer;
            var subIndexBufferStart: number[] = submesh._subIndexBufferStart;
            var subIndexBufferCount: number[] = submesh._subIndexBufferCount;
            subIndexBufferStart.length = 1;
            subIndexBufferCount.length = 1;
            subIndexBufferStart[0] = start;
		    subIndexBufferCount[0] = ibArray[i].length;
            submesh._setIndexRange(start,ibArray[i].length);
            start+=ibArray[i].length;
        }
        mesh.bounds = orimesh.bounds;
        return mesh;
    }
    

}