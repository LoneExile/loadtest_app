const { createLogger, format, transports, config } = require("winston");
const { combine, timestamp, json } = format;
const userLogger = createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    json(),
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [new transports.Console()],
});

function timeloger() {
  Date.prototype.addHours = function (h) {
    this.setHours(this.getHours() + h);
    return this;
  };
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

module.exports = {
  userLogger: userLogger,
  timeloger,
};
