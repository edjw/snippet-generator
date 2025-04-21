import styles from "./featureB.module.css";

export function featureB() {
	console.log("Feature B initialised!");

	const element = document.createElement("p"); // Use a different element type
	element.textContent = "Feature B reporting in!";
	element.className = styles.featureBParagraph; // Apply scoped style
	document.body.appendChild(element); // Append to body for demo
}
