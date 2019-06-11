import { Pool } from "../../utils/Pool";
/**
 * 填充文字命令
 * @private
 */
export class FillWordsCmd {
    /**@private */
    static create(words, x, y, font, color) {
        var cmd = Pool.getItemByClass("FillWordsCmd", FillWordsCmd);
        cmd.words = words;
        cmd.x = x;
        cmd.y = y;
        cmd.font = font;
        cmd.color = color;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.words = null;
        Pool.recover("FillWordsCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.fillWords(this.words, this.x + gx, this.y + gy, this.font, this.color);
    }
    /**@private */
    get cmdID() {
        return FillWordsCmd.ID;
    }
}
FillWordsCmd.ID = "FillWords";
