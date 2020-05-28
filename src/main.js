/**
 * 
 *  Gets a permission document for go to shopping food in Chile
 * 	@module main
 * 
 * 	Written by @diegoulloao
 * 	@version 1
 * 
 */


const puppeteer = require( 'puppeteer' )
const chalk = require( 'chalk' )


/**
 * 
 * 	External Data with fill in
 * 
 */
const data = require( './data.json' )


/**
 * 
 * 	Field Selectors
 * 
 */
const field = require( './assets/selectors' )


/**
 * 
 * 	Functions
 * 
 */
const { getOption } = require( './assets/functions' )


/**
 * 
 *	Dictionary
 * 
 */
const messages = require( './assets/dictionary.json' )


/**
 * 
 *	Web URL where to get the permission
 * 
 */
const pageIndex = "https://comisariavirtual.cl/tramites/iniciar/103.html"


// Fills the fields
; ( async () => {
	// Browser
	const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
	const page = ( await browser.pages() )[0]


	// Page
	console.log( chalk.bgGreen.black( messages.pageLoaded ) )
	await page.goto( pageIndex, { waitUntil: 'networkidle2' } )
	console.log( chalk.bgGreen.black( `${messages.fillingData}\n` ) )


	// Types fullname
	await page.waitForSelector(field.name)
	await page.type( field.name, data.nombre )


	// Types RUN
	await page.waitForSelector(field.run)
	await page.type( field.run, data.rut )


	// Types age
	await page.waitForSelector(field.age)
	await page.type( field.age, data.edad )


	// Selects region
	await page.waitForSelector( field.region )
	await page.click( field.region )

	const region_option = await getOption.call( page, field.region, data.region )

	if ( region_option )
		await page.click( region_option )
	
	else
		console.log( chalk.bgRed.black( messages.fallRegion ) )
	;


	// Selects county
	if ( region_option ) {
		await page.waitForSelector( field.county )
		await page.click( field.county )
		await page.waitForFunction( county_selector => document.querySelectorAll(`${county_selector} > div.chosen-drop > ul.chosen-results > li`).length > 1, {}, field.county )

		const county_option = await getOption.call( page, field.county, data.comuna )
		
		if ( county_option )
			await page.click( county_option )

		else
			console.log( chalk.bgRed.black( messages.fallCounty ) )
		;
	}


	// Types address
	await page.waitForSelector( field.address )
	await page.type( field.address, data.direccion )


	// Checks all reasons
	field.reason.map( async selector => {
		await page.waitForSelector( selector )
		await page.click( selector )
	})


	// Checks roundtrip
	await page.waitForSelector( field.roundtrip )
	await page.click( field.roundtrip )


	// Types destiny
	await page.waitForSelector( field.destiny )
	await page.type( field.destiny, data.destino )


	// Selects email copy (optional)
	await page.waitForSelector( data.copia_email ? field.email_copy[1] : field.email_copy[0] )
	await page.click( data.copia_email ? field.email_copy[1] : field.email_copy[0] )

	if ( data.copia_email ) {
		await page.waitForSelector( field.email )
		await page.type( field.email, data.email )
	}


	// Accepts terms
	await page.waitForSelector( field.terms )
	await page.click( field.terms )


	// Scroll to down
	await page.evaluate( () => window.scrollBy( 0, window.innerHeight ) )

	
	// Wait for terminate the procedure ...
	console.log( chalk.bgYellow.black( messages.continue ) )
	console.log( `${messages.waiting}\n` )


	// Waits until user close the window
	await browser.on( 'targetdestroyed', async ( targetdestroyed ) => {
		await browser.close()

		if ( targetdestroyed.url() === pageIndex )
			console.log( chalk.bgGreen.black( messages.ready ) )
		;
	})

})()
