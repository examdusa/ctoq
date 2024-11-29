import dayjs from "dayjs";

function generateAsciiCharFromNumber(number: number) {
  return String.fromCharCode(65 + number);
}

function dateFormatter(date: Date) {
  return dayjs(date).tz(dayjs.tz.guess()).format("MM-DD-YYYY | hh:mm a");
}

export { dateFormatter, generateAsciiCharFromNumber };
