"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BaileysMongo_1 = __importDefault(require("../models/baileys-mongo/BaileysMongo"));
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const createSocket = (authHandler, mongoDB) => __awaiter(void 0, void 0, void 0, function* () {
    const { state, saveState } = authHandler;
    const sock = (0, baileys_1.default)({
        auth: state,
        keepAliveIntervalMs: 30000,
        printQRInTerminal: true,
        mobile: false,
        syncFullHistory: false
    });
    sock.ev.process((events) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        if (events['connection.update'] !== undefined) {
            const update = events['connection.update'];
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const loggedOut = ((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) === baileys_1.DisconnectReason.loggedOut;
                if (!loggedOut) {
                    yield createSocket(authHandler, mongoDB);
                }
                if (loggedOut) {
                    console.log('Connection closed by logout');
                    yield mongoDB.auth.delete({
                        where: {
                            key: 'storeKeyExample'
                        }
                    });
                }
            }
            console.log('------------ update ------------- ', update);
        }
        if (events['creds.update'] !== undefined) {
            try {
                yield saveState();
            }
            catch (err) {
                console.log('Error save state: ', err);
            }
        }
        if (events['messages.upsert'] !== undefined) {
            const upsert = events['messages.upsert'];
            console.log('upsert', JSON.stringify(upsert));
        }
    }));
});
const start = (storeKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { createNewAuth } = yield BaileysMongo_1.default.init();
        const { auth, mongoDB } = yield createNewAuth(storeKey);
        const authHandler = yield auth.useAuthHandler();
        yield createSocket(authHandler, mongoDB);
    }
    catch (err) {
        throw new Error(err);
    }
});
start('storeKeyExample').catch((err) => {
    console.log(`Error starting client ${err.message}`);
});
// start('storeKeyExample2').catch((err) => {
//   console.log(`Error starting client ${err.message as string}`)
// })
