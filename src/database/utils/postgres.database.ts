export class QueryBuilder {
    private queryParts: string[] = [];
    private filtersActive: boolean = false;
    private groupByActive: boolean = false;
    private orderByActive: boolean = false;

    constructor(select: string) {
        this.queryParts.push(select);
    }

    public addFilter(filterQuery: string) {
        this.queryParts.push(this.filtersActive ? " AND " : " WHERE ");
        this.queryParts.push(filterQuery);
        this.filtersActive = true;
    }

    public addGroupBy(groupBy: string) {
        this.queryParts.push(this.groupByActive ? " , ":" GROUP BY ");
        this.queryParts.push(groupBy);
        this.groupByActive = true;
    }

    public addOrderBy(orderBy: string) {
        this.queryParts.push(this.orderByActive ? " , ":" ORDER BY ");
        this.queryParts.push(orderBy);
        this.orderByActive = true;
    }

    public addPagination(page: number, limit: number) {
        this.queryParts.push(` LIMIT ${limit} OFFSET ${ page * limit}`);
    }

    public build(): string {
        this.queryParts.push(";");
        return this.queryParts.join("");
    }
}