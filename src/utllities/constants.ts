export interface PriceDetail {
  amount: number;
  label: string;
  description: React.ReactNode | null;
  features: string[];
  imageUrl: string;
  regularPrice: number | null;
  priceId: string;
  currencyOptions: any;
}

export interface PriceMap {
  [key: string]: PriceDetail;
}

const PRICE_MAP: PriceMap = {
  price_1QGNbZBpYrMQUMR14RX1iZVQ: {
    amount: 0,
    label: "Starter",
    description: null,
    imageUrl: "/images/base-sub.png",
    features: ["Generate 4 question set of 10 question each per month"],
    regularPrice: null,
    priceId: "price_1QGNbZBpYrMQUMR14RX1iZVQ",
    currencyOptions: "",
  },
  price_1QH7gtBpYrMQUMR1GNUV8E6W: {
    amount: 4999,
    label: "Premium",
    description: null,
    features: ["200 sets of question for up to 30 questions per month"],
    imageUrl: "/images/premium-sub.png",
    regularPrice: 99,
    priceId: "price_1QH7gtBpYrMQUMR1GNUV8E6W",
    currencyOptions: "",
  },
  price_1QKM8OBpYrMQUMR17Lk1ZR7D: {
    amount: 19900,
    label: "Integrated",
    description: null,
    features: ["Generate unlimited sets of question each month"],
    imageUrl: "/images/integrated-sub.png",
    regularPrice: 399,
    priceId: "price_1QKM8OBpYrMQUMR17Lk1ZR7D",
    currencyOptions: "",
  },
};

const stripeSupportedCountries = {
  US: { name: "United States", currency: "usd" },
  AE: { name: "United Arab Emirates", currency: "aed" },
  AF: { name: "Afghanistan", currency: "afn" },
  AL: { name: "Albania", currency: "all" },
  AM: { name: "Armenia", currency: "amd" },
  AN: { name: "Netherlands Antilles", currency: "ang" },
  AO: { name: "Angola", currency: "aoa" },
  AR: { name: "Argentina", currency: "ars" },
  AU: { name: "Australia", currency: "aud" },
  AW: { name: "Aruba", currency: "awg" },
  AZ: { name: "Azerbaijan", currency: "azn" },
  BA: { name: "Bosnia and Herzegovina", currency: "bam" },
  BB: { name: "Barbados", currency: "bbd" },
  BD: { name: "Bangladesh", currency: "bdt" },
  BG: { name: "Bulgaria", currency: "bgn" },
  BI: { name: "Burundi", currency: "bif" },
  BM: { name: "Bermuda", currency: "bmd" },
  BN: { name: "Brunei Darussalam", currency: "bnd" },
  BO: { name: "Bolivia", currency: "bob" },
  BR: { name: "Brazil", currency: "brl" },
  BS: { name: "Bahamas", currency: "bsd" },
  BW: { name: "Botswana", currency: "bwp" },
  BY: { name: "Belarus", currency: "byn" },
  BZ: { name: "Belize", currency: "bzd" },
  CA: { name: "Canada", currency: "cad" },
  CD: { name: "Democratic Republic of the Congo", currency: "cdf" },
  CH: { name: "Switzerland", currency: "chf" },
  CL: { name: "Chile", currency: "clp" },
  CN: { name: "China", currency: "cny" },
  CO: { name: "Colombia", currency: "cop" },
  CR: { name: "Costa Rica", currency: "crc" },
  CV: { name: "Cape Verde", currency: "cve" },
  CZ: { name: "Czech Republic", currency: "czk" },
  DJ: { name: "Djibouti", currency: "djf" },
  DK: { name: "Denmark", currency: "dkk" },
  DO: { name: "Dominican Republic", currency: "dop" },
  DZ: { name: "Algeria", currency: "dzd" },
  EG: { name: "Egypt", currency: "egp" },
  ET: { name: "Ethiopia", currency: "etb" },
  EU: { name: "European Union", currency: "eur" },
  FJ: { name: "Fiji", currency: "fj" },
  FK: { name: "Falkland Islands", currency: "fkp" },
  GB: { name: "United Kingdom", currency: "gbp" },
  IL: { name: "Israel", currency: "ils" },
  IN: { name: "India", currency: "inr" },
  IS: { name: "Iceland", currency: "isk" },
  JM: { name: "Jamaica", currency: "jmd" },
  JP: { name: "Japan", currency: "jpy" },
  KE: { name: "Kenya", currency: "kes" },
  MM: { name: "Myanmar", currency: "mmk" },
  MN: { name: "Mongolia", currency: "mnt" },
  MO: { name: "Macau", currency: "mop" },
  MU: { name: "Mauritius", currency: "mur" },
  MV: { name: "Maldives", currency: "mvr" },
  MW: { name: "Malawi", currency: "mwk" },
  MX: { name: "Mexico", currency: "mxn" },
  MY: { name: "Malaysia", currency: "myr" },
  MZ: { name: "Mozambique", currency: "mzn" },
  NA: { name: "Namibia", currency: "nad" },
  NG: { name: "Nigeria", currency: "ngn" },
  NI: { name: "Nicaragua", currency: "nio" },
  NO: { name: "Norway", currency: "nok" },
  NP: { name: "Nepal", currency: "npr" },
  NZ: { name: "New Zealand", currency: "nzd" },
  PA: { name: "Panama", currency: "pab" },
  PE: { name: "Peru", currency: "pen" },
  PG: { name: "Papua New Guinea", currency: "pgk" },
  PH: { name: "Philippines", currency: "php" },
  PK: { name: "Pakistan", currency: "pkr" },
  PL: { name: "Poland", currency: "pln" },
  QA: { name: "Qatar", currency: "qar" },
  RO: { name: "Romania", currency: "ron" },
  RS: { name: "Serbia", currency: "rsd" },
  RU: { name: "Russia", currency: "rub" },
  RW: { name: "Rwanda", currency: "rwf" },
  SA: { name: "Saudi Arabia", currency: "sar" },
  SZ: { name: "Eswatini", currency: "szl" },
  SE: { name: "Sweden", currency: "sek" },
  SG: { name: "Singapore", currency: "sgd" },
  TH: { name: "Thailand", currency: "thb" },
  TT: { name: "Trinidad and Tobago", currency: "ttd" },
  TZ: { name: "Tanzania", currency: "tzs" },
  VN: { name: "Vietnam", currency: "vnd" },
  YE: { name: "Yemen", currency: "yer" },
  ZA: { name: "South Africa", currency: "zar" },
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#493915",
      fontSize: "16px",
      fontSmoothing: "antialiased",
      borderBottom: "1px solid #777777",

      "::placeholder": {
        color: "gray",
        fontSize: "16px",
      },
      ":-webkit-autofill": {
        color: "#e39f48",
      },
    },
    invalid: {
      color: "#E25950",

      "::placeholder": {
        color: "#FFCCA5",
      },
    },
  },
};

export { CARD_ELEMENT_OPTIONS, PRICE_MAP, stripeSupportedCountries };
