/**
	 * @private
	 * 静态常量集合
	 */
export class Const {
    static NOT_ACTIVE: number = 0x01;
    static ACTIVE_INHIERARCHY: number = 0x02;
    static AWAKED: number = 0x04;
    static NOT_READY: number = 0x08;
    static DISPLAY: number = 0x10;
    static HAS_ZORDER: number = 0x20;
    static HAS_MOUSE: number = 0x40;
    static DISPLAYED_INSTAGE: number = 0x80;
    static DRAWCALL_OPTIMIZE: number = 0x100;
}

