require("dotenv").config();
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connection = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true
});

const displayItems = () => {
    connection.query("SELECT * FROM products", (err, res) => {
        if (err) throw err;
        console.log("\n\n" + cTable.getTable(res));
    });
};

const purchaseItems = () => {
    inquirer.prompt([{
            name: "id",
            message: "Enter the ID of the product you would like to purchase:",
            validate: value => {
                return value && !isNaN(value) || "Please enter a number";
            },
            filter: value => {
                return parseInt(value);
            }
        },
        {
            name: "amount",
            message: "How many units would you like?",
            validate: value => {
                return value && !isNaN(value) || "Please enter a number";
            },
            filter: value => {
                return parseInt(value);
            }
        }
    ]).then(answer => {
        const query = "UPDATE products SET stock_quantity = CASE WHEN stock_quantity >= ? THEN stock_quantity - ? ELSE stock_quantity END WHERE item_id = ?; SELECT product_name, stock_quantity, price FROM products WHERE item_id = ?;";
        connection.query(query, [answer.amount, answer.amount, answer.id, answer.id], (err, res) => {
            if (err) throw err;
            console.log(res[0].changedRows ? `Successfully purchased ${answer.amount} unit(s) of ${res[1][0].product_name}\nTotal Cost: ${(answer.amount * res[1][0].price).toFixed(2)}` : "Insufficient quantity!");
            doItAgain();
        });
    });
};

const doItAgain = () => {
    inquirer.prompt([{
        name: "answer",
        message: "Would you like to purchase anything else?",
        type: "confirm",
        default: true
    }]).then(res => {
        res.answer ? main() : connection.end(err => {
            if (err) throw err;
            console.log("Goodbye!")
        });
    });
};

const main = () => {
    const promiseAttempt = new Promise((resolve, reject) => {
        displayItems();
        setTimeout(() => {
            resolve("success!")
        }, 250);
    })

    promiseAttempt.then(purchaseItems);
};

main();