/**
 * 
 *	Comisariav-permiso
 *	v1.0
 *	@diegoulloao
 * 
 *	2020 · Apache Licence 2.0
 * 
 */


// Extends puppeteer
const puppeteer = require( 'puppeteer-extra' )

// Captcha
const userAgent = require( 'user-agents' )
const StealthPlugin = require( 'puppeteer-extra-plugin-stealth' )
const RecaptchaPlugin = require( 'puppeteer-extra-plugin-recaptcha' )

// Console input
const chalk = require( 'chalk' )
const inquirer = require( 'inquirer' )

// File Stream
const fs = require( 'fs' )
const util = require( 'util' )
const stream = require( 'stream' )

// Http
const fetch = require( 'node-fetch' )


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
const utils = require( './assets/utils' )


/**
 * 
 *	Dictionary
 * 
 */
const messages = require( './assets/dictionary.json' )


/**
 * 
 * 	App Config
 * 
 */
const config = require( './config.json' )


/**
 * 
 * 	Captcha API-KEY & Provider
 * 
 */
const { captcha } = require( './config.json' )


/**
 * 
 *	Abstracted web URL where to get the permission
 * 
 */
let pageIndex = "https://comisariavirtual.cl/tramites/iniciar/10@.html"


// Get the permission
; ( async () => {

	// Confirm prompt
	console.log( chalk.bgYellow.black.bold( `${messages.confirm}\n` ) )
	utils.printData()

	const { permission_type } = await inquirer.prompt({
		type: "list",
		name: "permission_type",
		message: messages.permission_type,
		choices: [
			'Compra de alimentos e insumos básicos',
			'Sacar a pasear mascota'
		],

		filter: ( answer ) => {
			
			switch ( answer ) {
				case 'Compra de alimentos e insumos básicos':
					answer = 3
					break
				;

				case 'Sacar a pasear mascota':
					answer = 1
				;
			}

			return answer
		}
	})

	// Set the URL
	pageIndex = pageIndex.replace( '@', permission_type )

	// Browser
	puppeteer.use( StealthPlugin() )

	if ( captcha['api-key'] )
		puppeteer.use( 
			RecaptchaPlugin({
				visualFeedback: true,
				provider: {
					id: captcha.provider || '2captcha',
					token: captcha[ 'api-key' ]
				}
			})
		)
	else
		// No Captcha api-key forces headless:false
		config[ 'headless-process' ] = false
	;

	const browser = await puppeteer.launch({ headless: config['headless-process'], defaultViewport: null })
	const page = ( await browser.pages() )[0]


	// Page
	console.log()
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

	const regionOption = await utils.getOption.call( page, field.region, data.region, messages.field.region )

	if ( regionOption )
		await page.click( regionOption )

	else
		console.log( chalk.bgRed.white( messages.fallRegion ) )
	;


	// Selects county
	if ( regionOption ) {
		await page.waitForSelector( field.county )
		await page.click( field.county )
		await page.waitForFunction( county_selector => document.querySelectorAll(`${county_selector} > div.chosen-drop > ul.chosen-results > li`).length > 1, {}, field.county )

		const countyOption = await utils.getOption.call( page, field.county, data.comuna, messages.field.county )
		
		if ( countyOption )
			await page.click( countyOption )

		else
			console.log( chalk.bgRed.white( messages.fallCounty ) )
		;
	}


	// Types address
	await page.waitForSelector( field.address )
	await page.type( field.address, data.direccion )


	// Checks all reasons
	if ( permission_type === 3 )
		field.reason.map( async selector => {
			await page.waitForSelector( selector )
			await page.click( selector )
		})
	;


	// Checks roundtrip
	await page.waitForSelector( field.roundtrip )
	await page.click( field.roundtrip )


	// Types destiny
	if ( permission_type === 3 ) {
		await page.waitForSelector( field.destiny )
		await page.type( field.destiny, data.destino )
	}


	// Selects email copy (optional)
	await page.waitForSelector( config['email-copy'] ? field.copy[1] : field.copy[0] )
	await page.click( config['email-copy'] ? field.copy[1] : field.copy[0] )

	if ( config['email-copy'] ) {
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

	// Solves CAPTCHA
	if ( captcha['api-key'] ) {

		console.log( chalk.bgYellow.black( `${messages.solving}` ) )
		const { solved } = await page.solveRecaptchas()

		if ( !solved.length || !solved[0].isSolved ) {
			console.log( chalk.bgRed.white( `${messages.solvingFailed}\n` ) )
			process.exit(0)
		}

		// Solved. Continue
		console.log( chalk.bgGreen.black( `${messages.solvingDone}\n` ) )

		// Promise it when navigates to submit page
		await Promise.all([
			page.waitForNavigation(),
			page.click( field.submit )

		]).catch( error => {
			console.log( chalk.bgRed.white(error) )
			throw error
		})

		// Checks for auth errors
		if ( page.url().split('/').pop().split('.').shift() === 'error_vigente' ) {
			let error_message = await page.$eval( '.alert.alert-success', error_container => error_container.innerText )
			console.log( chalk.bgRed.white.bold( error_message ) )

			if ( config['headless-process'] ) {
				await browser.close()
				process.exit(0)

			} else {
				browser.on( 'targetdestroyed', async target => {
					if ( target === page.target() ) {
						await browser.close()
						process.exit(0)
					}
				})
				
				return ;
			}
		}

		// Auto-download PDF Permission
		console.log( chalk.bgYellow.black( `${messages.downloading}` ) )

		await page.waitForSelector( field.download )
		const fetchURL = await page.$eval( field.download, download => download.href )

		// Manage permission download via async fetch
		await ( async () => {

			// Download the pdf permission
			const response = await fetch( fetchURL )

			// Prepare streamline
			const streamPipeline = util.promisify( stream.pipeline )
			const writeStream = fs.createWriteStream( `${ config['download-path'] }/permisov-${ Date.now() }.pdf` )

			// Save file to disk
			streamPipeline( response.body, writeStream )

			if ( config['headless-process'] ) {
				console.log( chalk.bgGreen.black.bold(message.ready) )

				await browser.close()
				process.exit(0)
			}

		})()

		console.log( chalk.bgGreen.black(
			`${ messages.downloaded + ( config["email-copy"] ? messages.downloaded_copy : '' ) }\n`
		))
		
	} else {

		// Wait for terminate the procedure ...
		console.log( chalk.bgYellow.black( messages.continue ) )
		console.log( `${messages.waiting}\n` )

	}


	// All done. Waits until user close the window
	if ( !config['headless-process'] )
		browser.on( 'targetdestroyed', async target => {
			if ( target === page.target() ) {
				console.log( chalk.bgGreen.black.bold( messages.ready ) )

				await browser.close()
				process.exit(0)
			}
		})
	;

})()
