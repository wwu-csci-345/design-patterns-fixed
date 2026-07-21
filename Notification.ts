export {};

// Product abstraction.
//
// NotificationService depends on this interface rather than on
// EmailNotification, SmsNotification, or PushNotification.
interface Notification {
  send(message: string): void;
}

// Concrete dependency.
//
// This class contains only email-specific notification behavior.
class EmailNotification implements Notification {
  public send(message: string): void {
    console.log(`Email sent: ${message}`);
  }
}

// Concrete dependency.
//
// This class contains only SMS-specific notification behavior.
class SmsNotification implements Notification {
  public send(message: string): void {
    console.log(`SMS sent: ${message}`);
  }
}

// Concrete dependency.
//
// This class contains only push-notification-specific behavior.
class PushNotification implements Notification {
  public send(message: string): void {
    console.log(`Push notification sent: ${message}`);
  }
}

// Consumer class.
//
// NotificationService does not create its Notification dependency.
// The dependency is supplied from outside through the constructor.
class NotificationService {
  public constructor(private readonly notification: Notification) {}

  // This workflow remains the same regardless of the concrete
  // notification channel injected into the service.
  public notifyUser(message: string): void {
    console.log('Validating notification request...');

    this.notification.send(message);

    console.log('Recording notification result...');
  }
}

// Composition root.
//
// This is the part of the application where concrete objects are
// selected, constructed, and connected together.
//
// Object creation is kept outside NotificationService.
const emailNotification = new EmailNotification();
const emailService = new NotificationService(emailNotification);

const smsNotification = new SmsNotification();
const smsService = new NotificationService(smsNotification);

const pushNotification = new PushNotification();
const pushService = new NotificationService(pushNotification);

// usage example
emailService.notifyUser('Your order has shipped.');

smsService.notifyUser('Your verification code is 482913.');

pushService.notifyUser('You have a new message.');
