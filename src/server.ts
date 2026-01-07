import { app } from "./app";
import { Logger } from "./core/Logger";
import { env } from "./config/env";


try {
  app.listen(env.port, () => {
    Logger.info(`🚀 Server running on port ${env.port}`);
  });
} catch (error) {
  Logger.error("Application failed to start", error);
  process.exit(1);
}
