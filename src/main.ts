import { ProductInfo, OrderItem, OrderData, OrderDataResponse } from "./types";
import { fetchProducts, sendOrder } from "./api";

import * as bootstrap from "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const cartTotalEl = document.querySelector(".total-Sum")!;
const modalAddToCartButton =
  document.querySelector<HTMLButtonElement>("#addToCartButton")!;
const toCheckOutBtn =
  document.querySelector<HTMLButtonElement>("#toCheckOutBtn")!;

let products: ProductInfo[] = [];
localStorage.setItem("selectedProductKey", "{}");

const createCard = async () => {
  products = await fetchProducts();

  const updateProductCards = () => {
    const productCardsDiv = document.querySelector<HTMLDivElement>(".row")!;
    productCardsDiv.innerHTML = "";

    products.forEach((productInfo) => {
      productCardsDiv.innerHTML += `
      <div class="col-lg-4 col-xl-3 col-xxl-2 col-sm-6 mb-4 mt-3">
        <div class="d-flex justify-content-center flex-wrap flex-column"> 
          <img class="img-fluid" src="https://www.bortakvall.se/${
            productInfo.images.thumbnail
          }" alt="${productInfo.name}" />
          <h6 class="card-title text-center mt-2"><a href="#" class="text-decoration-none link-secondary text-reset readMore fw-bold" data-product='${JSON.stringify(
            productInfo
          ).replace(/'/g, "&#39;")}'>${productInfo.name}</a></h6>
          <p class="card-text text-center mt-2 fw-bold">${
            productInfo.price
          } Kr</p>
          <button class="btn btn-primary addToCartBtn" data-product='${JSON.stringify(
            productInfo
          ).replace(/'/g, "&#39;")}'${
        productInfo.stock_status === "outofstock" ? "disabled" : ""
      }>Lägg till i varukorg</button>
        </div>
      </div>`;
    });

    document.querySelectorAll(".addToCartBtn").forEach((button) =>
      button.addEventListener("click", (e) => {
        e.preventDefault();

        const selectedProduct: ProductInfo = JSON.parse(
          (<HTMLButtonElement>e.target).getAttribute("data-product")!
        );

        addToCart(selectedProduct);
      })
    );

    document.querySelectorAll(".readMore").forEach((readMoreLink) => {
      readMoreLink.addEventListener("click", (e) => {
        e.preventDefault();
        const productData: ProductInfo = JSON.parse(
          readMoreLink.getAttribute("data-product")!
        );

        updateModalContent(productData);
        const readMoreModal = new bootstrap.Modal(
          document.querySelector(".modal")!
        );

        localStorage.setItem("selectedProductKey", JSON.stringify(productData));

        readMoreModal.show();
      });
    });
  };

  const dropdownItem = document.querySelector(".dropdown-item");
  dropdownItem?.addEventListener("click", (e) => {
    e.preventDefault();
    products.sort((a, b) => a.name.localeCompare(b.name));

    updateProductCards();
  });

  const numberOfProductsEl = document.querySelector("#numberOfProducts")!;
  numberOfProductsEl.innerHTML = `Visar ${products.length} produkter`;
  numberOfProductsEl.innerHTML = `Visar ${products.length} produkter varav ${
    products.filter((product) => product.stock_status === "instock").length
  } är i lager.`;

  updateProductCards();

  const cart: ProductInfo[] = JSON.parse(
    localStorage.getItem("cartKey") || "[]"
  );

  updateCart(cart);
};

createCard();

const calculateTotal = (cart: ProductInfo[]) => {
  let cartTotal = 0;

  cart.forEach((productData) => {
    const totalProductPrice = productData.stock_quantity * productData.price;
    cartTotal += totalProductPrice;
  });

  return cartTotal;
};

const updateCart = (cart: ProductInfo[]) => {
  const cartContent = document.querySelector(".productsInCart")!;
  cartContent.innerHTML = "";

  if (cart.length > 0) {
    cart.forEach((productData) => {
      const listItem = document.createElement("li");
      const imgEl = document.createElement("img");
      const contentContainer = document.createElement("div");
      const nameSpan = document.createElement("span");
      const unitPriceSpan = document.createElement("span");
      const quantityAndPriceSpan = document.createElement("span");
      const deleteIcon = document.createElement("span");

      listItem.classList.add(
        "list-group-item",
        "d-flex",
        "mt-4",
        "align-items-start",
        "justify-content-between"
      );
      contentContainer.classList.add(
        "d-flex",
        "ms-2",
        "align-items-start",
        "flex-column"
      );

      imgEl.src = `https://www.bortakvall.se/${productData.images.thumbnail}`;
      imgEl.alt = productData.name;
      listItem.appendChild(imgEl);
      imgEl.classList.add("w-25");

      nameSpan.innerHTML = `${productData.name}`;
      contentContainer.appendChild(nameSpan);

      unitPriceSpan.innerHTML = `${productData.price} kr/st`;
      contentContainer.appendChild(unitPriceSpan);

      const totalProductPrice = productData.stock_quantity * productData.price;

      quantityAndPriceSpan.innerHTML = `<small>${productData.stock_quantity}x</small> <strong>${totalProductPrice} Kr</strong>`;
      contentContainer.appendChild(quantityAndPriceSpan);

      deleteIcon.innerHTML += "✖️";
      deleteIcon.addEventListener("click", (e) => {
        e.preventDefault();

        const updatedCartList = cart.filter((p) => p.id !== productData.id);
        localStorage.setItem("cartKey", JSON.stringify(updatedCartList));
        updateCart(updatedCartList);
      });

      listItem.appendChild(contentContainer);
      listItem.appendChild(deleteIcon);
      cartContent.appendChild(listItem);

      toCheckOutBtn.disabled = false;

      const cartTotal = calculateTotal(cart);
      cartTotalEl.innerHTML = `Summa: ${cartTotal} Kr`;
    });
  } else {
    toCheckOutBtn.disabled = true;
    cartTotalEl.innerHTML = `Summa: 0 Kr`;
  }

  const offcanvasTrigger = document.querySelector(".cartOffcanvasTrigger")!;
  new bootstrap.Offcanvas(offcanvasTrigger);

  const orderSumEl = document.querySelector<HTMLElement>("#order-summery")!;
  orderSumEl.innerHTML = generateOrderSummary(cart);
};

const updateModalContent = (productData: ProductInfo) => {
  const modalImg = document.querySelector<HTMLImageElement>(".modal-img")!;
  const modalProductName = document.querySelector<HTMLElement>(".modal-title")!;
  const modalDescription =
    document.querySelector<HTMLElement>(".modal-description")!;
  const modalPrice = document.querySelector<HTMLElement>(".modal-price")!;
  const modalStockQuantity = document.querySelector(".stock-quantity")!;

  modalImg.src = `https://www.bortakvall.se${productData.images.large}`;
  modalImg.alt = productData.name;
  modalProductName.innerHTML = productData.name;
  modalDescription.innerHTML = productData.description;
  modalPrice.innerHTML = `<strong>${productData.price} Kr</strong>`;

  if (productData.stock_quantity === null) {
    modalStockQuantity.innerHTML = `Inte i lager`;
  } else {
    modalStockQuantity.innerHTML = `${productData.stock_quantity} st i lager`;
  }

  modalAddToCartButton.disabled = productData.stock_status === "outofstock";
};

const addToCart = (selectedProduct: ProductInfo) => {
  const cart: ProductInfo[] = JSON.parse(
    localStorage.getItem("cartKey") || "[]"
  );

  if (cart.length > 0 && cart.find((p) => p.id === selectedProduct.id)) {
    cart.forEach((p) => {
      if (p.id === selectedProduct.id) {
        p.stock_quantity = p.stock_quantity + 1;
      }
    });
  } else {
    selectedProduct.stock_quantity = 1;
    cart.push(selectedProduct);
  }

  localStorage.setItem("cartKey", JSON.stringify(cart));

  const offcanvasTrigger: HTMLElement | null = document.querySelector(
    ".cartOffcanvasTrigger"
  );

  if (offcanvasTrigger) {
    offcanvasTrigger.click();
  }

  updateCart(cart);
};

modalAddToCartButton.addEventListener("click", (e) => {
  e.preventDefault();

  const selectedProduct: ProductInfo = JSON.parse(
    localStorage.getItem("selectedProductKey") || "{}"
  );

  addToCart(selectedProduct);
});

(() => {
  "use strict";

  const forms: NodeListOf<HTMLFormElement> =
    document.querySelectorAll(".needs-validation");

  Array.from(forms).forEach((form: HTMLFormElement) => {
    form.addEventListener("submit", async (event: Event) => {
      const value_zip = inputField_zip!.value;
      const feedback_zip = document.querySelector(".invalid-feedback-zip")!;
      const valueZipTemp = value_zip.replace(/\s/g, "");

      feedback_zip.innerHTML = "";
      let notValidPostalCode = false;

      if (!valueZipTemp) {
        feedback_zip.innerHTML = "Ange ditt postnummer";
        notValidPostalCode = true;
      }

      if (isNaN(Number(valueZipTemp))) {
        feedback_zip.innerHTML = "Postnumret innehåller icke-numeriska tecken.";
        notValidPostalCode = true;
      }

      if (value_zip.length > 3 && value_zip[3] !== " ") {
        feedback_zip.innerHTML = "Fyll i postnummer med mellanslag på plats 4";
        notValidPostalCode = true;
      }

      if (value_zip.length < 6) {
        feedback_zip.innerHTML =
          "Postnummer måste innehålla 5 siffor med mellanslag på plats 4";
        notValidPostalCode = true;
      }

      if (!form.checkValidity() || notValidPostalCode) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add("was-validated");

      if (form.checkValidity() && !notValidPostalCode) {
        event.preventDefault();

        const container = document.querySelector<HTMLElement>("#container")!;
        container.style.display = "none";
        const showCheckoutForm =
          document.querySelector<HTMLElement>("#checkoutForm")!;
        showCheckoutForm.style.display = "none";
        const orderDetails =
          document.querySelector<HTMLElement>("#order-details")!;
        orderDetails.style.display = "flex";
        orderDetails.classList.add("order-overlay");

        try {
          const responseData = await postData();

          if (responseData?.data?.id) {
            orderDetails.innerHTML = `Din order har gått igenom! Tack för din order! Ditt ordernummer är: ${responseData.data.id}`;
          } else {
            orderDetails.innerHTML = `Din order gick inte igenom, Fyll i alla fält igen med korrekt info!`;
          }
        } catch (error) {
          orderDetails.innerHTML = `De blev tyvärr ett fel & din order har inte gått igenom. Fel: ${error}`;
        }
      } else {
        alert("Ett problem uppstod med din order. Fyll i formuläret rätt.");
      }
    });
  });
})();

const postData = async (): Promise<OrderDataResponse> => {
  const input_firstname =
    document.querySelector<HTMLInputElement>("#input_firstname")!;
  const inputField_lastName =
    document.querySelector<HTMLInputElement>("#input_lastname")!;
  const inputField_address =
    document.querySelector<HTMLInputElement>("#input_address")!;
  const inputField_city =
    document.querySelector<HTMLInputElement>("#input_city")!;
  const inputField_mobile =
    document.querySelector<HTMLInputElement>("#input_mobile");
  const inputField_email =
    document.querySelector<HTMLInputElement>("#input_email")!;

  const cart: ProductInfo[] = JSON.parse(
    localStorage.getItem("cartKey") || "[]"
  );

  let orderTotal = 0;
  const orderItems: OrderItem[] = [];

  cart.forEach((product) => {
    const productTotal = product.stock_quantity * product.price;
    orderTotal += productTotal;

    const orderItem: OrderItem = {
      product_id: product.id,
      qty: product.stock_quantity,
      item_price: product.price,
      item_total: productTotal,
    };

    orderItems.push(orderItem);
  });

  const orderData: OrderData = {
    customer_first_name: input_firstname.value,
    customer_last_name: inputField_lastName.value,
    customer_address: inputField_address.value,
    customer_postcode: inputField_zip.value,
    customer_city: inputField_city.value,
    customer_email: inputField_email.value,
    customer_phone: inputField_mobile?.value ?? "",
    order_total: orderTotal,
    order_items: orderItems,
  };

  const orderResponse = await sendOrder(orderData);
  return orderResponse;
};

const generateOrderSummary = (cart: ProductInfo[]) => {
  let orderSummary = "";
  let orderTotal = 0;

  cart.forEach((productData) => {
    const totalProductPrice = productData.stock_quantity * productData.price;
    orderTotal += totalProductPrice;

    orderSummary += `
      <div class="order-summary-item">
        <span>${productData.name} (${productData.stock_quantity}x)</span>
        <span>${totalProductPrice} Kr</span>
      </div>`;
  });

  orderSummary += `
    <div class="order-summary-total">
      <span>Totalt:</span>
      <span>${orderTotal} Kr</span>
    </div>`;

  return orderSummary;
};

const showCheckoutForm = document.querySelector<HTMLElement>("#checkoutForm")!;
const inputField_zip = document.querySelector<HTMLInputElement>("#input_zip")!;

toCheckOutBtn.addEventListener("click", (e) => {
  e.preventDefault();

  showCheckoutForm.style.display = "flex";
  showCheckoutForm.classList.add("overlay");
  const container = document.querySelector<HTMLElement>("#container")!;
  container.style.display = "none";
});
