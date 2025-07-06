// Modal logic for Add to Order
const modal = document.getElementById('addToOrderModal');
const modalItemInfo = document.getElementById('modalItemInfo');
const modalPriceButtons = document.getElementById('modalPriceButtons');
const closeModalBtn = document.getElementById('closeModalBtn');

function cleanPrice(val) {
  return parseFloat(String(val).replace(/[^0-9.]/g, '') || '0');
}

function showAddToOrderModal(item) {
  modalItemInfo.innerHTML = 
    `<div class="menu-catagory-name">${item.category}:</div>
    <div class="menu-item-name">${item.name}</div>` +
    (item.description ? `<div class="menu-item-description">${item.description}</div>` : '') +
    (item.notes ? `<div class="menu-item-note">${item.notes}</div>` : '');

  modalPriceButtons.innerHTML = '';

  let extraCheeseCheckbox = null;
  const allowExtraCheese = item.category && item.category.toLowerCase().includes('pizza') && (item.small || item.large);

  if (allowExtraCheese) {
    const cheeseWrapper = document.createElement('div');
    cheeseWrapper.className = 'extra-cheese-option';

    const label = document.createElement('label');
    label.style.display = 'flex';
    label.style.alignItems = 'center';
    label.style.gap = '8px';

    extraCheeseCheckbox = document.createElement('input');
    extraCheeseCheckbox.type = 'checkbox';
    extraCheeseCheckbox.name = 'extraCheese';
    extraCheeseCheckbox.value = 'Extra Cheese';

    label.appendChild(extraCheeseCheckbox);
    label.append('Extra Cheese (+$1.79 small | +$2.79 large)');
    cheeseWrapper.appendChild(label);
    modalItemInfo.appendChild(cheeseWrapper);
  }

  const isMakeYourOwn = item.name.toLowerCase() === 'make your own pizza';
  let toppingsForm = null;

  if (isMakeYourOwn) {
    const toppingsSection = document.createElement('div');
    toppingsSection.className = 'toppings-section';
    toppingsSection.innerHTML = `<h3>Select Your Toppings ($1 each)</h3>`;

    const allToppings = [
      { label: 'Meat Toppings', items: meat_toppings },
      { label: 'Veggie Toppings', items: veggie_toppings },
      { label: 'Premium Toppings', items: premium_toppings }
    ];

    toppingsForm = document.createElement('div');
    toppingsForm.className = 'toppings-form';

    allToppings.forEach(group => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'topping-group';

      const header = document.createElement('button');
      header.className = 'topping-group-header';
      header.type = 'button';
      header.textContent = `➕ ${group.label}`;
      header.setAttribute('aria-expanded', 'false');

      const grid = document.createElement('div');
      grid.className = 'topping-options-grid';
      grid.style.display = 'none';

      group.items.forEach(topping => {
        const label = document.createElement('label');
        label.className = 'topping-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'topping';
        checkbox.value = topping;

        label.appendChild(checkbox);
        label.append(topping);
        grid.appendChild(label);
      });

      header.addEventListener('click', () => {
        const isVisible = grid.style.display === 'block';
        grid.style.display = isVisible ? 'none' : 'block';
        header.textContent = `${isVisible ? '➕' : '➖'} ${group.label}`;
        header.setAttribute('aria-expanded', String(!isVisible));
      });

      groupDiv.appendChild(header);
      groupDiv.appendChild(grid);
      toppingsForm.appendChild(groupDiv);
    });

    toppingsSection.appendChild(toppingsForm);
    modalItemInfo.appendChild(toppingsSection);
  }

  const createPriceButton = (label, size, basePrice) => {
    const btn = document.createElement('button');
    btn.className = 'price-button';

    const getUpdatedPriceText = () => {
      let extra = 0;
      if (extraCheeseCheckbox && extraCheeseCheckbox.checked) {
        if (size === 'small') extra = 1.79;
        if (size === 'large') extra = 2.79;
      }
      let toppingsCount = 0;
      if (isMakeYourOwn && toppingsForm) {
        toppingsCount = toppingsForm.querySelectorAll('input[name="topping"]:checked').length;
      }
      const total = cleanPrice(basePrice) + extra + toppingsCount;
      return `Add to Order (${label ? label + ': ' : ''}$${total.toFixed(2)})`;
    };

    btn.textContent = getUpdatedPriceText();

    btn.onclick = () => {
      const selectedToppings = isMakeYourOwn ? [...toppingsForm.querySelectorAll('input[name="topping"]:checked')].map(el => el.value) : [];

      if (isMakeYourOwn && selectedToppings.length < 1) {
        alert("Please select at least 1 topping.");
        return;
      }

      let finalToppings = [...selectedToppings];
      let extraCheesePrice = 0;

      if (extraCheeseCheckbox && extraCheeseCheckbox.checked) {
        finalToppings.push('Extra Cheese');
        if (size === 'small') extraCheesePrice = 1.79;
        else if (size === 'large') extraCheesePrice = 2.79;
      }

      let finalPrice = cleanPrice(basePrice) + extraCheesePrice + finalToppings.length;

      const itemCopy = {
        ...item,
        toppings: finalToppings,
        price: `$${finalPrice.toFixed(2)}`
      };

      addToOrder(itemCopy, size);
      closeModal();
    };

    if (extraCheeseCheckbox || isMakeYourOwn) {
      const updateButton = () => {
        btn.textContent = getUpdatedPriceText();
        const toppingCount = isMakeYourOwn ? toppingsForm.querySelectorAll('input[name="topping"]:checked').length : 1;
        btn.disabled = isMakeYourOwn && toppingCount < 1;
      };

      if (extraCheeseCheckbox) {
        extraCheeseCheckbox.addEventListener('change', updateButton);
      }

      if (isMakeYourOwn && toppingsForm) {
        toppingsForm.addEventListener('change', updateButton);
        updateButton();
      }
    }

    modalPriceButtons.appendChild(btn);
  };

  if (item.small && item.large) {
    createPriceButton('Small', 'small', item.small);
    createPriceButton('Large', 'large', item.large);
  } else if (item.small) {
    createPriceButton('Small', 'small', item.small);
  } else if (item.large) {
    createPriceButton('Large', 'large', item.large);
  } else if (item.default) {
    createPriceButton('', 'default', item.default);
  }

  modal.style.display = 'flex';
}

function closeModal() {
  modal.style.display = 'none';
}

closeModalBtn.onclick = closeModal;
window.onclick = function(event) {
  if (event.target === modal) {
    closeModal();
  }
};

function addToOrder(item, size) {
  let itemText;
  let priceText;

  if (size.toLowerCase() === 'large') {
    itemText = `${item.name} (Large)`;
  } else if (size.toLowerCase() === 'small') {
    itemText = `${item.name} (Small)`;
  } else {
    itemText = `${item.name}`;
  }

  priceText = item.price || item.default;

  const order = {
    item: itemText,
    price: priceText,
    toppings: item.toppings || []
  };

  addToCart(order);
}

window.showAddToOrderModal = showAddToOrderModal;
window.addToOrder = addToOrder;
