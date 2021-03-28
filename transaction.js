
const axios = require('axios');

require('dotenv').config()

const USER = process.env.RPC_USER; //"RockX"; //process.env.RPC_USER;
const PASS = process.env.RPC_PASSWORD; // "RockX"; //process.env.RPC_PASSWORD;
const IP = process.env.RPC_IP; // "3.1.85.124";
const PORT = process.env.RPC_PORT; // "18332";

let getAddressAll = async function() {
   var promise = new Promise(function(resolve, reject){
    let url = "http://localhost:3500/address/all";

    axios.get(url)
    .then(function (response) {
      let addressData = response["data"]["data"];

      resolve(addressData);
    })
    .catch(function (error) {
      console.log(error);
      resolve("fail");
    });
  });
  return promise;
}

let getUtxoAll = async function() {
   var promise = new Promise(function(resolve, reject){
    let url = "http://localhost:3500/utxo/all";

    axios.get(url)
    .then(function (response) {
      let addressData = response["data"]["data"];

      resolve(addressData);
    })
    .catch(function (error) {
      console.log(error);
      resolve("fail");
    });
  });
  return promise;
}

let getBlockCount = async function() {
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

let getBestBlockHash = async function() {
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

let getBlock = async function(hash) {
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

let getBlockHash = async function(index) {
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

let getRawTransaction = async function(txId) {
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

let updateAddress = async function(address, blockHeight) {
   var promise = new Promise(function(resolve, reject){
    let url = "http://localhost:3500/address";

    let data = {
      address: address,
      block_height: blockHeight,
    }

    console.log("data",data)

    axios.put(url, data)
    .then(function (response) {

      resolve(response["data"]);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

let addUtxo = async function(address, utxoId, balance, vout, blockHeight) {
   var promise = new Promise(function(resolve, reject){
    let url = "http://localhost:3500/utxo";

    let data = {
      address: address,
      utxo_id: utxoId,
      balance: balance,
      vout: vout,
      block_height: blockHeight,
    }

    console.log("data",data)

    axios.post(url, data)
    .then(function (response) {

      resolve(response["data"]);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

let removeUtxo = async function(address, utxoId, balance, vout) {
  console.log("removeUtxo")
   var promise = new Promise(function(resolve, reject){
    let url = "http://localhost:3500/utxo/remove";

    let data = {
      address: address,
      utxo_id: utxoId,
      balance: balance,
      vout: vout,
    }

    console.log("data",data)

    axios.post(url, data)
    .then(function (response) {

      resolve(response["data"]);
    })
    .catch(function (error) {
      console.log(error);
    });
  });
  return promise;
}

exports.getAddressAll = getAddressAll;
exports.getUtxoAll = getUtxoAll;
exports.getBlockCount = getBlockCount;
exports.getBestBlockHash = getBestBlockHash;
exports.getBlock = getBlock;
exports.getBlockHash = getBlockHash;
exports.getRawTransaction = getRawTransaction;

exports.addUtxo = addUtxo;
exports.removeUtxo = removeUtxo;
exports.updateAddress = updateAddress;
