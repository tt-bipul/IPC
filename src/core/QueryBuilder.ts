type Value = string | number | boolean | null

type JoinType = "INNER" | "LEFT" | "RIGHT"

type OperationType = "SELECT" | "INSERT" | "UPDATE"

export default class QueryBuilder {
  private table?: string
  private columns: string[] = []
  private joins: string[] = []
  private wheres: string[] = []
  private params: Value[] = []
  private orderByValue?: string
  private limitValue?: number
  private offsetValue?: number
  private softDeleteColumn?: string
  private includeDeleted = false
  private operation: OperationType = "SELECT"
  private insertData: Record<string, Value> = {}
  private updateData: Record<string, Value> = {}
  private onDuplicateKeyUpdate: string[] = []

  static selectAll(): QueryBuilder {
    return new QueryBuilder()
  }

  static insert(table: string): QueryBuilder {
    const qb = new QueryBuilder()
    qb.operation = "INSERT"
    qb.table = table
    return qb
  }

  static update(table: string): QueryBuilder {
    const qb = new QueryBuilder()
    qb.operation = "UPDATE"
    qb.table = table
    return qb
  }

  data(data: Record<string, Value>): this {
    if (this.operation === "INSERT") {
      this.insertData = { ...this.insertData, ...data }
    } else if (this.operation === "UPDATE") {
      this.updateData = { ...this.updateData, ...data }
    }
    return this
  }

  set(column: string, value: Value): this {
    if (this.operation === "UPDATE") {
      this.updateData[column] = value
    }
    return this
  }

  onDuplicate(updates: string[]): this {
    this.onDuplicateKeyUpdate = updates
    return this
  }

  select(columns: string[]): this {
    this.columns = columns
    return this
  }

  from(table: string): this {
    this.table = table
    return this
  }

  join(
    table: string,
    left: string,
    operator: "=" | ">" | "<" | ">=" | "<=",
    right: string,
    type: JoinType = "INNER"
  ): this {
    this.joins.push(`${type} JOIN ${table} ON ${left} ${operator} ${right}`)
    return this
  }

  where(column: string, value: Value): this {
    this.wheres.push(`${column} = ?`)
    this.params.push(value)
    return this
  }

  whereIn(column: string, values: Value[]): this {
    const placeholders = values.map(() => "?").join(", ")
    this.wheres.push(`${column} IN (${placeholders})`)
    this.params.push(...values)
    return this
  }

  softDelete(column = "deleted_at"): this {
    this.softDeleteColumn = column
    return this
  }

  withDeleted(): this {
    this.includeDeleted = true
    return this
  }

  orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): this {
    this.orderByValue = `${column} ${direction}`
    return this
  }

  paginate(page: number, perPage: number): this {
    const p = page < 1 ? 1 : page
    this.limitValue = perPage
    this.offsetValue = (p - 1) * perPage
    return this
  }

  limit(limit: number): this {
    this.limitValue = limit
    return this
  }

  offset(offset: number): this {
    this.offsetValue = offset
    return this
  }

  build(): { sql: string; params: Value[] } {
    if (!this.table) {
      throw new Error("Table is required")
    }

    switch (this.operation) {
      case "INSERT":
        return this.buildInsert()
      case "UPDATE":
        return this.buildUpdate()
      default:
        return this.buildSelect()
    }
  }

  private buildSelect(): { sql: string; params: Value[] } {
    const selectClause =
      this.columns.length > 0 ? this.columns.join(", ") : "*"

    let sql = `SELECT ${selectClause} FROM ${this.table}`

    if (this.joins.length) {
      sql += ` ${this.joins.join(" ")}`
    }

    if (this.softDeleteColumn && !this.includeDeleted) {
      this.wheres.push(`${this.softDeleteColumn} IS NULL`)
    }

    if (this.wheres.length) {
      sql += ` WHERE ${this.wheres.join(" AND ")}`
    }

    if (this.orderByValue) {
      sql += ` ORDER BY ${this.orderByValue}`
    }

    if (this.limitValue !== undefined) {
      sql += ` LIMIT ${this.limitValue}`
    }

    if (this.offsetValue !== undefined) {
      sql += ` OFFSET ${this.offsetValue}`
    }

    return { sql, params: this.params }
  }

  private buildInsert(): { sql: string; params: Value[] } {
    const columns = Object.keys(this.insertData)
    const values = Object.values(this.insertData)
    const placeholders = columns.map(() => "?").join(", ")

    if (columns.length === 0) {
      throw new Error("No data provided for INSERT")
    }

    let sql = `INSERT INTO ${this.table} (${columns.join(", ")}) VALUES (${placeholders})`

    if (this.onDuplicateKeyUpdate.length > 0) {
      sql += ` ON DUPLICATE KEY UPDATE ${this.onDuplicateKeyUpdate.join(", ")}`
    }

    return { sql, params: values }
  }

  private buildUpdate(): { sql: string; params: Value[] } {
    const columns = Object.keys(this.updateData)
    const values = Object.values(this.updateData)

    if (columns.length === 0) {
      throw new Error("No data provided for UPDATE")
    }

    const setClause = columns.map((col) => `${col} = ?`).join(", ")

    let sql = `UPDATE ${this.table} SET ${setClause}`

    if (this.wheres.length) {
      sql += ` WHERE ${this.wheres.join(" AND ")}`
    }

    return { sql, params: [...values, ...this.params] }
  }
}
