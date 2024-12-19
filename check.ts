function findMissingKeys(schema, keys) {
	return keys.filter((key) => !schema.hasOwnProperty(key));
}

// Example usage:
const reportsSchema = {
	start_date: "date",
	end_date: "date",
	confirmation_report_date: "date",
	country: "string",
	currency: "string",
	type: "string",
	units: "number",
	unit_price: "number",
	gross_total: "number",
	channel_costs: "number",
	taxes: "number",
	net_total: "number",
	currency_rate: "number",
	gross_total_client_currency: "number",
	gross_total_client_currency_commission: "number",
	other_costs_client_currency: "number",
	channel_costs_client_currency: "number",
	channel: "string",
	label: "string",
	release: "string",
	isrc: "string",
	tenant_id: "number",
};

const keysToCheck = [
	"id",
	"start_date",
	"end_date",
	"confirmation_report_date",
	"country",
	"currency",
	"type",
	"units",
	"unit_price",
	"gross_total",
	"channel_costs",
	"taxes",
	"net_total",
	"currency_rate",
	"gross_total_client_currency",
	"other_costs_client_currency",
	"channel_costs_client_currency",
	"net_total_client_currency",
	"user_email",
	"channel",
	"label",
	"artist",
	"release",
	"UPC",
	"track_title",
	"isrc",
	"tenant_id",
];

const missingKeys = findMissingKeys(reportsSchema, keysToCheck);
console.log("Missing Keys:", missingKeys);
