
/** @ignore */
export class Path {
    _lastOriX: number = 0;	//moveto等的原始位置。没有经过内部矩阵变换的
    _lastOriY: number = 0;
    paths: RenderPath[] = [];	//所有的路径
    private _curPath: RenderPath = null;

    beginPath(convex: boolean): void {
        this.paths.length = 1;
        this._curPath = this.paths[0] = new RenderPath();
        this._curPath.convex = convex;
        //_curPath.path = [];
    }

    closePath(): void {
        this._curPath.loop = true;
    }

    newPath(): void {
        this._curPath = new RenderPath();
        this.paths.push(this._curPath);
    }

    addPoint(pointX: number, pointY: number): void {
        //tempArray.push(pointX, pointY);
        this._curPath.path.push(pointX, pointY);
    }

    //直接添加一个完整的path
    push(points: number[], convex: boolean): void {
        this.pushOwned(points.slice(), convex);
    }

    /** @internal */
    pushOwned(points: number[], convex: boolean): void {
        if (!this._curPath) {
            this._curPath = new RenderPath();
            this.paths.push(this._curPath);
        } else if (this._curPath.path.length > 0) {
            this._curPath = new RenderPath();
            this.paths.push(this._curPath);
        }
        var rp: RenderPath = this._curPath;
        rp.path = points;
        rp.convex = convex;
    }
    reset(): void {
        this.paths.length = 0;//TODO 复用
    }
}



class RenderPath {
    path: any[] = []; //[x,y,x,y,....]鐨勬暟缁?
    loop: boolean = false;
    convex: boolean = false;
}
