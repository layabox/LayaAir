import { Sprite } from "../display/Sprite";
import { UIComponent } from "./UIComponent";
/**鼠标提示管理类*/
export declare class TipManager extends UIComponent {
    static offsetX: number;
    static offsetY: number;
    static tipTextColor: string;
    static tipBackColor: string;
    static tipDelay: number;
    private _tipBox;
    private _tipText;
    private _defaultTipHandler;
    constructor();
    /**
     * @private
     */
    private _onStageHideTip;
    /**
     * @private
     */
    private _onStageShowTip;
    /**
     * @private
     */
    private _showTip;
    /**
     * @private
     */
    private _onStageMouseDown;
    /**
     * @private
     */
    private _onStageMouseMove;
    /**
     * @private
     */
    private _showToStage;
    /**关闭所有鼠标提示*/
    closeAll(): void;
    /**
     * 显示显示对象类型的tip
     */
    showDislayTip(tip: Sprite): void;
    /**
     * @private
     */
    private _showDefaultTip;
    /**默认鼠标提示函数*/
    defaultTipHandler: Function;
}
