// different methods of a document's lifecycle
interface DocumentState {
  submitForReview(document: DocumentConcrete): void;
  publish(document: DocumentConcrete): void;
  archive(document: DocumentConcrete): void;
  getName(): string;
}

// concrete document class that implements the DocumentState interface
class DocumentConcrete {
  // current state of the document
  private state: DocumentState;

  // aim to initialize the document in the Draft state
  // the state is an injected dependency, allowing for flexibility in changing the state at runtime
  constructor() {
    this.state = new DraftState();
  }

  // method to transition to a new state
  transitionTo(state: DocumentState): void {
    console.log(
      `State changed from ${this.state.getName()} to ${state.getName()}.`
    );

    this.state = state;
  }

  /* implement submitForReview, publish, and archive methods that delegate to the current state */
  submitForReview(): void {
    this.state.submitForReview(this);
  }

  publish(): void {
    this.state.publish(this);
  }

  archive(): void {
    this.state.archive(this);
  }

  getStateName(): string {
    return this.state.getName();
  }
}

// a class representing the Draft state of a document, implementing the DocumentState interface
class DraftState implements DocumentState {
  submitForReview(document: DocumentConcrete): void {
    console.log("The draft was submitted for review.");
    document.transitionTo(new ReviewState());
  }

  publish(document: DocumentConcrete): void {
    console.log("A draft cannot be published directly.");
  }

  archive(document: DocumentConcrete): void {
    console.log("A draft cannot be archived.");
  }

  getName(): string {
    return "Draft";
  }
}

// a class representing the Review state of a document, implementing the DocumentState interface
class ReviewState implements DocumentState {
  submitForReview(document: DocumentConcrete): void {
    console.log("The document is already under review.");
  }

  publish(document: DocumentConcrete): void {
    console.log("The document was approved and published.");
    document.transitionTo(new PublishedState());
  }

  archive(document: DocumentConcrete): void {
    console.log("A document under review cannot be archived.");
  }

  getName(): string {
    return "Under Review";
  }
}

// a class representing the Published state of a document, implementing the DocumentState interface
class PublishedState implements DocumentState {
  submitForReview(document: DocumentConcrete): void {
    console.log("A published document cannot be submitted for review.");
  }

  publish(document: DocumentConcrete): void {
    console.log("The document is already published.");
  }

  archive(document: DocumentConcrete): void {
    console.log("The published document was archived.");
    document.transitionTo(new ArchivedState());
  }

  getName(): string {
    return "Published";
  }
}

// a class representing the Archived state of a document, implementing the DocumentState interface
class ArchivedState implements DocumentState {
  submitForReview(document: DocumentConcrete): void {
    console.log("An archived document cannot be submitted for review.");
  }

  publish(document: DocumentConcrete): void {
    console.log("An archived document cannot be published.");
  }

  archive(document: DocumentConcrete): void {
    console.log("The document is already archived.");
  }

  getName(): string {
    return "Archived";
  }
}

/* Example usage */
// Initial state is Draft
const documentSmall = new DocumentConcrete();
console.log(`Current state: ${documentSmall.getStateName()}`);

// Transition to Review state
documentSmall.submitForReview();
console.log(`Current state: ${documentSmall.getStateName()}`);

// Transition to Published state
documentSmall.publish();
console.log(`Current state: ${documentSmall.getStateName()}`);

// Transition to Archived state
documentSmall.archive();
console.log(`Current state: ${documentSmall.getStateName()}`);