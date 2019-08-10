
export class Path {

    //public var _rect:Rectangle;
    /**@internal */
    _lastOriX: number = 0;	//moveto等的原始位置。没有经过内部矩阵变换的
    /**@internal */
    _lastOriY: number = 0;
    paths: any[] = [];	//所有的路径。{@type renderPath[] }
    private _curPath: renderPath = null;


    constructor() {
    }

    beginPath(convex: boolean): void {
        this.paths.length = 1;
        this._curPath = this.paths[0] = new renderPath();
        this._curPath.convex = convex;
        //_curPath.path = [];
    }

    closePath(): void {
        this._curPath.loop = true;
    }

    newPath(): void {
        this._curPath = new renderPath();
        this.paths.push(this._curPath);
    }

    addPoint(pointX: number, pointY: number): void {
        //tempArray.push(pointX, pointY);
        this._curPath.path.push(pointX, pointY);
    }

    //直接添加一个完整的path
    push(points: any[], convex: boolean): void {
        if (!this._curPath) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        } else if (this._curPath.path.length > 0) {
            this._curPath = new renderPath();
            this.paths.push(this._curPath);
        }
        var rp: renderPath = this._curPath;
        rp.path = points.slice();//TODO 这个可能多次slice了
        rp.convex = convex;
    }

    reset(): void {
        this.paths.length = 0;//TODO 复用
    }
}



class renderPath {
    path: any[] = []; //[x,y,x,y,....]的数组
    loop: boolean = false;
    convex: boolean = false;
}
