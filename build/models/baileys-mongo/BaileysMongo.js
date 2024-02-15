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
        this.createNewAuth = (storeKey, prismaClient, payload) => __awaiter(this, void 0, void 0, function* () {
            try {
                const store = yield prismaClient.auth.findFirst({
                    where: {
                        key: storeKey
                    }
                });
                if (store == null) {
                    yield prismaClient.auth.create({
                        data: Object.assign({ key: storeKey, value: '' }, (payload !== null && payload !== void 0 ? payload : {}))
                    });
                }
                return {
                    auth: new AuthHandler_1.default(prismaClient, storeKey),
                    mongoDB: prismaClient
                };
            }
            catch (err) {
                throw new Error(err);
            }
        });
        this.init = () => __awaiter(this, void 0, void 0, function* () {
            const { prismaClient } = yield db_1.PrismaSingleton.getInstance();
            const createAuthStore = (storeKey, payload) => __awaiter(this, void 0, void 0, function* () {
                const auth = yield this.createNewAuth(storeKey, prismaClient, payload);
                return auth;
            });
            return { createNewAuth: createAuthStore };
        });
        this.getDb = () => __awaiter(this, void 0, void 0, function* () {
            const { prismaClient } = yield db_1.PrismaSingleton.getInstance();
            return prismaClient;
        });
    }
}
exports.BaileysMongo = BaileysMongo;
BaileysMongo._instance = new BaileysMongo();
exports.default = BaileysMongo._instance;
//# sourceMappingURL=BaileysMongo.js.map