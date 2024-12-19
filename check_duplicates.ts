import fs from "fs";
import path from "path";
import csvParser from "csv-parser";

interface Row {
	[key: string]: string; // Allow all properties dynamically
}

interface DuplicateInfo {
	occurrences: number;
	all_fields_equal: boolean;
	non_equal_fields: string[]; // Fields not equal across occurrences
	data: { file: string; line: number; row: Row }[];
}

const uniqueFields = ["channel", "isrc", "start_date", "end_date", "country"];
const uniqueRows: Row[] = [];
const duplicates: Record<string, DuplicateInfo> = {};

// Function to generate a unique key for a row based on the defined fields
const rowKey = (row: Row) => uniqueFields.map((field) => row[field]).join("|");

// Function to check if a row is a duplicate
const isDuplicate = (row: Row, existingRows: Row[]) =>
	existingRows.some((existingRow) =>
		uniqueFields.every((field) => existingRow[field] === row[field])
	);

const processCSV = async (filePath: string): Promise<void> => {
	return new Promise((resolve, reject) => {
		let line = 1; // Track line number, start at 1 for the header
		fs.createReadStream(filePath)
			.pipe(csvParser())
			.on("data", (row: Row) => {
				line++;
				const key = rowKey(row);

				if (isDuplicate(row, uniqueRows)) {
					// Handle duplicates
					if (!duplicates[key]) {
						duplicates[key] = {
							occurrences: 0,
							all_fields_equal: true, // Start as true, will update later if needed
							non_equal_fields: [],
							data: [],
						};
					}

					// Compare the new row with previous occurrences
					const fieldsWithDifferences: Set<string> = new Set();
					for (const entry of duplicates[key].data) {
						for (const field in row) {
							if (row[field] !== entry.row[field]) {
								fieldsWithDifferences.add(field);
							}
						}
					}

					// Update non_equal_fields and all_fields_equal
					duplicates[key].non_equal_fields = Array.from(fieldsWithDifferences);
					duplicates[key].all_fields_equal =
						duplicates[key].non_equal_fields.length === 0;

					// Increment occurrences and add to data
					duplicates[key].occurrences += 1;
					duplicates[key].data.push({ file: path.basename(filePath), line, row });
				} else {
					// Add to unique rows if not already present
					uniqueRows.push(row);
				}
			})
			.on("end", resolve)
			.on("error", reject);
	});
};

const loadCSVFiles = async () => {
	const directoryPath = path.resolve(".");
	const files = fs.readdirSync(directoryPath).filter((file) => file.endsWith(".csv"));

	for (const file of files) {
		const filePath = path.join(directoryPath, file);
		await processCSV(filePath);
	}

	// Filter out duplicates with occurrences <= 1
	const filteredDuplicates = Object.entries(duplicates).reduce((output, [key, info]) => {
		if (info.occurrences > 1) {
			output[key] = {
				occurrences: info.occurrences,
				all_fields_equal: info.all_fields_equal,
				non_equal_fields: info.non_equal_fields,
				data: info.data.map((entry) => ({
					file: entry.file,
					line: entry.line,
					row: entry.row,
				})),
			};
		}
		return output;
	}, {} as Record<string, DuplicateInfo>);

	// Write filtered duplicates to JSON
	const duplicateOutputPath = path.join(directoryPath, "duplicates.json");
	fs.writeFileSync(duplicateOutputPath, JSON.stringify(filteredDuplicates, null, 4));

	console.log(`Filtered duplicate rows logged to ${duplicateOutputPath}`);
};

loadCSVFiles()
	.then(() => console.log("CSV files processed successfully."))
	.catch((error) => console.error("Error processing CSV files:", error));
