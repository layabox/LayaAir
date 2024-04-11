
import { BufferUsage } from "../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../RenderEngine/RenderShader/VertexMesh";
import { VertexDeclaration } from "../RenderEngine/VertexDeclaration";
import { Laya3DRender } from "../d3/RenderObjs/Laya3DRender";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { Mesh } from "../d3/resource/models/Mesh";
import { PrimitiveMesh } from "../d3/resource/models/PrimitiveMesh";
import { Vector3 } from "../maths/Vector3";
import { NavMesh } from "./NavMesh";
import { NavigationPathData } from "./NavigationPathData";

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
        const vboff = vbDatas.length / 3;
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
        }

        verts = title.getdetailVerts();
        for (var i = 0, n = verts.length; i < n; i += 3) {
            vbDatas.push(verts[i] - center.x);
            vbDatas.push(verts[i + 1] - center.y);
            vbDatas.push(verts[i + 2] - center.z);
        }
    }

    /**
     * create navMesh tile to Laya Mesh 
     * @param navMesh 
     * @param mesh
     */
    static creageDebugMesh(navMesh: NavMesh, mesh: Mesh) {
        let m_navMesh = navMesh.navMesh;
        let tileCount = m_navMesh.getMaxTiles();
        let orig: Vector3 = navMesh.navTileGrid.bounds.getCenter();
        let poses: number[] = []
        let indexs: number[] = [];
        for (var i = 0; i < tileCount; i++) {
            this.getTitleData(m_navMesh.getTile(i), poses, orig, indexs);
        }
        let vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION");
        let vb = new Float32Array(poses);
        let ib = new Uint16Array(indexs);
        if (mesh == null) {
            mesh = PrimitiveMesh._createMesh(vertexDeclaration, vb, ib);
        } else {
            this.resetMesh(mesh, vertexDeclaration, vb, ib);
        }
        Vector3.subtract(navMesh.navTileGrid.bounds.max, orig, mesh.bounds.max);
        Vector3.subtract(navMesh.navTileGrid.bounds.min, orig, mesh.bounds.min);
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

    /**@internal  */
    static initialize(Recast: any) {
        NavigationUtils._recast = Recast;
        NavigationUtils._dtCrowdAgentParams = new Recast.dtCrowdAgentParams();
        NavigationUtils._TemprefPoint = {};
        NavigationUtils._TemprefPoint1 = {};
    }

    /**
     * create NavMesh
     * @return any
     */
    static createNavMesh() {
        return new this._recast.dtNavMesh();
    }

    /**
     * create NavMeshQuery
     * @return any
     */
    static createNavMeshQuery() {
        return new this._recast.dtNavMeshQuery();
    }

    /**
     * create RefPointData
     * @return any
     */
    static createRefPointData(): any {
        return new this._recast.dtRefPointData();
    }

    /**
    * create MeshOffLink
    * @return any
    */
    static createMeshOffLink(): any {
        return new this._recast.dtOffMeshConnection()
    }

    /**
    * create ConvexVolum
    * @return any
    */
    static createConvexVolume(): any {
        return new this._recast.dtConvexVolume()
    }

    /**
     * create QueryFilter
     * @return any
     */
    static createQueryFilter(): any {
        return new this._recast.dtQueryFilter();
    }

    /**
     * create Crowd
     * @return any
     */
    static createCrowd(): any {
        return new this._recast.dtCrowd();
    }

    /**
     * create NavTileData
     * @internal
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
    * get CrowdAgentParams  
    * @return any
    */
    static getCrowdAgentParams(): any {
        return this._dtCrowdAgentParams;
    }

    /**
     * free NavMeshQuery
     */
    static freeNavMeshQuery(data: any) {
        this._recast.dtFreeNavMeshQuery(data);
    }

    /**
     * free NavMesh
     */
    static freeNavMesh(data: any) {
        this._recast.dtFreeNavMesh(data);
    }

    /**
     * free Crowd
     */
    static freeCrowd(data: any) {
        this._recast.dtFreeCrowd(data);
    }

    /**
     * free any other
     */
    static free(data: any) {
        this._recast.dtFree(data);
    }

    /**
    * free any layaData
    */
    static freeLayaData(data: any) {
        this._recast._free(data);
    }
    /**
     * check Status is Succeed
     */
    static statusSucceed(data: any): boolean {
        return this._recast.dtStatusSucceed(status)
    }
}