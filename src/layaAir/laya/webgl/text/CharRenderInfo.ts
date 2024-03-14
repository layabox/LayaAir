import { RenderInfo } from "../../renders/RenderInfo"
import { IAutoExpiringResource } from "../../renders/ResNeedTouch";
import { TextTexture } from "./TextTexture";
/**
 * TODO如果占用内存较大,这个结构有很多成员可以临时计算
 */
export class CharRenderInfo implements IAutoExpiringResource{
    isRandomTouch=true;
    char = '';	    			// 调试用
    texture: TextTexture;
    deleted = false; 	        // 已经被删除了
    uv: number[] = new Array(8);
    pos = 0;					//数组下标
    width: number;				//字体宽度。测量的宽度，用来排版。没有缩放
    height: number; 			//字体高度。没有缩放
    bmpWidth: number;			//实际图片的宽度。可能与排版用的width不一致。包含缩放和margin
    bmpHeight: number;
    orix = 0;				    // 原点位置，通常都是所在区域的左上角
    oriy = 0;
    touchTick = 0;	
    isSpace = false;		    //是否是空格，如果是空格，则只有width有效
    touch(): void {
        var curLoop = RenderInfo.loopCount;
        if (this.touchTick != curLoop) {// 这个保证每帧只调用一次
            this.texture.touchRect(this, curLoop);
            this.touchTick = curLoop;
        }
    }
}

