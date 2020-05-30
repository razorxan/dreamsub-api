import fetch from 'node-fetch';
import cheerio from 'cheerio';
import Series from './interfaces/series.interface';
import Season from './interfaces/season.interface';
import Episode from './interfaces/episode.interface';

class DreamSub {

    static basePath = ' https://dreamsub.stream';

    static _url(path: string) {
        return `${this.basePath}/${path}`;
    }

    static async _getPage(path: string) {
        const response = await fetch(this._url(path));
        return cheerio.load(await response.text());
    }

    static async get(slug: string) {
        const $ = await this._getPage(`anime/${slug}`);
        const isSeries = $('.dcis').toArray().some((i: any) => $(i).text() === 'Tipo: Serie TV');
        if (isSeries) {
            return await this.getSeries(slug, $);
        } else {
            return await this.getMovie(slug, $)
        }
    }

    static async getMovie(slug: string, document: CheerioStatic | null = null) {
        const $ = document || await this._getPage(`anime/${slug}`);
        if ($('.dc-title strong').length < 1) return null;
        return {
            title: $('.dc-title strong').text(),
            links: $('a.dwButton').toArray().map((link: any) => {
                const version = $(link).parent().find('b').text().split(':')[0]
                return {
                    link: $(link).attr('href'),
                    resolution: $(link).attr('title')!.match(/(\d+)p/gi)![0],
                    version,
                }
            }),
        };
    }

    static async getEpisode(slug: string, episode: number) {
        const $ = await this._getPage(`anime/${slug}/${episode}`);
        if ($('#current_episode_name').length < 1) return null;
        return {
            title: $('#current_episode_name').text().split(':').slice(-1).join('').trim(),
            number: +episode,
            links: $('a.dwButton').toArray().map((link: any) => {
                const version = $(link).parent().find('b').text().split(':')[0]

                return {
                    link: $(link).attr('href'),
                    resolution: $(link).attr('title')!.match(/(\d+)p/gi)![0],
                    version,
                }
            }),
        };
    }

    static async getSeries(slug: string, document: CheerioStatic | null = null): Promise<Series> {
        const $ = document || await DreamSub._getPage(`anime/${slug}`);
        const title: string = $('.dc-title a strong').text();
        const info: any = $('.dc-info .dcis').toArray().reduce((a: object, e: any) => {
            const text = $(e).text().split(':').map((i: any) => i.trim())
            return { ...a, [text[0]]: text[1] }
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
                }

            } else {
                info.Data = {
                    status,
                    start: date[0],
                    end: 'nd',
                }
            }
        }
        const seasEls = $('.mainSeas').toArray();
        if (seasEls.length) {
            const seasons = seasEls.map((seas: CheerioElement, i: number): Season => {
                const re = new RegExp(`\\/anime\\/${slug}\\/\\d+`, 'gi');
                const el = $(seas).find('a.btn').toArray()
                const episodes = el
                    .filter((l: CheerioElement) => !!$(l).attr('href')!.match(re))
                    .map((l: any, j: number): Episode => {
                        return <Episode>{
                            season: i + 1,
                            number: j + 1,
                            link: $(l).attr('href')!.replace('anime/', ''),
                            title: $(l).attr('title')!.split(': ').slice(-1).join(''),
                        }
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
        } else {
            const re: RegExp = new RegExp(`\\/anime\\/${slug}\\/\\d+`, 'gi');
            const eps: CheerioElement[] = $('#episodes-list a.btn').toArray()
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
                        .filter((l: CheerioElement) => !!$(l).attr('href')!.match(re))
                        .map((l: CheerioElement, i: number) => {
                            return {
                                season: 1,
                                number: i + 1,
                                link: $(l).attr('href')!.replace('anime/', ''),
                                title: $(l).attr('title')!.split(': ').slice(-1).join(''),
                            }
                        }),
                }],
            };
        }
    }

    static async search(query: string) {
        const response = await fetch(this._url(`api/ajax/fastSearch?getNome=${query}&requestOrder=10`));
        const json = await response.json();
        return json.suggests.map((result: any) => ({ slug: result.clean, title: result.nome }));
    }

}

export default DreamSub;