
var request = require("request");
const axios = require('axios');

const USER = "RockX"; //process.env.RPC_USER;
const PASS = "RockX"; //process.env.RPC_PASSWORD;
const IP = "3.1.85.124";
const PORT = "18332";

const headers = {
  "content-type": "text/plain;"
};

//
//
// Address to watch
// get data from db
// api > db
// poller > db

// db structure:
// address, utxoCount, balanceTotal
// address, utxo

// how to add address to db

let trackedAddress = [
  "mpXwg4jMtRhuSpVq4xS3HFHmCmWp9NyGKt",
  "2NB1DcHpU1dFLofhC4MbcuqhMBvsC2obSZj",
  "2N5jbce6nZbGM6vPzCtwtZRDjmWVohhb1bj",
  "n4qRvMS6RHtPkQFk5HcxkK4DZ1MejeiGqd",
  "mi4pAbA4ow3hVskWQXJ2FmEJ23BNc8pXTk",
  "msPLqihLLkuKdn2WDaSDQMK2SeHYt57xeY",
  "msjFmUD2R4PMvjW5o8s1ZsJVMwcQuHAejt",
  "mtqU97Nv69DPeEaQz2i2YdyrjxkqxasECm"
]

let trackedAddressDetail = [
  {
    address: "mpXwg4jMtRhuSpVq4xS3HFHmCmWp9NyGKt",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "2NB1DcHpU1dFLofhC4MbcuqhMBvsC2obSZj",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "2N5jbce6nZbGM6vPzCtwtZRDjmWVohhb1bj",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "n4qRvMS6RHtPkQFk5HcxkK4DZ1MejeiGqd",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "mi4pAbA4ow3hVskWQXJ2FmEJ23BNc8pXTk",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "msPLqihLLkuKdn2WDaSDQMK2SeHYt57xeY",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "msjFmUD2R4PMvjW5o8s1ZsJVMwcQuHAejt",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "mtqU97Nv69DPeEaQz2i2YdyrjxkqxasECm",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
  {
    address: "mx5DRB8Gsb7ypMU8cXvYxaadJgN6rjVs5x",
    utxo: [],
    balance: 0,
    blockheight: 0,
  },
]

// db structure
// address, utxo id, value, blockheight

let rawLog = []

var blockOutput = []
var blockInput = []

let utxoArray = []

init()

//const utxos = await client.command('scantxoutset', 'start', ['addr(some_valid_address), addr(some_valid_address)'])

async function init(){

  let currentBlockHeight = await getBlockCount();
  console.log("currentBlockHeight", currentBlockHeight);

  // Get genesis block or specific block height
  let startHeight = 1609782//currentBlockHeight - 10000 // db height

  // Get current block height
  let bestBlockHash = await getBestBlockHash()
  //console.log("bestBlockHash", bestBlockHash);

  // get latest block height
  let trackedHeight = startHeight;
  for(var x=trackedHeight; x<currentBlockHeight; x++){
    if(trackedHeight !== currentBlockHeight){
      let currentBlockHash = await getBlockHash(trackedHeight)
      //console.log("currentBlockHash", currentBlockHash);

      // Get block information
      let currentBlockInfo = await getBlock(currentBlockHash);
      //console.log("currentBlockInfo", currentBlockInfo);

      for(var y=0; y<currentBlockInfo["tx"].length; y++){
        let currentBlockVin = currentBlockInfo["tx"][y]["vin"];
        let currentBlockVout = currentBlockInfo["tx"][y]["vout"];
        //console.log("currentBlockVin", currentBlockVin);
        //console.log("currentBlockVout", currentBlockVout);


        for(var z=0; z<currentBlockVin.length - 1; z++){
          let currentBlockTxId = currentBlockVin[z]["txid"];
          let currentBlockVoutNum = currentBlockVin[z]["vout"];

          for(var i=0; i<trackedAddressDetail.length; i++){
            for(var r=0; r<trackedAddressDetail[i]["utxo"].length; r++){
              if(trackedAddressDetail[i]["utxo"][r][0] == currentBlockTxId){
                if(trackedAddressDetail[i]["utxo"][r][1] == currentBlockVoutNum){
                  console.log("------------------");
                  console.log("------------------");
                  console.log("-----REMOVED!!------");
                  console.log("------------------");
                  console.log("------------------");
                  console.log("currentBlockVout", currentBlockInfo["tx"][y]["vout"]);
                  console.log("currentBlockVoutNum", currentBlockVoutNum);

                  // need to getrawtransaction here
                  // since i dont know value of utxo
                  let rawTx = await getRawTransaction(currentBlockTxId)
                  let spentAmount = 0;
                  for(var p=0; p<rawTx["vout"].length; p++){
                    if(trackedAddressDetail[i]["address"] == rawTx["vout"][p]["scriptPubKey"]["addresses"]){
                      spentAmount = rawTx["vout"][p]["value"]
                    }
                  }
                  console.log("spentAmount", spentAmount)
                  /*
                  let newBalance = trackedAddressDetail[i]["balance"] - spentAmount
                  trackedAddressDetail[i]["balance"] = newBalance;

                  trackedAddressDetail[i]["utxo"].splice(r, 1);
                  */
                  blockInput.push({
                    currentBlockTxId, currentBlockVoutNum
                  })
                }
              }
            }
          }
        }

        for(var z=0; z<currentBlockInfo["tx"][y]["vout"].length - 1; z++){
          let currentBlockVoutValue = currentBlockInfo["tx"][y]["vout"][z]["value"];
          let currentBlockVoutNum = currentBlockInfo["tx"][y]["vout"][z]["n"];
          let currentBlockVoutAddress = currentBlockInfo["tx"][y]["vout"][z]["scriptPubKey"]["addresses"];
          let currentBlockVoutUtxoId = currentBlockInfo["tx"][y]["txid"];

          if(currentBlockVoutValue !== 0){
            //console.log("currentBlockVoutValue", currentBlockVoutValue);
            //console.log("currentBlockVoutAddress", currentBlockVoutAddress);
            for(var i=0; i<trackedAddressDetail.length; i++){
              if(trackedAddressDetail[i]["address"] == currentBlockVoutAddress){
                if(trackedAddressDetail[i]["blockheight"] < trackedHeight){
                  console.log("------------------");
                  console.log("------------------");
                  console.log("-----FOUND!!------");
                  console.log("------------------");
                  console.log("------------------");
                  console.log("currentBlockVout", currentBlockInfo["tx"][y]["vout"]);
                  console.log("currentBlockVoutNum", currentBlockVoutNum);

                  let newBalance = trackedAddressDetail[i]["balance"] + currentBlockVoutValue
                  trackedAddressDetail[i]["balance"] = newBalance;

                  trackedAddressDetail[i]["utxo"].push([currentBlockVoutUtxoId, currentBlockVoutNum]);

                  blockOutput.push({
                    currentBlockVoutAddress, currentBlockVoutValue, currentBlockVoutUtxoId, currentBlockVoutNum, trackedHeight
                  })
                }
              }
            }
          }
        }
      }

      // If address shown in vout then add balance and utxo
      // If utxo shown in vin then remove utxo and reduce balance

      trackedHeight++;
      console.log("trackedHeight", trackedHeight);
    }else{
      break;
    }
  }

  console.log("trackedAddressDetail", trackedAddressDetail);
  console.log("blockInput", blockInput);
  console.log("blockOutput", blockOutput);


  // bitcoin-cli getblockhash 0
  // bitcoin-cli getblock 000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943 2
}
/*
function mapTrackedAddress(){
  for(var i=0; i<trackedAddress.length; i++){
    let addressInfo = {
      address: trackedAddress[i]
    }
    addressInfo.balance = id;
    trackedAddressDetail.push({
      address: "mpXwg4jMtRhuSpVq4xS3HFHmCmWp9NyGKt",
      utxo: {

      },
      balance: 0,
      blockheight: 0,
    })

    trackedAddressDetail.push(addressInfo)
  }
}
*/

function checkAddTrackedAddress(destinationDB, addressToCheck, value){
  for(var i=0; i<trackedAddress.length; i++){
    if(trackedAddress[i] == addressToCheck){
      destinationDB.push([addressToCheck, value])
    }
  }
}

async function getBlockCount(){
  var promise = new Promise(function(resolve, reject){
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockcount","params":[]}`;

    let url = `http://${USER}:${PASS}@${IP}:${PORT}/`;

    axios.post(url, dataString)
    .then(function (response) {
      console.log(response["data"]["result"])

      resolve(response["data"]["result"])
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

async function getBestBlockHash(){
  var promise = new Promise(function(resolve, reject){
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getbestblockhash","params":[]}`;


    let url = `http://${USER}:${PASS}@${IP}:${PORT}/`;

    axios.post(url, dataString)
    .then(function (response) {
      console.log(response["data"]["result"])

      resolve(response["data"]["result"])
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

async function getBlock(hash){
  var promise = new Promise(function(resolve, reject){
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblock","params":["${
      hash
    }",2]}`;

    let url = `http://${USER}:${PASS}@${IP}:${PORT}/`;

    axios.post(url, dataString)
    .then(function (response) {
      //console.log(response["data"]["result"])

      resolve(response["data"]["result"])
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

async function getBlockHash(index){
  var promise = new Promise(function(resolve, reject){
    var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"getblockhash","params":[${
      index
    }]}`;

    let url = `http://${USER}:${PASS}@${IP}:${PORT}/`;

    axios.post(url, dataString)
    .then(function (response) {
      console.log(response["data"]["result"])

      resolve(response["data"]["result"])
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

async function getRawTransaction(txId){
  var promise = new Promise(function(resolve, reject){
    var dataString = `{"jsonrpc":"2.0","id":"curltext","method":"getrawtransaction","params":["${
      txId
    }", 1]}`;

    let url = `http://${USER}:${PASS}@${IP}:${PORT}/`;

    axios.post(url, dataString)
    .then(function (response) {
      //console.log(response["data"]["result"])

      resolve(response["data"]["result"])
    })
    .catch(function (error) {
      console.log(error);
    });

  });
  return promise;
}

/*
router.get("/decoderawtransaction/:hex", (req, res) => {
  var dataString = `{"jsonrpc":"1.0","id":"curltext","method":"decoderawtransaction","params":["${
    req.params.hex
  }"]}`;
  var options = {
    url: `http://${USER}:${PASS}@${IP}:${PORT}/`,
    method: "POST",
    headers: headers,
    body: dataString
  };

  callback = (error, response, body) => {
    if (!error && response.statusCode == 200) {
      const data = JSON.parse(body);
      res.send(data);
    }
  };
  request(options, callback);
});
*/
