/**
 * 
 * 	Fields Selectors.
 * 	@module assets/selectors
 * 
 * 	@description Contains all fields selector for data input.
 * 
 */


module.exports = {

	// Person
	name: 'input[id="1897"]',
	run: 'input[id="1898"]',
	age: 'input[id="2529"]',

	// Residence
	region: 'div[id="regiones_1899_chosen"]',
	county: 'div[id="comunas_1899_chosen"]',
	address: 'input[id="1900"]',

	// Journey
	reason: [
		'input[id="Compra de alimentos"]',
		'input[id="Compra de medicamentos"]',
		'input[id="Compra de insumos básicos"]'
	],
	roundtrip: 'input[id="Ida - Regreso"]',
	destiny: 'input[id="1905"]',

	// Email
	copy: [ 'input[id="No"]', 'input[id="Si"]' ],
	email: 'input[id="2404"]',

	// Terms
	terms: 'input[id="en_caso_de_comprobarse_falsedad_en_la_declaracion_de_la_causal_invocada_para_requerir_el_presente_documento_se_incurrira_en_las_penas_del_art_210_del_codigo_penal"]',

	// Submit
	submit: 'button[type="submit"]',

	// Download PDF
	download: 'a[id="linkpdf"]'

}
