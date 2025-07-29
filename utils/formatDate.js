const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const formatDateToMX = (timestamp) => {
    return dayjs(timestamp)
        .tz("America/Mexico_City")
        .format("YYYY-MM-DD HH:mm:ss [GMT-6]");
};

module.exports = { formatDateToMX };