/**
 * 
 *	Obtanins a document of permission to go buy food in Chile during the covid-19.
 *	@module main
 * 
 *	Written by @diegoulloao
 *	@version 1
 * 
 */


// Extends puppeteer
const puppeteer = require( 'puppeteer-extra' )

const userAgent = require( 'user-agents' )
const StealthPlugin = require( 'puppeteer-extra-plugin-stealth' )
const RecaptchaPlugin = require( 'puppeteer-extra-plugin-recaptcha' )

const chalk = require( 'chalk' )
const inquirer = require( 'inquirer' )

const fs = require( 'fs' )
const util = require( 'util' )
const stream = require( 'stream' )

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
const { getOption, printData } = require( './assets/functions' )


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
 *	Web URL where to get the permission
 * 
 */
const pageIndex = "https://comisariavirtual.cl/tramites/iniciar/101.html"


// Fills the fields
; ( async () => {

	// Confirm prompt
	console.log( chalk.bgYellow.black.bold( `${messages.confirm}\n` ) )
	printData()

	const response = await inquirer.prompt({
		type: "confirm",
		name: "proceed",
		message: messages.yesno
	})

	if ( !response.proceed )
		process.exit(0)
	;


	// Browser
	puppeteer.use( StealthPlugin() )

	if ( config.captcha['api-key'] )	// optional
		puppeteer.use( 
			RecaptchaPlugin({
				visualFeedback: true,
				provider: {
					id: config.captcha.provider || '2captcha',
					token: config.captcha[ 'api-key' ]
				}
			})
		)
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

	const regionOption = await getOption.call( page, field.region, data.region, messages.field.region )

	if ( regionOption )
		await page.click( regionOption )
	
	else
		console.log( chalk.bgRed.black( messages.fallRegion ) )
	;


	// Selects county
	if ( regionOption ) {
		await page.waitForSelector( field.county )
		await page.click( field.county )
		await page.waitForFunction( county_selector => document.querySelectorAll(`${county_selector} > div.chosen-drop > ul.chosen-results > li`).length > 1, {}, field.county )

		const countyOption = await getOption.call( page, field.county, data.comuna, messages.field.county )
		
		if ( countyOption )
			await page.click( countyOption )

		else
			console.log( chalk.bgRed.black( messages.fallCounty ) )
		;
	}


	// Types address
	await page.waitForSelector( field.address )
	await page.type( field.address, data.direccion )


	// Checks all reasons
	field.reason.map( async selector => { return ;
		await page.waitForSelector( selector )
		await page.click( selector )
	})


	// Checks roundtrip
	await page.waitForSelector( field.roundtrip )
	await page.click( field.roundtrip )


	// Types destiny
	// await page.waitForSelector( field.destiny )
	// await page.type( field.destiny, data.destino )


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

	// Solves CAPTCHA (optional)
	if ( captchaData['api-key'] ) {

		console.log( chalk.bgYellow.black( `${messages.solving}` ) )
		const { solved } = await page.solveRecaptchas()

		if ( !solved.length || !solved[0].isSolved ) {
			console.log( chalk.bgRed.black( `${messages.solvingFailed}\n` ) )
			process.exit(0)
		}

		// Solved. Continue
		console.log( chalk.bgGreen.black( `${messages.solvingDone}\n` ) )

		// Promise it when navigates to submit page
		await Promise.all([
			page.waitForNavigation(),
			page.click( field.submit )
		])

		// Auto-download PDF Permission
		console.log( chalk.bgYellow.black( `${messages.downloading}` ) )

		await page.waitForSelector( field.download )
		const fetchURL = await page.$eval( field.download, download => download.href )

		// Manage permission download via async fetch
		await ( async () => {

			// Donwload the pdf permission
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

		console.log( chalk.bgGreen.black( `${messages.downloaded}\n` ) )
		
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
