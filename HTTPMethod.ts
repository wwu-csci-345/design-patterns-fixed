// The HTTP methods supported by this example.
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Represents the final HTTP request.
 *
 * This class is the "product" created by HttpRequestBuilder.
 *
 * The object is immutable after construction:
 * - All properties are readonly.
 * - Header and query-parameter objects are copied before being stored.
 *
 * The constructor is intentionally kept separate from the builder.
 * The builder is responsible for gathering configuration, applying
 * defaults, and validating the complete request.
 */
class HttpRequest {
  public readonly url: string;
  public readonly method: HttpMethod;
  public readonly headers: Readonly<Record<string, string>>;
  public readonly queryParameters: Readonly<Record<string, string>>;
  public readonly body: string | null;
  public readonly timeout: number;
  public readonly retryCount: number;

  public constructor(config: {
    url: string;
    method: HttpMethod;
    headers: Record<string, string>;
    queryParameters: Record<string, string>;
    body: string | null;
    timeout: number;
    retryCount: number;
  }) {
    this.url = config.url;
    this.method = config.method;

    // Copy mutable objects so the completed request does not share
    // the builder's internal header or query-parameter objects.
    this.headers = { ...config.headers };
    this.queryParameters = { ...config.queryParameters };

    this.body = config.body;
    this.timeout = config.timeout;
    this.retryCount = config.retryCount;
  }

  /**
   * Returns the complete URL, including encoded query parameters.
   */
  public getFullUrl(): string {
    const entries = Object.entries(this.queryParameters);

    if (entries.length === 0) {
      return this.url;
    }

    const queryString = entries
      .map(([name, value]) => {
        return `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    // Use "&" when the original URL already contains a query string.
    const separator = this.url.includes('?') ? '&' : '?';

    return `${this.url}${separator}${queryString}`;
  }

  /**
   * Displays the request configuration.
   *
   * This method does not send the request. It is included only so the
   * completed product can be inspected in this demonstration.
   */
  public describe(): void {
    console.log('HTTP Request');
    console.log('------------');
    console.log(`Method: ${this.method}`);
    console.log(`URL: ${this.getFullUrl()}`);
    console.log(`Timeout: ${this.timeout} ms`);
    console.log(`Retry count: ${this.retryCount}`);
    console.log('Headers:', this.headers);
    console.log('Body:', this.body);
  }
}

/**
 * Constructs HttpRequest objects step by step.
 *
 * This class is the "builder" in the Builder pattern.
 *
 * It temporarily stores an incomplete request while the caller provides
 * configuration through descriptive methods such as:
 *
 * - setUrl()
 * - setMethod()
 * - addHeader()
 * - setJsonBody()
 * - setTimeout()
 *
 * The final HttpRequest is not created until build() is called.
 */
class HttpRequestBuilder {
  // The URL is required, so null represents "not supplied yet."
  private url: string | null = null;

  // Optional properties receive sensible default values.
  private method: HttpMethod = 'GET';
  private headers: Record<string, string> = {};
  private queryParameters: Record<string, string> = {};
  private body: string | null = null;
  private timeout = 5000;
  private retryCount = 0;

  /**
   * Sets the destination URL.
   */
  public setUrl(url: string): this {
    this.url = url;
    return this;
  }

  /**
   * Sets the HTTP method.
   */
  public setMethod(method: HttpMethod): this {
    this.method = method;
    return this;
  }

  /**
   * Adds or replaces one HTTP header.
   *
   * Calling this method multiple times with the same name replaces
   * the previous value.
   */
  public addHeader(name: string, value: string): this {
    this.headers[name] = value;
    return this;
  }

  /**
   * Replaces all existing headers.
   *
   * A copy is stored so the caller cannot later mutate the builder
   * by changing the original headers object.
   */
  public setHeaders(headers: Record<string, string>): this {
    this.headers = { ...headers };
    return this;
  }

  /**
   * Adds or replaces one query parameter.
   */
  public addQueryParameter(name: string, value: string): this {
    this.queryParameters[name] = value;
    return this;
  }

  /**
   * Replaces all existing query parameters.
   */
  public setQueryParameters(
    queryParameters: Record<string, string>,
  ): this {
    this.queryParameters = { ...queryParameters };
    return this;
  }

  /**
   * Sets a raw string body.
   *
   * The caller is responsible for selecting the correct Content-Type
   * header when using this method.
   */
  public setBody(body: string): this {
    this.body = body;
    return this;
  }

  /**
   * Serializes a value as JSON and automatically adds the appropriate
   * Content-Type header.
   *
   * This is an example of an intention-revealing builder operation.
   * The caller does not need to separately call JSON.stringify() and
   * manually configure the content type.
   */
  public setJsonBody(value: unknown): this {
    this.body = JSON.stringify(value);
    this.headers['Content-Type'] = 'application/json';
    return this;
  }

  /**
   * Removes any previously configured request body.
   */
  public clearBody(): this {
    this.body = null;
    return this;
  }

  /**
   * Sets the timeout in milliseconds.
   *
   * This setter validates a value that can be checked independently.
   */
  public setTimeout(timeout: number): this {
    if (!Number.isFinite(timeout) || timeout <= 0) {
      throw new Error('Timeout must be a positive number.');
    }

    this.timeout = timeout;
    return this;
  }

  /**
   * Sets the number of retries allowed after request failure.
   */
  public setRetryCount(retryCount: number): this {
    if (!Number.isInteger(retryCount) || retryCount < 0) {
      throw new Error(
        'Retry count must be a non-negative integer.',
      );
    }

    this.retryCount = retryCount;
    return this;
  }

  /**
   * Validates the complete construction state and creates the final
   * immutable HttpRequest object.
   *
   * Cross-property validation belongs here because it depends on more
   * than one builder field. For example, whether a body is allowed
   * depends on the selected HTTP method.
   */
  public build(): HttpRequest {
    if (this.url === null || this.url.trim() === '') {
      throw new Error('A non-empty request URL is required.');
    }

    // This is a demonstration rule. Some HTTP systems permit bodies on
    // DELETE requests, but this example deliberately prohibits them.
    if (
      this.body !== null &&
      (this.method === 'GET' || this.method === 'DELETE')
    ) {
      throw new Error(
        `${this.method} requests cannot contain a body.`,
      );
    }

    return new HttpRequest({
      url: this.url,
      method: this.method,
      headers: this.headers,
      queryParameters: this.queryParameters,
      body: this.body,
      timeout: this.timeout,
      retryCount: this.retryCount,
    });
  }

  /**
   * Restores the builder to its original default state.
   *
   * This method is useful when the same builder instance is reused.
   * In many applications, however, creating a fresh builder for each
   * request is clearer and safer.
   */
  public reset(): this {
    this.url = null;
    this.method = 'GET';
    this.headers = {};
    this.queryParameters = {};
    this.body = null;
    this.timeout = 5000;
    this.retryCount = 0;

    return this;
  }
}

/*
 * Example 1: A simple GET request
 *
 * The method, timeout, retry count, headers, query parameters, and body
 * all use their default values.
 */
const getUserRequest = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users/42')
  .build();

getUserRequest.describe();

/*
 * Example 2: A GET request with query parameters
 */
const searchUsersRequest = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users')
  .addQueryParameter('status', 'active')
  .addQueryParameter('department', 'Computer Science')
  .addQueryParameter('page', '1')
  .setTimeout(3000)
  .build();

searchUsersRequest.describe();

/*
 * Example 3: A POST request with a JSON body
 *
 * setJsonBody() both serializes the object and adds:
 *
 * Content-Type: application/json
 */
const createUserRequest = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users')
  .setMethod('POST')
  .addHeader('Authorization', 'Bearer example-token')
  .setJsonBody({
    name: 'Alice',
    email: 'alice@example.com',
  })
  .setTimeout(10_000)
  .setRetryCount(3)
  .build();

createUserRequest.describe();

/*
 * Example 4: A PATCH request
 */
const updateUserRequest = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users/42')
  .setMethod('PATCH')
  .addHeader('Authorization', 'Bearer example-token')
  .setJsonBody({
    email: 'new-address@example.com',
  })
  .setRetryCount(2)
  .build();

updateUserRequest.describe();

/*
 * Example 5: Building several requests with fresh builder instances
 *
 * This is generally safer than reusing the same mutable builder.
 */
const deleteUserRequest = new HttpRequestBuilder()
  .setUrl('https://api.example.com/users/42')
  .setMethod('DELETE')
  .addHeader('Authorization', 'Bearer example-token')
  .build();

deleteUserRequest.describe();

/*
 * Example 6: Invalid construction
 *
 * build() rejects a GET request that contains a body because the
 * combination violates this example's request rules.
 */
try {
  const invalidRequest = new HttpRequestBuilder()
    .setUrl('https://api.example.com/users')
    .setMethod('GET')
    .setJsonBody({
      name: 'Alice',
    })
    .build();

  invalidRequest.describe();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Could not create request: ${error.message}`);
  } else {
    console.error('An unknown error occurred.');
  }
}

/*
 * Example 7: Invalid construction caused by a missing required URL
 *
 * The builder may temporarily be incomplete, but build() will not produce
 * an invalid HttpRequest.
 */
try {
  const missingUrlRequest = new HttpRequestBuilder()
    .setMethod('POST')
    .setJsonBody({
      name: 'Alice',
    })
    .build();

  missingUrlRequest.describe();
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(`Could not create request: ${error.message}`);
  } else {
    console.error('An unknown error occurred.');
  }
}