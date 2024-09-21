window.onload = function () {
	loadCSV("items.csv");
};

function loadCSV(fileName) {
	fetch(fileName)
		.then((response) => response.text())
		.then((text) => parseCSV(text));
}

function parseCSV(data) {
	const rows = data.split("\n");
	const tableHeaders = document.getElementById("csvHeaders");
	const tableBody = document.getElementById("csvBody");
	const table = document.getElementById("csvTable");

	tableHeaders.innerHTML = "";
	tableBody.innerHTML = "";

	const headers = rows[0].split(",");
	headers.forEach((header) => {
		const th = document.createElement("th");
		th.textContent = header.trim();
		tableHeaders.appendChild(th);
	});

	const th = document.createElement("th");
	th.textContent = "Action";
	tableHeaders.appendChild(th);

	for (let i = 1; i < rows.length; i++) {
		if (rows[i].trim() === "") continue;
		const cells = rows[i].split(",");
		const rowElement = document.createElement("tr");

		cells.forEach((cell) => {
			const td = document.createElement("td");
			td.textContent = cell.trim();
			rowElement.appendChild(td);
		});

		const buttonTd = document.createElement("td");
		const button = document.createElement("button");
		button.textContent = "Show Graph";
		button.onclick = () => buttonGraph(cells);
		buttonTd.appendChild(button);
		rowElement.appendChild(buttonTd);

		tableBody.appendChild(rowElement);
	}

	table.style.display = "none";
}

function filterTable() {
	const input = document.getElementById("searchInput").value.toLowerCase();
	const rows = document.querySelectorAll("#csvBody tr");
	const table = document.getElementById("csvTable");

	if (input.trim() !== "") {
		table.style.display = "table";
	} else {
		table.style.display = "none";
		return;
	}

	rows.forEach((row) => {
		const cells = row.querySelectorAll("td");
		let rowMatch = false;

		cells.forEach((cell) => {
			const cellText = cell.textContent.toLowerCase();
			if (cellText.includes(input)) {
				rowMatch = true;
			}
		});

		if (rowMatch) {
			row.style.display = "";
		} else {
			row.style.display = "none";
		}
	});
}

let newChart = null;
function buttonGraph(rowData) {
	const search = rowData[1];
	console.log(typeof search);

	if (newChart !== null) {
		newChart.destroy();
	}

	const selectedLocations = Array.from(
		document.querySelectorAll('input[type="checkbox"]:checked')
	).map((checkbox) => checkbox.value);

	/*if (selectedLocations.length === 0) {
		alert("Veuillez sélectionner au moins une localisation.");
		return;
	}*/

	fetch(
		`https://europe.albion-online-data.com/api/v2/stats/charts/${search}?locations=${selectedLocations.join(
			","
		)}&qualities=1&time-scale=24`
	)
		.then((r) => r.json())
		.then((r) => {
			/*if (!Array.isArray(r) || r.length === 0) {
				alert("Aucune donnée trouvée pour les localisations sélectionnées.");
				return;
			}*/

			const labels = r[0].data.timestamps.map((timestamp) =>
				new Date(timestamp).toLocaleDateString()
			);

			const datasets = r.map((locationData, index) => ({
				label: locationData.location,
				data: locationData.data.prices_avg,
				borderColor: getColorByIndex(index),
				backgroundColor: getColorByIndex(index, true),
				borderWidth: 1,
				type: "line",
			}));

			console.log(datasets);

			const ctx = document.getElementById("chart").getContext("2d");
			newChart = new Chart(ctx, {
				type: "line",
				data: {
					labels: labels,
					datasets: datasets,
				},
				options: {
					plugins: {
						title: {
							display: true,
							text: search,
						},
					},
					scales: {
						y: {
							beginAtZero: false,
						},
					},
				},
			});
		})
		.catch((error) => {
			console.error("Erreur lors de la récupération des données :", error);
			/*alert("Une erreur s'est produite lors de la récupération des données.");*/
		});
}

// Fonction pour obtenir une couleur basée sur l'index
function getColorByIndex(index, isBackground = false) {
	const colors = [
		"rgba(128,0,255,1)", // Couleur pour l'index 0
		"rgba(200,200,200,1)", // Couleur pour l'index 1
		"rgba(20,192,192,1)", // Couleur pour l'index 2
		"rgba(255,165,0,1)", // Couleur pour l'index 3
		"rgba(255,0,0,1)", // Couleur pour l'index 4
		"rgba(0,128,0,1)", // Couleur pour l'index 5
	];

	return isBackground ? colors[index].replace("1)", "0.5)") : colors[index];
}
