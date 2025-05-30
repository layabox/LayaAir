import { ButtonDownEffect, ButtonMode, ButtonStatus, SelectionMode } from "./Const";
import { ControllerRef } from "./ControllerRef";
import { Controller } from "./Controller";
import { GLabel } from "./GLabel";
import type { GPanel } from "./GPanel";
import { Event } from "../events/Event";
import { SoundManager } from "../media/SoundManager";
import { Laya } from "../../Laya";
import { GImage } from "./GImage";
import { Color } from "../maths/Color";

export const ButtonPageAlternatives: Record<number, ButtonStatus> = {
    [ButtonStatus.Over]: ButtonStatus.Up,
    [ButtonStatus.SelectedOver]: ButtonStatus.Down,
    [ButtonStatus.Disabled]: ButtonStatus.Up,
    [ButtonStatus.SelectedDisabled]: ButtonStatus.Down,
};

const SaveColorSymbol = Symbol();
var tmpColor: Color;
const downEffectValueC = 0.8;
const downEffectValueS = 0.9;

/**
 * @blueprintInheritable
 */
export class GButton extends GLabel {
    private _mode: ButtonMode;
    private _selected: boolean = false;

    private _titleStr: string = "";
    private _iconStr: string = "";
    private _selectedTitleStr: string = "";
    private _selectedIconStr: string = "";
    private _sound: string;
    private _soundVolumeScale: number = 0;
    private _buttonController: Controller;
    private _selectedController: ControllerRef;
    private _selectedPage: number = 0;
    private _changeStateOnClick: boolean;
    private _downEffect: ButtonDownEffect = 0;
    private _scaleEffect: boolean = false;
    private _down: boolean;
    private _over: boolean;

    constructor() {
        super();

        this._mode = ButtonMode.Common;
        this._soundVolumeScale = 1;
        this._changeStateOnClick = true;

        this.on(Event.ROLL_OVER, this, this._rollover);
        this.on(Event.ROLL_OUT, this, this._rollout);
        this.on(Event.MOUSE_DOWN, this, this._btnTouchBegin);
        this.on(Event.MOUSE_UP, this, this._btnTouchEnd);
        this.on(Event.CLICK, this, this._click);
        this.on(Event.RIGHT_CLICK, this, this._rightClick);
        this.on(Event.UNDISPLAY, this, this._removeFromStage);
    }

    public destroy(): void {
        if (this._selectedController)
            this._selectedController.release();

        super.destroy();
    }

    public get title(): string {
        return this._titleStr;
    }

    public set title(value: string) {
        if (value == null)
            value = "";
        this._titleStr = value;
        super.title = (this._selected && this._selectedTitleStr) ? this._selectedTitleStr : value;
    }

    public get selectedTitle(): string {
        return this._selectedTitleStr;
    }

    public set selectedTitle(value: string) {
        if (value == null)
            value = "";
        this._selectedTitleStr = value;
        super.title = (this._selected && this._selectedTitleStr) ? value : this._titleStr;
    }

    public get icon(): string {
        return this._iconStr;
    }

    public set icon(value: string) {
        if (value == null)
            value = "";
        this._iconStr = value;
        super.icon = (this._selected && this._selectedIconStr) ? this._selectedIconStr : value;
    }

    public get selectedIcon(): string {
        return this._selectedIconStr;
    }

    public set selectedIcon(value: string) {
        if (value == null)
            value = "";
        this._selectedIconStr = value;
        super.icon = (this._selected && this._selectedIconStr) ? value : this._iconStr;
    }

    public get downEffect(): ButtonDownEffect {
        return this._downEffect;
    }
    public set downEffect(value: ButtonDownEffect) {
        this._downEffect = value;
    }

    public get sound(): string {
        return this._sound;
    }

    public set sound(val: string) {
        this._sound = val;
    }

    public get soundVolumeScale(): number {
        return this._soundVolumeScale;
    }

    public set soundVolumeScale(value: number) {
        this._soundVolumeScale = value;
    }

    public get selected(): boolean {
        return this._selected;
    }

    public set selected(value: boolean) {
        if (this._mode == ButtonMode.Common)
            return;

        if (this._selected != value) {
            this._selected = value;

            this.setCurrentState();
            if (this._selectedTitleStr && this._titleWidget)
                this._titleWidget.p.text = this._selected ? this._selectedTitleStr : this._titleStr;

            if (this._selectedIconStr && this._iconWidget)
                this._iconWidget.p.icon = this._selected ? this._selectedIconStr : this._iconStr;

            if (this._selectedController) {
                if (this._selected) {
                    this._selectedController.selectedIndex = this._selectedPage;
                }
                else if (this._mode == ButtonMode.Check && this._selectedController.selectedIndex == this._selectedPage)
                    this._selectedController.oppositeIndex = this._selectedPage;
            }
        }
    }

    public get mode(): ButtonMode {
        return this._mode;
    }

    public set mode(value: ButtonMode) {
        if (this._mode != value) {
            if (value == ButtonMode.Common)
                this.selected = false;
            this._mode = value;
        }
    }

    public get selectedController(): ControllerRef {
        return this._selectedController;
    }

    public set selectedController(value: ControllerRef) {
        if (this._selectedController)
            this._selectedController.release();
        this._selectedController = value;
        if (value) {
            value.validate();
            value.onChanged = this.selectChanged.bind(this);
            this.selectChanged();
        }
    }

    public get selectedPage(): number {
        return this._selectedPage;
    }

    public set selectedPage(value: number) {
        this._selectedPage = value;
        if (this._selectedController)
            this.selected = this._selectedPage == this._selectedController.selectedIndex;
    }

    public get changeStateOnClick(): boolean {
        return this._changeStateOnClick;
    }

    public set changeStateOnClick(value: boolean) {
        this._changeStateOnClick = value;
    }

    public get mouseEnabled() {
        return super.mouseEnabled;
    }

    public set mouseEnabled(value: boolean) {
        super.mouseEnabled = value;
        if (!this.mouseEnabled) {
            this._over = false;
            this.setCurrentState();
        }
    }

    public fireClick(downEffect?: boolean, clickCall?: boolean): void {
        if (this._mode !== ButtonMode.Common)
            return;

        downEffect = downEffect || false;
        if (downEffect) {
            this.setState(ButtonStatus.Over);
            Laya.timer.once(100, this, this.setState, [ButtonStatus.Down]);
            Laya.timer.once(200, null, () => {
                this.setState(ButtonStatus.Up);
                if (clickCall)
                    this.event(Event.CLICK);
            });
        }
    }

    protected setState(page: ButtonStatus): void {
        if (this._buttonController) {
            if (page >= this._buttonController.numPages) {
                page = ButtonPageAlternatives[page];
                if (page == null)
                    return;
            }
            this._buttonController.selectedIndex = page;
        }

        if (this._downEffect == ButtonDownEffect.Dark) {
            let isDown = page == ButtonStatus.Down || page == ButtonStatus.SelectedOver || page == ButtonStatus.SelectedDisabled;

            if (!tmpColor) tmpColor = new Color();
            for (let child of this.children) {
                if (child instanceof GImage) {
                    if (isDown) {
                        (<any>child)[SaveColorSymbol] = child.color;
                        tmpColor.parse(child.color);
                        tmpColor.r *= downEffectValueC;
                        tmpColor.g *= downEffectValueC;
                        tmpColor.b *= downEffectValueC;
                        child.color = tmpColor.toString();
                    }
                    else if ((<any>child)[SaveColorSymbol])
                        child.color = (<any>child)[SaveColorSymbol];
                }
            }
        }
        else if (this._downEffect == ButtonDownEffect.UpScale || this._downEffect == ButtonDownEffect.DownScale) {
            let rate = this._downEffect == ButtonDownEffect.DownScale ? downEffectValueS : 1 / downEffectValueS;
            if (page == ButtonStatus.Down || page == ButtonStatus.SelectedOver || page == ButtonStatus.SelectedDisabled) {
                if (!this._scaleEffect) {
                    this.scale(this.scaleX * rate, this.scaleY * rate);
                    this._scaleEffect = true;
                }
            }
            else {
                if (this._scaleEffect) {
                    this.scale(this.scaleX / rate, this.scaleY / rate);
                    this._scaleEffect = false;
                }
            }
        }
    }

    protected setCurrentState() {
        if (this._selected)
            this.setState(this.grayed ? ButtonStatus.SelectedDisabled : (this._over ? ButtonStatus.SelectedOver : ButtonStatus.Down));
        else
            this.setState(this.grayed ? ButtonStatus.Disabled : (this._over ? ButtonStatus.Over : ButtonStatus.Up));
    }

    protected _controllersChanged(): void {
        super._controllersChanged();

        let c = this.getController("button");
        if (this._buttonController != c) {
            this._buttonController = c;
            this.setCurrentState();
        }
    }

    protected _onPartChanged(which: string) {
        if (which == "title") {
            if (this._titleStr)
                this.title = this._titleStr;
        }
        else if (which == "icon") {
            if (this._iconStr)
                this.icon = this._iconStr;
        }
    }

    private selectChanged() {
        this.selected = this._selectedPage == this._selectedController.selectedIndex;
    }

    private _rollover(): void {
        this._over = true;
        if (this._down)
            return;

        if (this.grayed)
            return;

        this.setState(this._selected ? ButtonStatus.SelectedOver : ButtonStatus.Over);
    }

    private _rollout(): void {
        this._over = false;
        if (this._down)
            return;

        if (this.grayed)
            return;

        this.setState(this._selected ? ButtonStatus.Down : ButtonStatus.Up);
    }

    private _btnTouchBegin(evt: Event): void {
        if (evt.button != 0)
            return;

        this._down = true;

        if (this._mode == ButtonMode.Common) {
            this.setState(this.grayed ? ButtonStatus.SelectedDisabled : ButtonStatus.Down);
        }
    }

    private _btnTouchEnd(): void {
        if (this._down) {
            this._down = false;

            if (this._mode == ButtonMode.Common) {
                this.setState(this.grayed ? ButtonStatus.Disabled : (this._over ? ButtonStatus.Over : ButtonStatus.Up));
            }
            else {
                if (!this._over
                    && this._buttonController
                    && (this._buttonController.selectedIndex == ButtonStatus.Over || this._buttonController.selectedIndex == ButtonStatus.SelectedOver)) {
                    this.setCurrentState();
                }
            }
        }
    }

    private _removeFromStage() {
        if (this._over)
            this._rollout();
    }

    private _click(evt: Event): void {
        if (this._sound)
            SoundManager.playSound(this._sound).volume = this._soundVolumeScale;

        let ss = (<GPanel>this.parent)?.selection;
        if (ss && ss.mode != SelectionMode.None) {
            ss.handleClick(this, evt);

            if (this._mode != ButtonMode.Common)
                return;
        }

        if (this._mode == ButtonMode.Check) {
            if (this._changeStateOnClick) {
                this.selected = !this._selected;
                this.event(Event.CHANGE);
            }
        }
        else if (this._mode == ButtonMode.Radio) {
            if (this._changeStateOnClick && !this._selected) {
                this.selected = true;
                this.event(Event.CHANGE);
            }
        }
        else {
            if (this._selectedController)
                this._selectedController.selectedIndex = this._selectedPage;
        }
    }

    private _rightClick(evt: Event) {
        let ss = (<GPanel>this.parent).selection;
        if (ss && ss.mode != SelectionMode.None) {
            ss.handleClick(this, evt);
        }
    }

    /** @internal @blueprintEvent */
    GButton_bpEvent: {
        [Event.CHANGE]: () => void;
    };
}