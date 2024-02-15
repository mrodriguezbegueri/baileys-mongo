"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = require("@whiskeysockets/baileys");
class AuthHandler {
    constructor(prismaCLient, key) {
        this.prismaCLient = prismaCLient;
        this.key = key;
        this.useAuthHandler = () => __awaiter(this, void 0, void 0, function* () {
            let creds;
            const authDBCreds = yield this.prismaCLient.auth.findFirst({
                where: {
                    key: `${this.key}:creds`
                }
            });
            if (authDBCreds !== null && authDBCreds.value !== '') {
                creds = JSON.parse(authDBCreds.value, baileys_1.BufferJSON.reviver);
            }
            else {
                creds = (0, baileys_1.initAuthCreds)();
            }
            const saveInDB = (keyField, dataToSave) => __awaiter(this, void 0, void 0, function* () {
                const dbKey = `${this.key}:${keyField}`;
                const saveStatePromise = this.prismaCLient.auth.upsert({
                    where: {
                        key: dbKey
                    },
                    update: {
                        value: JSON.stringify(dataToSave, baileys_1.BufferJSON.replacer)
                    },
                    create: {
                        key: dbKey,
                        value: JSON.stringify(dataToSave, baileys_1.BufferJSON.replacer)
                    }
                });
                return yield saveStatePromise;
            });
            const getFromDB = (key) => __awaiter(this, void 0, void 0, function* () {
                const data = yield this.prismaCLient.auth.findFirst({
                    where: {
                        key
                    }
                });
                if (data === null) {
                    return null;
                }
                return data;
            });
            return {
                state: {
                    creds,
                    keys: {
                        get: (type, ids) => __awaiter(this, void 0, void 0, function* () {
                            const promises = ids.map((id) => __awaiter(this, void 0, void 0, function* () { return yield getFromDB(`${this.key}:${type}:${id}`); }));
                            const values = yield Promise.all(promises);
                            return ids.reduce((dict, idx) => {
                                const value = values.find((val) => (val === null || val === void 0 ? void 0 : val.key) === `${this.key}:${type}:${idx}`);
                                if (value !== undefined && value !== null) {
                                    const dataParsed = JSON.parse(value.value, baileys_1.BufferJSON.reviver);
                                    if (type === 'app-state-sync-key') {
                                        dict[idx] = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(dataParsed);
                                    }
                                    dict[idx] = dataParsed;
                                }
                                return dict;
                            }, {});
                        }),
                        set: (data) => __awaiter(this, void 0, void 0, function* () {
                            const dataToSave = [];
                            for (const _key in data) {
                                let signalData = data[_key];
                                if (signalData === undefined) {
                                    signalData = {};
                                }
                                for (const id in signalData) {
                                    const value = signalData[id];
                                    const key = `${_key}:${id}`;
                                    const dbPromise = saveInDB(key, value);
                                    dataToSave.push(dbPromise);
                                }
                            }
                            yield Promise.all(dataToSave);
                        })
                    }
                },
                saveState: () => __awaiter(this, void 0, void 0, function* () {
                    yield saveInDB('creds', creds);
                })
            };
        });
        this.deleteKeys = (storeKey, prismaCLient) => __awaiter(this, void 0, void 0, function* () {
            yield prismaCLient.auth.deleteMany({
                where: {
                    key: {
                        startsWith: storeKey
                    }
                }
            });
        });
    }
}
exports.default = AuthHandler;
//# sourceMappingURL=AuthHandler.js.map