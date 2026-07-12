export {};

/**
 * Represents the input video file.
 *
 * This class stores basic information about the source file and provides
 * helper methods for extracting the filename and extension.
 */
class VideoFile {
  constructor(public readonly filename: string) {}

  /**
   * Returns the file extension without the leading period.
   *
   * Example:
   * "lecture.mov" -> "mov"
   */
  getExtension(): string {
    const lastDotIndex = this.filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
      throw new Error(
        `The file "${this.filename}" does not have an extension.`,
      );
    }

    return this.filename.substring(lastDotIndex + 1).toLowerCase();
  }

  /**
   * Returns the filename without its extension.
   *
   * Example:
   * "lecture.mov" -> "lecture"
   */
  getBaseName(): string {
    const lastDotIndex = this.filename.lastIndexOf('.');

    if (lastDotIndex === -1) {
      return this.filename;
    }

    return this.filename.substring(0, lastDotIndex);
  }
}

/**
 * Represents a video codec.
 *
 * Different codec implementations support different output formats.
 */
interface VideoCodec {
  getName(): string;
  getFileExtension(): string;
}

/**
 * Codec used to create MP4 video files.
 */
class Mp4Codec implements VideoCodec {
  getName(): string {
    return 'H.264 / MP4';
  }

  getFileExtension(): string {
    return 'mp4';
  }
}

/**
 * Codec used to create WebM video files.
 */
class WebMCodec implements VideoCodec {
  getName(): string {
    return 'VP9 / WebM';
  }

  getFileExtension(): string {
    return 'webm';
  }
}

/**
 * Creates the appropriate codec based on the requested output format.
 */
class CodecFactory {
  createCodec(outputFormat: string): VideoCodec {
    switch (outputFormat.toLowerCase()) {
      case 'mp4':
        return new Mp4Codec();

      case 'webm':
        return new WebMCodec();

      default:
        throw new Error(`Unsupported output format: "${outputFormat}".`);
    }
  }
}

/**
 * Represents raw video data after decoding.
 *
 * In a real application, this object might contain video frames,
 * audio samples, timestamps, and metadata.
 */
class DecodedVideo {
  constructor(
    public readonly sourceFilename: string,
    public readonly data: string,
  ) {}
}

/**
 * Represents video data after it has been resized.
 */
class ResizedVideo {
  constructor(
    public readonly sourceFilename: string,
    public readonly data: string,
    public readonly width: number,
    public readonly height: number,
  ) {}
}

/**
 * Represents encoded video data that is ready to be saved.
 */
class EncodedVideo {
  constructor(
    public readonly data: string,
    public readonly codec: VideoCodec,
  ) {}
}

/**
 * Reads and decodes the source video.
 */
class VideoDecoder {
  decode(videoFile: VideoFile): DecodedVideo {
    const sourceFormat = videoFile.getExtension();

    console.log(
      `Decoding "${videoFile.filename}" from ${sourceFormat.toUpperCase()} format...`,
    );

    // This string represents decoded video data for demonstration purposes.
    const decodedData = `decoded-data-from-${videoFile.filename}`;

    return new DecodedVideo(videoFile.filename, decodedData);
  }
}

/**
 * Changes the resolution of decoded video data.
 */
class VideoResizer {
  resize(
    decodedVideo: DecodedVideo,
    width: number,
    height: number,
  ): ResizedVideo {
    if (width <= 0 || height <= 0) {
      throw new Error('Video width and height must both be greater than zero.');
    }

    console.log(`Resizing video to ${width}x${height}...`);

    // This string represents resized video data for demonstration purposes.
    const resizedData = `${decodedVideo.data}-resized-to-${width}x${height}`;

    return new ResizedVideo(
      decodedVideo.sourceFilename,
      resizedData,
      width,
      height,
    );
  }
}

/**
 * Encodes resized video data using a selected codec.
 */
class VideoEncoder {
  encode(resizedVideo: ResizedVideo, codec: VideoCodec): EncodedVideo {
    console.log(`Encoding video using ${codec.getName()}...`);

    // This string represents encoded binary data for demonstration purposes.
    const encodedData = `${resizedVideo.data}-encoded-with-${codec.getName()}`;

    return new EncodedVideo(encodedData, codec);
  }
}

/**
 * Writes encoded video data to an output file.
 */
class VideoFileWriter {
  save(encodedVideo: EncodedVideo, outputFilename: string): void {
    console.log(`Saving converted video as "${outputFilename}"...`);

    // A real implementation would write binary data to the file system.
    console.log(`Saved data: ${encodedVideo.data}`);
  }
}

/**
 * Generates a thumbnail from decoded video data.
 */
class ThumbnailGenerator {
  generate(decodedVideo: DecodedVideo, outputFilename: string): void {
    console.log(
      `Generating thumbnail "${outputFilename}" from "${decodedVideo.sourceFilename}"...`,
    );

    // A real implementation would extract a frame and save it as an image.
  }
}

/**
 * Extracts metadata from the original video.
 */
class VideoMetadataExtractor {
  extract(videoFile: VideoFile): Record<string, string | number> {
    console.log(`Extracting metadata from "${videoFile.filename}"...`);

    // Example metadata used only for this demonstration.
    return {
      filename: videoFile.filename,
      format: videoFile.getExtension(),
      durationInSeconds: 3600,
    };
  }
}

/**
 * Represents the result of a complete video conversion operation.
 *
 * Returning a result object is cleaner than returning only the output
 * filename because the facade also generates a thumbnail and metadata.
 */
class VideoConversionResult {
  constructor(
    public readonly outputFilename: string,
    public readonly thumbnailFilename: string,
    public readonly metadata: Record<string, string | number>,
  ) {}
}

/**
 * FACADE
 *
 * This class provides a simple, high-level interface to the video
 * conversion subsystem.
 *
 * The client no longer needs to know:
 *
 * 1. Which subsystem classes are involved
 * 2. In what order the operations must occur
 * 3. Which intermediate objects must be passed between components
 * 4. How codecs are selected
 * 5. How output filenames are constructed
 * 6. When metadata and thumbnails are generated
 *
 * All of that workflow knowledge is centralized in this facade.
 */
class VideoConversionFacade {
  private readonly codecFactory: CodecFactory;
  private readonly decoder: VideoDecoder;
  private readonly resizer: VideoResizer;
  private readonly encoder: VideoEncoder;
  private readonly fileWriter: VideoFileWriter;
  private readonly thumbnailGenerator: ThumbnailGenerator;
  private readonly metadataExtractor: VideoMetadataExtractor;

  constructor() {
    /*
     * The facade creates and manages the subsystem objects.
     *
     * This keeps the client from being directly coupled to each
     * individual subsystem class.
     */
    this.codecFactory = new CodecFactory();
    this.decoder = new VideoDecoder();
    this.resizer = new VideoResizer();
    this.encoder = new VideoEncoder();
    this.fileWriter = new VideoFileWriter();
    this.thumbnailGenerator = new ThumbnailGenerator();
    this.metadataExtractor = new VideoMetadataExtractor();
  }

  /**
   * Converts a video using one simple high-level operation.
   *
   * This method coordinates the complete workflow:
   *
   * 1. Create the source video object
   * 2. Extract metadata
   * 3. Select the output codec
   * 4. Decode the source video
   * 5. Generate a thumbnail
   * 6. Resize the decoded video
   * 7. Encode the resized video
   * 8. Construct the output filename
   * 9. Save the encoded video
   */
  convertVideo(
    sourceFilename: string,
    outputFormat: string,
    width: number,
    height: number,
  ): VideoConversionResult {
    console.log('Starting video conversion through the facade.');
    console.log('---------------------------------------------');

    /*
     * Step 1: Create the source video object.
     */
    const sourceVideo = new VideoFile(sourceFilename);

    /*
     * Step 2: Extract metadata from the original video.
     *
     * The client does not need to know which subsystem class handles
     * metadata extraction.
     */
    const metadata = this.metadataExtractor.extract(sourceVideo);

    console.log('Video metadata:', metadata);

    /*
     * Step 3: Select the correct codec.
     *
     * The facade knows that the output format must first be converted
     * into a VideoCodec object.
     */
    const outputCodec = this.codecFactory.createCodec(outputFormat);

    /*
     * Step 4: Decode the source video.
     */
    const decodedVideo = this.decoder.decode(sourceVideo);

    /*
     * Step 5: Construct the thumbnail filename and generate it.
     *
     * The facade knows that thumbnail generation requires decoded
     * video data.
     */
    const thumbnailFilename = `${sourceVideo.getBaseName()}-thumbnail.jpg`;

    this.thumbnailGenerator.generate(decodedVideo, thumbnailFilename);

    /*
     * Step 6: Resize the decoded video.
     */
    const resizedVideo = this.resizer.resize(decodedVideo, width, height);

    /*
     * Step 7: Encode the resized video using the selected codec.
     */
    const encodedVideo = this.encoder.encode(resizedVideo, outputCodec);

    /*
     * Step 8: Construct the output filename.
     *
     * The facade owns the naming convention, so the client does not
     * need to know how converted files should be named.
     */
    const outputFilename =
      `${sourceVideo.getBaseName()}-converted.` +
      outputCodec.getFileExtension();

    /*
     * Step 9: Save the encoded video.
     */
    this.fileWriter.save(encodedVideo, outputFilename);

    console.log('---------------------------------------------');
    console.log('Video conversion completed.');
    console.log(`Output video: ${outputFilename}`);
    console.log(`Thumbnail: ${thumbnailFilename}`);

    /*
     * Return a simple result object to the client.
     *
     * The client receives the useful outputs without needing access
     * to internal objects such as DecodedVideo or EncodedVideo.
     */
    return new VideoConversionResult(
      outputFilename,
      thumbnailFilename,
      metadata,
    );
  }
}

/**
 * CLIENT CODE
 *
 * The client interacts only with the facade.
 *
 * It does not directly create or coordinate:
 *
 * - CodecFactory
 * - VideoDecoder
 * - VideoResizer
 * - VideoEncoder
 * - VideoFileWriter
 * - ThumbnailGenerator
 * - VideoMetadataExtractor
 */
function main(): void {
  try {
    /*
     * Create the facade.
     *
     * This becomes the single entry point to the video conversion
     * subsystem.
     */
    const videoConverter = new VideoConversionFacade();

    /*
     * Request a complete video conversion through one method call.
     *
     * The client specifies what it wants, while the facade determines
     * how the subsystem should perform the operation.
     */
    const result = videoConverter.convertVideo(
      'software-design-lecture.mov',
      'mp4',
      1920,
      1080,
    );

    /*
     * The client receives only the final outputs it needs.
     */
    console.log('\nApplication received the following result:');
    console.log(`Converted video: ${result.outputFilename}`);
    console.log(`Thumbnail: ${result.thumbnailFilename}`);
    console.log('Metadata:', result.metadata);
  } catch (error: unknown) {
    /*
     * TypeScript treats caught values as unknown in strict mode.
     * We therefore verify that the value is an Error before reading
     * its message.
     */
    if (error instanceof Error) {
      console.error(`Conversion failed: ${error.message}`);
    } else {
      console.error('Conversion failed because of an unknown error.');
    }
  }
}

main();
