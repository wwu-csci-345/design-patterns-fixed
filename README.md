# Design Patterns 

This repository contains implementations of various design patterns in TypeScript. Each design pattern is implemented in a separate module, and the code is organized for easy understanding and reference.

* Singleton Pattern: Ensures that a class has only one instance and provides a global point of access to it.
  - Example: [`DatabaseConnector.ts`](./DatabaseConnector.ts)
  - Example: [`CacheManager.ts`](./CacheManager.ts)

* Observer Pattern: Defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically.
  - Example: [`InventoryTracker.ts`](./InventoryTracker.ts)
  - Example: [`DeploymentPipeline.ts`](./DeploymentPipeline.ts)

* State Pattern: Allows an object to alter its behavior when its internal state changes. The object will appear to change its class.
  - Example: [`DocumentState.ts`](./DocumentState.ts)

* Strategy Pattern: Defines a family of algorithms, encapsulates each one, and makes them interchangeable. Strategy lets the algorithm vary independently from clients that use it.
  - Example: [`Navigation.ts`](./Navigation.ts)

* Composite Pattern: Composes objects into tree structures to represent part-whole hierarchies. Composite lets clients treat individual objects and compositions of objects uniformly.
  - Example: [`Employee.ts`](./Employee.ts)

* Facade Pattern: Provides a unified interface to a set of interfaces in a subsystem. Façade defines a higher-level interface that makes the subsystem easier to use.
  - Example: [`VideoConverter.ts`](./VideoConverter.ts)

* Decorator Pattern: Attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.
  - Example: [`CoffeeShop.ts`](./CoffeeShop.ts)
  - Example: [`DataService.ts`](./DataService.ts)

* Adapter Pattern: Converts the interface of a class into another interface clients expect. Adapter lets classes work together that couldn't otherwise because of incompatible interfaces.
  - Example: [`PaymentProcessor.ts`](./PaymentProcessor.ts)

* Factory Method Pattern: Defines an interface for creating an object, but lets subclasses alter the type of objects that will be created.
  - Example: [`Notification.ts`](./Notification.ts)
  - Example: [`FileProcessor.ts`](./FileProcessor.ts)

* Builder Pattern: Separates the construction of a complex object from its representation so that the same construction process can create different representations.
  - Example: [`HTTPMethod.ts`](./HTTPMethod.ts)