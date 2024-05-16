import { ProductInfo, OrderData, OrderDataResponse } from "./types";

export const fetchProducts = async () => {
  const res = await fetch("https://www.bortakvall.se/api/v2/products", {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Kunde inte hämta datan. StatusText: ${res.statusText}`);
  }

  const productData: { data: ProductInfo[] } = await res.json();

  return productData.data;
};

export const sendOrder = async (orderData: OrderData) => {
  const response = await fetch(
    "https://www.bortakvall.se/api/v2/users/34/orders",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Fel vid förfrågan: ${response.status} - ${response.statusText}`
    );
  }

  const responseData: OrderDataResponse = await response.json();

  return responseData;
};
