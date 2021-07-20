import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTempletBase } from "./SpineTempletBase";
import { SpineTemplet_3_x } from "./SpineTemplet_3_x";
import { SpineTemplet_4_0 } from "./SpineTemplet_4_0";

/**数据解析完成后的调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event.COMPLETE", desc = "数据解析完成后的调度")]*/
/**数据解析错误后的调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event.ERROR", desc = "数据解析错误后的调度")]*/

export class SpineTemplet extends SpineTempletBase {
    /**
     * Spine动画模板类
     * @param ver spine资源版本号
     */
    constructor(ver: SpineVersion) {
		super();
        let templet;
        if (ver === SpineVersion.v3_7 || ver === SpineVersion.v3_8) {
            templet = new SpineTemplet_3_x();
        } else if (ver === SpineVersion.v4_0) {
			templet = new SpineTemplet_4_0();
		} else {
            throw new Error("传入参数错误，请与服务提供商联系");
        }
        return templet;
	}

    loadAni(jsonOrSkelUrl: string) {
    }

    /**
	 * 创建动画
	 * @return
	 */
	buildArmature(): SpineSkeleton {
		return null;
	}

	/**
	 * 通过索引得动画名称
	 * @param	index
	 * @return
	 */
	getAniNameByIndex(index: number): string {
		return null;
	}

	/**
	 * 通过皮肤名字得到皮肤索引
	 * @param	skinName 皮肤名称
	 * @return
	 */
	getSkinIndexByName(skinName: string): number {
		return null;
	}

	/**
	 * 释放纹理
	 * @override
	 */
	destroy(): void {
	}
}

export enum SpineVersion {
    "v3_7" = "v3_7",
    "v3_8" = "v3_8",
    "v4_0" = "v4_0",
}

export enum SpineFormat {
    "json" = "json",
    "binary" = "binary",
}
