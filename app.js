const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "nb4qr3gx3srf",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "od28lT8T3T17VY0IHbmN6JtrPVuwGVc2pXPV0VkqJuw",
});

//variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");
const menuBtn = document.querySelector(".fa-bars");
const menu = document.querySelector(".menu-container");
const menuIcon = document.querySelector(".fa-bars");
const hero = document.querySelector(".hero");
const about = document.querySelector(".about-container");
const aboutCloseBtn = document.querySelector(".about-btn");
const aboutShowBtn = document.querySelector(".about-show");

// const btns = document.querySelectorAll(".bag-btn") NO llamamos a los botones aca, porque se cargan y quedan vacios porque los llamamos antes que los productos sean cargados

// const addToCartBtn = document.querySelector('.bag-btn')
// const removeCartItemBtn = document.querySelector('.remove-item')

let cart = []; //  carro principal, de aca se van a agregar los productos del carrito

//botones
let buttonsDOM = [];

// obteniendo los productos
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type: "comfyHouseProducts",
      });
      let result = await fetch("products.json");
      let data = await result.json();

      let products = contentful.items;
      // let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.error(error);
    }
  }
}

// mostrar los productos
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((products) => {
      result += `
      <!-- single products -->
      <article class="product">
        <div class="img-container">
          <img
            src=${products.image}
            alt="producto"
            class="product-img"
          />
          <button class="bag-btn" data-id=${products.id}>
            <i class="fas fa-shopping-cart"></i>
            agregar al carro
          </button>
        </div>
        <h3>${products.title}</h3>
        <h4>$${products.price}</h4>
      </article>
      <!-- single products end -->
      `;
    });
    productsDOM.innerHTML = result;
  }
  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "En el carrito";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "en el carrito";
        event.target.disabled = true;
        // obtener productos de Products
        let cartItem = { ...Storage.getProducts(id), amount: 1 };
        // agregar productos al carrito
        cart = [...cart, cartItem];
        // guardar el carrito en la memoria local
        Storage.saveCart(cart);
        // asignar valores del carro
        this.setCartValues(cart);
        // mostrar los items del carrito
        this.addCartItem(cartItem);
        // mostrar el carrito cuando se agregue un item
        // this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal).toFixed(2);
    cartItems.innerText = itemsTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src="${item.image}" alt="producto" />
    <div>
      <h4>${item.title}</h4>
      <h5>$${item.price}</h5>
      <span class="remove-item" data-id="${item.id}">remove</span>
    </div>
    <div>
      <i class="fas fa-chevron-up" data-id="${item.id}"></i>
      <p class="item-amount">${item.amount}</p>
      <i class="fas fa-chevron-down" data-id="${item.id}"></i>
            `;
    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }
  showOrHideMenu() {
    menu.classList.toggle("menu-show");
    if (menuIcon.classList.contains("fa-bars")) {
      menuIcon.classList.remove("fa-bars");
      menuIcon.classList.add("fa-times");
    } else {
      menuIcon.classList.remove("fa-times");
      menuIcon.classList.add("fa-bars");
    }
  }
  slider() {
    function imgNum() {
      return Math.floor(Math.random() * (9 - 1) + 1);
    }
    return `url("./images/product-${imgNum()}.jpeg") center/cover no-repeat`;
  }
  hideAbout() {
    about.classList.add("about-hide");
  }
  showAbout() {
    about.classList.remove("about-hide");
  }
  setupAPP() {
    cart = Storage.getCart(); // 2:45:00
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
    menuBtn.addEventListener("click", this.showOrHideMenu);
    aboutCloseBtn.addEventListener("click", this.hideAbout);
    aboutShowBtn.addEventListener("click", this.showAbout);
    hero.style.background = this.slider();
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart(); // con la arrow function hago que "this" apunte a la clase
    });
    // cart functionality
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement); // aca se remueve el item del DOM
        this.removeItem(id); // solo lo remuve del carrito, pero no del DOM
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement); // aca se remueve el item del DOM
          this.removeItem(id);
        }
      }
    });
  }
  clearCart() {
    let cartItem = cart.map((item) => item.id);
    cartItem.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
  }
  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> agregar al carro`;
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}

// local storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products)); // para guardar necesitamos que sea un string, por eso el stringify, cuando queramos usar la info vamos a tener que volverla a convertir con .parse
  }
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // setup app
  ui.setupAPP();

  // get all products
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products); // como es un metodo "static" no necesitamos inicializar la clase
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
