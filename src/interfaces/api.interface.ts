
export interface Page<T> {
    page: number;
    pageSize: number;
    items: T[];
}