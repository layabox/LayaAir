/**
 * @en The `LocalStorage` class is used for data storage without time limit.
 * @zh `LocalStorage` 类用于没有时间限制的数据存储。
 */
export class LocalStorage {

    /**
     * @internal
     * @en Base class.
     * @zh 基础类。
     */
    static _baseClass: any;
    /**
     * @en Data list.
     * @zh 数据列表。
     */
    static items: any;
    /**
     * @en Indicates whether `LocalStorage` is supported.
     * @zh 表示是否支持 `LocalStorage`。
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
     * @en Stores a key-value pair as strings.
     * @param key The key name.
     * @param value The value to store.
     * @zh 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void {
        LocalStorage._baseClass.setItem(key, value);
    }

    /**
     * @en Retrieves the value for the specified key.
     * @param key The key name.
     * @returns The string value associated with the key.
     * @zh 获取指定键名的值。
     * @param key 键名。
     * @returns 与键关联的字符串值。
     */
    static getItem(key: string): string {
        return LocalStorage._baseClass.getItem(key);
    }

    /**
     * @en Stores a key-value pair where the value is an Object.
     * @param key The key name.
     * @param value The value to store. It's an Object type and will be converted to a JSON string for storage.
     * @zh 存储指定键名及其对应的 Object 类型值。
     * @param key 键名。
     * @param value 键值。是 Object 类型，会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void {
        LocalStorage._baseClass.setJSON(key, value);
    }

    /**
     * @en Retrieves the Object value for the specified key.
     * @param key The key name.
     * @returns The Object value associated with the key.
     * @zh 获取指定键名对应的 Object 类型值。
     * @param key 键名。
     * @returns 与键关联的 Object 类型值。
     */
    static getJSON(key: string): any {
        return LocalStorage._baseClass.getJSON(key);
    }

    /**
     * @en Removes the item associated with the specified key.
     * @param key The key name.
     * @zh 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void {
        LocalStorage._baseClass.removeItem(key);
    }

    /**
     * @en Clears all locally stored information.
     * @zh 清除所有本地存储的信息。
     */
    static clear(): void {
        LocalStorage._baseClass.clear();
    }
}


/** @internal */
class Storage {

    /**
     * @en items list for LocalStorage.
     * @zh 用于本地存储的数据項列表。
     */
    static items: any;
    /**
     * @en Indicates whether LocalStorage is supported.
     * @zh 表示是否支持本地存储（LocalStorage）。
     */
    static support: boolean = false;

    static init(): void {
        try { Storage.support = true; Storage.items = window.localStorage; Storage.setItem('laya', '1'); Storage.removeItem('laya'); } catch (e) { Storage.support = false; } if (!Storage.support) console.log('LocalStorage is not supprot or browser is private mode.');
    }

    /**
     * @en Stores the specified key-value pair as strings.
     * @param key The key name.
     * @param value The value corresponding to the key.
     * @zh 以字符串类型存储指定的键名和键值。
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
    * @en Retrieves the value corresponding to the specified key.
    * @param key The key name.
    * @return The value as a string.
    * @zh 获取指定键名对应的值。
    * @param key 键名。
    * @return 返回字符串类型的值。
    */
    static getItem(key: string): string {
        return Storage.support ? Storage.items.getItem(key) : null;
    }

    /**
     * @en Stores the specified key and its value of type <code>Object</code>. The object value will be converted to a JSON string for storage.
     * @param key The key name.
     * @param value The value of type <code>Object</code>.
     * @zh 存储指定键名及其 <code>Object</code> 类型的键值。此处对象值将会被转换为JSON字符串进行存储。
     * @param key 键名。
     * @param value 键值，为 <code>Object</code> 类型。
     */
    static setJSON(key: string, value: any): void {
        try {
            Storage.support && Storage.items.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn("set localStorage failed", e);
        }
    }

    /**
     * @en Retrieves the value of type <code>Object</code> corresponding to the specified key.
     * @param key The key name.
     * @return The value of type <code>Object</code>.
     * @zh 获取指定键名对应的 <code>Object</code> 类型的值。
     * @param key 键名。
     * @return 返回 <code>Object</code> 类型的值。
     */
    static getJSON(key: string): any {
        try {
            let obj = JSON.parse(Storage.support ? Storage.items.getItem(key) : null);
            return obj;
        } catch (err) {
            return Storage.items.getItem(key);
        }
    }

    /**
     * @en Deletes the information corresponding to the specified key.
     * @param key The key name.
     * @zh 删除指定键名对应的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void {
        Storage.support && Storage.items.removeItem(key);
    }

    /**
     * @en Clears the local storage information.
     * @zh 清除本地存储信息。
     */
    static clear(): void {
        Storage.support && Storage.items.clear();
    }

}
