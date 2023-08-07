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
const KEY_MAP = {
    'pre-key': 'preKeys',
    session: 'sessions',
    'sender-key': 'senderKeys',
    'app-state-sync-key': 'appStateSyncKeys',
    'app-state-sync-version': 'appStateVersions',
    'sender-key-memory': 'senderKeyMemory'
};
class AuthHandler {
    constructor(prismaCLient, key) {
        this.prismaCLient = prismaCLient;
        this.key = key;
        this.useAuthHandler = () => __awaiter(this, void 0, void 0, function* () {
            let creds;
            let keys = {};
            const authDB = yield this.prismaCLient.auth.findFirst({
                where: {
                    key: this.key
                }
            });
            if (authDB !== null && authDB.value !== '') {
                ({ creds, keys } = JSON.parse(authDB.value, baileys_1.BufferJSON.reviver));
            }
            else {
                creds = (0, baileys_1.initAuthCreds)();
                keys = {};
            }
            const saveState = () => __awaiter(this, void 0, void 0, function* () {
                const saveStateResult = yield this.prismaCLient.auth.upsert({
                    where: {
                        key: this.key
                    },
                    update: {
                        value: JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer, 2)
                    },
                    create: {
                        key: this.key,
                        value: JSON.stringify({ creds, keys }, baileys_1.BufferJSON.replacer, 2)
                    }
                });
                return saveStateResult;
            });
            return {
                state: {
                    creds,
                    keys: {
                        get: (type, ids) => {
                            const key = KEY_MAP[type];
                            return ids.reduce((dict, id) => {
                                var _a;
                                let value = (_a = keys[key]) === null || _a === void 0 ? void 0 : _a[id];
                                if (value !== undefined) {
                                    if (type === 'app-state-sync-key') {
                                        value = baileys_1.proto.Message.AppStateSyncKeyData.fromObject(value);
                                    }
                                    dict[id] = value;
                                }
                                return dict;
                            }, {});
                        },
                        set: (data) => __awaiter(this, void 0, void 0, function* () {
                            for (const _key in data) {
                                const key = KEY_MAP[_key];
                                if (keys[key] === undefined) {
                                    keys[key] = {};
                                }
                                Object.assign(keys[key], data[_key]);
                            }
                            yield saveState();
                        })
                    }
                },
                saveState
            };
        });
    }
}
exports.default = AuthHandler;
