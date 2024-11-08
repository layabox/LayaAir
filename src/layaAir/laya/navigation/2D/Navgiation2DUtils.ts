import { Sprite } from "../../display/Sprite";
import { LayaGL } from "../../layagl/LayaGL";
import { Color } from "../../maths/Color";
import { Matrix } from "../../maths/Matrix";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Point } from "../../maths/Point";
import { Vector2 } from "../../maths/Vector2";
import { Vector3 } from "../../maths/Vector3";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { Mesh2D, VertexMesh2D } from "../../resource/Mesh2D";
import { Utils } from "../../utils/Utils";
import { NavigationUtils } from "../common/NavigationUtils";
import { NavMesh2D } from "./NavMesh2D";

let tempVector3 = new Vector3();
let mat = new Matrix();
let point = new Point();
const transfromPoint = function (x: number, y: number) {
    point.setTo(x, y);
    return mat.transformPoint(point);
}
/** @internal*/
export class Navgiation2DUtils {
    private static _colorMap: Map<number, Color> = new Map<number, Color>();
    /**
     * @internal
     */
    static __init__() {
        const areaColor = ['#800000', '#FFA500', '#FF0000', '#FFD700', '#F0E68C', '#808000', '#FFFF00', '#7CFC00', '#008000', '#98FB98', '#8FBC8F', '#00FFFF', '#E0FFFF', '#00BFFF', '#191970', '#0000FF']
        for (var i = 0; i < 16; i++) {
            let color = new Color();
            let data = areaColor[i];
            color.r = parseInt("0x" + data.substring(1, 3), 16) / 255;
            color.g = parseInt("0x" + data.substring(3, 5), 16) / 255;
            color.b = parseInt("0x" + data.substring(5, 7), 16) / 255;
            color.a = 0.4;
            this._colorMap.set(i, color);
        }
    }

    /**
     * @internal
     */
    static _vec2ToVec3 = function (value: Vector2, out: Vector3) {
        out.setValue(value.x, 0, value.y);
    }

    /**
     * @internal
     */
    static _setValue3(x: number, y: number, out: Vector3) {
        out.setValue(x, 0, y);
    }

    /**
     * @internal
     */
    static _getSpriteGlobalPos(sprite: Sprite, out: Vector3) {
        this._setValue3(sprite.globalPosX, sprite.globalPosY, out);
    }

    /**
     * @internal
     */
    static _transfromVec2ToVec3(vec2: Vector2, mat: Matrix, out: Vector3) {
        out.x = mat.a * vec2.x + mat.c * vec2.y + mat.tx;
        out.y = 0;
        out.z = mat.b * vec2.x + mat.d * vec2.y + mat.ty;
    }

    /** @internal*/
    static _getSpriteMatrix4x4(sprite: Sprite, out: Matrix4x4) {
        let mat = sprite.getGlobalMatrix();
        out.elements[0] = mat.a;
        out.elements[1] = 0;
        out.elements[2] = mat.b;
        out.elements[3] = 0;

        out.elements[4] = 0;
        out.elements[5] = 1;
        out.elements[6] = 0;
        out.elements[7] = 0;

        out.elements[8] = mat.c;
        out.elements[9] = 0;
        out.elements[10] = mat.d;
        out.elements[11] = 0;

        out.elements[12] = mat.tx;
        out.elements[13] = 0;
        out.elements[14] = mat.ty;
        out.elements[15] = 1;
    }

    /** @internal*/
    static _getTransfromMatrix4x4(pos: Vector2, rot: number, scale: Vector2, out: Matrix4x4) {
        out.identity();
        let rate = Utils.toRadian(rot);
        let sin = Math.sin(rate);
        let cos = Math.cos(rate);
        out.elements[0] = cos * scale.x;
        out.elements[2] = sin * scale.x;

        out.elements[8] = -sin * scale.y;
        out.elements[10] = cos * scale.y;

        out.elements[12] = pos.x;
        out.elements[14] = pos.y;
    }

    /** @internal*/
    private static _getTitleData(title: any, vbDatas: number[], size: Vector3, ibs: number[]): void {
        let header: any = title.getheader();
        if (!header) return null;

        let tvertCount: number = header.vertCount;
        let tailTris: number[] = title.getdetailTris();
        let indexMaps = new Map<number, number[]>();
        for (var i = 0; i < header.polyCount; i++) {
            let p: any = title.getPolys(i);
            let flags: number = p.flags;
            if (!indexMaps.has(flags)) indexMaps.set(flags, []);
            let indexs = indexMaps.get(flags);
            let vertCount: number = p.vertCount;
            let pverts: number[] = p.getVerts();

            let pd: any = title.getPolyDetail(i);
            let triCount: number = pd.triCount;
            for (var j = 0; j < triCount; j++) {
                let index = (pd.triBase + j) * 4;
                for (var k = 0; k < 3; k++) {
                    const kvalue = tailTris[index + NavigationUtils._TitleMeshIbOff[k]];
                    if (kvalue < vertCount) {
                        indexs.push(pverts[kvalue]);
                    } else {
                        indexs.push(pd.vertBase + kvalue - vertCount + tvertCount);
                    }
                }
            }
        }
        let pointdatas: number[] = [];

        let verts = title.getVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            let p = transfromPoint(verts[i], verts[i + 2]);
            pointdatas.push(p.x, p.y);
            pointdatas.push(verts[i] / size.x)
            pointdatas.push(verts[i + 2] / size.z)
        }

        verts = title.getdetailVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            let p = transfromPoint(verts[i], verts[i + 2]);
            pointdatas.push(p.x, p.y);
            pointdatas.push(verts[i] / size.x)
            pointdatas.push(verts[i + 2] / size.z)
        }

        //组织顶点数据；按照map的顺序
        indexMaps.forEach((values, key) => {
            let color = this._colorMap.get(Math.log2(key) + 1);
            let set = new Set(values);
            let newIb = Array.from(set.values());
            newIb.sort((a, b) => a - b);
            const ibOffset = vbDatas.length / 9;
            for (var i = 0, n = newIb.length; i < n; i++) {
                let index = newIb[i] * 4;
                vbDatas.push(pointdatas[index], pointdatas[index + 1], 0, color.r, color.g, color.b, color.a, pointdatas[index + 2], pointdatas[index + 3]);
            }
            values.forEach((ib, index) => {
                ibs.push(newIb.indexOf(ib) + ibOffset);
            })
        })

    }

    /** @internal*/
    private static _updateMesh2DData(mesh2d: Mesh2D, vbdata: Float32Array, ib: Uint16Array | Uint32Array, ibFormat: IndexFormat) {
        let vbArray = [];
        {
            let vertex = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Dynamic);
            vertex.vertexDeclaration = VertexMesh2D.getVertexDeclaration(["POSITION,COLOR,UV"], false)[0];
            vertex.setDataLength(vbdata.buffer.byteLength);
            vertex.setData(vbdata.buffer, 0, 0, vbdata.buffer.byteLength);
            vbArray.push(vertex);
        }

        let indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Dynamic);
        indexBuffer._setIndexDataLength(ib.buffer.byteLength);
        indexBuffer._setIndexData(ib, 0);
        mesh2d._setBuffers(vbArray, indexBuffer);

        let geometryArray = [];
        // for (var i = 0; i < submeshInfo.length; i++) {
        let geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
        geometry.bufferState = mesh2d._bufferState;
        geometry.setDrawElemenParams(ib.length, 0);
        geometry.indexFormat = ibFormat;
        geometryArray.push(geometry);
        // }
        mesh2d._setSubMeshes(geometryArray);
        mesh2d._vertices = [vbdata];
        mesh2d._indices = ib;
        mesh2d._vertexCount = vbdata.length / 9;
        return mesh2d;
    }

    /**
     * @internal
     * create navMesh tile to Laya Mesh 
     * @param navMesh 
     * @param mesh
     */
    static _createDebugMesh(navMesh: NavMesh2D, mesh: Mesh2D = null, isGlobal: boolean = false): Mesh2D {
        let m_navMesh = navMesh.navMesh;
        let tileCount = m_navMesh.getMaxTiles();
        let poses: number[] = []
        let indexs: number[] = [];
        if (isGlobal) {
            mat.identity();
        } else {
            let sprite = navMesh._surface.owner as Sprite;
            sprite.getGlobalMatrix().copyTo(mat);
            mat.invert();
        }
        Vector3.subtract(navMesh.navTileGrid.max, navMesh.navTileGrid.min, tempVector3);
        for (var i = 0; i < tileCount; i++) {
            this._getTitleData(m_navMesh.getTile(i), poses, tempVector3, indexs);
        }
        let vb = new Float32Array(poses);
        let ib = new Uint16Array(indexs);
        if (mesh == null) {
            mesh = new Mesh2D();
            mesh.canRead = true;
        }
        this._updateMesh2DData(mesh, vb, ib, IndexFormat.UInt16);
        return mesh;
    }
} 