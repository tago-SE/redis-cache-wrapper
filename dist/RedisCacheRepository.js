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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheRepository = void 0;
/**
 * This is a redis implementation of the ICache interface.
 * With this wrapper you can make as many logical partitions of one single redis client.
 * Important to notice that in order to avoid key collisions, process.env.USERNAME and config.name are used as cache key prefixes to the argument key.
 */
var RedisCacheRepository = /** @class */ (function () {
    function RedisCacheRepository(redis, config) {
        var keySeparator = config.separator || ":";
        var userSegment = process.env.USERNAME
            ? process.env.USERNAME + keySeparator
            : "";
        var nameSegment = config.name + keySeparator;
        this.ttlInSeconds = config.ttlInSeconds;
        this.keyPrefix = userSegment + nameSegment;
        this.redis = redis;
    }
    RedisCacheRepository.prototype._getKey = function (key) {
        return this.keyPrefix + key;
    };
    RedisCacheRepository.prototype._getSetExpiration = function (options) {
        var _a;
        if (options === void 0) { options = {}; }
        var ttl = typeof (options === null || options === void 0 ? void 0 : options.ttlInSeconds) === "number"
            ? options.ttlInSeconds
            : (_a = this.ttlInSeconds) !== null && _a !== void 0 ? _a : 0;
        return isNaN(ttl) ? 0 : ttl;
    };
    RedisCacheRepository.prototype._encode = function (value, meta) {
        if (!value)
            throw new Error("Value must be set.");
        var encoded = { value: value, meta: meta };
        return JSON.stringify(encoded);
    };
    RedisCacheRepository.prototype._decode = function (value) {
        if (!value)
            return null;
        var decoded = JSON.parse(value);
        return decoded;
    };
    RedisCacheRepository.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis
                            .get(this._getKey(key))
                            .then(function (value) { return _this._decode(value); })];
                    case 1:
                        data = _a.sent();
                        return [2 /*return*/, (data === null || data === void 0 ? void 0 : data.value) || null];
                }
            });
        });
    };
    RedisCacheRepository.prototype.getWithMeta = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis
                            .get(this._getKey(key))
                            .then(function (value) { return _this._decode(value); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RedisCacheRepository.prototype.set = function (key, value, options) {
        return __awaiter(this, void 0, void 0, function () {
            var ttl, _key, meta, result, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ttl = this._getSetExpiration(options);
                        _key = this._getKey(key);
                        meta = {
                            argKey: key,
                            rawKey: _key,
                            ttl: ttl,
                            savedAt: Date.now(),
                        };
                        if (!(ttl > 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redis.set(_key, this._encode(value, meta), "EX", ttl)];
                    case 1:
                        _a = _b.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.redis.set(_key, this._encode(value, meta))];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4:
                        result = _a;
                        return [2 /*return*/, result === "OK"];
                }
            });
        });
    };
    RedisCacheRepository.prototype.del = function (keys) {
        return __awaiter(this, void 0, void 0, function () {
            var _keys;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!Array.isArray(keys)) return [3 /*break*/, 2];
                        _keys = keys.map(function (key) { return _this._getKey(key); });
                        return [4 /*yield*/, this.redis.del(_keys)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2: return [4 /*yield*/, this.redis.del(this._getKey(keys))];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RedisCacheRepository.prototype.ttl = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.ttl(this._getKey(key))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RedisCacheRepository.prototype.expire = function (key, ttl) {
        return __awaiter(this, void 0, void 0, function () {
            var _key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _key = this._getKey(key);
                        if (!(ttl < 0)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.redis.persist(_key)];
                    case 1: return [2 /*return*/, (_a.sent()) === 1];
                    case 2: return [4 /*yield*/, this.redis.expire(_key, ttl)];
                    case 3: return [2 /*return*/, (_a.sent()) === 1];
                }
            });
        });
    };
    RedisCacheRepository.prototype.has = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.exists(this._getKey(key))];
                    case 1: return [2 /*return*/, (_a.sent()) === 1];
                }
            });
        });
    };
    RedisCacheRepository.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.redis.ping()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    RedisCacheRepository.prototype.keys = function () {
        return __awaiter(this, void 0, void 0, function () {
            var firstPartOfKey, keys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        firstPartOfKey = this._getKey("");
                        return [4 /*yield*/, this.redis.keys(firstPartOfKey + "*")];
                    case 1:
                        keys = _a.sent();
                        return [2 /*return*/, keys.map(function (key) { return key.replace(firstPartOfKey, ""); })];
                }
            });
        });
    };
    RedisCacheRepository.prototype.flushAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var keys, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.redis.keys(this._getKey("") + "*")];
                    case 1:
                        keys = _b.sent();
                        if (!(keys.length <= 0)) return [3 /*break*/, 2];
                        _a = 0;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.redis.del(keys)];
                    case 3:
                        _a = _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, _a];
                }
            });
        });
    };
    return RedisCacheRepository;
}());
exports.RedisCacheRepository = RedisCacheRepository;
