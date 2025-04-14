import styles from "./featureA.module.css";

export function featureA() {
  console.log("Feature A initialised!");

  const element = document.createElement("div");
  element.textContent = "Hello from Feature A!";
  element.className = styles.featureAElement; // Apply scoped style
  document.body.appendChild(element); // Append to body for demo
}
