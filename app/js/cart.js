const submitOrderBtn = document.getElementById('submit_order');
const orderList = document.getElementById('orderList');
const subtotal_elem = document.getElementById('subtotal');
const tax_elem = document.getElementById('tax');
const final_total_elem = document.getElementById('total');


let cart = [];

// Open the drawer
document.getElementById('viewOrderBtn').addEventListener('click', () => {
  document.getElementById('orderDrawer').classList.add('open');
  renderCart();
});

// Close the drawer
document.getElementById('closeDrawer').addEventListener('click', () => {
  document.getElementById('orderDrawer').classList.remove('open');
});

// Add item to cart (call this on button clicks)
function addToCart(order) {
  cart.push(order);
  updateCartCount();
  renderCart();
  showCartAlert(`${order.item} added to cart`);
}

// Update cart count badge
function updateCartCount() {
  document.getElementById('cartCount').textContent = cart.length;
}

// Render cart items inside the drawer
function renderCart() {

  console.log(cart);

  orderList.innerHTML = '';

  if (cart.length === 0) {
    orderList.innerHTML = '<li><em>Your cart is empty.</em></li>';
    return;
  }

  cart.forEach((order, index) => {
    const li = document.createElement('li');

    if (order.toppings.length != 0) {
      let topping_text = "";
      order.toppings.forEach((topping) => {
        topping_text += `<p>— ${topping}</p>`;
      });

      li.innerHTML = `
        <span class="cart_item">
          <span class="item_name">${index + 1}. ${order.item}</span>
          <span class="item_price">${order.price}</span>
          <button class="delete-item">🗑️</button>
        </span>
        <div class="item_toppings_list">
          ${topping_text}
        </div>
      `;
    } else {
      li.innerHTML = `
        <span class="cart_item">
          <span class="item_name">${index + 1}. ${order.item}</span>
          <span class="item_price">${order.price}</span>
          <button class="delete-item">🗑️</button>
        </span>
      `;
    }

    
    // Delete button logic
    li.querySelector('.delete-item').addEventListener('click', () => {
      cart.splice(index, 1);
      updateCartCount();
      renderCart(); // Re-render after deletion
      updateTotal();
    });
    
    orderList.appendChild(li);
  });

  updateTotal();
  updateShadows();
}


function updateTotal() {
  let subtotal = update_subtotal();
  let tax = update_tax(subtotal);
  let final_total = updateFinalTotal(subtotal, tax);

  subtotal_elem.textContent = `$${subtotal.toFixed(2)}`;
  tax_elem.textContent = `$${tax.toFixed(2)}`;
  final_total_elem.textContent = `$${final_total.toFixed(2)}`;
  updateShadows();
}
function update_subtotal() {
  const subtotal = cart.reduce((sum, item) => {
    const num = parseFloat(item.price.replace('$', '')) || 0;
    return sum + num;
  }, 0);
  return subtotal;
}
const TAX_RATE = 0.0625;
function update_tax(subtotal) {
  return +(subtotal * TAX_RATE).toFixed(2);
}
function updateFinalTotal(subtotal, tax) {
  return subtotal + tax;
}




function showCartAlert(message = 'Item added to cart ✅') {
  const alert = document.getElementById('cartAlert');
  alert.textContent = message;
  alert.classList.add('show');

  setTimeout(() => {
    alert.classList.remove('show');
  }, 2000); // disappears after 2 seconds
}