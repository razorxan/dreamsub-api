import Episode from './episode.interface'

export default interface Season {
    title: string;
    number: number;
    episodes: Array<Episode>;
};