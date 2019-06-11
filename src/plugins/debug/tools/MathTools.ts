/**
	 * ...
	 * @author ww
	 */
	export class MathTools 
	{
		
		constructor(){
			
		}
		/**
		 * 一个用来确定数组元素排序顺序的比较函数。
		 * @param	a 待比较数字。
		 * @param	b 待比较数字。
		 * @return 如果a等于b 则值为0；如果b>a则值为1；如果b<则值为-1。
		 */
		 static sortBigFirst(a:number, b:number):number {
			if (a == b)
				return 0;
			return b > a ? 1 : -1;
		}
		
		/**
		 * 一个用来确定数组元素排序顺序的比较函数。
		 * @param	a 待比较数字。
		 * @param	b 待比较数字。
		 * @return 如果a等于b 则值为0；如果b>a则值为-1；如果b<则值为1。 
		 */
		 static sortSmallFirst(a:number, b:number):number {
			if (a == b)
				return 0;
			return b > a ? -1 : 1;
		}
		
		/**
		 * 将指定的元素转为数字进行比较。
		 * @param	a 待比较元素。
		 * @param	b 待比较元素。
		 * @return b、a转化成数字的差值 (b-a)。
		 */
		 static sortNumBigFirst(a:any, b:any):number {
			return parseFloat(b) - parseFloat(a);
		}
		/**
		 * 将指定的元素转为数字进行比较。
		 * @param	a 待比较元素。
		 * @param	b 待比较元素。
		 * @return a、b转化成数字的差值 (a-b)。
		 */
		 static sortNumSmallFirst(a:any, b:any):number {
			return parseFloat(a) - parseFloat(b);
		}
		/**
		 * 返回根据对象指定的属性进行排序的比较函数。
		 * @param	key 排序要依据的元素属性名。
		 * @param	bigFirst 如果值为true，则按照由大到小的顺序进行排序，否则按照由小到大的顺序进行排序。
		 * @param	forceNum 如果值为true，则将排序的元素转为数字进行比较。
		 * @return 排序函数。
		 */
		 static sortByKey(key:string, bigFirst:boolean = false, forceNum:boolean = true):Function {
			var _sortFun:Function;
			if (bigFirst) {
				_sortFun = forceNum ? MathTools.sortNumBigFirst : MathTools.sortBigFirst;
			} else {
				_sortFun = forceNum ? MathTools.sortNumSmallFirst : MathTools.sortSmallFirst;
			}
			return function(a:any, b:any):number {
				return _sortFun(a[key], b[key]);
			};
		
		}
	}


