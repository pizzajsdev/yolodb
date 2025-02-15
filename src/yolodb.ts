import fs from 'node:fs'
import path from 'node:path'
import superjson from 'superjson'

export type YoloDbLogger = (...args: any[]) => void

export class YoloDbError extends Error {
  constructor(message: string) {
    super(`[YoloDB] ${message}`)
    this.name = 'YoloDbError'
  }
}

export type YoloDbTableOptions = {
  logger?: YoloDbLogger
}

/**
 * Simple file-based JSON database built on top of SuperJSON.
 */
export class YoloDbTable<R extends Record<string, any>> {
  private readonly tableName: string
  private readonly pkField: keyof R
  private readonly filePath: string
  private readonly options: Required<YoloDbTableOptions>

  constructor(absoluteFilePath: string, pkField: keyof R, initialData: R[] = [], options?: YoloDbTableOptions) {
    const dirName = path.dirname(absoluteFilePath)

    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true })
    }

    this.tableName = path.basename(absoluteFilePath).replace('.json', '')
    this.pkField = pkField
    this.filePath = absoluteFilePath

    this.options = {
      logger: (...args) => console.debug(`[YoloDB] ${this.tableName}`, ...args),
      ...options,
    }

    if (!fs.existsSync(absoluteFilePath)) {
      this.saveFile(initialData)
    }
  }

  private get log(): YoloDbLogger {
    return this.options.logger
  }

  private getData(): R[] {
    const db = this.readFile()
    if (!Array.isArray(db)) {
      throw new YoloDbError(`Invalid data in ${this.filePath}`)
    }
    return db
  }

  all(): R[] {
    return this.getData()
  }

  readFile(): R[] {
    this.log(`Reading table from ${this.filePath}`)

    if (!fs.existsSync(this.filePath)) {
      this.saveFile([])
      return []
    }

    const fileContent = fs.readFileSync(this.filePath, 'utf8')
    return superjson.parse<R[]>(fileContent)
  }

  saveFile(db: R[]): void {
    this.log(`Saving table to ${this.filePath}`)
    fs.writeFileSync(this.filePath, JSON.stringify(superjson.serialize(db), null, 2))
  }

  findById(id: string): R | undefined {
    const db = this.getData()
    return db.find((record) => record[this.pkField] === id)
  }

  findBy(field: keyof R, value: any): R[] {
    const db = this.getData()
    return db.filter((record) => record[field] === value)
  }

  findFirstBy(field: keyof R, value: any): R | undefined {
    const db = this.getData()
    return db.find((record) => record[field] === value)
  }

  search(filterFn: (record: R) => boolean): R[] {
    const db = this.getData()
    return db.filter((record) => filterFn(record))
  }

  insert(record: R): void {
    const pk = record[this.pkField]
    if (!pk) {
      throw new YoloDbError(`Record does not have a primary key: ${this.tableName}.${String(this.pkField)}`)
    }

    const db = this.getData()
    db.push(record)

    this.saveFile(db)
  }

  insertMany(records: R[]): void {
    const db = this.getData()
    db.push(...records)

    this.saveFile(db)
  }

  update(record: Partial<R>): void {
    const pk = record[this.pkField]
    if (!pk) {
      throw new YoloDbError(`Record not found in ${this.tableName}: ${pk}`)
    }

    const db = this.getData()

    for (const currentRecord of db) {
      if (currentRecord[this.pkField] === pk) {
        Object.assign(currentRecord, record)
        break
      }
    }

    this.saveFile(db)
  }

  updateMany(records: Array<Partial<R>>): void {
    records.forEach((record) => this.update(record))
  }

  delete(id: string): void {
    this.deleteMany([id])
  }

  deleteMany(ids: string[]): void {
    this.log(`Deleting ${ids.length} records`)
    const db = this.getData().filter((record) => !ids.includes(record[this.pkField]))

    this.saveFile(db)
  }

  truncate(): void {
    this.saveFile([])
  }
}

export class YoloDbRepository<R extends Record<string, any>> {
  protected table: YoloDbTable<R>

  constructor(dataPath: string, pkField: keyof R) {
    this.table = yolodb<R>(dataPath, pkField, [])
  }
}

// In-memory cache of YoloDB table instances
const _yoloDbTables: Record<string, YoloDbTable<any>> = {}

/**
 * Helper function to create a new YoloDB table.
 * It reuses the same table instance if the same file path is used.
 */
export function yolodb<R extends Record<string, any>>(
  filePath: string,
  pkField: keyof R,
  initialData: R[],
  options?: YoloDbTableOptions,
): YoloDbTable<R> {
  if (!_yoloDbTables[filePath]) {
    _yoloDbTables[filePath] = new YoloDbTable<R>(filePath, pkField, initialData, options)
  }
  return _yoloDbTables[filePath]
}
