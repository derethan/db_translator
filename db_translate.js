//Import Dependencies
const translate = require('translate-google');
const util = require('util');

// Configure dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });


// Funtion to translate text
async function translateText(text, target) {
    try {
        const translatedText = await translate(text, { to: target });
        return translatedText;
    } catch (error) {
        console.error('Translation Error: ', error);
        return text;
    }
}

// Async function to perform the tast
async function translateDB() {

    //Establish connection to database
    const db_con = require('./js/db'); // Import db.js
    const dbQueryPromise = util.promisify(db_con.query).bind(db_con); //promisify db_con.query


    try {
        // Query to get the number of rows in the table
        const rows = await dbQueryPromise('SELECT COUNT(*) AS count FROM cash_shop_item');
        const rowCount = rows[0].count;

        console.log ('There Are ' + rowCount + ' entries in the table to translate');

        //Query to get all items from the table
        const items = await dbQueryPromise('SELECT cash_name FROM cash_shop_item');

        console.log('Starting translation...');

        // Loop through the items and translate the name
        for (const item of items) {

            const item_Name = item.cash_name;


            const item_Name_Trans = await translateText(item_Name, 'en');

            if (item_Name != item_Name_Trans)
            {
            // Query to update the translated name
            await dbQueryPromise ('UPDATE cash_shop_item SET cash_name = ? WHERE cash_name = ?', [item_Name_Trans, item_Name]);

            console.log ('Translated: ' + item_Name + ' to : ' + item_Name_Trans);
            } else
            {
                console.log ('Skipped: ' + item_Name);
            }
        }


    } catch (error) {
        console.error('Error: ', error);
    } finally {
        console.log('Translation Complete, closing database connection and exiting');

        db_con.end();
    }
}

//translateDB();
