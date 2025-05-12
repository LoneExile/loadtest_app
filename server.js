const express = require("express");
const bodyPaser = require("body-parser");
const cors = require("cors");
const app = express();
const CryptoJS = require("crypto-js");
const { userLogger } = require("./logger");

app.use(cors());
app.use(bodyPaser.json({ limit: "50mb" }));
app.use(bodyPaser.text({ type: "text/*" }));
app.use(
  bodyPaser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000000000000000000,
  }),
);

app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Request methods you wish to allow
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE",
  );

  // Request headers you wish to allow
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type",
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader("Access-Control-Allow-Credentials", true);

  // Pass to next layer of middleware
  next();
});

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};
Date.prototype.minusDays = function (days) {
  this.setDate(this.getDate() - parseInt(days));
  return this;
};
Date.prototype.addDays = function (days) {
  this.setDate(this.getDate() + parseInt(days));
  return this;
};

Date.prototype.minusHours = function (h) {
  this.setTime(this.getTime() - h * 60 * 60 * 1000);
  return this;
};

Date.prototype.addHours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};

function timelog() {
  var timelog = new Date().addHours(7);
  var timelogok =
    (timelog.getHours() < 10 ? "0" : "") +
    timelog.getHours() +
    ":" +
    (timelog.getMinutes() < 10 ? "0" : "") +
    timelog.getMinutes() +
    ":" +
    (timelog.getSeconds() < 10 ? "0" : "") +
    timelog.getSeconds();
  var timelogplus7 =
    timelog.getFullYear() +
    "-" +
    (timelog.getMonth() + 1 < 10 ? "0" : "") +
    (timelog.getMonth() + 1) +
    "-" +
    (timelog.getDate() < 10 ? "0" : "") +
    timelog.getDate() +
    " " +
    (timelog.getHours() < 10 ? "0" : "") +
    timelog.getHours() +
    ":" +
    (timelog.getMinutes() < 10 ? "0" : "") +
    timelog.getMinutes() +
    ":" +
    (timelog.getSeconds() < 10 ? "0" : "") +
    timelog.getSeconds();
  return { timelogok: timelogok, timelogplus7: timelogplus7 };
}

async function encrypted(keys) {
  var thenewdate = new Date().getTime();
  var newkey = JSON.parse(keys);
  newkey.t1 = thenewdate;
  var newKey2 = JSON.stringify(newkey);
  var key = `0sPa9lP2iJEiOFkQ8hCQxSClvsh@1939`;
  var iv = `abJE+nFiSpNeTwK`;
  key = CryptoJS.enc.Hex.parse(key);
  iv = CryptoJS.enc.Hex.parse(iv);
  var encrypted = CryptoJS.AES.encrypt(newKey2, key, { iv: iv });
  return encrypted.toString();
}

async function decryptedMassageNormal(massage) {
  console.log("decrypted", massage);
  var key = `0sPa9lP2iJEiOFkQ8hCQxSClvsh@1939`;
  var iv = `abJE+nFiSpNeTwK`;
  key = CryptoJS.enc.Hex.parse(key);
  iv = CryptoJS.enc.Hex.parse(iv);
  var decrypted = CryptoJS.AES.decrypt(massage, key, { iv: iv });
  decrypted = decrypted.toString(CryptoJS.enc.Utf8);

  if (decrypted.includes("customerld")) {
    return decrypted.toString(CryptoJS.enc.Utf8);
  } else {
    return `{pin : "out"}`;
  }
}
var preparejson = {
  customerld: "Customer001",
  maxCardld: "00000001",
};
app.post("/api/checkEtax", async function (req, res) {
  var jojo = await encrypted(JSON.stringify(preparejson));
  var ms = jojo;
  var cusId = "not found";
  var newdata = { ms };
  var Jsondata = await decryptedMassageNormal(ms);
  console.log("Jsondata ", Jsondata);
  if (Jsondata.includes("customerld") && Jsondata.includes("maxCardld")) {
    Jsondata = JSON.parse(Jsondata);
    var cusId = Jsondata.customerld;
    var payermaxCardld = Jsondata.maxCardld;
    userLogger.info(
      `${timelog().timelogok} | Open Etax Page | /api/checkEtax | ${cusId} | success`,
      {
        api: "/api/checkEtax",
        cusid: cusId,
        data: payermaxCardld,
        ms: "good",
        timelog7: timelog().timelogplus7,
        reason: "not have etax | no",
      },
    );
    return res
      .status(200)
      .json({
        ms: "good",
        result: { cusId: cusId, payermaxCardld: payermaxCardld },
      });
  } else {
    userLogger.warn(
      `${timelog().timelogok} | Open Etax Page | /api/checkEtax | ${cusId} | Token ไม่ถูกต้อง`,
      {
        api: "/api/checkEtax",
        cusid: cusId,
        data: newdata,
        ms: "bad",
        reason: "Token ไม่ถูกต้อง",
        timelog7: timelog().timelogplus7,
      },
    );
    return res.status(200).json({ ms: "bad sql", result: "Hacker" });
  }
});
const server = app.listen(process.env.PORT || 3003, () => {
  console.log(`Server is running on port ${process.env.PORT || 3003}`);
});
