/*
 * Coffee Customization Using the Decorator Pattern
 *
 * In this design:
 *
 * - SimpleCoffee represents the basic coffee.
 * - Each ingredient is represented by a separate decorator class.
 * - Decorators wrap a Coffee object and add their own description and cost.
 * - Ingredients can be combined dynamically without modifying SimpleCoffee.
 */

/*
 * Component interface
 *
 * Both the basic coffee and all ingredient decorators implement this
 * interface. This allows the client to treat decorated and undecorated
 * coffee objects in the same way.
 */
interface Coffee {
  getDescription(): string;
  getCost(): number;
}

/*
 * Concrete Component
 *
 * This class represents the basic coffee before any ingredients are added.
 *
 * It contains only the core coffee behavior. It does not know anything
 * about milk, sugar, whipped cream, caramel, or other optional ingredients.
 */
class SimpleCoffee implements Coffee {
  constructor(private readonly size: CoffeeSize) {}

  /*
   * Returns the description of the basic coffee.
   */
  getDescription(): string {
    return `${this.size} coffee`;
  }

  /*
   * Returns the base price according to the selected size.
   */
  getCost(): number {
    switch (this.size) {
      case CoffeeSize.Small:
        return 2.0;

      case CoffeeSize.Medium:
        return 2.5;

      case CoffeeSize.Large:
        return 3.0;

      default:
        throw new Error('Unsupported coffee size.');
    }
  }
}

/*
 * Represents the available coffee sizes.
 */
enum CoffeeSize {
  Small = 'Small',
  Medium = 'Medium',
  Large = 'Large',
}

/*
 * Base Decorator
 *
 * This abstract class implements the same Coffee interface as SimpleCoffee.
 *
 * It stores a reference to another Coffee object. That wrapped object may be:
 *
 * - A SimpleCoffee
 * - Another ingredient decorator
 *
 * This makes it possible to stack multiple decorators around one coffee.
 */
abstract class CoffeeDecorator implements Coffee {
  constructor(protected readonly wrappedCoffee: Coffee) {}

  /*
   * The default implementation delegates to the wrapped coffee.
   *
   * Concrete decorators override this method to add their own ingredient
   * to the description.
   */
  getDescription(): string {
    return this.wrappedCoffee.getDescription();
  }

  /*
   * The default implementation delegates to the wrapped coffee.
   *
   * Concrete decorators override this method to add their own ingredient
   * price.
   */
  getCost(): number {
    return this.wrappedCoffee.getCost();
  }
}

/*
 * Concrete Decorator: Milk
 *
 * Adds milk to the coffee description and adds the milk price.
 */
class MilkDecorator extends CoffeeDecorator {
  getDescription(): string {
    return `${this.wrappedCoffee.getDescription()}, milk`;
  }

  getCost(): number {
    return this.wrappedCoffee.getCost() + 0.5;
  }
}

/*
 * Concrete Decorator: Sugar
 *
 * Adds sugar to the coffee description and adds the sugar price.
 */
class SugarDecorator extends CoffeeDecorator {
  getDescription(): string {
    return `${this.wrappedCoffee.getDescription()}, sugar`;
  }

  getCost(): number {
    return this.wrappedCoffee.getCost() + 0.25;
  }
}

/*
 * Concrete Decorator: Whipped Cream
 *
 * Adds whipped cream to the coffee description and adds its price.
 */
class WhippedCreamDecorator extends CoffeeDecorator {
  getDescription(): string {
    return `${this.wrappedCoffee.getDescription()}, whipped cream`;
  }

  getCost(): number {
    return this.wrappedCoffee.getCost() + 0.75;
  }
}

/*
 * Concrete Decorator: Caramel
 *
 * Adds caramel to the coffee description and adds the caramel price.
 */
class CaramelDecorator extends CoffeeDecorator {
  getDescription(): string {
    return `${this.wrappedCoffee.getDescription()}, caramel`;
  }

  getCost(): number {
    return this.wrappedCoffee.getCost() + 0.65;
  }
}

/*
 * Helper function used to display a coffee order.
 *
 * The function depends only on the Coffee interface. It does not need
 * to know whether the object is a SimpleCoffee or a chain of decorators.
 */
function printCoffeeOrder(coffee: Coffee): void {
  console.log(`Order: ${coffee.getDescription()}`);
  console.log(`Cost: $${coffee.getCost().toFixed(2)}`);
  console.log();
}

/*
 * Client Code
 */

/*
 * Order 1:
 *
 * A small plain coffee with no added ingredients.
 */
const plainCoffee: Coffee = new SimpleCoffee(CoffeeSize.Small);

printCoffeeOrder(plainCoffee);

/*
 * Order 2:
 *
 * A medium coffee with milk and sugar.
 *
 * Runtime structure:
 *
 * SugarDecorator
 *     -> MilkDecorator
 *         -> SimpleCoffee
 */
const milkAndSugarCoffee: Coffee = new SugarDecorator(
  new MilkDecorator(new SimpleCoffee(CoffeeSize.Medium)),
);

printCoffeeOrder(milkAndSugarCoffee);

/*
 * Order 3:
 *
 * A large coffee with milk, sugar, whipped cream, and caramel.
 *
 * Runtime structure:
 *
 * CaramelDecorator
 *     -> WhippedCreamDecorator
 *         -> SugarDecorator
 *             -> MilkDecorator
 *                 -> SimpleCoffee
 */
const fullyLoadedCoffee: Coffee = new CaramelDecorator(
  new WhippedCreamDecorator(
    new SugarDecorator(new MilkDecorator(new SimpleCoffee(CoffeeSize.Large))),
  ),
);

printCoffeeOrder(fullyLoadedCoffee);

/*
 * Order 4:
 *
 * A small coffee with two portions of caramel.
 *
 * The Decorator pattern naturally supports repeating the same ingredient
 * because the same decorator can be applied more than once.
 *
 * Runtime structure:
 *
 * CaramelDecorator
 *     -> CaramelDecorator
 *         -> SimpleCoffee
 */
const doubleCaramelCoffee: Coffee = new CaramelDecorator(
  new CaramelDecorator(new SimpleCoffee(CoffeeSize.Small)),
);

printCoffeeOrder(doubleCaramelCoffee);

/*
 * Order 5:
 *
 * Build a coffee step by step.
 *
 * This demonstrates that decorators can be selected dynamically at runtime.
 */
let customCoffee: Coffee = new SimpleCoffee(CoffeeSize.Medium);

/*
 * Add milk.
 */
customCoffee = new MilkDecorator(customCoffee);

/*
 * Add whipped cream.
 */
customCoffee = new WhippedCreamDecorator(customCoffee);

/*
 * Add caramel.
 */
customCoffee = new CaramelDecorator(customCoffee);

printCoffeeOrder(customCoffee);
