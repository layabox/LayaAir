import { ISaveData } from "././ISaveData";
import { SaveBase } from "././SaveBase";
import { Matrix } from "../../../maths/Matrix"
	import { Context } from "../../../resource/Context"
	
	export class SaveTransform implements ISaveData {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		
		private static POOL:any =/*[STATIC SAFE]*/ SaveBase._createArray();
		
		 _savematrix:Matrix;
		 _matrix:Matrix = new Matrix();
		
		constructor(){
		}
		
		 isSaveMark():boolean { return false; }
		
		 restore(context:Context):void {
			context._curMat = this._savematrix;
			SaveTransform.POOL[SaveTransform.POOL._length++] = this;
		}
		
		 static save(context:Context):void {
			var _saveMark:any = context._saveMark;
			if ((_saveMark._saveuse & SaveBase.TYPE_TRANSFORM) === SaveBase.TYPE_TRANSFORM) return;
			_saveMark._saveuse |= SaveBase.TYPE_TRANSFORM;
			var no:any = SaveTransform.POOL;
			var o:SaveTransform = no._length > 0 ? no[--no._length] : (new SaveTransform());
			o._savematrix = context._curMat;
			context._curMat = context._curMat.copyTo(o._matrix);
			var _save:any[] = context._save;
			_save[_save._length++] = o;
		}	
	}

