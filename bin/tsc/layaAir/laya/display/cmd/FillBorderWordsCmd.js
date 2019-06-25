import { Pool } from "../../utils/Pool";
/**
 * 绘制边框
 * @private
 */
export class FillBorderWordsCmd {
    /**@private */
    static create(words, x, y, font, fillColor, borderColor, lineWidth) {
        var cmd = Pool.getItemByClass("FillBorderWordsCmd", FillBorderWordsCmd);
        cmd.words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.fillColor = fillColor;
        cmd.borderColor = borderColor;
        cmd.lineWidth = lineWidth;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.words = null;
        Pool.recover("FillBorderWordsCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.fillBorderWords(this.words, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth);
    }
    /**@private */
    get cmdID() {
        return FillBorderWordsCmd.ID;
    }
}
FillBorderWordsCmd.ID = "FillBorderWords";
