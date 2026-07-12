type DeploymentStatus = 'started' | 'succeeded' | 'failed';

interface DeploymentObserver {
  update(
    application: string,
    environment: string,
    status: DeploymentStatus,
  ): void;
}

class SlackDeploymentNotifier implements DeploymentObserver {
  update(
    application: string,
    environment: string,
    status: DeploymentStatus,
  ): void {
    console.log(
      `[Slack] ${application} deployment to ${environment}: ${status}`,
    );
  }

  sendFailureDetails(application: string, errorMessage: string): void {
    console.log(`[Slack] ALERT: ${application} failed: ${errorMessage}`);
  }
}

class DeploymentAuditLogger implements DeploymentObserver {
  update(
    application: string,
    environment: string,
    status: DeploymentStatus,
  ): void {
    console.log(
      `[Audit] ${new Date().toISOString()} | ` +
        `${application} | ${environment} | ${status}`,
    );
  }

  saveIncidentReference(incidentId: string): void {
    console.log(`[Audit] Incident reference saved: ${incidentId}`);
  }
}

class DeploymentPipeline {
  private observers: DeploymentObserver[] = [];

  addObserver(observer: DeploymentObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: DeploymentObserver): void {
    this.observers = this.observers.filter(
      (existingObserver) => existingObserver !== observer,
    );
  }

  deploy(application: string, environment: string, shouldFail: boolean): void {
    this.notifyObservers(application, environment, 'started');

    console.log(`[Pipeline] Deploying ${application} to ${environment}...`);

    if (shouldFail) {
      const errorMessage = 'Database migration timed out.';
      const incidentId = 'INC-2048';

      this.notifyObservers(application, environment, 'failed');

      // Additional handling for failure
      for (const observer of this.observers) {
        if (observer instanceof SlackDeploymentNotifier) {
          observer.sendFailureDetails(application, errorMessage);
        }

        if (observer instanceof DeploymentAuditLogger) {
          observer.saveIncidentReference(incidentId);
        }
      }

      return;
    }

    this.notifyObservers(application, environment, 'succeeded');
  }

  private notifyObservers(
    application: string,
    environment: string,
    status: DeploymentStatus,
  ): void {
    for (const observer of this.observers) {
      observer.update(application, environment, status);
    }
  }
}

// Usage example:
const pipeline = new DeploymentPipeline();

const slackNotifier = new SlackDeploymentNotifier();
const auditLogger = new DeploymentAuditLogger();

pipeline.addObserver(slackNotifier);
pipeline.addObserver(auditLogger);

pipeline.deploy('customer-api', 'production', true);
