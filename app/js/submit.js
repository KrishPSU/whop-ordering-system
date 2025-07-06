const submit_order_btn = document.getElementById('submit_order');
const client_name_input = document.getElementById('client-name');
const client_phone_number_input = document.getElementById('client-phone-number');

submit_order_btn.addEventListener('click', () => {  
  if (cart.length == 0) return;
  let client_name = client_name_input.value.trim();
  let client_phone_number = client_phone_number_input.value.trim();

  if (client_name == "") {
    client_name_input.style.borderColor = "red";
    return;
  } else {
    client_name_input.style.borderColor = "#ccc";
  }

  if (client_phone_number == "" || !isValidPhoneNumber(client_phone_number)) {
    client_phone_number_input.style.borderColor = "red";
    return;
  } else {
    client_phone_number_input.style.borderColor = "#ccc";
  }

  // console.log(client_name, client_phone_number);
  // console.log(cart);

  let subtotal = 0;
  let tax = 0;
  let final_total = 0;
  cart.forEach((item) => {
    subtotal += parseFloat(item.price.split('$').join(''));
    tax += (subtotal * TAX_RATE);
    final_total += (parseFloat(subtotal) + parseFloat(tax));
  });

  // if (Number(subtotal).toFixed(2) != subtotal_elem.innerText.split('$').join('') ||
  //     Number(tax).toFixed(2) != tax_elem.innerText.split('$').join('') ||
  //     Number(final_total).toFixed(2) != final_total_elem.innerText.split('$').join('')) {

  //   console.log(subtotal)
  //   console.log(tax)
  //   console.log(final_total)


  //   return;
  // }

  let orderData = {
    client_name: client_name,
    client_phone_number: client_phone_number,
    client_order: cart,
    client_subtotal: subtotal_elem.innerText.split('$').join(''),
    client_tax: tax_elem.innerText.split('$').join(''),
    client_final_total: final_total_elem.innerText.split('$').join('')
  };

  submitOrder(orderData);
});



function isValidPhoneNumber(phone) {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // Valid if 10 digits (standard) or 11 digits starting with '1' (US country code)
  return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'));
}




async function submitOrder(orderData) {
  try {
    const response = await axios.post('/api/orders', orderData);

    if (response.status === 201 || response.status === 200) {
      console.log('Order submitted:', response.data);
      alert('Your order has been placed successfully!');

      cart = [];
      renderCart();
      updateCartCount()
      client_name_input.value = "";
      client_phone_number_input.value = "";
      updateTotal();

    } else {
      console.warn('Unexpected response:', response);
      alert('Something went wrong. Please try again.');
    }
  } catch (error) {
    if (error.response) {
      console.error('Server error:', error.response.data);
      alert(`Server error: ${error.response.data.message || 'Unable to submit order.'}`);
    } else {
      console.error('Network error:', error.message);
      alert('Network error. Please check your internet connection.');
    }
  }
}
