import { ISubmit } from "././ISubmit";
import { SubmitKey } from "././SubmitKey";
import { Context } from "../../resource/Context"
	import { Texture } from "../../resource/Texture"
	import { Stat } from "../../utils/Stat"
	import { WebGL } from "../WebGL"
	import { WebGLContext } from "../WebGLContext"
	import { BlendMode } from "../canvas/BlendMode"
	import { Value2D } from "../shader/d2/value/Value2D"
	import { CONST3D2D } from "../utils/CONST3D2D"
	import { Mesh2D } from "../utils/Mesh2D"
	
	export class Submit implements ISubmit {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		 static TYPE_2D:number = 10000;
		 static TYPE_CANVAS:number = 10003;
		 static TYPE_CMDSETRT:number = 10004;
		 static TYPE_CUSTOM:number = 10005;
		 static TYPE_BLURRT:number = 10006;
		 static TYPE_CMDDESTORYPRERT:number = 10007;
		 static TYPE_DISABLESTENCIL:number = 10008;
		 static TYPE_OTHERIBVB:number = 10009;
		 static TYPE_PRIMITIVE:number = 10010;
		 static TYPE_RT:number = 10011;
		 static TYPE_BLUR_RT:number = 10012;
		 static TYPE_TARGET:number = 10013;
		 static TYPE_CHANGE_VALUE:number = 10014;
		 static TYPE_SHAPE:number = 10015;
		 static TYPE_TEXTURE:number = 10016;
		 static TYPE_FILLTEXTURE:number = 10017;
		
		 static KEY_ONCE:number = -1;
		 static KEY_FILLRECT:number = 1;
		 static KEY_DRAWTEXTURE:number = 2;
		 static KEY_VG:number = 3;
		 static KEY_TRIANGLES:number = 4;
		
		 static RENDERBASE:Submit;
		 static ID:number = 1;
		 static preRender:ISubmit=null;	//上一个submit，主要用来比较key,以减少uniform的重复提交。

		protected static _poolSize:number = 0;
		protected static POOL:any[] =[];
		
		 clipInfoID:number = -1;	//用来比较clipinfo
		
		 _mesh:Mesh2D=null;			//代替 _vb,_ib
		 _blendFn:Function=null;
		protected _id:number=0;
		//protected var _isSelfVb:Boolean = false;
		
		 _renderType:number=0;
		
		 _parent:Submit=null;
		
		//渲染key，通过key判断是否是同一个
		 _key:SubmitKey=new SubmitKey();
		
		// 从VB中什么地方开始画，画到哪
		 _startIdx:number=0;		//indexbuffer 的偏移，单位是byte
		 _numEle:number=0;

		 _ref:number=1;
		
		 shaderValue:Value2D=null;
		
		 static __init__():void {
			var s:Submit = Submit.RENDERBASE = new Submit(-1);
			s.shaderValue = new Value2D(0, 0);
			s.shaderValue.ALPHA = 1;
			s._ref = 0xFFFFFFFF;
		}
		
		constructor(renderType:number = Submit.TYPE_2D){
			this._renderType = renderType;
			this._id =++Submit.ID;
		}
		
		//TODO:coverage
		 getID():number
		{
			return this._id;
		}
		
		 releaseRender():void {
			
			if (Submit.RENDERBASE == this)
				return;
				
			if( (--this._ref) <1)
			{
				Submit.POOL[Submit._poolSize++] = this;
				this.shaderValue.release();
				this.shaderValue=null;
				//_vb = null;
				//_mesh.destroy();
				this._mesh = null;
				this._parent && (this._parent.releaseRender(), this._parent = null);
			}
		}
		
		//TODO:coverage
		 getRenderType():number {
			return this._renderType;
		}
		
		 renderSubmit():number {
			if (this._numEle === 0 || !this._mesh || this._numEle == 0) return 1;//怎么会有_numEle是0的情况?
			
			var _tex:Texture = this.shaderValue.textureHost;
			if (_tex) {
				var source:any = _tex._getSource();
				if (!source)
					return 1;
				this.shaderValue.texture = source;
			}
			
			var gl:WebGLContext = WebGL.mainContext;
			this._mesh.useMesh(gl);
			//_ib._bind_upload() || _ib._bind();
			//_vb._bind_upload() || _vb._bind();
			
			this.shaderValue.upload();
			
			
			if (BlendMode.activeBlendFunction !== this._blendFn) {
				WebGLContext.setBlend(gl, true);
				this._blendFn(gl);
				BlendMode.activeBlendFunction = this._blendFn;
			}
			gl.drawElements(WebGLContext.TRIANGLES, this._numEle, WebGLContext.UNSIGNED_SHORT, this._startIdx);
			
			Stat.renderBatches++;
			Stat.trianglesFaces += this._numEle / 3;
			
			return 1;
		}
		
		/**
		 * 基于o和传入的其他参数来初始化submit对象
		 * @param	o
		 * @param	context
		 * @param	mesh
		 * @param	pos
		 */
		//TODO:coverage
		protected _cloneInit(o:Submit,context:Context, mesh:Mesh2D, pos:number):void
		{
			;
			o._ref=1;
			//o._ib = ib;
			//o._vb = vb;
			o._mesh = mesh;
			o._id = this._id;
			//o._isSelfVb = _isSelfVb;
			o._key.copyFrom(this._key);
			o._parent = this;
			o._blendFn = this._blendFn;
			o._renderType = this._renderType;
			o._startIdx = pos * CONST3D2D.BYTES_PIDX;
			o._numEle = this._numEle;
			o.shaderValue = this.shaderValue;
			this.shaderValue.ref++;
			this._ref++;
		}
		
		//TODO:coverage
		 clone(context:Context,mesh:Mesh2D,pos:number):ISubmit
		{
			;
			/*
			if (_key.submitType===-1 || _isSelfVb) return null;
			var o:Submit = _poolSize ? POOL[--_poolSize] : new Submit();
			_cloneInit(o, context, ib, vb, pos);
			return o;
			*/
			return null;
		}
		
		//TODO:coverage
		 reUse(context:Context, pos:number):number
		{
			;
			return 0;
			/*
			_ref++;
			
			if (_isSelfVb)
			{
				return pos;
			}	
			_ib = context._ib;
			_vb = context._vb;
			_startIdx = pos / 8 * 6;
		    return pos + _numEle / 6 * 16;
			*/
		}
		
		//TODO:coverage
		 toString():string
		{
			return "ibindex:" + this._startIdx + " num:" + this._numEle+" key="+this._key;
		}
		
		/*
		   create方法只传对submit设置的值
		 */
		//TODO:coverage
		 static create(context:Context, mesh:Mesh2D, sv:Value2D):Submit {
			;
			var o:Submit = Submit._poolSize ? Submit.POOL[--Submit._poolSize] : new Submit();
			o._ref = 1;
			o._mesh = mesh;
			o._key.clear();
			o._startIdx = mesh.indexNum * CONST3D2D.BYTES_PIDX;
			o._numEle = 0;
			var blendType:number = context._nBlendType;
			o._blendFn = context._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
			o.shaderValue = sv;
			o.shaderValue.setValue(context._shader2D);
			var filters:any[] = context._shader2D.filters;
			filters && o.shaderValue.setFilters(filters);			
			return o;
		}
		
		/**
		 * 创建一个矢量submit
		 * @param	ctx
		 * @param	mesh
		 * @param	numEle		对应drawElement的第二个参数:count
		 * @param	offset		drawElement的时候的ib的偏移。
		 * @param	sv			Value2D
		 * @return
		 */
		 static createShape(ctx:Context, mesh:Mesh2D, numEle:number, sv:Value2D):Submit {
			var o:Submit = Submit._poolSize ? Submit.POOL[--Submit._poolSize]:(new Submit());
			o._mesh = mesh;
			o._numEle = numEle;
			o._startIdx = mesh.indexNum * 2;
			o._ref=1;
			o.shaderValue = sv;
			o.shaderValue.setValue(ctx._shader2D);
			var blendType:number = ctx._nBlendType;
			o._key.blendShader = blendType;
			o._blendFn = ctx._targets ? BlendMode.targetFns[blendType] : BlendMode.fns[blendType];
			return o;
		}
	}


