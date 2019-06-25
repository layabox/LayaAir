/**
     * <p> <code>LocalStorage</code> 类用于没有时间限制的数据存储。</p>
     */
export class LocalStorage {
    static __init__() {
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
    static setItem(key, value) {
        LocalStorage._baseClass.setItem(key, value);
    }
    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key) {
        return LocalStorage._baseClass.getItem(key);
    }
    /**
     * 存储指定键名及其对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key, value) {
        LocalStorage._baseClass.setJSON(key, value);
    }
    /**
     * 获取指定键名对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @return <code>Object</code> 类型值
     */
    static getJSON(key) {
        return LocalStorage._baseClass.getJSON(key);
    }
    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key) {
        LocalStorage._baseClass.removeItem(key);
    }
    /**
     * 清除本地存储信息。
     */
    static clear() {
        LocalStorage._baseClass.clear();
    }
}
/**
 * 表示是否支持  <code>LocalStorage</code>。
 */
LocalStorage.support = false;
class Storage {
    static init() {
        try {
            Storage.support = true;
            Storage.items = window.localStorage;
            Storage.setItem('laya', '1');
            Storage.removeItem('laya');
        }
        catch (e) {
            Storage.support = false;
        }
        if (!Storage.support)
            console.log('LocalStorage is not supprot or browser is private mode.');
    }
    /**
     * 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key, value) {
        try {
            Storage.support && Storage.items.setItem(key, value);
        }
        catch (e) {
            console.warn("set localStorage failed", e);
        }
    }
    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key) {
        return Storage.support ? Storage.items.getItem(key) : null;
    }
    /**
     * 存储指定键名和它的 <code>Object</code> 类型值。
     * @param key 键名。
     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key, value) {
        try {
            Storage.support && Storage.items.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.warn("set localStorage failed", e);
        }
    }
    /**
     * 获取指定键名的 <code>Object</code> 类型值。
     * @param key 键名。
     * @return <code>Object</code> 类型值
     */
    static getJSON(key) {
        return JSON.parse(Storage.support ? Storage.items.getItem(key) : null);
    }
    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key) {
        Storage.support && Storage.items.removeItem(key);
    }
    /**
     * 清除本地存储信息。
     */
    static clear() {
        Storage.support && Storage.items.clear();
    }
}
/**
 * 表示是否支持  <code>LocalStorage</code>。
 */
Storage.support = false;
