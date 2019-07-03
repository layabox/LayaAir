export class Path {
    constructor() {
        //public var _rect:Rectangle;
        /**@internal */
        this._lastOriX = 0; //moveto等的原始位置。没有经过内部矩阵变换的
        /**@internal */
        this._lastOriY = 0;
        this.paths = []; //所有的路径。{@type renderPath[] }
        this._curPath = null;
    }
    beginPath(convex) {
        this.paths.length = 1;
        this._curPath = this.paths[0] = new renderPath();
        this._curPath.convex = convex;
        //_curPath.path = [];
    }
    closePath() {
        this._curPath.loop = true;
    }
    newPath() {
        this._curPath = new renderPath();
        this.paths.push(this._curPath);
    }
    addPoint(pointX, pointY) {
        //tempArray.push(pointX, pointY);
        this._curPath.path.push(pointX, pointY);
    }
    //直接添加一个完整的path
    push(points, convex) {
        if (!this._curPath) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        else if (this._curPath.path.length > 0) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        var rp = this._curPath;
        rp.path = points.slice(); //TODO 这个可能多次slice了
        rp.convex = convex;
    }
    reset() {
        this.paths.length = 0; //TODO 复用
    }
}
class renderPath {
    constructor() {
        this.path = []; //[x,y,x,y,....]的数组
        this.loop = false;
        this.convex = false;
    }
}
