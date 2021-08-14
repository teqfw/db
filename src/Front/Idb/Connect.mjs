/**
 * Connector to IndexedDb to use with async/await in TeqFW apps.
 */
const NS = 'TeqFw_Db_Front_Idb_Connect';

export default class TeqFw_Db_Front_Idb_Connect {
    constructor() {
        let /** @type {function} */
            fnUpgrade,
            /** @type {IDBDatabase} */
            db;

        // DEFINE INSTANCE METHODS

        this.openDb = function (name, version, _fnUpgrade) {
            fnUpgrade = _fnUpgrade;
            return new Promise(function (resolve, reject) {
                const req = indexedDB.open(name, version);
                if (typeof fnUpgrade === 'function') req.onupgradeneeded = fnUpgrade;
                req.onerror = function () {
                    console.log('IDB open error:' + req.error);
                    reject(req.error);
                }
                req.onsuccess = function () {
                    db = req.result;
                    resolve(db);
                }
            });
        }

        this.isConnected = function () {
            return db !== undefined;
        }

        this.delete = function (dbName) {
            return new Promise(function (resolve, reject) {
                if (db) db.close();
                const req = indexedDB.deleteDatabase(dbName);
                req.onblocked = function () {
                    console.log('IDB delete error:' + req);
                    reject(req);
                }
                req.onerror = function () {
                    console.log('IDB delete error:' + req.error);
                    reject(req.error);
                };
                req.onsuccess = function () {
                    resolve();
                };
            });
        }

        this.store = function (name) {
            if (!db) throw new Error("Please, connect to DB first.");
            return new Store(name, db);
        }
    }

}

/**
 * Wrapper for IDBObjectStore. Add async/await and transaction-per-request features.
 *
 * https://stackoverflow.com/a/61373664/4073821
 *
 * @memberOf TeqFw_Db_Front_Idb_Connect
 */
class Store {
    constructor($name, $db) {
        const db = $db;
        const name = $name;

        this.getByKey = function (key) {
            return new Promise(function (resolve, reject) {
                const trn = db.transaction(name);
                const store = trn.objectStore(name);
                const req = store.get(key);
                req.onerror = function () {
                    console.log('IDB Store error:' + req.error);
                    reject(req.error);
                }
                req.onsuccess = function () {
                    resolve(req.result);
                }
            });
        }

        this.put = function (value, key) {
            return new Promise(function (resolve, reject) {
                const data = JSON.parse(JSON.stringify(value)); // save DTO w/o Proxy
                const trn = db.transaction(name, 'readwrite');
                const store = trn.objectStore(name);
                const req = key ? store.put(data, key) : store.put(data);
                req.onerror = function () {
                    console.log('IDB Store error:' + req.error);
                    reject(req.error);
                }
                req.onsuccess = function () {
                    resolve(req.result);
                }
            });
        }
    }
}

Object.defineProperty(Store, 'name', {value: `${NS}.${Store.constructor.name}`});
