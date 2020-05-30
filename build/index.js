"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const DreamSub_1 = __importDefault(require("./DreamSub"));
const app = express_1.default();
app.use(cors_1.default());
app.set('json spaces', 2);
app.get('/search', (req, res) => __awaiter(this, void 0, void 0, function* () {
    if (typeof req.query.q === 'string') {
        res.json(yield DreamSub_1.default.search(req.query.q));
    }
    else {
        res.json(null);
    }
}));
app.get('/:slug/:episode', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const result = yield DreamSub_1.default.getEpisode(req.params.slug, +req.params.episode);
    res.json(result);
}));
app.get('/:slug', (req, res) => __awaiter(this, void 0, void 0, function* () {
    const result = yield DreamSub_1.default.get(req.params.slug);
    res.json(result);
}));
app.listen(3333, () => {
    console.log('up and running on port 3333');
});
//# sourceMappingURL=index.js.map