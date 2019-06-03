/**
	 * 配置文件管理
	 * ...
	 * @author anling
	 */     
	export class AssetsConsts 
	{
		
		//----------------------------------------------------------------
		//界面相关配置表
//		//----------------------------------------------------------------
		/**
		 * 物品路径 
		 */		
		 static GOODS_RESOUSE:string = "res/goods/";
		/**
		 * 英雄大图路径 
		 */		
		 static HERO_RESOUSE:string = "res/hero/";
		/**
		 * 英雄皮肤大图路径 
		 */		
		 static SKIN_RESOUSE:string = "res/skin/";
		/**
		 * 建筑图片路径
		 */		
		 static GOODS_BUILDIMG:string = "res/buildImg/";
		/**成就图片*/
		 static URL_ACHIEVE:string = "res/achieve/";		
		/**技能icon基础路径*/
		 static URL_SKILL_ICON:string = "res/skillIcon/{id}.png";
		/**
		 * debuff基础路径 
		 */		
		 static URL_DEBUFF_ICON:string = "res/skillIcon/{id}.png";	
		/**ui配置文件*/
		 static UI_CONFIG:string = "ui.json";
		/**
		 * 游戏配置数据 
		 */		
		 static GAME_CONFIG:string = "json/gameconfig.json";
		/**
		 * 预加载资源
		 */		
		 static ATLAS_RESLOADING:string = "res/atlas/resloading.atlas";
		/**
		 * 登录界面资源
		 */		
		 static ATLAS_CHOOSE_LOGIN:string = "res/atlas/choosesign.atlas";
		/**四叉树 js*/
		 static JS_QTREE:string = "js/qtree.js";
		/**
		 * 公用资源 
		 */		
		 static ATLAS_COMMON:string = "res/atlas/common.atlas";
		/**
		 * 分享资源 
		 */		
		 static ATLAS_SHARE:string = "res/atlas/shareInfo.atlas";
		/**
		 * 游戏提示界面 
		 */		
		 static ATLAS_GAMETIPS:string = "res/atlas/gametips.atlas";
		/**
		 * 新玩法结算 
		 */		
		 static ATLAS_SETTLEMENTPAGE:string = "res/atlas/settlement.atlas";	
		
		 static ATLAS_GAMERESULT:string = "res/atlas/gameResult.atlas";
		/**
		 * 被动技能
		 */
		 static ATLAS_PASSIVESKILLS:string = "res/atlas/passiveSkills.atlas";
		/**
		 * 对战表情
		 */
		 static ATLAS_MOOD:string = "res/atlas/mood.atlas";
		/**
		 * 组队赛选择 
		 */		
		 static ATLAS_GROUPLIST:string = "res/atlas/groupMode.atlas";
		/**
		 * 友谊赛选择界面 
		 */		
		 static ATLAS_FREE_CHOOSE:string = "res/atlas/freechoose.atlas";
		/**
		 * 友谊赛资源 
		 */		
		 static ATLAS_FREEMATCH:string = "res/atlas/freematch.atlas";
		/**
		 * 分享提示界面
		 */		
		 static ATLAS_SHARETIPS:string = "sharetips/tips1.jpg";
		/**
		 * 大厅资源 
		 */		
		 static ATLAS_MENULIST:string = "res/atlas/menulist.atlas";
		/**
		 * 首冲界面资源 
		 */		
		 static ATLAS_SHOWCHONG:string = "res/atlas/shouchong.atlas";
		/**
		 * 雪花图集资源 
		 */		
		 static ATLAS_SNOW:string = "res/atlas/ani/snow.atlas";
		/**战斗结算-排行榜界面*/
		 static ATLAS_RANKING:string = "res/atlas/rankList.atlas";
		/**
		 * 签到奖励 
		 */		
		 static ATLAS_SIGNIN:string = "res/atlas/signin.atlas";
		/**活跃度界面 - 每日任务界面 资源*/
		 static ATLAS_TASK:string = "res/atlas/task.atlas";
		/**商城界面 资源*/
		 static ATLAS_SHOP:string = "res/atlas/shop.atlas";
		/**背包界面 资源*/
		 static ATLAS_BACKPACK:string = "res/atlas/backpack.atlas";
		/**选择数量界面 资源*/
		 static ATLAS_CHOOSENUM:string = "res/atlas/chooseNum.atlas";
		/**战斗结算-段位界面*/
		 static ATLAS_BALANCE:string = "res/atlas/balance.atlas";
		/**战斗结算-排行榜界面*/
		 static ATLAS_DUANWEI:string = "res/atlas/duanwei.atlas";
		
		/**
		 * 登录资源 
		 */		
		 static ATLAS_LOGIN:string = "res/atlas/login.atlas";
		/**debug模式下使用*/
		 static ATLAS_MENU:string = "res/atlas/menu.atlas";
		/**游戏主界面*/
		 static ATLAS_GAMING:string = "res/atlas/gaming.atlas";
		/**游戏主界面2*/
		 static ATLAS_GAMINGTOP:string = "res/atlas/gamingtop.atlas";
		/**战斗设置界面*/
		 static ATLAS_FIGHTSET:string = "res/atlas/fightSet.atlas";
		/**
		 * 组队界面 
		 */		
		 static ATLAS_TEAMVIEW:string = "res/atlas/team.atlas";
		/**帮助界面*/
		 static ATLAS_HELP:string = "res/atlas/help.atlas";
		/**引导？*/
		//public static const ATLAS_GUIDE:String = "res/atlas/guide.atlas";
		/**新引导*/
		 static ATLAS_GUIDENEW:string = "res/atlas/newguide.atlas";
		/**出生json*/
		 static ATLAS_GUIDE_CHUSHENG:string = "ani/donghua/HeroAni.ani";
		/**穿越json*/
		 static ATLAS_GUIDE_CHUANYUE:string = "ani/donghua/mofazhen.ani";
		/**出生json*/
		 static ATLAS_GUIDE_CHUSHENG2:string = "HeroAni2.ani";
		/**穿越json*/
		 static ATLAS_GUIDE_CHUANYUE2:string = "mofazhen2.ani";
		/**新手引导重生json*/
		 static ATLAS_GUIDENEW2:string = "res/atlas/power.atlas";
		/**引导位置ani*/
		 static ATLAS_GUIDE_WEIZHI:string = "res/atlas/guide/weizhi.atlas";
		/**关注按钮特效**/
		 static ATLAS_GUANZHU_TEXIAO:string = "res/atlas/ani/guanzhu.atlas";
		/**新手结算浮层**/
		 static ATLAS_GAMERESULTN:string = "res/atlas/gameResultN.atlas";
		// 特效
		 static ATLAS_EFFECT:string = "res/effect/effect.atlas";
		 static ATLAS_EFFECT1:string = "res/effect/effect1.atlas";
		/**默认角色图片*/
		 static IMG_ROLEDEFAULE:string = "res/role/default.png";
		
		/**雪花图片 - 在 Player.onInitMap 中被赋值*/
		 static IMG_SNOW:string ;
		/**雪花组图片 - 在 Player.onInitMap 中被赋值*/
		 static IMG_SNOWGROUP:string ;
		
		/**网络提示loading资源**/
		 static LOADINGRES:string = "res/atlas/loading.atlas";
		
		// 大雪球的滚动动画
		 static ANI_BIG_SNOWBALL_ROLL:string = "res/bullet/399.atlas";
		
		//gam的图集资源
		 static ANI_GAM:string = "res/obj/baoshi.atlas";
		//熊的图集资源
		 static ANI_BEAR:string = "res/role/116.atlas";
		/**兔子的图集资源*/
		 static ATLAS_HARE:string = "res/role/hare.atlas";
		/**加载 power 相关资源 - 心，闪电，星星的图集*/
		 static ATLAS_POWER:string = "res/obj/power.atlas";
		
		/**战斗子弹图集资源*/
		 static ATLAS_NEWEFFECT:string = "res/atlas/neweffect.atlas";
		/**技能冷却图集*/
		 static ATLAS_SKILLCD:string = "res/atlas/skillCd.atlas";
		/**战斗特效图集资源*/
		 static ATLAS_NEWBULLET:string = "res/newbullet/newbullet.atlas";
		/**冰雪家园资源*/
		 static ATLAS_ICEHOMERES:string = "res/atlas/iceHome.atlas";
		/**冰雪议会资源*/
		 static ATLAS_YIHUI:string = "res/atlas/yihui.atlas";	
		
		/**成就分享资源*/
		 static ATLAS_SACHIEVE:string = "res/atlas/shareAchieve.atlas";
		/**英雄分享资源*/
		 static ATLAS_SHERO:string = "res/atlas/shareHero.atlas";
		/**皮肤分享资源*/
		 static ATLAS_SKIN:string = "res/atlas/shareSkin.atlas";
		/**称号分享资源*/
		 static ATLAS_STITLE:string = "res/atlas/shareTitle.atlas";
		
		/**角色手持雪球配置地址*/
		 static JSON_ROLE_SNOWBALL:string = "json/roleQiu/{id}.json";
		
		/*
		 * 图片资源
		 */
        constructor(){
		}
		
	}


