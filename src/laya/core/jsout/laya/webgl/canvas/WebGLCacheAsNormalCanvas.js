import { Matrix } from "../../maths/Matrix";
import { SubmitBase } from "../submit/SubmitBase";
import { MeshQuadTexture } from "../utils/MeshQuadTexture";
import { MeshTexture } from "../utils/MeshTexture";
import { MeshVG } from "../utils/MeshVG";
/**
 * 对象 cacheas normal的时候，本质上只是想把submit缓存起来，以后直接执行
 * 为了避免各种各样的麻烦，这里采用复制相应部分的submit的方法。执行环境还是在原来的context中
 * 否则包括clip等都非常难以处理
 */
export class WebGLCacheAsNormalCanvas {
    constructor(ctx, sp) {
        this.submitStartPos = 0; // 对应的context的submit的开始的地方
        this.submitEndPos = 0;
        this.context = null;
        this.touches = []; //记录的文字信息。cacheas normal的话，文字要能正确touch
        this.submits = []; // 从context中剪切的submit
        this.sprite = null; // 对应的sprite对象
        this.meshlist = []; //本context用到的mesh
        // cache的时候对应的clip
        this.cachedClipInfo = new Matrix(); // 用来判断是否需要把cache无效
        //private var oldMatrix:Matrix = null;				//本地画的时候完全不应用矩阵，所以需要先保存老的，以便恢复		这样会丢失缩放信息，导致文字模糊，所以不用这种方式了
        this.oldTx = 0;
        this.oldTy = 0;
        // 创建这个canvas的时候对应的矩阵的逆矩阵。因为要保留矩阵的缩放信息。所以采用逆矩阵的方法。
        this.invMat = new Matrix();
        this.context = ctx;
        this.sprite = sp;
        ctx._globalClipMatrix.copyTo(this.cachedClipInfo);
    }
    startRec() {
        // 如果有文字优化，这里要先提交一下
        if (this.context._charSubmitCache._enbale) {
            this.context._charSubmitCache.enable(false, this.context);
            this.context._charSubmitCache.enable(true, this.context);
        }
        this.context._incache = true;
        this.touches.length = 0;
        //记录需要touch的文字资源
        (this.context).touches = this.touches;
        this.context._globalClipMatrix.copyTo(this.cachedClipInfo);
        this.submits.length = 0;
        this.submitStartPos = this.context._submits._length;
        // 先把之前的释放掉
        for (var i = 0, sz = this.meshlist.length; i < sz; i++) {
            var curm = this.meshlist[i];
            curm.canReuse ? (curm.releaseMesh()) : (curm.destroy());
        }
        this.meshlist.length = 0;
        this._mesh = MeshQuadTexture.getAMesh(false);
        this._pathMesh = MeshVG.getAMesh(false);
        this._triangleMesh = MeshTexture.getAMesh(false);
        this.meshlist.push(this._mesh);
        this.meshlist.push(this._pathMesh);
        this.meshlist.push(this._triangleMesh);
        // 打断合并
        this.context._curSubmit = SubmitBase.RENDERBASE;
        // 接管context中的一些值
        this._oldMesh = this.context._mesh;
        this._oldPathMesh = this.context._pathMesh;
        this._oldTriMesh = this.context._triangleMesh;
        this._oldMeshList = this.context.meshlist;
        this.context._mesh = this._mesh;
        this.context._pathMesh = this._pathMesh;
        this.context._triangleMesh = this._triangleMesh;
        this.context.meshlist = this.meshlist;
        // 要取消位置，因为以后会再传入位置。这里好乱
        this.oldTx = this.context._curMat.tx;
        this.oldTy = this.context._curMat.ty;
        this.context._curMat.tx = 0;
        this.context._curMat.ty = 0;
        // 取消缩放等
        this.context._curMat.copyTo(this.invMat);
        this.invMat.invert();
        //oldMatrix = context._curMat;
        //context._curMat = matI;
    }
    endRec() {
        // 如果有文字优化，这里要先提交一下
        if (this.context._charSubmitCache._enbale) {
            this.context._charSubmitCache.enable(false, this.context);
            this.context._charSubmitCache.enable(true, this.context);
        }
        // copy submit
        var parsubmits = this.context._submits;
        this.submitEndPos = parsubmits._length;
        var num = this.submitEndPos - this.submitStartPos;
        for (var i = 0; i < num; i++) {
            this.submits.push(parsubmits[this.submitStartPos + i]);
        }
        parsubmits._length -= num;
        // 恢复原始context的值
        this.context._mesh = this._oldMesh;
        this.context._pathMesh = this._oldPathMesh;
        this.context._triangleMesh = this._oldTriMesh;
        this.context.meshlist = this._oldMeshList;
        // 打断合并
        this.context._curSubmit = SubmitBase.RENDERBASE;
        // 恢复matrix
        //context._curMat = oldMatrix;
        this.context._curMat.tx = this.oldTx;
        this.context._curMat.ty = this.oldTy;
        (this.context).touches = null;
        this.context._incache = false;
    }
    /**
     * 当前缓存是否还有效。例如clip变了就失效了，因为clip太难自动处理
     * @return
     */
    isCacheValid() {
        var curclip = this.context._globalClipMatrix;
        if (curclip.a != this.cachedClipInfo.a || curclip.b != this.cachedClipInfo.b || curclip.c != this.cachedClipInfo.c
            || curclip.d != this.cachedClipInfo.d || curclip.tx != this.cachedClipInfo.tx || curclip.ty != this.cachedClipInfo.ty)
            return false;
        return true;
    }
    flushsubmit() {
        var curSubmit = SubmitBase.RENDERBASE;
        this.submits.forEach(function (subm) {
            if (subm == SubmitBase.RENDERBASE)
                return;
            SubmitBase.preRender = curSubmit;
            curSubmit = subm;
            subm.renderSubmit();
        });
    }
    releaseMem() {
    }
}
WebGLCacheAsNormalCanvas.matI = new Matrix();
