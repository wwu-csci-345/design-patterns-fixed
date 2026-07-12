/*
 * Data Service Using the Decorator Pattern
 *
 * Responsibilities are separated into independent classes:
 *
 * - BasicDataService fetches the original data.
 * - LoggingDataServiceDecorator adds logging.
 * - CompressionDataServiceDecorator adds compression.
 * - EncryptionDataServiceDecorator adds encryption.
 * - CachingDataServiceDecorator adds caching.
 *
 * Because every class implements DataService, decorators can be combined
 * in different orders without modifying the original data service.
 */

/*
 * Component interface
 *
 * Both the basic service and all decorators implement this interface.
 * This allows the client to treat decorated and undecorated services
 * in exactly the same way.
 */
interface DataService {
  fetchData(): string;
}

/*
 * Concrete Component
 *
 * This class provides only the core responsibility:
 * retrieving the original application data.
 *
 * It does not know anything about logging, compression, encryption,
 * or caching.
 */
class BasicDataService implements DataService {
  fetchData(): string {
    /*
     * In a real application, this could:
     *
     * - Query a database
     * - Call a REST API
     * - Read a file
     * - Contact another service
     */
    return 'Important application data';
  }
}

/*
 * Base Decorator
 *
 * This abstract class implements the same DataService interface and stores
 * a reference to another DataService object.
 *
 * Concrete decorators extend this class and add behavior before or after
 * delegating the operation to the wrapped service.
 */
abstract class DataServiceDecorator implements DataService {
  /*
   * The wrapped service may be:
   *
   * - BasicDataService
   * - Another decorator
   *
   * This is what allows decorators to be stacked.
   */
  protected readonly wrappedService: DataService;

  constructor(service: DataService) {
    this.wrappedService = service;
  }

  /*
   * The base implementation simply delegates to the wrapped service.
   *
   * Concrete decorators can override this method to add behavior.
   */
  fetchData(): string {
    return this.wrappedService.fetchData();
  }
}

/*
 * Concrete Decorator: Logging
 *
 * Adds logging before and after data retrieval.
 *
 * It does not need to know whether the wrapped service is a basic service,
 * a compression decorator, an encryption decorator, or another decorator.
 */
class LoggingDataServiceDecorator extends DataServiceDecorator {
  fetchData(): string {
    console.log('Starting data retrieval...');

    /*
     * Delegate the actual work to the wrapped service.
     */
    const data = this.wrappedService.fetchData();

    console.log('Data retrieval completed.');

    return data;
  }
}

/*
 * Concrete Decorator: Compression
 *
 * Adds compression to the result returned by the wrapped service.
 */
class CompressionDataServiceDecorator extends DataServiceDecorator {
  fetchData(): string {
    /*
     * First, retrieve the result from the wrapped service.
     */
    const originalData = this.wrappedService.fetchData();

    /*
     * Then apply the additional compression behavior.
     */
    const compressedData = this.compress(originalData);

    return compressedData;
  }

  /*
   * Demonstration-only compression.
   *
   * This removes whitespace to simulate a smaller representation.
   * It is not a real compression algorithm.
   */
  private compress(data: string): string {
    return data.replace(/\s+/g, '');
  }
}

/*
 * Concrete Decorator: Encryption
 *
 * Adds encoding to the result returned by the wrapped service.
 *
 * Base64 is used only to demonstrate data transformation.
 * Base64 is not secure encryption.
 */
class EncryptionDataServiceDecorator extends DataServiceDecorator {
  fetchData(): string {
    /*
     * Retrieve the result from the wrapped service.
     */
    const originalData = this.wrappedService.fetchData();

    /*
     * Transform the result before returning it.
     */
    const encryptedData = this.encrypt(originalData);

    return encryptedData;
  }

  /*
   * Browser-compatible Base64 encoding.
   *
   * TextEncoder converts the string into UTF-8 bytes.
   * btoa then converts the byte sequence into Base64.
   */
  private encrypt(data: string): string {
    const bytes = new TextEncoder().encode(data);

    let binary = '';

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary);
  }
}

/*
 * Concrete Decorator: Caching
 *
 * Stores the result returned by the wrapped service.
 *
 * On later requests, it returns the cached value instead of calling
 * the wrapped service again.
 */
class CachingDataServiceDecorator extends DataServiceDecorator {
  /*
   * null means no data has been cached yet.
   */
  private cachedData: string | null = null;

  fetchData(): string {
    /*
     * Return the cached result when one already exists.
     */
    if (this.cachedData !== null) {
      console.log('Returning data from cache.');

      return this.cachedData;
    }

    /*
     * Otherwise, retrieve the result from the wrapped service.
     */
    console.log('No cached data found.');

    const data = this.wrappedService.fetchData();

    /*
     * Cache exactly what this decorator receives.
     *
     * The location of this decorator in the chain determines whether
     * it caches raw data, compressed data, encrypted data, or another
     * transformed representation.
     */
    this.cachedData = data;

    console.log('Data stored in cache.');

    return data;
  }

  /*
   * Clears the cached result.
   *
   * Cache management belongs only to the caching decorator rather than
   * being placed inside the basic data service.
   */
  clearCache(): void {
    this.cachedData = null;

    console.log('Cache cleared.');
  }
}

/*
 * Client Code
 */

/*
 * Start with the basic service.
 *
 * At this point, the service only retrieves the original data.
 */
const basicService: DataService = new BasicDataService();

/*
 * Build the decorator chain.
 *
 * The final structure is:
 *
 * CachingDataServiceDecorator
 *     -> LoggingDataServiceDecorator
 *         -> EncryptionDataServiceDecorator
 *             -> CompressionDataServiceDecorator
 *                 -> BasicDataService
 *
 * Processing order:
 *
 * 1. Caching checks whether a result already exists.
 * 2. Logging records the start of the operation.
 * 3. Encryption requests data from compression.
 * 4. Compression requests the original data.
 * 5. BasicDataService returns the original data.
 * 6. Compression removes whitespace.
 * 7. Encryption encodes the compressed data.
 * 8. Logging records completion.
 * 9. Caching stores the final result.
 */
const compressedService: DataService = new CompressionDataServiceDecorator(
  basicService,
);

const encryptedService: DataService = new EncryptionDataServiceDecorator(
  compressedService,
);

const loggedService: DataService = new LoggingDataServiceDecorator(
  encryptedService,
);

/*
 * Keep a reference to the concrete caching decorator because the client
 * may need to call clearCache().
 */
const cachedService = new CachingDataServiceDecorator(loggedService);

/*
 * The decorated object can still be treated as a DataService.
 */
const service: DataService = cachedService;

/*
 * First request
 *
 * No cached value exists, so the entire decorator chain runs.
 */
console.log('First request:');

const firstResult = service.fetchData();

console.log('Result:', firstResult);

/*
 * Second request
 *
 * The caching decorator returns the stored result immediately.
 * The inner logging, encryption, compression, and basic service objects
 * are not called.
 */
console.log('\nSecond request:');

const secondResult = service.fetchData();

console.log('Result:', secondResult);

/*
 * Clear the cache.
 */
console.log('\nClearing cache:');

cachedService.clearCache();

/*
 * Third request
 *
 * Because the cache was cleared, the full decorator chain runs again.
 */
console.log('\nThird request:');

const thirdResult = service.fetchData();

console.log('Result:', thirdResult);
