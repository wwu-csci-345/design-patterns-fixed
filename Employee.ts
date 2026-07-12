/**
 * COMPANY STRUCTURE USING THE COMPOSITE PATTERN
 *
 * Core idea:
 *
 * - Individual employees are leaf objects.
 * - Managers are composite objects.
 * - Both implement the same Employee interface.
 * - A Manager stores Employee objects, which may be:
 *   - individual employees, or
 *   - other managers.
 *
 * This allows client code to treat one employee, one department,
 * or the entire company in the same way.
 */

/**
 * The Component interface in the Composite pattern.
 *
 * Every object in the company hierarchy implements this interface.
 *
 * It defines operations that are meaningful for both:
 * - leaf objects, such as Developer
 * - composite objects, such as Manager
 */
interface Employee {
  /**
   * Returns the employee's name.
   */
  getName(): string;

  /**
   * Returns only this employee's own salary.
   *
   * For a Manager, this does not include subordinate salaries.
   */
  getSalary(): number;

  /**
   * Returns the total salary represented by this object.
   *
   * For an individual employee:
   * - returns only that employee's salary
   *
   * For a manager:
   * - returns the manager's salary
   * - plus the salaries of all direct and indirect subordinates
   */
  getTotalSalary(): number;

  /**
   * Prints this employee and, when applicable,
   * all employees below this employee.
   */
  printStructure(indent?: string): void;

  /**
   * Counts the number of people represented by this object.
   *
   * For an individual employee:
   * - returns 1
   *
   * For a manager:
   * - returns 1 for the manager
   * - plus everyone below the manager
   */
  getEmployeeCount(): number;

  /**
   * Searches this object or subtree for a person with the given name.
   *
   * Returns the matching Employee object or null if no match is found.
   */
  findByName(targetName: string): Employee | null;
}

/**
 * Shared abstract base class for leaf employees.
 *
 * This class is not required by the Composite pattern, but it avoids
 * repeating common fields and methods in every individual employee class.
 *
 * A leaf employee:
 * - has a name
 * - has a salary
 * - has no children
 */
abstract class IndividualEmployee implements Employee {
  constructor(
    private readonly name: string,
    private readonly salary: number,
  ) {}

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  /**
   * A leaf has no subordinates.
   *
   * Therefore, the total salary represented by this object
   * is just the employee's own salary.
   */
  getTotalSalary(): number {
    return this.salary;
  }

  /**
   * A leaf represents exactly one employee.
   */
  getEmployeeCount(): number {
    return 1;
  }

  /**
   * A leaf only needs to compare its own name.
   */
  findByName(targetName: string): Employee | null {
    if (this.name === targetName) {
      return this;
    }

    return null;
  }

  /**
   * Each concrete leaf class provides its own role label.
   */
  abstract printStructure(indent?: string): void;
}

/**
 * Leaf class.
 *
 * A Developer cannot contain subordinate employees.
 */
class Developer extends IndividualEmployee {
  printStructure(indent: string = ''): void {
    console.log(
      `${indent}Developer: ${this.getName()} - ` +
        `$${this.getSalary().toLocaleString()}`,
    );
  }
}

/**
 * Leaf class.
 *
 * A Designer cannot contain subordinate employees.
 */
class Designer extends IndividualEmployee {
  printStructure(indent: string = ''): void {
    console.log(
      `${indent}Designer: ${this.getName()} - ` +
        `$${this.getSalary().toLocaleString()}`,
    );
  }
}

/**
 * Leaf class.
 *
 * A QA engineer cannot contain subordinate employees.
 */
class QualityAssuranceEngineer extends IndividualEmployee {
  printStructure(indent: string = ''): void {
    console.log(
      `${indent}QA Engineer: ${this.getName()} - ` +
        `$${this.getSalary().toLocaleString()}`,
    );
  }
}

/**
 * Leaf class.
 *
 * A Business Analyst cannot contain subordinate employees.
 */
class BusinessAnalyst extends IndividualEmployee {
  printStructure(indent: string = ''): void {
    console.log(
      `${indent}Business Analyst: ${this.getName()} - ` +
        `$${this.getSalary().toLocaleString()}`,
    );
  }
}

/**
 * Composite class.
 *
 * A Manager is an Employee, but a Manager can also contain
 * other Employee objects.
 *
 * Those child Employee objects may be:
 * - Developer
 * - Designer
 * - QualityAssuranceEngineer
 * - BusinessAnalyst
 * - another Manager
 *
 * This recursive structure is the key part of the Composite pattern.
 */
class Manager implements Employee {
  /**
   * The Manager stores all children through the Employee abstraction.
   *
   * There is no need for separate arrays such as:
   *
   * - developers: Developer[]
   * - designers: Designer[]
   * - managers: Manager[]
   *
   * One Employee array can contain both leaves and composites.
   */
  private readonly subordinates: Employee[] = [];

  constructor(
    private readonly name: string,
    private readonly salary: number,
    private readonly title: string,
  ) {}

  getName(): string {
    return this.name;
  }

  getSalary(): number {
    return this.salary;
  }

  getTitle(): string {
    return this.title;
  }

  /**
   * Adds any Employee object as a direct subordinate.
   *
   * Because Manager also implements Employee, this method can add:
   * - an individual employee
   * - another manager
   */
  addSubordinate(employee: Employee): void {
    /**
     * Prevent the simplest invalid case:
     * a manager directly supervising itself.
     */
    if (employee === this) {
      throw new Error('A manager cannot be added as their own subordinate.');
    }

    /**
     * Prevent a cycle in which this manager is already somewhere
     * inside the proposed subordinate's subtree.
     *
     * Example of an invalid cycle:
     *
     * CEO contains Engineering Manager
     * Engineering Manager then tries to contain CEO
     */
    if (employee.findByName(this.name) === this) {
      throw new Error(
        'Cannot add this employee because it would create a cycle.',
      );
    }

    this.subordinates.push(employee);
  }

  /**
   * Removes a direct subordinate.
   *
   * This does not search recursively.
   */
  removeSubordinate(employee: Employee): void {
    const index = this.subordinates.indexOf(employee);

    if (index !== -1) {
      this.subordinates.splice(index, 1);
    }
  }

  /**
   * Returns a copy of the subordinate array.
   *
   * Returning a copy prevents outside code from directly modifying
   * the Manager's internal collection.
   */
  getSubordinates(): readonly Employee[] {
    return [...this.subordinates];
  }

  /**
   * Calculates the total salary represented by this manager.
   *
   * The manager does not need to know whether each child is:
   * - a Developer
   * - a Designer
   * - another Manager
   *
   * It simply calls getTotalSalary() on every Employee.
   *
   * Polymorphism handles the difference:
   * - leaves return their own salary
   * - composites recursively calculate subtree salary
   */
  getTotalSalary(): number {
    let total = this.salary;

    for (const subordinate of this.subordinates) {
      total += subordinate.getTotalSalary();
    }

    return total;
  }

  /**
   * Counts this manager and everyone below this manager.
   *
   * Each child knows how many employees it represents.
   */
  getEmployeeCount(): number {
    let count = 1;

    for (const subordinate of this.subordinates) {
      count += subordinate.getEmployeeCount();
    }

    return count;
  }

  /**
   * Searches this manager and the entire subtree below this manager.
   *
   * The manager does not need separate search logic for leaves
   * and child managers.
   *
   * It simply delegates the search to each Employee object.
   */
  findByName(targetName: string): Employee | null {
    if (this.name === targetName) {
      return this;
    }

    for (const subordinate of this.subordinates) {
      const result = subordinate.findByName(targetName);

      if (result !== null) {
        return result;
      }
    }

    return null;
  }

  /**
   * Prints this manager and recursively prints all subordinates.
   *
   * Each subordinate decides how to print itself.
   */
  printStructure(indent: string = ''): void {
    console.log(
      `${indent}${this.title}: ${this.name} - ` +
        `$${this.salary.toLocaleString()}`,
    );

    const childIndent = `${indent}    `;

    for (const subordinate of this.subordinates) {
      subordinate.printStructure(childIndent);
    }
  }
}

/**
 * Client function that works with any Employee.
 *
 * It does not need to know whether the object is:
 * - one individual employee
 * - one manager
 * - one department
 * - the entire company
 */
function printEmployeeSummary(employee: Employee): void {
  console.log(`Name: ${employee.getName()}`);
  console.log(
    `Total salary represented: ` +
      `$${employee.getTotalSalary().toLocaleString()}`,
  );
  console.log(`Employee count represented: ${employee.getEmployeeCount()}`);
}

/**
 * Creates the individual engineering employees.
 */
const developerAlice = new Developer('Alice', 120_000);
const developerBob = new Developer('Bob', 115_000);
const qaEngineerCarol = new QualityAssuranceEngineer('Carol', 100_000);

/**
 * Creates the engineering manager.
 */
const engineeringManager = new Manager('David', 160_000, 'Engineering Manager');

/**
 * The same addSubordinate() method accepts all employee types.
 */
engineeringManager.addSubordinate(developerAlice);
engineeringManager.addSubordinate(developerBob);
engineeringManager.addSubordinate(qaEngineerCarol);

/**
 * Creates the individual product employees.
 */
const designerEva = new Designer('Eva', 105_000);
const analystFrank = new BusinessAnalyst('Frank', 98_000);

/**
 * Creates the product manager.
 */
const productManager = new Manager('Grace', 150_000, 'Product Manager');

productManager.addSubordinate(designerEva);
productManager.addSubordinate(analystFrank);

/**
 * Creates the CEO.
 *
 * The CEO is also represented by Manager because the CEO may
 * contain other managers and employees.
 */
const ceo = new Manager('Helen', 250_000, 'CEO');

/**
 * A Manager can contain other Manager objects because Manager
 * implements the Employee interface.
 */
ceo.addSubordinate(engineeringManager);
ceo.addSubordinate(productManager);

/**
 * Prints the entire company.
 *
 * The client calls one method on the root object.
 * The recursive traversal happens inside the hierarchy.
 */
console.log('COMPANY STRUCTURE');
console.log('-----------------');

ceo.printStructure();

/**
 * Calculates payroll for the entire company.
 */
console.log(
  `\nTotal company salary: ` + `$${ceo.getTotalSalary().toLocaleString()}`,
);

/**
 * Counts the CEO and all employees below the CEO.
 */
console.log(`Total employee count: ${ceo.getEmployeeCount()}`);

/**
 * To count only the people below the CEO, subtract the CEO.
 */
console.log(`People below the CEO: ${ceo.getEmployeeCount() - 1}`);

/**
 * Searches the entire company hierarchy.
 */
const searchResult = ceo.findByName('Eva');

if (searchResult === null) {
  console.log('\nPerson not found.');
} else {
  console.log(`\nFound employee: ${searchResult.getName()}`);

  console.log(
    `Salary represented by this employee: ` +
      `$${searchResult.getTotalSalary().toLocaleString()}`,
  );
}

/**
 * The same client function works with a leaf.
 */
console.log('\nDEVELOPER SUMMARY');
console.log('-----------------');

printEmployeeSummary(developerAlice);

/**
 * The same client function also works with a composite department.
 */
console.log('\nENGINEERING DEPARTMENT SUMMARY');
console.log('------------------------------');

printEmployeeSummary(engineeringManager);

/**
 * The same client function also works with the entire company.
 */
console.log('\nCOMPANY SUMMARY');
console.log('---------------');

printEmployeeSummary(ceo);
