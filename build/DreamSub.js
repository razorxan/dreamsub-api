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
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio_1 = __importDefault(require("cheerio"));
class DreamSub {
    static _url(path) {
        return `${this.basePath}/${path}`;
    }
    static _getPage(path) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(this._url(path));
            return cheerio_1.default.load(yield response.text());
        });
    }
    static get(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield this._getPage(`anime/${slug}`);
            const isSeries = $('.dcis').toArray().some((i) => $(i).text() === 'Tipo: Serie TV');
            if (isSeries) {
                return yield this.getSeries(slug, $);
            }
            else {
                return yield this.getMovie(slug, $);
            }
        });
    }
    static getMovie(slug, document = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = document || (yield this._getPage(`anime/${slug}`));
            if ($('.dc-title strong').length < 1)
                return null;
            return {
                title: $('.dc-title strong').text(),
                links: $('a.dwButton').toArray().map((link) => {
                    const version = $(link).parent().find('b').text().split(':')[0];
                    return {
                        link: $(link).attr('href'),
                        resolution: $(link).attr('title').match(/(\d+)p/gi)[0],
                        version,
                    };
                }),
            };
        });
    }
    static getEpisode(slug, episode) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = yield this._getPage(`anime/${slug}/${episode}`);
            if ($('#current_episode_name').length < 1)
                return null;
            return {
                title: $('#current_episode_name').text().split(':').slice(-1).join('').trim(),
                number: +episode,
                links: $('a.dwButton').toArray().map((link) => {
                    const version = $(link).parent().find('b').text().split(':')[0];
                    return {
                        link: $(link).attr('href'),
                        resolution: $(link).attr('title').match(/(\d+)p/gi)[0],
                        version,
                    };
                }),
            };
        });
    }
    static getSeries(slug, document = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const $ = document || (yield DreamSub._getPage(`anime/${slug}`));
            const title = $('.dc-title a strong').text();
            const info = $('.dc-info .dcis').toArray().reduce((a, e) => {
                const text = $(e).text().split(':').map((i) => i.trim());
                return Object.assign({}, a, { [text[0]]: text[1] });
            }, {});
            if (info.Data) {
                let status = 'running';
                const date = info.Data.split(' a ');
                if (date.length === 2) {
                    const spl = date[1].split(', ');
                    const start = date[0];
                    let end = date[1];
                    if (spl.length === 2) {
                        status = spl[1];
                        end = spl[0];
                    }
                    info.Data = {
                        start,
                        status,
                        end
                    };
                }
                else {
                    info.Data = {
                        status,
                        start: date[0],
                        end: 'nd',
                    };
                }
            }
            const seasEls = $('.mainSeas').toArray();
            if (seasEls.length) {
                const seasons = seasEls.map((seas, i) => {
                    const re = new RegExp(`\\/anime\\/${slug}\\/\\d+`, 'gi');
                    const el = $(seas).find('a.btn').toArray();
                    const episodes = el
                        .filter((l) => !!$(l).attr('href').match(re))
                        .map((l, j) => {
                        return {
                            season: i + 1,
                            number: j + 1,
                            link: $(l).attr('href').replace('anime/', ''),
                            title: $(l).attr('title').split(': ').slice(-1).join(''),
                        };
                    });
                    return {
                        title: $(seas).find('div h2').text(),
                        episodes,
                        number: i + 1,
                    };
                });
                return {
                    language: info.Lingua || null,
                    duration: info.Durata || null,
                    date: info.Data,
                    japanese_title: info['Titolo giapponese'] || null,
                    title,
                    seasons,
                };
            }
            else {
                const re = new RegExp(`\\/anime\\/${slug}\\/\\d+`, 'gi');
                const eps = $('#episodes-list a.btn').toArray();
                return {
                    language: info.Lingua || null,
                    duration: info.Durata || null,
                    date: info.Data,
                    japanese_title: info['Titolo giapponese'] || null,
                    title,
                    seasons: [{
                            title: "Season 1",
                            number: 1,
                            episodes: eps
                                .filter((l) => !!$(l).attr('href').match(re))
                                .map((l, i) => {
                                return {
                                    season: 1,
                                    number: i + 1,
                                    link: $(l).attr('href').replace('anime/', ''),
                                    title: $(l).attr('title').split(': ').slice(-1).join(''),
                                };
                            }),
                        }],
                };
            }
        });
    }
    static search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield node_fetch_1.default(this._url(`api/ajax/fastSearch?getNome=${query}&requestOrder=10`));
            const json = yield response.json();
            return json.suggests.map((result) => ({ slug: result.clean, title: result.nome }));
        });
    }
}
DreamSub.basePath = ' https://dreamsub.stream';
exports.default = DreamSub;
//# sourceMappingURL=DreamSub.js.map