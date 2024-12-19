import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser"; // Import the csv-parser library

async function convertCsvToJson(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const results: Record<string, string | number>[] = [];
		const fileNameWithoutExtension = path.basename(filePath, path.extname(filePath));
		const outputJsonPath = path.join(
			path.dirname(filePath),
			`${fileNameWithoutExtension}.json`
		);

		fs.createReadStream(filePath)
			.pipe(csv())
			.on("data", (data) => {
				results.push(data); // Accumulate each row of the CSV as a JSON object
			})
			.on("end", () => {
				fs.writeFileSync(outputJsonPath, JSON.stringify(results, null, 2), "utf-8");
				console.log(`Converted: ${filePath} -> ${outputJsonPath}`);
				resolve();
			})
			.on("error", (error) => {
				reject(error);
			});
	});
}

async function convertAllCsvFiles(directory: string): Promise<void> {
	const csvFiles = fs
		.readdirSync(directory)
		.filter((file) => file.endsWith(".csv"))
		.map((file) => path.join(directory, file));

	if (csvFiles.length === 0) {
		console.log("No CSV files found in the directory.");
		return;
	}

	console.log(`Found ${csvFiles.length} CSV file(s). Converting to JSON...`);

	for (const file of csvFiles) {
		try {
			await convertCsvToJson(file);
		} catch (error) {
			console.error(`Error converting ${file}:`, error);
		}
	}

	console.log("Conversion completed.");
}

// Run the script
convertAllCsvFiles("./")
	.then(() => console.log("All CSV files processed."))
	.catch((error) => console.error("Error processing CSV files:", error));
