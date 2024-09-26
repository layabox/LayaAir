import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Vector3 } from "../../maths/Vector3";
import { BaseNavMesh } from "./BaseNavMesh";
import { NavigationPathData } from "./NavigationPathData";
const tempVec3 = new Vector3();
const tempVec31 = new Vector3();
const tempVec32 = new Vector3();
const tempVec33 = new Vector3();

/**
 * @en NavigationUtils is a utility class for handling operations related to navigation meshes.
 * @zh NavigationUtils 是一个导航工具类,主要用于处理与导航网格相关的操作。
 */
export class NavigationUtils {
    /**@internal */
    private static _MAX_SMOOTH: number = 2048;
    /**@internal 超了怎么办 */
    private static _MAX_POLYS: number = 256;
    /**@internal */
    static _TitleMeshIbOff: number[] = [0, 2, 1];
    /**@internal ori recast Data */
    static _recast: any;
    /**@internal */
    static _dtCrowdAgentParams: any;
    /**@internal */
    static _TemprefPoint: any;
    /**@internal */
    static _TemprefPoint1: any;

    /** @internal */
    static _boundContentPoint(min: Vector3, max: Vector3, point: Vector3): boolean {
        if (point.x > max.x || point.x < min.x) return false;
        if (point.y > max.y || point.y < min.y) return false;
        if (point.z > max.z || point.z < min.z) return false;
        return true;
    }

    /** @internal */
    static _boundInterection(min1: Vector3, max1: Vector3, min2: Vector3, max2: Vector3): number {
        var tempV0: Vector3 = tempVec3;
        var tempV1: Vector3 = tempVec31;
        var thisExtends: Vector3 = tempVec32;
        Vector3.subtract(max1, min1, thisExtends);
        Vector3.scale(thisExtends, 0.5, thisExtends);
        var boundExtends: Vector3 = tempVec33;
        Vector3.subtract(max2, min2, boundExtends);
        Vector3.scale(boundExtends, 0.5, boundExtends);
        tempV0.setValue(Math.max(max1.x, max2.x) - Math.min(min1.x, min2.x),
            Math.max(max1.y, max2.y) - Math.min(min1.y, min2.y),
            Math.max(max1.z, max2.z) - Math.min(min1.z, min2.z));
        tempV1.setValue((thisExtends.x + boundExtends.x) * 2.0,
            (thisExtends.y + boundExtends.y) * 2.0,
            (thisExtends.z + boundExtends.z) * 2.0);
        if ((tempV0.x) > (tempV1.x)) return -1;
        if ((tempV0.y) > (tempV1.y)) return -1;
        if ((tempV0.z) > (tempV1.z)) return -1;
        return (tempV1.x - tempV0.x) * (tempV1.y - tempV0.y) * (tempV1.z - tempV0.z);
    }

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
    static _inRange(v1: number[], v2: number[], radius: number, height: number, offIndex: number) {
        const dx = v2[0] - v1[offIndex];
        const dy = v2[1] - v1[offIndex + 1];
        const dz = v2[2] - v1[offIndex + 2];
        return (dx * dx + dz * dz) < radius * radius && Math.abs(dy) < height;
    }

    /**@internal 
     * calculate the boundBox of the transform
     * @param min vector3
     * @param max vector3
     * @param transfrom matrix4x4
     * @param outMin vector3
     * @param outMax vector3
     */
    static _transfromBoundBox(min: Vector3, max: Vector3, transfrom: Matrix4x4, outMin: Vector3, outMax: Vector3) {
        const center = tempVec3;
        Vector3.lerp(min, max, 0.5, center);
        const extent = tempVec31;
        Vector3.subtract(max, min, extent);
        Vector3.scale(extent, 0.5, extent);
        Vector3.transformCoordinate(center, transfrom, center);
        Vector3.TransformNormal(extent, transfrom, extent);
        Vector3.subtract(center, extent, outMin);
        Vector3.add(center, extent, outMax);
    }
    /**@internal  */
    static _isFlags(data: number, flag: any): number {
        return data & flag.value;
    }

    /**@internal  */
    static _addVector3ToArray(vec1: Vector3, vec2: Vector3, scale: number) {
        let dest: number[] = [];
        dest[0] = vec1.x + vec2.x * scale;
        dest[1] = vec1.y + vec2.y * scale;
        dest[2] = vec1.z + vec2.z * scale;
        return dest;
    }

    /**@internal  */
    static _getSteerTarget(navMesh: BaseNavMesh, startRef: any, endRef: any, minTargetDist: number, paths: number[], pathSize: number, out: Vector3) {
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
            if (this._isFlags(steerPathFlags[ns], this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ||
                !this._inRange(steerPath, startRef, minTargetDist, 1000, ns * 3))
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
    static _dtMergeCorridorStartMoved(path: number[], npath: number, maxPath: number, visited: number[], nvisited: number) {
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
    static _findFllowPath(navMesh: BaseNavMesh, filter: any, startPos: Vector3, endPos: Vector3, steplength: number, minTarget: number, fllowPath: NavigationPathData[]) {
        const navQuery = navMesh.navQuery;
        const namesh = navMesh.navMesh;
        const startRef = navQuery.findNearestPoly(startPos.toArray(), navMesh.extents, filter);
        const endRef = navQuery.findNearestPoly(endPos.toArray(), navMesh.extents, filter);
        let pathdata = navQuery.findPath(startRef, endRef, filter, NavigationUtils._MAX_POLYS);
        let polys = pathdata.polys;
        let m_npolys = polys.length;
        let m_nsmoothPath = 0;
        let steerPos: Vector3 = new Vector3();
        let help1: Vector3 = new Vector3();
        let help2: Vector3 = new Vector3();
        if (polys.length > 0) {
            let npolys = m_npolys;
            let iterPos = navQuery.closestPointOnPolyByRefPointData(startRef);
            let targetPos = navQuery.closestPointOnPoly(polys[npolys - 1], endRef.data);
            this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_START.value);
            m_nsmoothPath++;
            while (npolys && m_nsmoothPath < NavigationUtils._MAX_SMOOTH) {
                let steerData = this._getSteerTarget(navMesh, iterPos, targetPos, minTarget, polys, npolys, steerPos);
                if (steerData == null) {
                    break;
                }
                help1.fromArray(iterPos);
                let steerPosFlag = steerData.steerPosFlag;
                let steerPosRef = steerData.steerPosRef;
                let endOfPath = this._isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_END) ? true : false;
                let offMeshConnection = this._isFlags(steerPosFlag, this._recast.dtStraightPathFlags.DT_STRAIGHTPATH_OFFMESH_CONNECTION) ? true : false;
                Vector3.subtract(steerPos, help1, help2);
                let len = help2.length();
                if ((endOfPath || offMeshConnection) && len < steplength)
                    len = 1;
                else
                    len = steplength / len;
                let moveTgt = this._addVector3ToArray(help1, help2, len);
                let surfacedata = navQuery.moveAlongSurface(polys[0], iterPos, moveTgt, filter, 16);
                let result = surfacedata.resultPos;
                let visited = surfacedata.visited;
                polys = this._recast.mergeCorridorStartMoved(polys, NavigationUtils._MAX_POLYS, Array.from(visited));
                polys = this._recast.fixupShortcuts(polys, navQuery);
                npolys = polys.length;
                let heightData = navQuery.getPolyHeight(polys[0], result);
                result[1] = heightData.height;
                iterPos = result;
                let isRange = this._inRange(iterPos, steerPos.toArray(), minTarget, 1.0, 0);

                if (endOfPath && isRange) {
                    // Reached end of path.
                    iterPos = targetPos;
                    if (m_nsmoothPath < NavigationUtils._MAX_SMOOTH) {
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
                    if (this._statusSucceed(status)) {
                        if (m_nsmoothPath < NavigationUtils._MAX_SMOOTH) {
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
                if (m_nsmoothPath < NavigationUtils._MAX_SMOOTH) {
                    this._setDatastoArray(fllowPath, m_nsmoothPath, iterPos, steerPosFlag);
                    m_nsmoothPath++;
                }
            }
        }
        fllowPath.length = m_nsmoothPath;
    }



    /**@internal  */
    static _initialize(Recast: any) {
        NavigationUtils._recast = Recast;
        NavigationUtils._dtCrowdAgentParams = new Recast.dtCrowdAgentParams();
        NavigationUtils._TemprefPoint = {};
        NavigationUtils._TemprefPoint1 = {};
    }

    /**@internal  */
    static _getRecast() {
        return NavigationUtils._recast;
    }

    /**
     * create NavMesh
     * @return any
     */
    static _createNavMesh() {
        return new this._recast.dtNavMesh();
    }

    /**
     * create NavMeshQuery
     * @return any
     */
    static _createNavMeshQuery() {
        return new this._recast.dtNavMeshQuery();
    }

    /**
     * create RefPointData
     * @return any
     */
    static _createRefPointData(): any {
        return new this._recast.dtRefPointData();
    }

    /**
    * create MeshOffLink
    * @return any
    */
    static _createMeshOffLink(): any {
        return new this._recast.dtOffMeshConnection()
    }

    /**
    * create ConvexVolum
    * @return any
    */
    static _createConvexVolume(): any {
        return new this._recast.dtConvexVolume()
    }

    /**
     * create QueryFilter
     * @return any
     */
    static _createQueryFilter(): any {
        return new this._recast.dtQueryFilter();
    }

    /**
     * create Crowd
     * @return any
     */
    static _createCrowd(): any {
        return new this._recast.dtCrowd();
    }

    /**
     * create NavTileData
     * @internal
     */
    static _createdtNavTileData() {
        return new this._recast.dtNavTileData()
    }

    /**
     * create NavTileCache
     * @internal
     */
    static _createdtNavTileCache() {
        return new this._recast.dtNavTileCache();
    }

    /**
    * get CrowdAgentParams  
    * @return any
    */
    static _getCrowdAgentParams(): any {
        return this._dtCrowdAgentParams;
    }

    /**
     * free NavMeshQuery
     */
    static _freeNavMeshQuery(data: any) {
        this._recast.dtFreeNavMeshQuery(data);
    }

    /**
     * free NavMesh
     */
    static _freeNavMesh(data: any) {
        this._recast.dtFreeNavMesh(data);
    }

    /**
     * free Crowd
     */
    static _freeCrowd(data: any) {
        this._recast.dtFreeCrowd(data);
    }

    /**
     * free any other
     */
    static _free(data: any) {
        this._recast.dtFree(data);
    }

    /**
    * free any layaData
    */
    static _freeLayaData(data: any) {
        this._recast._free(data);
    }
    /**
     * check Status is Succeed
     */
    static _statusSucceed(data: any): boolean {
        return this._recast.dtStatusSucceed(data)
    }

    /**
     * update crowd
     */
    static _updateCrowd(crowd: any, dt: number) {
        return this._recast.updateCrowd(crowd, dt);
    }
}