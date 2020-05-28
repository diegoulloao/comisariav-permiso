/** 
 * 
 *	Functions.
 *	@module assets/functions
 *
 *	@description Contains all functions used in main file.
 * 
*/


const Table = require( 'cli-table' )
const chalk = require( 'chalk' )

const data = require( './../data.json' )


/**
* 
* 	Returns the option selector in the html select by keyword.
* 
* 	@param { string } selector - The option selector where to search.
* 	@param { string } optionText - Keyword to match.
* 
* 	@returns { string } selector
* 
*/
async function getOption( selector, optionText, fieldName ) {

    return await this.evaluate( ( selector, optionText, fieldName )  => {

        let target = Array.from( document.querySelectorAll( `${selector} > div.chosen-drop > ul.chosen-results > li` ) )
            .filter( option => option.textContent === optionText )
        ;

        if ( target.length === 0 ) {
            alert( `El valor "${optionText}" para "${fieldName}" no existe, corrobórelo en su archivo de datos.` )
            return false
        }
        
        target = target[0].getAttribute( 'data-option-array-index' )

        return `${selector} > div.chosen-drop > ul.chosen-results > li[data-option-array-index="${target}"]`
        
    }, selector, optionText, fieldName )

}


/**
 * 
 *  Shows All Data in screen.
 *  @returns void
 * 
 */
function printData() {

    const dataTable = new Table()

    Object.keys(data).map( field => {
        if ( field !== "copia_email" )
            dataTable.push([ chalk.bold.green( field.charAt(0).toUpperCase() + field.slice(1) ), data[field] ])
        ;
    })

    console.log( `${dataTable.toString()}\n` )

}


module.exports = { getOption, printData }
