/** 
 * @en Global UI configuration settings.
 * @zh 全局配置 
 */
export class UIConfig {
    /** 
     * @en Enable touch scrolling (for scroll bars).
     * @zh 是否开启触摸滚动（针对滚动条） 
     */
    static touchScrollEnable: boolean = true;

    /** 
     * @en Enable mouse wheel scrolling (for scroll bars).
     * @zh 是否开启滑轮滚动（针对滚动条） 
     */
    static mouseWheelEnable: boolean = true;

    /** 
     * @en Show scroll bar buttons.
     * @zh 是否显示滚动条按钮 
     */
    static showButtons: boolean = true;

    /** 
     * @en Background color for pop-up dialogs.
     * @zh 弹出框背景颜色 
     */
    static popupBgColor: string = "#000000";

    /** 
     * @en Background transparency for pop-up dialogs.
     * @zh 弹出框背景透明度 
     */
    static popupBgAlpha: number = 0.5;

    /** 
     * @en Whether clicking on the edge of a modal window will close it. The default is to close the window.
     * @zh 模式窗口点击边缘，是否关闭窗口，默认是关闭的 
     */
    static closeDialogOnSide: boolean = true;
}


