/**
	 * <p> <code>LocalStorage</code> 类用于没有时间限制的数据存储。</p>
	 */
export class LocalStorage {

    /**@ 基础类*/
    static _baseClass: any;
    /**
     *  数据列表。
     */
    static items: any;
    /**
     * 表示是否支持  <code>LocalStorage</code>。
     */
    static support: boolean = false;
    /**@internal */
    static __init__(): boolean {
        if (!LocalStorage._baseClass) {
            LocalStorage._baseClass = Storage;
            Storage.init();
        }
        LocalStorage.items = LocalStorage._baseClass.items;
        LocalStorage.support = LocalStorage._baseClass.support;
        return LocalStorage.support;
    }

    /**
     * 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void {
        LocalStorage._baseClass.setItem(key, value);
    }

    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key: string): string {
        return LocalStorage._baseClass.getItem(key);
    }

    /**
     * 存储指定键名及其对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void {
        LocalStorage._baseClass.setJSON(key, value);
    }

    /**
     * 获取指定键名对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @return <code>Object</code> 类型值
     */
    static getJSON(key: string): any {
        return LocalStorage._baseClass.getJSON(key);
    }

    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void {
        LocalStorage._baseClass.removeItem(key);
    }

    /**
     * 清除本地存储信息。
     */
    static clear(): void {
        LocalStorage._baseClass.clear();
    }
}


/** @internal */
class Storage {

	/**
	 *  数据列表。
	 */
    static items: any;
	/**
	 * 表示是否支持  <code>LocalStorage</code>。
	 */
    static support: boolean = false;

    static init(): void {
        try { Storage.support = true; Storage.items = window.localStorage; Storage.setItem('laya', '1'); Storage.removeItem('laya'); } catch (e) { Storage.support = false; } if (!Storage.support) console.log('LocalStorage is not supprot or browser is private mode.');
    }

	/**
	 * 存储指定键名和键值，字符串类型。
	 * @param key 键名。
	 * @param value 键值。
	 */
    static setItem(key: string, value: string): void {
        try {
            Storage.support && Storage.items.setItem(key, value);
        } catch (e) {
            console.warn("set localStorage failed", e);
        }
    }

	/**
	 * 获取指定键名的值。
	 * @param key 键名。
	 * @return 字符串型值。
	 */
    static getItem(key: string): string {
        return Storage.support ? Storage.items.getItem(key) : null;
    }

	/**
	 * 存储指定键名和它的 <code>Object</code> 类型值。
	 * @param key 键名。
	 * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
	 */
    static setJSON(key: string, value: any): void {
        try {
            Storage.support && Storage.items.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn("set localStorage failed", e);
        }
    }

	/**
	 * 获取指定键名的 <code>Object</code> 类型值。
	 * @param key 键名。
	 * @return <code>Object</code> 类型值
	 */
    static getJSON(key: string): any {
        try{
            let obj = JSON.parse(Storage.support ? Storage.items.getItem(key) : null);
            return obj;
        }catch(err){
            return Storage.items.getItem(key);
        }
    }

	/**
	 * 删除指定键名的信息。
	 * @param key 键名。
	 */
    static removeItem(key: string): void {
        Storage.support && Storage.items.removeItem(key);
    }

	/**
	 * 清除本地存储信息。
	 */
    static clear(): void {
        Storage.support && Storage.items.clear();
    }

}
