import { ISaveData } from "././ISaveData";
import { SaveBase } from "././SaveBase";
import { Matrix } from "../../../maths/Matrix"
	import { Context } from "../../../resource/Context"
	
	export class SaveTranslate implements ISaveData {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		
		private static POOL:any =/*[STATIC SAFE]*/ SaveBase._createArray();
		 _mat:Matrix=new Matrix();
		 isSaveMark():boolean { return false; }
		
		 restore(context:Context):void {
			this._mat.copyTo(context._curMat);
			SaveTranslate.POOL[SaveTranslate.POOL._length++] = this;
		}
		
		 static save(context:Context):void {
			var no:any = SaveTranslate.POOL;
			var o:SaveTranslate = no._length > 0 ? no[--no._length] : (new SaveTranslate());
			context._curMat.copyTo(o._mat);
			var _save:any[] = context._save;
			_save[_save._length++] = o;
		}
	
	}


