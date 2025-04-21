import styles from "./featureA.module.css";

type Months = Array<
	| "January"
	| "February"
	| "March"
	| "April"
	| "May"
	| "June"
	| "July"
	| "August"
	| "September"
	| "October"
	| "November"
	| "December"
>;

const months: Months = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function featureA() {
	console.log("Feature A initialised!");

	const element = document.createElement("div");

	element.textContent = `${months.map((month) => month[0]).join(" ")}`;

	element.className = styles.featureAElement; // Apply scoped style

	// Add the event listener directly to the element before appending. It's hard to do click listeners after adding to the DOM because vite adds a hash to the class name.

	element.addEventListener("click", () => {
		console.log("Feature A clicked!");
	});

	document.body.appendChild(element); // Append to body
}
