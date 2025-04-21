import "./style.css"; // Import global styles (if any)
import { featureA } from "./features/featureA";
import { featureB } from "./features/featureB";

// Main function to initialise all features
function initialise() {
	const features = [featureA, featureB];

	// Run each feature
	for (const runFeature of features) {
		try {
			runFeature();
		} catch (err) {
			console.error("Feature failed to initialise:", err);
		}
	}
}

// Auto-run when the script loads
initialise();
