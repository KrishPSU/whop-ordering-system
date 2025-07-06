const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('https://www.ediningexpress.com/live40/1321/2487/', {
    waitUntil: 'domcontentloaded'
  });

  await page.waitForSelector('.menu_item');

  // Step 1: Get dropdown options (categories)
  const dropdownOptions = await page.$$eval('.select-hide div', divs =>
    divs.map(div => div.textContent.trim())
  );

  // Step 2: Get category headers and their DOM positions
  const categoryBlocks = await page.$$eval('.name', (divs, options) => {
    return divs.map((div, index) => ({
      text: div.textContent.trim(),
      index
    })).filter(({ text }) => options.includes(text));
  }, dropdownOptions);

  // Step 3: Extract structured menu items from .menu_item elements
  const rawMenuItems = await page.$$eval('.menu_item', (items) => {
    return items.map((el, i) => {
      const info = el.querySelector('.info');
      const nameEl = info?.querySelector('.name');
      const descEl = info?.querySelector('.description');

      const name = nameEl?.textContent.trim() ?? '';
      const description = descEl?.textContent.trim() ?? '';

      const priceText = el.textContent.match(/\$[\d]+\.\d{2}/g) || [];
      let small = null, large = null, defaultPrice = null;

      if (priceText.length === 1) {
        defaultPrice = priceText[0];
      } else if (priceText.length >= 2) {
        small = priceText[0];
        large = priceText[1];
      }

      return {
        rawIndex: i,
        name,
        description,
        small,
        large,
        default: defaultPrice
      };
    });
  });

  console.log(`Total .menu_item elements found: ${rawMenuItems.length}`);

  // Step 4: Robustly group items under categories by traversing the DOM in order
  const domHandles = await page.$$('.name, .menu_item');
  const categories = [];
  let currentCategory = null;
  let nextId = 1;
  let makeYourOwnPizzaAdded = false;

  for (const handle of domHandles) {
    const className = await handle.getAttribute('class');
    if (className && className.includes('name')) {
      const categoryName = (await handle.textContent()).trim();
      if (dropdownOptions.includes(categoryName)) {
        currentCategory = {
          category: categoryName,
          items: []
        };
        categories.push(currentCategory);
      } else {
        continue;
      }
    } else if (className && className.includes('menu_item')) {
      const info = await handle.$('.info');
      const nameEl = info ? await info.$('.name') : null;
      const descEl = info ? await info.$('.description') : null;
      const name = nameEl ? (await nameEl.textContent()).trim() : '';
      const description = descEl ? (await descEl.textContent()).trim() : '';
      const priceText = (await handle.textContent()).match(/\$[\d]+\.\d{2}/g) || [];

      let small = null, large = null, defaultPrice = null;
      if (priceText.length === 1) {
        defaultPrice = priceText[0];
      } else if (priceText.length >= 2) {
        small = priceText[0];
        large = priceText[1];
      }

      const lowerName = name.toLowerCase();
      const isToppingPizza = /(one|two|three|four)\s+topping/i.test(lowerName);
      const isExtraCheese = lowerName.includes("extra cheese");

      if (currentCategory && !isToppingPizza && !isExtraCheese) {
        currentCategory.items.push({
          id: nextId++,
          name,
          description,
          small,
          large,
          default: defaultPrice
        });
      }

      // Inject "Make Your Own Pizza" once in a pizza-related category
      if (
        currentCategory &&
        !makeYourOwnPizzaAdded &&
        /pizza/i.test(currentCategory.category)
      ) {
        currentCategory.items.push({
          id: nextId++,
          name: "Make Your Own Pizza",
          description: "Choose your own toppings!",
          small: "$11.49",
          large: "$17.49",
          default: null
        });
        makeYourOwnPizzaAdded = true;
      }
    }
  }

  // Add category field to each item
  categories.forEach(category => {
    category.items.forEach(item => {
      item.category = category.category;
    });
  });

  const filePath = path.resolve(__dirname, 'menu.json');
  fs.writeFileSync(filePath, JSON.stringify(categories, null, 2));
  console.log(`✅ menu.json overwritten with ${categories.flatMap(c => c.items).length} item(s) in ${categories.length} categories.`);

  await browser.close();
})();
