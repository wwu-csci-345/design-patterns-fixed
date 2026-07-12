export{};

type StockChangeEvent = {
  productId: string;
  quantity: number;
  reorderLevel: number;
};

// Observer interface.
//
// Any class that wants to react to inventory changes must implement this
// interface. WarehouseInventory does not need to know the concrete class.
interface InventoryObserver {
  update(event: StockChangeEvent): void;
}

// Concrete observer #1.
//
// This observer is responsible only for purchasing-related behavior.
class PurchasingService implements InventoryObserver {
  update(event: StockChangeEvent): void {
    const { productId, quantity, reorderLevel } = event;

    if (quantity <= reorderLevel) {
      console.log(
        `[Purchasing] Creating purchase request for ${productId}. ` +
          `Current quantity: ${quantity}, reorder level: ${reorderLevel}.`,
      );
    }
  }
}

// Concrete observer #2.
//
// This observer is responsible only for displaying inventory status.
class OperationsDashboard implements InventoryObserver {
  update(event: StockChangeEvent): void {
    const { productId, quantity, reorderLevel } = event;

    const status = quantity <= reorderLevel ? 'LOW STOCK' : 'NORMAL';

    console.log(`[Dashboard] ${productId}: ${quantity} units - ${status}`);
  }
}

// Concrete observer #3.
//
// This observer demonstrates that we can add new behavior without changing
// WarehouseInventory. It only needs to implement InventoryObserver.
class InventoryAuditLogger implements InventoryObserver {
  update(event: StockChangeEvent): void {
    const { productId, quantity, reorderLevel } = event;

    console.log(
      `[Audit] ${new Date().toISOString()} | ` +
        `${productId} | quantity=${quantity} | reorderLevel=${reorderLevel}`,
    );
  }
}

// Subject interface.
//
// This is optional, but useful pedagogically. It separates the idea of a
// subscribable inventory source from the concrete WarehouseInventory class.
interface InventorySubject {
  addObserver(observer: InventoryObserver): void;
  removeObserver(observer: InventoryObserver): void;
  notifyObservers(event: StockChangeEvent): void;
}

// Concrete subject.
//
// WarehouseInventory manages inventory state. It does not know which concrete
// services react to stock changes. It only knows that observers implement the
// InventoryObserver interface.
class WarehouseInventory implements InventorySubject {
  private readonly stock = new Map<string, number>();

  private readonly observers: InventoryObserver[] = [];

  addObserver(observer: InventoryObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: InventoryObserver): void {
    const index = this.observers.indexOf(observer);

    if (index === -1) {
      return;
    }

    this.observers.splice(index, 1);
  }

  updateStock(productId: string, quantity: number, reorderLevel: number): void {
    if (quantity < 0) {
      throw new Error('Quantity cannot be negative.');
    }

    this.stock.set(productId, quantity);

    console.log(`[Inventory] ${productId} updated to ${quantity} units.`);

    const event: StockChangeEvent = {
      productId,
      quantity,
      reorderLevel,
    };

    this.notifyObservers(event);
  }

  notifyObservers(event: StockChangeEvent): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }

  getQuantity(productId: string): number | undefined {
    return this.stock.get(productId);
  }
}

// Usage

const inventory = new WarehouseInventory();

const purchasingService = new PurchasingService();
const operationsDashboard = new OperationsDashboard();
const auditLogger = new InventoryAuditLogger();

// Observers are registered dynamically.
// WarehouseInventory does not know or care what concrete classes these are.
inventory.addObserver(purchasingService);
inventory.addObserver(operationsDashboard);
inventory.addObserver(auditLogger);

inventory.updateStock('LAPTOP-15', 18, 10);
inventory.updateStock('LAPTOP-15', 7, 10);

// Observers can also be removed dynamically.
inventory.removeObserver(operationsDashboard);

inventory.updateStock('MONITOR-27', 4, 5);
