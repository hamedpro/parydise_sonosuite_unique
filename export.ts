import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser"; // Correct way to import csv-parser

async function readCsvHeaders(filePath: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		const headers: string[] = [];

		fs.createReadStream(filePath)
			.pipe(csv())
			.on("headers", (csvHeaders) => {
				resolve(csvHeaders);
			})
			.on("error", (error) => {
				reject(error);
			});
	});
}

async function analyzeCsvFiles(directory: string): Promise<void> {
	const csvFiles = fs
		.readdirSync(directory)
		.filter((file) => file.endsWith(".csv"))
		.map((file) => path.join(directory, file));

	const headersMap: Map<string, Set<string>> = new Map();
	const allHeadersSet: Set<string> = new Set();

	for (const file of csvFiles) {
		const headers = await readCsvHeaders(file);
		console.log(file, "headers count", headers.length);
		headersMap.set(file, new Set(headers));
		headers.forEach((header) => allHeadersSet.add(header));
	}

	const allHeaders = Array.from(allHeadersSet);

	// Identify common headers
	const commonHeaders = allHeaders.filter((header) =>
		Array.from(headersMap.values()).every((headerSet) => headerSet.has(header))
	);

	// Identify non-common headers
	const nonCommonHeaders = allHeaders.filter((header) => !commonHeaders.includes(header));

	// Log results
	console.log("1- List of all common column names:");
	console.log(commonHeaders);

	console.log("\n2- List of all column names that are not common between all files:");
	for (const header of nonCommonHeaders) {
		const filesWithHeader = csvFiles
			.filter((file) => headersMap.get(file)?.has(header))
			.map((file) => path.basename(file));
		console.log(`- Column: "${header}"`);
		console.log(`  Found in: ${filesWithHeader.join(", ")}`);
		console.log();
	}
}

// Run the function
analyzeCsvFiles("./")
	.then(() => console.log("Analysis completed."))
	.catch((error) => console.error("Error analyzing CSV files:", error));
