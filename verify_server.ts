
import { app } from "./src/app";
import { Logger } from "./src/core/Logger";

const PORT = 5000;

try {
    app.listen(PORT, () => {
        console.log(`🚀 Verification Server running on port ${PORT}`);
    });
} catch (error) {
    console.error("Verification Application failed to start", error);
    process.exit(1);
}
