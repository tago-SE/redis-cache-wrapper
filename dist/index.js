"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheRepository = exports.sayHello = void 0;
function sayHello(name) {
    return "Hello, ".concat(name, "!");
}
exports.sayHello = sayHello;
var RedisCacheRepository_1 = require("./RedisCacheRepository");
Object.defineProperty(exports, "RedisCacheRepository", { enumerable: true, get: function () { return RedisCacheRepository_1.RedisCacheRepository; } });
