/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var fetch = require("node-fetch");

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

var stocksDB = {};

function addToStocksDB(symbol, price, like) {
  if (symbol) {
    if (stocksDB.hasOwnProperty(symbol)) {
      stocksDB[symbol] = {
        price,
        like: like ? stocksDB[symbol].like + 1 : stocksDB[symbol].like,
      };
    } else {
      stocksDB[symbol] = {
        price,
        like: like ? 1 : 0,
      };
    }
  }
}

module.exports = function (app) {
  async function getStock(stock) {
    const fetchRes = await fetch(
      `https://stock-price-checker-proxy--freecodecamp.repl.co/v1/stock/${stock}/quote`
    );
    const { symbol, latestPrice } = await fetchRes.json();
    return {
      symbol,
      price: `${latestPrice}`,
    };
  }

  app.route("/api/stock-prices").get(async function (req, res) {
    const { stock, like } = req.query;

    let stockKeys = [];

    console.log(stock);
    if (stock) {
      if (typeof stock === "string") {
        let { symbol, price } = await getStock(stock);
        addToStocksDB(symbol, price, like);
        stockKeys.push(stock.toUpperCase());
      } else {
        for (let i = 0; i < stock.length; i++) {
          // 2 stocks
          let { symbol, price } = await getStock(stock[i]);
          addToStocksDB(symbol, price, like);
          stockKeys.push(stock[i].toUpperCase());
        }
      }
    }

    let result = {};
    if (stockKeys.length === 1) {
      result = {
        stock: stockKeys[0],
        ...stocksDB[stockKeys[0]]
      };
    } else {
      result = Object.keys(stocksDB)
      .filter((key) => stockKeys.includes(key))
      .map((key) => ({
        stock: key,
        ...stocksDB[key],
      }));
    };

    res.json({
      stockData: result,
    });
  });
};
