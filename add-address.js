
var request = require("request");
const axios = require('axios');

var database = require('./db.js');

global.db = database.setupDB(
  process.env.DB_HOST,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  process.env.DB_DATABASE
);


function checkAddTrackedAddress(destinationDB, addressToCheck, value){
  for(var i=0; i<trackedAddress.length; i++){
    if(trackedAddress[i] == addressToCheck){
      destinationDB.push([addressToCheck, value])
    }
  }

  let address = "";

   var promise = new Promise(function(resolve, reject){
     let query = 'INSERT INTO `' + 'address' + '` (address, utxoCount, balanceTotal, blockHeight) VALUES("' + address +'", "", "0", "0", "0");'

     dbHoldingArea.query(query, (err, result) => {
         if (err) {
             // return res.status(500).send(err);
             resolve("fail");
         }

         resolve("success");
     });
   });
   return promise;
}
