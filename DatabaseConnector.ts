type DatabaseConfig = { host: string; port: number; database: string; username: string };

interface Logger { info(msg: string): void }

interface QueryExecutor {                       // ISP: what consumers need
  query(sql: string, params?: unknown[]): Promise<unknown[]>;
}

interface Database extends QueryExecutor {      // what the owner needs
  close(): Promise<void>;
}

class PostgresDatabase implements Database {
  private open = true;

  // Only reachable through open(): no "unconnected" instances exist
  private constructor(
    private readonly config: DatabaseConfig,
    private readonly logger: Logger,
  ) {}

  static async open(config: DatabaseConfig, logger: Logger): Promise<PostgresDatabase> {
    // ...real connect logic here...
    logger.info(`Connected to ${config.database} at ${config.host}:${config.port}`);
    return new PostgresDatabase(config, logger);
  }

  async query(sql: string, params: unknown[] = []): Promise<unknown[]> {
    if (!this.open) throw new Error('Database is closed.');
    this.logger.info(`Executing SQL: ${sql}`);
    return [];
  }

  async close(): Promise<void> {
    if (!this.open) return;                     // idempotent
    this.open = false;
    this.logger.info('Disconnected from database.');
  }
}

// High-level code depends on the abstraction (DIP)
class StudentRepository {
  constructor(private readonly db: QueryExecutor) {}
  findAll() { return this.db.query('SELECT * FROM students'); }
}

// Composition root: the ONE place that decides "one shared instance"
async function main() {
  const db = await PostgresDatabase.open(
    { host: 'localhost', port: 5432, database: 'student_records', username: 'admin' },
    { info: console.log },
  );
  const students = new StudentRepository(db);
  await students.findAll();
  await db.close();
}