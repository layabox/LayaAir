import { Pool } from "../../utils/Pool";
/**
 * 绘制描边文字
 */
export class StrokeTextCmd {
    /**@private */
    static create(text, x, y, font, color, lineWidth, textAlign) {
        var cmd = Pool.getItemByClass("StrokeTextCmd", StrokeTextCmd);
        cmd.text = text;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        cmd.lineWidth = lineWidth;
        cmd.textAlign = textAlign;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        Pool.recover("StrokeTextCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.strokeWord(this.text, this.x + gx, this.y + gy, this.font, this.color, this.lineWidth, this.textAlign);
    }
    /**@private */
    get cmdID() {
        return StrokeTextCmd.ID;
    }
}
StrokeTextCmd.ID = "StrokeText";
