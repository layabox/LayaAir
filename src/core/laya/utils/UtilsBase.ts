	/**
	 * <code>Utils</code> 是工具类。
     * 把Utils分开，避免循环调用
	 */
	export class UtilsBase {
		/**@private */
		private static _gid:number = 1;
		/**@private */
		private static _pi:number = /*[STATIC SAFE]*/ 180 / Math.PI;
		/**@private */
		private static _pi2:number = /*[STATIC SAFE]*/ Math.PI / 180;
		/**@private */
		protected static _extReg:RegExp =/*[STATIC SAFE]*/ /\.(\w+)\??/g;
		
		/**
		 * 角度转弧度。
		 * @param	angle 角度值。
		 * @return	返回弧度值。
		 */
		 static toRadian(angle:number):number {
			return angle * UtilsBase._pi2;
		}
		
		/**
		 * 弧度转换为角度。
		 * @param	radian 弧度值。
		 * @return	返回角度值。
		 */
		 static toAngle(radian:number):number {
			return radian * UtilsBase._pi;
		}
		
		/**
		 * 将传入的 uint 类型颜色值转换为字符串型颜色值。
		 * @param color 颜色值。
		 * @return 字符串型颜色值。
		 */
		 static toHexColor(color:number):string {
			if (color < 0 || isNaN(color)) return null;
			var str:string = color.toString(16);
			while (str.length < 6) str = "0" + str;
			return "#" + str;
		}
		
		/**获取一个全局唯一ID。*/
		 static getGID():number {
			return UtilsBase._gid++;
		}
		
		/**
		 * 将字符串解析成 XML 对象。
		 * @param value 需要解析的字符串。
		 * @return js原生的XML对象。
		 */
		 static parseXMLFromString:Function = function(value:string):XMLDocument {
			var rst:any;
			value = value.replace(/>\s+</g, '><');
			rst=(new DOMParser()).parseFromString(value,'text/xml');
			if (rst.firstChild.textContent.indexOf("This page contains the following errors") > -1) {
				throw new Error(rst.firstChild.firstChild.textContent);
			}
			return rst;
		}
		
		/**
		 * @private
		 * <p>连接数组。和array的concat相比，此方法不创建新对象</p>
		 * <b>注意：</b>若 参数 a 不为空，则会改变参数 source 的值为连接后的数组。
		 * @param	source 待连接的数组目标对象。
		 * @param	array 待连接的数组对象。
		 * @return 连接后的数组。
		 */
		 static concatArray(source:any[], array:any[]):any[] {
			if (!array) return source;
			if (!source) return array;
			var i:number, len:number = array.length;
			for (i = 0; i < len; i++) {
				source.push(array[i]);
			}
			return source;
		}
		
		/**
		 * @private
		 * 清空数组对象。
		 * @param	array 数组。
		 * @return	清空后的 array 对象。
		 */
		 static clearArray(array:any[]):any[] {
			if (!array) return array;
			array.length = 0;
			return array;
		}
		
		/**
		 * @private
		 * 清空source数组，复制array数组的值。
		 * @param	source 需要赋值的数组。
		 * @param	array 新的数组值。
		 * @return 	复制后的数据 source 。
		 */
		 static copyArray(source:any[], array:any[]):any[] {
			source || (source = []);
			if (!array) return source;
			source.length = array.length;
			var i:number, len:number = array.length;
			for (i = 0; i < len; i++) {
				source[i] = array[i];
			}
			return source;
		}
		
		/**
		 * 给传入的函数绑定作用域，返回绑定后的函数。
		 * @param	fun 函数对象。
		 * @param	scope 函数作用域。
		 * @return 绑定后的函数。
		 */
		 static bind(fun:Function, scope:any):Function {
			var rst:Function = fun;
			rst=fun.bind(scope);;
			return rst;
		}
		
		/**
		 * @private
		 * 批量移动点坐标。
		 * @param points 坐标列表。
		 * @param x x轴偏移量。
		 * @param y y轴偏移量。
		 */
		 static transPointList(points:any[], x:number, y:number):void {
			var i:number, len:number = points.length;
			for (i = 0; i < len; i += 2) {
				points[i] += x;
				points[i + 1] += y;
			}
		}
		
		/**
		 * 解析一个字符串，并返回一个整数。和JS原生的parseInt不同：如果str为空或者非数字，原生返回NaN，这里返回0。
		 * @param	str		要被解析的字符串。
		 * @param	radix	表示要解析的数字的基数。默认值为0，表示10进制，其他值介于 2 ~ 36 之间。如果它以 “0x” 或 “0X” 开头，将以 16 为基数。如果该参数不在上述范围内，则此方法返回 0。
		 * @return	返回解析后的数字。
		 */
		 static parseInt(str:string, radix:number = 0):number {
			var result:any = parseInt(str, radix);
			if (isNaN(result)) return 0;
			return result;
		}
		
		/**@private */
		 static getFileExtension(path:string):string {
			UtilsBase._extReg.lastIndex = path.lastIndexOf(".");
			var result:any[] = UtilsBase._extReg.exec(path);
			if (result && result.length > 1) {
				return result[1].toLowerCase();
			}
			return null;
		}
		
		/**
		 * 获得URL参数值
		 * @param	name 参数名称
		 * @return	参数值
		 */
		 static getQueryString(name:string):string {
			//if (Browser.onMiniGame) return null;
			if(!window.location || !window.location.search)
				return null;
			var reg:RegExp = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
			var r:any = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]);
			return null;
		}
	}

