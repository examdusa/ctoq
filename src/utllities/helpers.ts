import dayjs from "dayjs";

function generateAsciiCharFromNumber(number: number) {
  return String.fromCharCode(65 + number);
}

function dateFormatter(date: Date) {
  return dayjs(date).tz(dayjs.tz.guess()).format("MM-DD-YYYY | hh:mm a");
}

function encodeFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.result && typeof reader.result === "string") {
        resolve(reader.result.split(",")[1]); // Extract Base64 part
      } else {
        reject(new Error("FileReader result is not a string."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };

    reader.readAsDataURL(file); // Read file as Data URL
  });
}

export { dateFormatter, generateAsciiCharFromNumber, encodeFileToBase64 };
