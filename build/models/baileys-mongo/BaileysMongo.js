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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaileysMongo = void 0;
const AuthHandler_1 = __importDefault(require("../auth-handler/AuthHandler"));
const db_1 = require("../../db/db");
class BaileysMongo {
    constructor() {
        this.createNewAuth = (storeKey, prismaClient) => __awaiter(this, void 0, void 0, function* () {
            try {
                const store = yield prismaClient.auth.findFirst({
                    where: {
                        key: storeKey
                    }
                });
                if (store == null) {
                    yield prismaClient.auth.create({
                        data: {
                            key: storeKey,
                            value: ''
                        }
                    });
                }
                return {
                    auth: new AuthHandler_1.default(prismaClient, storeKey),
                    mongoDB: prismaClient
                };
            }
            catch (err) {
                throw new Error('Error creating auth in mongo ---- Error');
            }
        });
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            const { prismaClient } = yield db_1.PrismaSingleton.getInstance();
            const createAuthStore = (storeKey) => __awaiter(this, void 0, void 0, function* () {
                const auth = yield this.createNewAuth(storeKey, prismaClient);
                return auth;
            });
            return { createNewAuth: createAuthStore };
        });
    }
}
exports.BaileysMongo = BaileysMongo;
BaileysMongo._instance = new BaileysMongo();
exports.default = BaileysMongo._instance;
//# sourceMappingURL=BaileysMongo.js.map