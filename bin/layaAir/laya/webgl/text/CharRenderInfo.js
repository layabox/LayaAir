import { RenderInfo } from "../../renders/RenderInfo";
/**
 * TODO如果占用内存较大,这个结构有很多成员可以临时计算
 */
export class CharRenderInfo {
    constructor() {
        this.char = ''; // 调试用
        this.deleted = false; // 已经被删除了
        this.uv = new Array(8); // [0, 0, 1, 1];		//uv
        this.pos = 0; //数组下标
        this.orix = 0; // 原点位置，通常都是所在区域的左上角
        this.oriy = 0;
        this.touchTick = 0; //
        this.isSpace = false; //是否是空格，如果是空格，则只有width有效
    }
    touch() {
        var curLoop = RenderInfo.loopCount;
        if (this.touchTick != curLoop) { // 这个保证每帧只调用一次
            this.tex.touchRect(this, curLoop);
        }
        this.touchTick = curLoop;
    }
}
