// ============================================================
// Domain model
// ============================================================

/**
 * Represents one customer record after the input file
 * has been parsed successfully.
 */
type CustomerRecord = {
  id: number;
  name: string;
  email: string;
};

// ============================================================
// Parser abstraction
// ============================================================

/**
 * Abstraction for file parsers.
 *
 * FileProcessingJob depends on this interface instead of depending
 * directly on CsvFileParser or JsonFileParser.
 *
 * This supports loose coupling and makes the processing job easier
 * to configure, extend, and test.
 */
interface FileParser {
  parse(fileContents: string): CustomerRecord[];
}

// ============================================================
// Concrete parser implementations
// ============================================================

/**
 * Parses customer records from CSV text.
 *
 * Expected input format:
 *
 * id,name,email
 * 1,Alice Johnson,alice@example.com
 * 2,Bob Smith,bob@example.com
 */
class CsvFileParser implements FileParser {
  public parse(fileContents: string): CustomerRecord[] {
    console.log("Parsing file contents as CSV...");

    const lines = fileContents
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < 2) {
      throw new Error(
        "CSV file must contain a header and at least one record.",
      );
    }

    // Remove the header row.
    const dataLines = lines.slice(1);

    return dataLines.map((line, index) => {
      const columns = line.split(",");

      if (columns.length !== 3) {
        throw new Error(
          `Invalid CSV record on data line ${index + 1}.`,
        );
      }

      const [idText, name, email] = columns;

      return {
        id: Number(idText.trim()),
        name: name.trim(),
        email: email.trim(),
      };
    });
  }
}

/**
 * Parses customer records from JSON text.
 *
 * Expected input format:
 *
 * [
 *   {
 *     "id": 1,
 *     "name": "Alice Johnson",
 *     "email": "alice@example.com"
 *   }
 * ]
 */
class JsonFileParser implements FileParser {
  public parse(fileContents: string): CustomerRecord[] {
    console.log("Parsing file contents as JSON...");

    const parsedData: unknown = JSON.parse(fileContents);

    if (!Array.isArray(parsedData)) {
      throw new Error(
        "JSON file must contain an array of customer records.",
      );
    }

    // The shared validation step in FileProcessingJob will verify
    // the fields of every returned record.
    return parsedData as CustomerRecord[];
  }
}

/**
 * Parses customer records from pipe-delimited text.
 *
 * Expected input format:
 *
 * 1|Alice Johnson|alice@example.com
 * 2|Bob Smith|bob@example.com
 */
class PipeDelimitedFileParser implements FileParser {
  public parse(fileContents: string): CustomerRecord[] {
    console.log(
      "Parsing file contents as pipe-delimited text...",
    );

    const lines = fileContents
      .trim()
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    return lines.map((line, index) => {
      const columns = line.split("|");

      if (columns.length !== 3) {
        throw new Error(
          `Invalid pipe-delimited record on line ${index + 1}.`,
        );
      }

      const [idText, name, email] = columns;

      return {
        id: Number(idText.trim()),
        name: name.trim(),
        email: email.trim(),
      };
    });
  }
}

// ============================================================
// File-reading abstraction
// ============================================================

/**
 * Abstraction for reading file contents.
 *
 * FileProcessingJob depends on this interface rather than on a
 * particular file-system implementation.
 */
interface FileContentReader {
  read(filePath: string): string;
}

/**
 * Simulated file reader.
 *
 * This implementation stores file contents in memory so that the
 * example can run without using Node.js file-system APIs.
 */
class InMemoryFileContentReader implements FileContentReader {
  public constructor(
    private readonly files: ReadonlyMap<string, string>,
  ) {}

  public read(filePath: string): string {
    console.log(`Reading file: ${filePath}`);

    const contents = this.files.get(filePath);

    if (contents === undefined) {
      throw new Error(`File not found: ${filePath}`);
    }

    if (contents.trim().length === 0) {
      throw new Error(`File is empty: ${filePath}`);
    }

    return contents;
  }
}

// ============================================================
// Repository abstraction
// ============================================================

/**
 * Abstraction for storing customer records.
 *
 * FileProcessingJob does not need to know whether records are
 * stored in a database, written to a file, or sent to an API.
 */
interface CustomerRepository {
  saveAll(records: CustomerRecord[]): void;
}

/**
 * Simple repository implementation that prints saved records.
 *
 * A real implementation could use a relational database,
 * document database, or external web service.
 */
class ConsoleCustomerRepository implements CustomerRepository {
  public saveAll(records: CustomerRecord[]): void {
    console.log(`Saving ${records.length} customer records...`);

    for (const record of records) {
      console.log(
        `Saved customer: ${record.id}, ${record.name}, ${record.email}`,
      );
    }
  }
}

// ============================================================
// Processing service
// ============================================================

/**
 * Coordinates the complete file-processing workflow.
 *
 * This class does not create its dependencies.
 *
 * The parser, file reader, and repository are supplied from outside
 * through the constructor. This is constructor-based dependency
 * injection.
 */
class FileProcessingJob {
  public constructor(
    private readonly parser: FileParser,
    private readonly fileReader: FileContentReader,
    private readonly customerRepository: CustomerRepository,
  ) {}

  /**
   * Runs the stable processing workflow:
   *
   * 1. Read the file.
   * 2. Parse its contents.
   * 3. Validate the records.
   * 4. Save the records.
   * 5. Report success or failure.
   */
  public run(filePath: string): void {
    console.log("\n========================================");
    console.log(`Starting processing job for ${filePath}`);
    console.log("========================================");

    try {
      // The reader implementation was injected through the constructor.
      const fileContents = this.fileReader.read(filePath);

      // The parser implementation was also injected.
      //
      // FileProcessingJob does not know whether this is a CSV,
      // JSON, or pipe-delimited parser.
      const records = this.parser.parse(fileContents);

      this.validate(records);

      // The repository implementation was injected as well.
      this.customerRepository.saveAll(records);

      console.log(`Successfully processed ${filePath}`);
    } catch (error: unknown) {
      this.handleError(filePath, error);
    } finally {
      console.log(`Finished processing job for ${filePath}`);
    }
  }

  /**
   * Shared validation logic.
   *
   * Every parser returns CustomerRecord objects, so all formats can
   * use the same validation process.
   */
  private validate(records: CustomerRecord[]): void {
    console.log("Validating customer records...");

    if (records.length === 0) {
      throw new Error(
        "The file did not contain any customer records.",
      );
    }

    for (const record of records) {
      if (!Number.isInteger(record.id) || record.id <= 0) {
        throw new Error(
          `Invalid customer ID: ${String(record.id)}`,
        );
      }

      if (
        typeof record.name !== "string" ||
        record.name.trim().length === 0
      ) {
        throw new Error(
          `Customer ${record.id} does not have a valid name.`,
        );
      }

      if (
        typeof record.email !== "string" ||
        !record.email.includes("@")
      ) {
        throw new Error(
          `Customer ${record.id} does not have a valid email.`,
        );
      }
    }

    console.log(`${records.length} customer records are valid.`);
  }

  /**
   * Shared error-handling logic.
   */
  private handleError(filePath: string, error: unknown): void {
    const message =
      error instanceof Error
        ? error.message
        : "An unknown processing error occurred.";

    console.error(`Failed to process ${filePath}: ${message}`);
  }
}

// ============================================================
// Composition root
// ============================================================

/**
 * The composition root is the part of the application where
 * concrete objects are created and connected together.
 *
 * FileProcessingJob does not decide which parser, reader, or
 * repository to use. Those decisions are made here.
 */

const files = new Map<string, string>([
  [
    "customers.csv",
    `
id,name,email
1,Alice Johnson,alice@example.com
2,Bob Smith,bob@example.com
`,
  ],
  [
    "customers.json",
    `
[
  {
    "id": 3,
    "name": "Carol Williams",
    "email": "carol@example.com"
  },
  {
    "id": 4,
    "name": "David Brown",
    "email": "david@example.com"
  }
]
`,
  ],
  [
    "customers.txt",
    `
5|Emma Davis|emma@example.com
6|Frank Miller|frank@example.com
`,
  ],
]);

// These dependencies can be shared by multiple processing jobs.
const fileReader = new InMemoryFileContentReader(files);
const customerRepository = new ConsoleCustomerRepository();

// Each processing job receives a different parser implementation.
const csvProcessingJob = new FileProcessingJob(
  new CsvFileParser(),
  fileReader,
  customerRepository,
);

const jsonProcessingJob = new FileProcessingJob(
  new JsonFileParser(),
  fileReader,
  customerRepository,
);

const pipeDelimitedProcessingJob = new FileProcessingJob(
  new PipeDelimitedFileParser(),
  fileReader,
  customerRepository,
);

// ============================================================
// Run the processing jobs
// ============================================================

csvProcessingJob.run("customers.csv");

jsonProcessingJob.run("customers.json");

pipeDelimitedProcessingJob.run("customers.txt");