import SeriesDate from './series_date.interface';
import Season from './season.interface';

export default interface Series {
    title: string;
    language: string | null;
    duration: string | null;
    date: SeriesDate | null;
    japanese_title: string | null;
    seasons: Array<Season>;
}

