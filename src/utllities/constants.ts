export interface PriceDetail {
  priceId: string;
  amount: number;
  label: string;
  description: React.ReactNode | null;
  features: string[];
  imageUrl: string;
  regularPrice: number | null;
}

const PRICE_LIST: PriceDetail[] = [
  {
    priceId: "price_1QGNbZBpYrMQUMR14RX1iZVQ",
    amount: 0,
    label: "Starter",
    description: null,
    imageUrl: "/images/base-sub.png",
    features: ["Generate 4 question set of 10 question each per month"],
    regularPrice: null,
  },
  {
    priceId: "price_1QH7gtBpYrMQUMR1GNUV8E6W",
    amount: 4999,
    label: "Premium",
    description: null,
    features: ["200 sets of question for up to 30 questions per month"],
    imageUrl: "/images/premium-sub.png",
    regularPrice: 99,
  },
  {
    priceId: "price_1QKM8OBpYrMQUMR17Lk1ZR7D",
    amount: 19900,
    label: "Integrated",
    description: null,
    features: ["Generate unlimited sets of question each month"],
    imageUrl: "/images/integrated-sub.png",
    regularPrice: 399,
  },
];

export {
    PRICE_LIST
}
