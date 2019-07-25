import { Laya } from "../../Laya";
import { Sprite } from "../display/Sprite";
import { Utils } from "../utils/Utils";

/**
 * ...
 * @author ww
 */
export class FilterSetterBase {
	_filter: any;
	constructor() {

	}

	paramChanged(): void {
		Laya.systemTimer.callLater(this, this.buildFilter);
	}

	protected buildFilter(): void {
		if (this._target) {
			this.addFilter(this._target);
		}
	}

	protected addFilter(sprite: Sprite): void {
		if (!sprite) return;

		if (!sprite.filters) {
			sprite.filters = [this._filter];
		} else {

			var preFilters: any[];
			preFilters = sprite.filters;
			if (preFilters.indexOf(this._filter) < 0) {

				preFilters.push(this._filter);
				sprite.filters = Utils.copyArray([], preFilters);
			}
		}
	}

	protected removeFilter(sprite: Sprite): void {
		if (!sprite) return;
		sprite.filters = null;
	}

	private _target: any;
	set target(value: any) {
		if (this._target != value) {
			//removeFilter(_target as Sprite);
			//addFilter(value as Sprite);
			this._target = value;
			this.paramChanged();
		}
	}

}


