import { Matrix } from "../maths/Matrix";

/** @ignore */
export class Cache_Info {
    //相对所在page的信息.如果本身就是normal则就是自己的cache结果
    page: any = null;

    //世界信息
    //wMat=new Matrix();
    mat: Matrix;
    alpha: number;
    blend: string;    //undefined表示没有设置
    contextID: number;   //当这sprite是挂点的时候，这个表示更新挂点信息的id
    //clipRect:Rectangle;
    clipMatrix: Matrix;
    reset() {
        this.page && this.page.reset();
        this.page = null;
    }
}

//计算两个裁剪用matrix的交集
function mergeClipMatrix(a: Matrix, b: Matrix, out: Matrix) {
    //假设a和b都是正的。TODO 起码应该假设a是正的
    let amaxx = a.tx + a.a;
    let amaxy = a.ty + a.d;
    let bmaxx = b.tx + b.a;
    let bmaxy = b.ty + b.d;

    let minx = out.tx = Math.max(a.tx, b.tx);
    let miny = out.ty = Math.max(a.ty, b.ty);

    out.b = out.c = 0;
    out.tx = minx;
    out.ty = miny;
    //如果没有交集
    if (amaxx <= b.tx || amaxy <= b.ty || bmaxx <= a.tx || bmaxy <= a.ty) {
        out.a = -0.1;
        out.d = -0.1;
    } else {
        let maxx = Math.min(amaxx, bmaxx);
        let maxy = Math.min(amaxy, bmaxy);
        out.a = maxx - minx;
        out.d = maxy - miny;
    }
    return out;
}
