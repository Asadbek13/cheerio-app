const request = require("request-promise");
const cheerio = require("cheerio");
const chalk = require("chalk");
const cron = require("node-cron");
const MongoClient = require("mongodb").MongoClient;
const express = require("express");

console.log(chalk.yellowBright("---LOGGING STARTS HERE---"));

const port = process.env.PORT || 3000;
const url =
  "mongodb+srv://admin-asadbek:admin@cluster0.zyrmo.mongodb.net/rateDB?retryWrites=true&w=majority";
let status = true;
let oldData = "$44,761.21$3,118.08$384.33";

const client = new MongoClient(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const app = express();

async function main() {
  await client.connect(async (err) => {
    if (err) {
      console.log(err);
    }

    const db = client.db("rateDB");

    if (status) {
      cron.schedule("* * * * * *", () => {
        request("https://coinmarketcap.com/", async (error, response, html) => {
          if (error) {
            console.log(error);
          }

          const date = new Date();
          const { day, month, year, hour, minute, second } = normalizeTime(
            date.getDay(),
            date.getMonth(),
            date.getFullYear(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds()
          );

          const time = `${day}/${month}/${year}, ${hour}:${minute}:${second}`;

          const $ = cheerio.load(html);

          const bitcoin = $(".sc-131di3y-0")["0"].children[0].children[0].data;
          const ethereum = $(".sc-131di3y-0")["1"].children[0].children[0].data;
          const binance = $(".sc-131di3y-0")["2"].children[0].children[0].data;
          let newData = bitcoin + ethereum + binance;

          if (newData !== oldData) {
            oldData = newData;
            const storeData = {
              "Bitcoin BTC": bitcoin,
              "Ethereum ETH": ethereum,
              "Binance Coin BNB": binance,
              Date: time,
            };
            console.log(
              `Bitcoin BTC\tEthereum ETH\tBinance Coin BNB\t${time}\n${bitcoin}\t${ethereum}\t${binance}\n`
            );
            const result = await db
              .collection("cryptocurrency")
              .insertOne(storeData);
            if (result.acknowledged) {
              console.log("Successfully inserted\n");
            }
          }
        });
      });
    }
  });
}

main();

app.get("/start", (req, res) => {
  status = true;
  res.send("<h1>Status is TRUE. Web Scraping is running...</h1>");
  main();
});

app.get("/stop", (req, res) => {
  status = false;
  res.send("<h1>Status is FALSE. Web Scraping is stopped...</h1>");
  main();
});

app.get("/status", (req, res) => {
  res.send(`<h1>Web Scraper is ${status ? "ON" : "OFF"}</h1>`);
});

app.get("/", (req, res) => {
  res.send("<h1>Hello Web Scraper!!!</h1>");
});

app.listen(port, () => {
  console.log(chalk.blueBright("Server is running..."));
});

function normalizeTime(day, month, year, hour, minute, second) {
  hour += 5;
  if (hour > 23) {
    hour -= 24;
  }

  if (hour < 10) {
    hour = "0" + hour.toString();
  }

  if (minute < 10) {
    minute = "0" + minute.toString();
  }

  if (second < 10) {
    second = "0" + second.toString();
  }

  if (day < 10) {
    day = "0" + day.toString();
  }

  if (month < 10) {
    month = "0" + month.toString();
  }

  return {
    day,
    month,
    year,
    hour,
    minute,
    second,
  };
}

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

// const data = {
//   infinBank: {
//     buy: "",
//     sell: "",
//   },
// };
