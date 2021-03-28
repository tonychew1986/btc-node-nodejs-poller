
var request = require("request");
const axios = require('axios');

const headers = {
  "content-type": "text/plain;"
};

var tx = require('./transaction.js');

init();

////
// NEED TO OPTIMISE LOGIC SO THAT ADDRESS WITH HIGHER BLOCK HEIGHT DO NOT GET LOOPED
//
//
//

// starting height will always be from the lowest block height among watched addresses

async function init() {
  // call api to get address to track
  let trackedAddress = await tx.getAddressAll();
  console.log(trackedAddress);

  let trackedUtxo = await tx.getUtxoAll();
  console.log(trackedUtxo);

  let addressArray = [];
  let lowestBlockHeightAmongAddresses = 99999999999999999999;

  for(var i=0; i<trackedAddress.length; i++){
    addressArray.push(trackedAddress[i]["address"])

    if(trackedAddress[i]["blockHeight"] < lowestBlockHeightAmongAddresses){
      lowestBlockHeightAmongAddresses = parseInt(trackedAddress[i]["blockHeight"]);
    }
  }

  let currentBlockHeight = await tx.getBlockCount();
  console.log("currentBlockHeight", currentBlockHeight);

  // Get genesis block or specific block height
  let startHeight = lowestBlockHeightAmongAddresses + 1; //1610100; //currentBlockHeight - 10000 // db height
  console.log("startHeight", startHeight);

  // Get current block height
  let bestBlockHash = await tx.getBestBlockHash()
  console.log("bestBlockHash", bestBlockHash);

  // get latest block height
  let trackedHeight = startHeight;

  for(var x=trackedHeight; x<currentBlockHeight; x++){
    if(trackedHeight !== currentBlockHeight){
      let currentBlockHash = await tx.getBlockHash(trackedHeight)
      //console.log("currentBlockHash", currentBlockHash);

      // Get block information
      let currentBlockInfo = await tx.getBlock(currentBlockHash);
      //console.log("currentBlockInfo", currentBlockInfo);

      for(var y=0; y<currentBlockInfo["tx"].length; y++){
        let currentBlockVin = currentBlockInfo["tx"][y]["vin"];
        let currentBlockVout = currentBlockInfo["tx"][y]["vout"];
        // console.log("currentBlockVin", currentBlockVin);
        //console.log("currentBlockVout", currentBlockVout);

        // Searching for spent utxo to remove
        for(var z=0; z<currentBlockVin.length; z++){
          let currentBlockTxId = currentBlockVin[z]["txid"];
          let currentBlockVoutNum = currentBlockVin[z]["vout"];

          for(var i=0; i<trackedAddress.length; i++){
            // if address monitored block height > crawled block height then ignore
            // if(trackedAddress[i]["blockHeight"] < trackedHeight){
            if(true){
              for(var r=0; r<trackedUtxo.length; r++){
                if(trackedUtxo[r]["utxoId"] == currentBlockTxId){
                  if(trackedUtxo[r]["vout"] == currentBlockVoutNum){
                    console.log("------------------");
                    console.log("------------------");
                    console.log("-----REMOVED!!------");
                    console.log("------------------");
                    console.log("------------------");
                    // console.log("currentBlockVout", currentBlockInfo["tx"][y]["vout"]);
                    // console.log("currentBlockVoutNum", currentBlockVoutNum);
                    // console.log("currentBlockVoutAddr", currentBlockInfo["tx"][y]["vout"][0]["scriptPubKey"]["addresses"]);

                    // need to getrawtransaction here
                    // since i dont know value of utxo
                    // console.log("currentBlockTxId", currentBlockTxId);
                    let rawTx = await tx.getRawTransaction(currentBlockTxId)
                    // console.log("rawTx", rawTx)

                    let spentAmount = 0;
                    for(var p=0; p<rawTx["vout"].length; p++){
                      if(trackedAddress[i]["address"] == rawTx["vout"][p]["scriptPubKey"]["addresses"]){
                        spentAmount = rawTx["vout"][p]["value"]
                        // console.log("address", trackedAddress[i]["address"])
                        // console.log("spentAmount", spentAmount)
                      }
                    }

                    let resultAddress = await tx.updateAddress(trackedAddress[i]["address"], trackedHeight);

                    console.log("resultUtxoRemove-1111")
                    console.log(trackedAddress[i]["address"], trackedUtxo[r]["utxoId"], trackedUtxo[r]["balance"], trackedUtxo[r]["vout"])
                    let resultUtxoRemove = await tx.removeUtxo(trackedAddress[i]["address"], trackedUtxo[r]["utxoId"], trackedUtxo[r]["balance"], trackedUtxo[r]["vout"]);
                    console.log("resultUtxoRemove-2222")

                  }
                }
              }
            }
          }
        }

        // Searching for new transaction input
        for(var z=0; z<currentBlockInfo["tx"][y]["vout"].length; z++){
          let currentBlockVoutValue = currentBlockInfo["tx"][y]["vout"][z]["value"];
          let currentBlockVoutNum = currentBlockInfo["tx"][y]["vout"][z]["n"];
          let currentBlockVoutAddress = currentBlockInfo["tx"][y]["vout"][z]["scriptPubKey"]["addresses"];
          let currentBlockVoutUtxoId = currentBlockInfo["tx"][y]["txid"];

          if(currentBlockVoutValue !== 0){
            //console.log("currentBlockVoutValue", currentBlockVoutValue);
            //console.log("currentBlockVoutAddress", currentBlockVoutAddress);
            for(var i=0; i<trackedAddress.length; i++){
              if(trackedAddress[i]["address"] == currentBlockVoutAddress){
                if(trackedAddress[i]["blockHeight"] < trackedHeight){
                  console.log("------------------");
                  console.log("------------------");
                  console.log("-----FOUND!!------");
                  console.log("------------------");
                  console.log("------------------");
                  console.log("currentBlockVout", currentBlockInfo["tx"][y]["vout"]);
                  console.log("currentBlockVoutNum", currentBlockVoutNum);


                  trackedAddress[i]["blockHeight"] = trackedHeight;

                  let resultAddress = await tx.updateAddress(trackedAddress[i]["address"], trackedHeight);
                  let resultUtxo = await tx.addUtxo(trackedAddress[i]["address"], currentBlockVoutUtxoId, currentBlockVoutValue, currentBlockVoutNum, trackedHeight);
                }
              }
            }
          }
        }
      }


      trackedHeight++;
      console.log("trackedHeight", trackedHeight);

      if(trackedHeight % 10000 == 0){
        massUpdateAddress(trackedAddress, trackedHeight);
      }
    }else{
      massUpdateAddress(trackedAddress, trackedHeight);

      break;
    }
  }
  massUpdateAddress(trackedAddress, trackedHeight);
}

async function massUpdateAddress(trackedAddress, trackedHeight){
  for(var i=0; i<trackedAddress.length; i++){
    let addr = trackedAddress[i]["address"];

    let resultAddress = await tx.updateAddress(addr, trackedHeight);

    console.log("resultAddress", resultAddress);
    console.log("addr", addr);
  }
  console.log("reached the latest block");
}
