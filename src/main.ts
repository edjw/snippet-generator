import "./style.css"; // Import global styles (if any)
import { featureA } from "./features/featureA";
import { featureB } from "./features/featureB";

// Main function to initialize all features
function initialise() {
  console.log("CMS Snippet Initialising...");

  // Run feature setup functions
  featureA();
  featureB();

  console.log("CMS Snippet Initialised!");
}

// Auto-run when the script loads
initialise();
