
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Laya3DRender } from "../d3/RenderObjs/Laya3DRender";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../d3/resource/models/PrimitiveMesh";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Vector3 } from "../maths/Vector3";
import { NavMesh } from "./NavMesh";
import { NavigationPathData } from "./NavigationPathData";

const tempVector3 = new Vector3();
const tempVector31 = new Vector3();
/**
 * @en NavigationUtils is a utility class for handling operations related to navigation meshes.
 * @zh NavigationUtils 是一个导航工具类,主要用于处理与导航网格相关的操作。
 */
export class NavigationUtils {
    /**@internal */
    private static MAX_SMOOTH: number = 2048;
    /**@internal 超了怎么办 */
    private static MAX_POLYS: number = 256;
    /**@internal */
    private static TitleMeshIbOff: number[] = [0, 2, 1];
    /**@internal ori recast Data */
    static _recast: any;
    /**@internal */
    static _dtCrowdAgentParams: any;
    /**@internal */
    static _TemprefPoint: any;
    /**@internal */
    static _TemprefPoint1: any;

    /**
     * @internal
     * @param fllowPath 
     * @param index 
     * @param data 
     * @param flag 
     */
    private static _setDatastoArray(fllowPath: NavigationPathData[], index: number, data: number[], flag: number) {
        let navData: NavigationPathData = fllowPath[index] ? fllowPath[index] : new NavigationPathData();
        navData.pos.fromArray(data);
        navData._flag = flag
        fllowPath[index] = navData;
    }

    /**@internal  */
    static inRange(v1: number[], v2: number[], radius: number, height: number, offIndex: number) {
        const dx = v2[0] - v1[offIndex];
        const dy = v2[1] - v1[offIndex + 1];
        const dz = v2[2] - v1[offIndex + 2];
        return (dx * dx + dz * dz) < radius * radius && Math.abs(dy) < height;
    }

    /**@internal  */
    static isFlags(data: number, flag: any): number {
        return data & flag.value;
    }

    /**@internal  */
    static addVector3ToArray(vec1: Vector3, vec2: Vector3, scale: number) {
        let dest: number[] = [];
        dest[0] = vec1.x + vec2.x * scale;
        dest[1] = vec1.y + vec2.y * scale;
        dest[2] = vec1.z + vec2.z * scale;
        return dest;
    }

    /**@internal  */
    static getSteerTarget(navMesh: NavMesh, startRef: any, endRef: any, minTargetDist: number, paths: number[], pathSize: number, out: Vector3) {
        const navQuery = navMesh.navQuery;
        let data = navQuery.findStraightPath(startRef, endRef, paths, pathSize, 3);
        let steerPath = data.steerPath;
        let steerPathFlags = data.steerPathFlags;
        let steerPathPolys = data.steerPathPolys;
        let nsteerPath = data.nsteerPath;
        if (!nsteerPath) {
            return null;
        }
        let ns = 0;
        while (ns < nsteerPath) {
            if (this.isFlags(steerPathFlags[ns], this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ||
                !this.inRange(steerPath, startRef, minTargetDist, 1000, ns * 3))
                break;
            ns++;
        }
        if (ns >= nsteerPath)
            return null;
        out.fromArray(steerPath, ns * 3);
        return {
            steerPosFlag: steerPathFlags[ns],
            steerPosRef: steerPathPolys[ns]
        };
    }

    /**@internal  */
    static dtMergeCorridorStartMoved(path: number[], npath: number, maxPath: number, visited: number[], nvisited: number) {
        let furthestPath = -1;
        let furthestVisited = -1;
        for (var i = npath - 1; i >= 0; i--) {
            let found = false;
            for (let j = nvisited - 1; j >= 0; --j) {
                if (path[i] == visited[j]) {
                    furthestPath = i;
                    furthestVisited = j;
                    found = true;
                }
            }
            if (found)
                break;
        }
        if (furthestPath == -1 || furthestVisited == -1)
            return npath;
        const req = nvisited - furthestVisited;
        const orig = Math.min(furthestPath + 1, npath);
        let size = Math.max(0, npath - orig);
        if (req + size > maxPath)
            size = maxPath - req;

        // Store visited
        for (let i = 0; i < req; ++i)
            path[i] = visited[(nvisited - 1) - i];

        return req + size;
    }

    /**@internal  */
    static findFllowPath(navMesh: NavMesh, filter: any, startPos: Vector3, endPos: Vector3, steplength: number, minTarget: number, fllowPath: NavigationPathData[]) {
        const navQuery = navMesh.navQuery;
        const namesh = navMesh.navMesh;
        const startRef = navQuery.findNearestPoly(startPos.toArray(), navMesh.extents, filter);
        const endRef = navQuery.findNearestPoly(endPos.toArray(), navMesh.extents, filter);
        let pathdata = navQuery.findPath(startRef, endRef, filter, NavigationUtils.MAX_POLYS);
        let polys = pathdata.polys;
        let m_npolys = pathdata.pathCount;
        let m_nsmoothPath = 0;
        let steerPos: Vector3 = new Vector3();
        let help1: Vector3 = new Vector3();
        let help2: Vector3 = new Vector3();
        if (polys.length > 0) {
            let npolys = m_npolys;
            let iterPos = navQuery.closestPointOnPolyByRefPointData(startRef);
            let targetPos = navQuery.closestPointOnPoly(polys[npolys - 1], endRef.getData());
            this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_START.value);
            m_nsmoothPath++;
            while (npolys && m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                let steerData = this.getSteerTarget(navMesh, iterPos, targetPos, minTarget, polys, npolys, steerPos);
                if (steerData == null) {
                    break;
                }
                help1.fromArray(iterPos);
                let steerPosFlag = steerData.steerPosFlag;
                let steerPosRef = steerData.steerPosRef;
                let endOfPath = this.isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_END) ? true : false;
                let offMeshConnection = this.isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ? true : false;
                Vector3.subtract(steerPos, help1, help2);
                let len = help2.length();
                if ((endOfPath || offMeshConnection) && len < steplength)
                    len = 1;
                else
                    len = steplength / len;
                let moveTgt = this.addVector3ToArray(help1, help2, len);
                let surfacedata = navQuery.moveAlongSurface(polys[0], iterPos, moveTgt, filter, 16);
                let result = surfacedata.resultPos;
                let visited = surfacedata.visited;
                polys = this._recast.mergeCorridorStartMoved(polys, NavigationUtils.MAX_POLYS, Array.from(visited));
                polys = this._recast.fixupShortcuts(polys, navQuery);
                npolys = polys.length;
                let heightData = navQuery.getPolyHeight(polys[0], result);
                result[1] = heightData.height;
                iterPos = result;
                let isRange = this.inRange(iterPos, steerPos.toArray(), minTarget, 1.0, 0);

                if (endOfPath && isRange) {
                    // Reached end of path.
                    iterPos = targetPos;
                    if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                        this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_END.value);
                        m_nsmoothPath++;
                    }
                    break;
                } else if (offMeshConnection && isRange) {
                    let startPos = [0, 0, 0];
                    let endPos = [0, 0, 0];
                    let prevRef = 0, polyRef = polys[0];
                    let npos = 0;
                    while (npos < npolys && polyRef != steerPosRef) {
                        prevRef = polyRef;
                        polyRef = polys[npos];
                        npos++;
                    }
                    for (let i = npos; i < npolys; ++i) {
                        polys[i - npos] = polys[i];
                    }
                    npolys -= npos;
                    let status = namesh.getOffMeshConnectionPolyEndPoints(prevRef, polyRef, startPos, endPos);
                    if (this.statusSucceed(status)) {
                        if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                            this._setDatastoArray(fllowPath, m_nsmoothPath, startPos, steerPosFlag);
                            m_nsmoothPath++;
                            if (m_nsmoothPath & 1) {
                                this._setDatastoArray(fllowPath, m_nsmoothPath, startPos, steerPosFlag);
                                m_nsmoothPath++;
                            }
                        }
                        iterPos = endPos;

                        heightData = navQuery.getPolyHeight(polys[0], iterPos);
                        iterPos[1] = heightData.height;
                    }
                }
                if (m_nsmoothPath < NavigationUtils.MAX_SMOOTH) {
                    this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, steerPosFlag);
                    m_nsmoothPath++;
                }
            }
        }
        fllowPath.length = m_nsmoothPath;
    }

    /**@internal  */
    static getTitleData(title: any, vbDatas: number[], center: Vector3, ibs: number[]): void {
        let header: any = title.getheader();
        if (!header) return null;
        const vboff = vbDatas.length / 6; //兼容WGSL
        let tvertCount: number = header.vertCount;
        let tailTris: number[] = title.getdetailTris();
        for (var i = 0; i < header.polyCount; i++) {
            let p: any = title.getPolys(i);
            let vertCount: number = p.vertCount;
            let pverts: number[] = p.getVerts();
            let pd: any = title.getPolyDetail(i);
            let triCount: number = pd.triCount;
            for (var j = 0; j < triCount; j++) {
                let index = (pd.triBase + j) * 4;
                for (var k = 0; k < 3; k++) {
                    const kvalue = tailTris[index + NavigationUtils.TitleMeshIbOff[k]];
                    if (kvalue < vertCount) {
                        ibs.push(pverts[kvalue] + vboff)
                    } else {
                        ibs.push(pd.vertBase + kvalue - vertCount + vboff + tvertCount)
                    }
                }
            }
        }
        let verts = title.getVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            vbDatas.push(verts[i] - center.x);
            vbDatas.push(verts[i + 1] - center.y);
            vbDatas.push(verts[i + 2] - center.z);
            vbDatas.push(0, 0, 0); //兼容WGSL
        }

        verts = title.getdetailVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            vbDatas.push(verts[i] - center.x);
            vbDatas.push(verts[i + 1] - center.y);
            vbDatas.push(verts[i + 2] - center.z);
            vbDatas.push(0, 0, 0); //兼容WGSL
        }
    }

    /**
     * @en Create navMesh tile to Laya Mesh.
     * @param navMesh The navigation mesh to create the debug mesh from.
     * @param mesh The mesh to update or create. If null, a new mesh will be created.
     * @returns The created or updated mesh.
     * @zh 创建导航网格为Laya的网格。
     * @param navMesh 用于创建调试网格的导航网格。
     * @param mesh 要更新或创建的网格。如果为 null，将创建一个新的网格。
     * @returns 创建或更新后的网格。
     */
    static creageDebugMesh(navMesh: NavMesh, mesh: Mesh) {
        let m_navMesh = navMesh.navMesh;
        let tileCount = m_navMesh.getMaxTiles();
        Vector3.lerp(navMesh.navTileGrid.boundMax, navMesh.navTileGrid.boundMin, 0.5, tempVector3);
        let poses: number[] = []
        let indexs: number[] = [];
        for (var i = 0; i < tileCount; i++) {
            this.getTitleData(m_navMesh.getTile(i), poses, tempVector3, indexs);
        }
        let vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL"); //兼容WSGL
        let vb = new Float32Array(poses);
        let ib = new Uint16Array(indexs);
        if (mesh == null) {
            mesh = PrimitiveMesh._createMesh(vertexDeclaration, vb, ib);
        } else {
            this.resetMesh(mesh, vertexDeclaration, vb, ib);
        }
        Vector3.subtract(navMesh.navTileGrid.boundMax, tempVector3, mesh.bounds.max);
        Vector3.subtract(navMesh.navTileGrid.boundMin, tempVector3, mesh.bounds.min);
        return mesh;
    }

    /**@internal  */
    static resetMesh(mesh: Mesh, vertexDeclaration: VertexDeclaration, vertices: Float32Array, indices: Uint16Array) {
        var vertexBuffer: VertexBuffer3D = Laya3DRender.renderOBJCreate.createVertexBuffer3D(vertices.length * 4, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertices.buffer);
        mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
        var indexBuffer: IndexBuffer3D = Laya3DRender.renderOBJCreate.createIndexBuffer3D(IndexFormat.UInt16, indices.length, BufferUsage.Static, true);
        indexBuffer.setData(indices);
        mesh._indexBuffer = indexBuffer;

        mesh._setBuffer(vertexBuffer, indexBuffer);
        let subMesh = mesh.getSubMesh(0);
        //mesh._setInstanceBuffer(mesh._instanceBufferStateType);
        subMesh._vertexBuffer = vertexBuffer;
        subMesh._indexBuffer = indexBuffer;
        subMesh._setIndexRange(0, indexBuffer.indexCount);

        var subIndexBufferStart: number[] = subMesh._subIndexBufferStart;
        var subIndexBufferCount: number[] = subMesh._subIndexBufferCount;
        var boneIndicesList: Uint16Array[] = subMesh._boneIndicesList;
        subIndexBufferStart.length = 1;
        subIndexBufferCount.length = 1;
        boneIndicesList.length = 1;
        subIndexBufferStart[0] = 0;
        subIndexBufferCount[0] = indexBuffer.indexCount;

        var memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);
    }

    static transfromBound(mat:Matrix4x4,min:Vector3,max:Vector3,outMin:Vector3,outMax:Vector3){
        let center = tempVector3;
        let extent = tempVector31;
        Vector3.lerp(max, min, 0.5, center);
        Vector3.subtract(max, min, extent);
        Vector3.scale(extent, 0.5, extent);
        Vector3.transformCoordinate(center, mat, center);
        NavigationUtils._rotateExtents(extent, mat, extent);
        Vector3.subtract(center, extent, outMin);
        Vector3.add(center, extent, outMax);
    }

    /**
     * 旋转范围
     * @internal
     * @param extent 范围
     * @param rotation 旋转矩阵
     * @param out 返回值
     * @return void
     */
    protected static _rotateExtents(extents: Vector3, rotation: Matrix4x4, out: Vector3): void {
        var extentsX: number = extents.x;
        var extentsY: number = extents.y;
        var extentsZ: number = extents.z;
        var matE: Float32Array = rotation.elements;
        out.x = Math.abs(matE[0] * extentsX) + Math.abs(matE[4] * extentsY) + Math.abs(matE[8] * extentsZ);
        out.y = Math.abs(matE[1] * extentsX) + Math.abs(matE[5] * extentsY) + Math.abs(matE[9] * extentsZ);
        out.z = Math.abs(matE[2] * extentsX) + Math.abs(matE[6] * extentsY) + Math.abs(matE[10] * extentsZ);
    }

    static boundContainPoint(min:Vector3,max:Vector3,point:Vector3){
        return point.x >= min.x && point.x <= max.x && point.y >= min.y && point.y <= max.y && point.z >= min.z && point.z <= max.z;
    }

    /**@internal  */
    static initialize(Recast: any) {
        NavigationUtils._recast = Recast;
        NavigationUtils._dtCrowdAgentParams = new Recast.dtCrowdAgentParams();
        NavigationUtils._TemprefPoint = {};
        NavigationUtils._TemprefPoint1 = {};
    }

    /**
     * @en Create a new NavMesh.
     * @returns A new NavMesh object.
     * @zh 创建一个新的 NavMesh。
     * @returns 一个新的 NavMesh 对象。
     */
    static createNavMesh() {
        return new this._recast.dtNavMesh();
    }

    /**
     * @en Create a new NavMeshQuery.
     * @returns A new NavMeshQuery object.
     * @zh 创建一个新的 NavMeshQuery。
     * @returns 一个新的 NavMeshQuery 对象。
     */
    static createNavMeshQuery() {
        return new this._recast.dtNavMeshQuery();
    }

    /**
     * @en Create a new RefPointData.
     * @returns A new RefPointData object.
     * @zh 创建一个新的 RefPointData。
     * @returns 一个新的 RefPointData 对象。
     */
    static createRefPointData(): any {
        return new this._recast.dtRefPointData();
    }

    /**
     * @en Create a new MeshOffLink.
     * @returns A new MeshOffLink object.
     * @zh 创建一个新的 MeshOffLink。
     * @returns 一个新的 MeshOffLink 对象。
     */
    static createMeshOffLink(): any {
        return new this._recast.dtOffMeshConnection()
    }

    /**
     * @en Create a new ConvexVolume.
     * @returns A new ConvexVolume object.
     * @zh 创建一个新的 ConvexVolume。
     * @returns 一个新的 ConvexVolume 对象。
     */
    static createConvexVolume(): any {
        return new this._recast.dtConvexVolume()
    }

    /**
     * @en Create a new QueryFilter.
     * @returns A new QueryFilter object.
     * @zh 创建一个新的 QueryFilter。
     * @returns 一个新的 QueryFilter 对象。
     */
    static createQueryFilter(): any {
        return new this._recast.dtQueryFilter();
    }

    /**
     * @en Create a new Crowd.
     * @returns A new Crowd object.
     * @zh 创建一个新的 Crowd。
     * @returns 一个新的 Crowd 对象。
     */
    static createCrowd(): any {
        return new this._recast.dtCrowd();
    }

    /**
     * @en Create a new NavTileData.
     * @returns A new NavTileData object.
     * @zh 创建一个新的 NavTileData。
     * @returns 一个新的 NavTileData 对象。
     */
    static createdtNavTileData() {
        return new this._recast.dtNavTileData()
    }

    /**
     * create NavTileCache
     * @internal
     */
    static createdtNavTileCache() {
        return new this._recast.dtNavTileCache();
    }

    /**
     * @en Get CrowdAgentParams.
     * @returns CrowdAgentParams object.
     * @zh 获取 CrowdAgentParams。
     * @returns CrowdAgentParams 对象。
     */
    static getCrowdAgentParams(): any {
        return this._dtCrowdAgentParams;
    }

    /**
     * @en Free the NavMeshQuery object.
     * @param data The NavMeshQuery object to free.
     * @zh 释放 NavMeshQuery 对象。
     * @param data 要释放的 NavMeshQuery 对象。
     */
    static freeNavMeshQuery(data: any) {
        this._recast.dtFreeNavMeshQuery(data);
    }

    /**
     * @en Free the NavMesh object.
     * @param data The NavMesh object to free.
     * @zh 释放 NavMesh 对象。
     * @param data 要释放的 NavMesh 对象。
     */
    static freeNavMesh(data: any) {
        this._recast.dtFreeNavMesh(data);
    }

    /**
     * @en Free the Crowd object.
     * @param data The Crowd object to free.
     * @zh 释放 Crowd 对象。
     * @param data 要释放的 Crowd 对象。
     */
    static freeCrowd(data: any) {
        this._recast.dtFreeCrowd(data);
    }

    /**
     * @en Free any other object.
     * @param data The object to free.
     * @zh 释放任何其他对象。
     * @param data 要释放的对象。
     */
    static free(data: any) {
        this._recast.dtFree(data);
    }

    /**
     * @en Free any Laya data object.
     * @param data The Laya data object to free.
     * @zh 释放任何 Laya 数据对象。
     * @param data 要释放的 Laya 数据对象。
     */
    static freeLayaData(data: any) {
        this._recast._free(data);
    }
    /**
     * @en Check if the status is successful.
     * @param status The status to check.
     * @returns True if the status is successful, false otherwise.
     * @zh 检查状态是否成功。
     * @param status 要检查的状态。
     * @returns 如果状态成功则返回 true，否则返回 false。
     */
    static statusSucceed(data: any): boolean {
        return this._recast.dtStatusSucceed(status)
    }
}