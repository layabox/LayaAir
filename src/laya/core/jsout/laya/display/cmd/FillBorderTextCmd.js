import { Pool } from "../../utils/Pool";
/**
 * 绘制文本边框
 */
export class FillBorderTextCmd {
    /**@private */
    static create(text, x, y, font, fillColor, borderColor, lineWidth, textAlign) {
        var cmd = Pool.getItemByClass("FillBorderTextCmd", FillBorderTextCmd);
        cmd.text = text;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.fillColor = fillColor;
        cmd.borderColor = borderColor;
        cmd.lineWidth = lineWidth;
        cmd.textAlign = textAlign;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("FillBorderTextCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.fillBorderText(this.text, this.x + gx, this.y + gy, this.font, this.fillColor, this.borderColor, this.lineWidth, this.textAlign);
    }
    /**@private */
    get cmdID() {
        return FillBorderTextCmd.ID;
    }
}
FillBorderTextCmd.ID = "FillBorderText";
