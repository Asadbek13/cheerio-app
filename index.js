const request = require("request-promise");
const cheerio = require("cheerio");
const chalk = require("chalk");
const cron = require("node-cron");
const express = require("express");
const { filter } = require("cheerio/lib/api/traversing");

const data = {
  infinBank: {
    buy: "",
    sell: "",
  },
};

console.log(chalk.yellowBright("---LOGGING STARTS HERE---"));

const app = express();

const port = process.env.PORT || 3000;
// request(
//   "https://www.infinbank.com/uz/private/exchange-rates/",
//   (error, response, html) => {
//     if (error) {
//       console.log(error);
//     }

//     const infinBank = cheerio.load(html);

//     data.infinBank.buy = infinBank(".pr--32")["0"].next.next.children[0].data;
//     data.infinBank.sell = infinBank(".pr--32")["1"].next.next.children[0].data;

//     console.log(data);
//   }
// );

// request("https://ipakyulibank.uz/physical/", (error, response, html) => {
//   if (error) {
//     console.log(error);
//   }

//   const ipakyuliBank = cheerio.load(html);

//   const d = ipakyuliBank(".cur_block-1.cur_block")._root.text();

//   console.log(d);
// });

// update data every day at 23:59
// cron.schedule("59 23 * * *", function () {
//   console.log(new Date());
// });

let oldData = "$44,761.21$3,118.08$384.33";

cron.schedule("20,40,59 * * * * *", () => {
  request("https://coinmarketcap.com/", (error, response, html) => {
    if (error) {
      console.log(error);
    }

    const date = new Date();
    const time = date.toLocaleString("en-US", { hour12: false });

    const $ = cheerio.load(html);

    const bitcoin = $(".sc-131di3y-0")["0"].children[0].children[0].data;
    const ethereum = $(".sc-131di3y-0")["1"].children[0].children[0].data;
    const binance = $(".sc-131di3y-0")["2"].children[0].children[0].data;
    let newData = bitcoin + ethereum + binance;

    if (newData !== oldData) {
      oldData = newData;
      console.log(
        `Bitcoin BTC\tEthereum ETH\tBinance Coin BNB\t${time}\n${bitcoin}\t${ethereum}\t${binance}\n`
      );
    }
  });
});

// function normalize(item) {
//   item = item.split("");
//   for (let i = 0; i < item.length; i++) {
//     if (item[i] === "=" || item[i] === " ") {
//       item.splice(i, 1);
//       i -= 1;
//     }
//   }

//   return parseFloat(item.join(""));
// }

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(chalk.blueBright("Server is running..."));
});
