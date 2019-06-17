/**
     * @author laya
     */
export class IStatRender {
    /**
     * 显示性能统计信息。
     * @param	x X轴显示位置。
     * @param	y Y轴显示位置。
     */
    show(x = 0, y = 0) {
    }
    /**激活性能统计*/
    enable() {
    }
    /**
     * 隐藏性能统计信息。
     */
    hide() {
    }
    /**
     * 点击性能统计显示区域的处理函数。
     */
    set_onclick(fn) {
    }
    isCanvasRender() {
        return true;
    }
    // 非canvas模式的渲染
    renderNotCanvas(ctx, x, y) { }
}
