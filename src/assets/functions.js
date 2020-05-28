/** 
 * 
 *	Functions.
 *	@module assets/functions
 *
 *	@description Contains all functions used in main file.
 * 
*/


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
async function getOption( selector, optionText ) {

    return await this.evaluate( ( selector, optionText )  => {
        let target = Array.from( document.querySelectorAll( `${selector} > div.chosen-drop > ul.chosen-results > li` ) )
            .filter( option => option.textContent === optionText )
        ;

        if ( target.length === 0 ) {
            alert( `El valor "${optionText}" no existe, corrobórelo en su archivo de datos.` )
            return false
        }
        
        target = target[0].getAttribute( 'data-option-array-index' )

        return `${selector} > div.chosen-drop > ul.chosen-results > li[data-option-array-index="${target}"]`
    }, selector, optionText )

}

module.exports = { getOption }
