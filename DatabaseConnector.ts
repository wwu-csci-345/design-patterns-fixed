type DatabaseConfig = {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
};

/**
 * Defines the operations that a database connection must support.
 *
 * Depending on this interface rather than a concrete class makes
 * dependency injection easier and reduces coupling.
 */
interface IDatabaseConnection {
  connect(): void;
  disconnect(): void;
  query<T>(sql: string): T[];
  isConnectionOpen(): boolean;
}

/**
 * Handles database connection behavior only.
 *
 * This class does not manage its own singleton lifecycle.
 * It can be created normally and injected into another class.
 */
class DatabaseConnection implements IDatabaseConnection {
  private connected = false;

  public constructor(private readonly config: DatabaseConfig) {}

  public connect(): void {
    if (this.connected) {
      console.log('The database connection is already open.');
      return;
    }

    this.connected = true;

    console.log(
      `Connected to database "${this.config.database}" ` +
        `at ${this.config.host}:${this.config.port} ` +
        `as user "${this.config.username}".`,
    );
  }

  public query<T>(sql: string): T[] {
    if (!this.connected) {
      throw new Error(
        'Cannot execute a query because the database is not connected.',
      );
    }

    const normalizedSql = sql.trim();

    if (normalizedSql.length === 0) {
      throw new Error('The SQL query cannot be empty.');
    }

    console.log(`Executing SQL: ${normalizedSql}`);

    // Mock result for demonstration purposes.
    return [] as T[];
  }

  public disconnect(): void {
    if (!this.connected) {
      console.log('The database connection is already closed.');
      return;
    }

    this.connected = false;
    console.log('Disconnected from the database.');
  }

  public isConnectionOpen(): boolean {
    return this.connected;
  }
}

/**
 * Manages the lifecycle of one shared database connection.
 *
 * Singleton responsibility:
 * - Stores the single manager instance.
 * - Controls access to the shared connection.
 *
 * Dependency injection:
 * - Receives an IDatabaseConnection through its constructor.
 * - Does not create DatabaseConnection internally.
 */
class DatabaseConnectionManager {
  private static instance: DatabaseConnectionManager | null = null;

  private constructor(private readonly connection: IDatabaseConnection) {}

  /**
   * Creates the singleton manager on the first call.
   *
   * The database connection must be injected when the manager
   * is initialized for the first time.
   */
  public static getInstance(
    connection?: IDatabaseConnection,
  ): DatabaseConnectionManager {
    if (DatabaseConnectionManager.instance === null) {
      if (connection === undefined) {
        throw new Error(
          'A database connection is required when initializing the manager.',
        );
      }

      DatabaseConnectionManager.instance = new DatabaseConnectionManager(
        connection,
      );
    }

    return DatabaseConnectionManager.instance;
  }

  /**
   * Opens the managed connection.
   */
  public start(): void {
    this.connection.connect();
  }

  /**
   * Returns the shared connection to application services.
   */
  public getConnection(): IDatabaseConnection {
    return this.connection;
  }

  /**
   * Closes the managed connection.
   */
  public stop(): void {
    this.connection.disconnect();
  }
}

/**
 * A service that depends on the database abstraction.
 *
 * The connection is injected rather than obtained directly
 * from the singleton manager.
 */
class StudentRepository {
  public constructor(private readonly database: IDatabaseConnection) {}

  public findAll(): Student[] {
    return this.database.query<Student>('SELECT id, name, major FROM students');
  }
}

type Student = {
  id: number;
  name: string;
  major: string;
};

// Composition root:
// Create concrete dependencies in one central place.
const databaseConnection = new DatabaseConnection({
  host: 'localhost',
  port: 5432,
  database: 'student_records',
  username: 'admin',
  password: 'secret-password',
});

// Inject the connection into the singleton lifecycle manager.
const connectionManager =
  DatabaseConnectionManager.getInstance(databaseConnection);

// The manager controls when the shared connection is opened.
connectionManager.start();

// Obtain the shared connection and inject it into application services.
const studentRepository = new StudentRepository(
  connectionManager.getConnection(),
);

const students = studentRepository.findAll();

console.log('Students:', students);

// Calling getInstance() again returns the same manager.
const sameManager = DatabaseConnectionManager.getInstance();

console.log(connectionManager === sameManager); // true

console.log(connectionManager.getConnection() === sameManager.getConnection()); // true

// The manager controls when the connection is closed.
connectionManager.stop();
