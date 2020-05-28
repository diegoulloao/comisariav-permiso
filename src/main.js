/**
 * 
 *  Obtanin a document of permission to go buy food in Chile
 * 	@module main
 * 
 * 	Written by @diegoulloao
 * 	@version 1
 * 
 */


// Extends puppeteer
const puppeteer = require( 'puppeteer-extra' )

const userAgent = require( 'user-agents' )
const StealthPlugin = require( 'puppeteer-extra-plugin-stealth' )
const RecaptchaPlugin = require( 'puppeteer-extra-plugin-recaptcha' )

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
 * 	CAPTCHA Resolver Data
 * 
 */
const captchaData = require( './captcha.json' )


/**
 * 
 *	Web URL where to get the permission
 * 
 */
const pageIndex = "https://comisariavirtual.cl/tramites/iniciar/103.html"


// Fills the fields
; ( async () => {

	// Browser
	puppeteer.use( StealthPlugin() )

	if ( captchaData.api_key )	// optional
		puppeteer.use( 
			RecaptchaPlugin({
				provider: {
					id: captchaData.provider || '2captcha',
					token: captchaData.api_key
				},
				visualFeedback: true
			})
		)
	;

	const browser = await puppeteer.launch({ headless: false, defaultViewport: null })
	const page = ( await browser.pages() )[0]


	// Page
	console.log( chalk.bgYellow.black( messages.pageLoaded ) )

	await page.setUserAgent( userAgent.toString() )
	await page.goto( pageIndex, { waitUntil: 'networkidle2' } )

	console.log( chalk.bgGreen.black( `${messages.loaded}\n` ) )
	console.log( chalk.bgYellow.black( `${messages.fillingData}` ) )


	// Types fullname
	await page.waitForSelector( field.name )
	await page.type( field.name, data.nombre )


	// Types RUN
	await page.waitForSelector( field.run )
	await page.type( field.run, data.rut )


	// Types age
	await page.waitForSelector( field.age )
	await page.type( field.age, data.edad )


	// Selects region
	await page.waitForSelector( field.region )
	await page.click( field.region )

	const region_option = await getOption.call( page, field.region, data.region, messages.field.region )

	if ( region_option )
		await page.click( region_option )
	
	else
		console.log( chalk.bgRed.black( messages.fallRegion) )
	;


	// Selects county
	if ( region_option ) {
		await page.waitForSelector( field.county )
		await page.click( field.county )
		await page.waitForFunction( county_selector => document.querySelectorAll(`${county_selector} > div.chosen-drop > ul.chosen-results > li`).length > 1, {}, field.county )

		const county_option = await getOption.call( page, field.county, data.comuna, messages.field.county )
		
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


	// Data filled message
	console.log( chalk.bgGreen.black( `${messages.dataFilled}\n` ) )


	// Scroll to down
	await page.evaluate( () => window.scrollBy( 0, window.innerHeight ) )


	// Solves CAPTCHA (optional)
	if ( captchaData.api_key ) {
		console.log( chalk.bgYellow.black( `${messages.solving}\n` ) )
		const { error } = await page.solveRecaptchas()
		
		if ( !error )
			console.log( chalk.bgYellow.black( `${messages.solving_done}\n` ) )
		;
		
	} else {
		// Wait for terminate the procedure ...
		console.log( chalk.bgYellow.black( messages.continue ) )
		console.log( `${messages.waiting}\n` )
	}


	// Waits until user close the window
	await browser.on( 'targetdestroyed', async target => {
		if ( target === page.target() ) {
			await browser.close()
			console.log( chalk.bgGreen.black( messages.ready ) )
		}
	})

})()
