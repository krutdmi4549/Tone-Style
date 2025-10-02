  document.addEventListener("DOMContentLoaded", () => {
    // ================= Поиск товаров =================
    const searchInput = document.getElementById("searchInput");
    const clearBtn = document.getElementById("clearBtn");
    const searchBtn = document.getElementById("search-btn");
    const products = document.querySelectorAll(".product");
    const notFoundMessage = document.getElementById("notFoundMessage");

    function search() {
      const query = searchInput.value.trim().toLowerCase();
      let found = false;
      if (!query) {
        products.forEach(p => p.style.display = "block");
        notFoundMessage.style.display = "none";
        return;
      }
      products.forEach(product => {
        const title = product.querySelector(".span__text").textContent.toLowerCase();
        if (title.includes(query)) {
          product.style.display = "block";
          found = true;
        } else {
          product.style.display = "none";
        }
      });
      notFoundMessage.style.display = found ? "none" : "block";
      if (!found) setTimeout(() => { notFoundMessage.style.display = "none"; }, 3000);
    }

    searchInput.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); search(); } });
    clearBtn.addEventListener("click", () => {
      searchInput.value = "";
      searchInput.classList.remove("not-empty");
      products.forEach(p => p.style.display = "block");
      notFoundMessage.style.display = "none";
      clearBtn.style.display = "none";
    });
    searchBtn.addEventListener("click", () => search());
    searchInput.addEventListener("input", () => {
      searchInput.classList.toggle("not-empty", searchInput.value.trim() !== "");
      clearBtn.style.display = searchInput.value.trim() ? "inline" : "none";
    });

    // ================= Корзина =================
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

    function renderCart() {
      const container = document.getElementById("cart-items");
      const totalEl = document.getElementById("cart-total");
      const emptyCartMessage = document.getElementById("emptyCartMessage");
      container.innerHTML = "";
      emptyCartMessage.style.display = "none";

      if (cart.length === 0) {
        emptyCartMessage.style.display = "block";
        totalEl.textContent = "Итого: 0 ₽";
        const existingBtn = document.getElementById("cartBuyBtn");
        if (existingBtn) existingBtn.remove();
        return;
      }

      let total = 0;
      cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <div class="Air__text">
            <img src="${item.img}" width="100" alt="${item.name}">
            <p class="like-name">${item.name}</p>
            <p class="like-price">${item.price} ₽</p>
            <div class="AirPods__box">
              <button class="dop-btn" onclick="decreaseQty('${item.name}')">−</button>
              <span class="number__span">${item.qty}</span>
              <button class="dop-btn" onclick="increaseQty('${item.name}')">+</button>
              <button class="remove" onclick="removeFromCart('${item.name}')">
                <img src="./image/мусор.png" class="remove-icon">
              </button>
            </div>
          </div>
        `;
        container.appendChild(div);
        total += item.price * item.qty;
      });

      totalEl.textContent = `Итого: ${total} ₽`;

      let buyBtn = document.getElementById("cartBuyBtn");
      if (!buyBtn) {
        buyBtn = document.createElement("button");
        buyBtn.id = "cartBuyBtn";
        buyBtn.textContent = "Купить все";
        totalEl.parentNode.appendChild(buyBtn);
        buyBtn.addEventListener("click", () => {
          if(cart.length === 0){ alert("Корзина пуста!"); return; }
          const productList = cart.map(item => `${item.name} x${item.qty} = ${item.price*item.qty} ₽`).join("\n");
          document.getElementById('orderProduct').value = productList;
          toggleOrderPopup(true);
        });
      }

      document.querySelectorAll(".add-btn").forEach(btn => {
        const productName = btn.dataset.product;
        const inCart = cart.find(i => i.name === productName);
        if (inCart) {
          btn.textContent = "Товар в корзине";
          btn.disabled = true;
          btn.style.backgroundColor = "#ccc";
          btn.style.cursor = "default";
        } else {
          btn.textContent = "Добавить в корзину";
          btn.disabled = false;
          btn.style.backgroundColor = "";
          btn.style.cursor = "pointer";
        }
      });
    }

    window.addToCart = function(name, price, img, button) {
      const existing = cart.find(i => i.name === name);
      if (existing) existing.qty++;
      else cart.push({ name, price, qty: 1, img });

      saveCart();
      renderCart();
      showAddAlert();

      if (button) {
        button.textContent = "Товар в корзине";
        button.disabled = true;
        button.style.backgroundColor = "#ccc";
        button.style.cursor = "default";
      }
    };

    function showAddAlert() {
      const alertBox = document.getElementById("add-alert");
      alertBox.classList.add("show");
      setTimeout(() => alertBox.classList.remove("show"), 2000);
    }

    window.removeFromCart = function(name) { cart = cart.filter(i => i.name !== name); saveCart(); renderCart(); }
    window.clearCart = function() { cart = []; saveCart(); renderCart(); }
    window.increaseQty = function(name) { const i = cart.find(x => x.name === name); if (i) { i.qty++; saveCart(); renderCart(); } }
    window.decreaseQty = function(name) { const i = cart.find(x => x.name === name); if (i && i.qty>1) i.qty--; else cart = cart.filter(x=>x.name!==name); saveCart(); renderCart(); }

    // ================= Анимация корзины =================
    window.toggleCart = function(show){
      const cartPopup = document.getElementById("cartPopup");
      const overlay = document.getElementById("overlay");

      if(show){
        cartPopup.style.display = 'flex';
        overlay.style.display = 'block';
        setTimeout(() => cartPopup.classList.add('show'), 10);
        setTimeout(() => overlay.classList.add('show'), 10);
      } else {
        cartPopup.classList.remove('show');
        overlay.classList.remove('show');
        setTimeout(() => { 
          cartPopup.style.display = 'none';
          overlay.style.display = 'none';
        }, 300);
      }
    };

    renderCart();

    // ================= Избранное =================
    let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    function saveFavorites() { localStorage.setItem("favorites", JSON.stringify(favorites)); }

    function renderFavorites() {
      const favItemsContainer = document.getElementById("fav-items");
      const emptyFavMessage = document.getElementById("emptyFavMessage");
      favItemsContainer.innerHTML = "";
      emptyFavMessage.style.display = favorites.length ? "none" : "block";

      favorites.forEach(item => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${item.img}" width="60" alt="${item.name}">
          <div>
            <p class="like-name">${item.name}</p>
            <p class="like-price">${item.price} ₽</p>
            <div class="like-box">
              <button class="dop-btn" onclick="decreaseFavQty('${item.name}')">−</button>
              <span class="number__span">${item.qty || 1}</span>
              <button class="dop-btn" onclick="increaseFavQty('${item.name}')">+</button>
              <button class="remove" onclick="removeFromFavorites('${item.name}')">
                <img src="./image/мусор.png" class="remove-icon">
              </button>
            </div>
          </div>
        `;
        favItemsContainer.appendChild(div);
      });

      const totalEl = document.getElementById("fav-total");
      const total = favorites.reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
      totalEl.textContent = `Итого: ${total} ₽`;

      document.querySelectorAll(".fav-btn").forEach(btn => {
        const inFav = favorites.find(f => f.name === btn.dataset.product);
        if (inFav) {
          btn.textContent = "В избранном";
          btn.disabled = true;
          btn.style.backgroundColor = "#ccc";
          btn.style.cursor = "default";
        } else {
          btn.textContent = "❤ В избранное";
          btn.disabled = false;
          btn.style.backgroundColor = "";
          btn.style.cursor = "pointer";
        }
      });
    }

    window.addToFavorites = function(name, price, img, button) {
      if (favorites.find(i=>i.name===name)) { showFavAlert(); return; }
      favorites.push({ name, price, qty: 1, img });
      saveFavorites();
      renderFavorites();
      showFavAlert();

      if (button) {
        button.textContent = "В избранном";
        button.disabled = true;
        button.style.backgroundColor = "#ccc";
        button.style.cursor = "default";
      }
    };

    window.increaseFavQty = function(name) { const i=favorites.find(x=>x.name===name); if(i){i.qty=(i.qty||1)+1; saveFavorites(); renderFavorites();} }
    window.decreaseFavQty = function(name) { const i=favorites.find(x=>x.name===name); if(i&&i.qty>1)i.qty--; else favorites=favorites.filter(x=>x.name!==name); saveFavorites(); renderFavorites(); }
    window.removeFromFavorites = function(name){ favorites=favorites.filter(x=>x.name!==name); saveFavorites(); renderFavorites(); }
    window.clearFavorites = function(){ favorites=[]; saveFavorites(); renderFavorites(); }
    function showFavAlert(){ const alert=document.getElementById("fav-alert"); alert.classList.add("show"); setTimeout(()=>alert.classList.remove("show"),2000); }

    // ================= Анимация избранного =================
    window.toggleFavorites = function(show){
      const favPopup = document.getElementById("favPopup");
      const favOverlay = document.getElementById("favOverlay");

      if(show){
        favPopup.style.display = 'flex';
        favOverlay.style.display = 'block';
        setTimeout(() => favPopup.classList.add('show'), 10);
        setTimeout(() => favOverlay.classList.add('show'), 10);
      } else {
        favPopup.classList.remove('show');
        favOverlay.classList.remove('show');
        setTimeout(() => { 
          favPopup.style.display = 'none';
          favOverlay.style.display = 'none';
        }, 300);
      }
    };

    renderFavorites();

    // ================= Модалка продукта с анимацией слайдера =================
    let currentImages = [];
    let currentIndex = 0;

    function showSlide(index) {
      const modalImg = document.getElementById('modalImg');
      if (!currentImages.length) return;
      modalImg.style.opacity = 0;
      setTimeout(() => {
        modalImg.src = currentImages[index];
        modalImg.style.opacity = 1;
      }, 200);
    }

    function prevSlide() { if(!currentImages.length) return; currentIndex = (currentIndex-1+currentImages.length)%currentImages.length; showSlide(currentIndex); }
    function nextSlide() { if(!currentImages.length) return; currentIndex = (currentIndex+1)%currentImages.length; showSlide(currentIndex); }

    document.querySelectorAll('.product').forEach(productEl => {
      const buyBtn = productEl.querySelector('.buy-btn');
      const addBtn = productEl.querySelector('.add-btn');
      const favBtn = productEl.querySelector('.fav-btn');

      productEl.addEventListener('click', e => {
        if (e.target === buyBtn || e.target === addBtn || e.target === favBtn) return;

        const productName = productEl.querySelector('.span__text').innerText;
        const productPrice = parseInt(productEl.querySelector('.span__price').innerText.replace(/\D/g,''));
        let description = '';
        currentImages = [];

        if(productName==="AirPods Pro 2 premium") {
          description = `🎧 Абсолютно новые, не использовались<br><br>📦 Полный комплект в коробке<br><br>🎁 Чехол для наушников в подарок<br><br>🔊 Работает шумоподавление, прозрачный режим, сенсорное управление<br><br>📱 Пoдключаетcя к IРhоne и Andrоid<br><br>⚡️ Хорошо держат заряд и хорошее качество звука<br><br>❗️Это не оригинал, достойная реплика - отличное соотношение качества и цены`;
          currentImages=['./image/pods-1.JPG','./image/pods-2.JPG','./image/pods-3.JPG','./image/pods-4.JPG','./image/logo.JPG'];
        } else if(productName==="Чехол для AirPods") {
          description = `🔥 Максимальная защита для ваших наушников!<br><br>🌈Яркий дизайн, множество цветов на выбор – подчеркнёт ваш стиль<br><br>📦 Чехол нового уровня – сохраняет ваши наушники как новые<br><br>💼 Лёгкий и компактный, удобно носить с собой в сумке или кармане<br><br>⚡️ Прочный материал, долговечный и надежный<br><br>💥 Сохраните свои наушники в идеальном состоянии!`;
          currentImages=['./image/чехол-1.JPG','./image/чехол-2.JPG','./image/чехол-3.JPG','./image/чехол-4.JPG','./image/logo.JPG'];
        }

        currentIndex=0;
        showSlide(currentIndex);

        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        if(currentImages.length<=1){ prevBtn.style.display='none'; nextBtn.style.display='none'; }
        else { prevBtn.style.display='block'; nextBtn.style.display='block'; }

        document.getElementById('modalName').innerText = productName;
        document.getElementById('modalPrice').innerText = productPrice + ' ₽';
        document.getElementById('modalPriceText').innerHTML = description;

        const modalAddBtn = document.getElementById('modalAddBtn');
        const inCart = cart.find(i => i.name === productName);
        if(inCart){
          modalAddBtn.textContent="Товар в корзине";
          modalAddBtn.disabled=true;
          modalAddBtn.style.backgroundColor="#ccc";
          modalAddBtn.style.cursor="default";
        } else {
          modalAddBtn.textContent="Добавить в корзину";
          modalAddBtn.disabled=false;
          modalAddBtn.style.backgroundColor="";
          modalAddBtn.style.cursor="pointer";
        }

        const modal = document.getElementById('productModal');
        modal.style.display='flex';
        setTimeout(()=>modal.classList.add('show'),10);
      });
    });

    document.getElementById('modalAddBtn').addEventListener('click',()=>{
      const productName=document.getElementById('modalName').innerText;
      const productPrice=parseInt(document.getElementById('modalPrice').innerText.replace(/\D/g,''));
      const productImg=currentImages[0]||'';
      addToCart(productName,productPrice,productImg);

      const modalAddBtn=document.getElementById('modalAddBtn');
      modalAddBtn.textContent="Товар в корзине";
      modalAddBtn.disabled=true;
      modalAddBtn.style.backgroundColor="#ccc";
      modalAddBtn.style.cursor="default";
    });

    window.prevSlide = prevSlide;
    window.nextSlide = nextSlide;
    window.closeModal = function(){
      const modal = document.getElementById('productModal');
      modal.classList.remove('show');
      setTimeout(()=>modal.style.display='none',300);
    }

    // ================= Кнопка "Купить" =================
    const TELEGRAM_BOT_TOKEN = '8390164471:AAHmzaZ-tsYody4tucmoiTlvrNFjr36yknI';
    const CHAT_ID = '-4914040453';
    const orderPopup = document.getElementById('orderPopup');
    const orderOverlay = document.getElementById('orderOverlay');
    const closeOrder = document.getElementById('closeOrder');
    const orderForm = document.getElementById('orderForm');
    const orderProductInput = document.getElementById('orderProduct');

    function toggleOrderPopup(show){
      if(show){
        orderPopup.classList.add('active');
        orderOverlay.classList.add('active');
      } else {
        orderPopup.classList.remove('active');
        orderOverlay.classList.remove('active');
      }
    }

    // Кнопки "Купить" для одиночного товара
    document.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const productEl = e.target.closest('.product');
        const productName = productEl.querySelector('.span__text').textContent;
        const productPrice = parseInt(productEl.querySelector('.span__price').textContent.replace(/\D/g,''));

        const inCart = cart.find(item => item.name === productName);
        const qty = inCart ? inCart.qty : 1;
        const total = productPrice * qty;

        orderProductInput.value = `${productName} x${qty} = ${total} ₽`;

        toggleOrderPopup(true);
      });
    });

    closeOrder.addEventListener('click',()=>toggleOrderPopup(false));
    orderOverlay.addEventListener('click',()=>toggleOrderPopup(false));

    orderForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const orderData = {
        products: orderProductInput.value,
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value
      };
      const message = `📦 *Новый заказ!*
  *Товары:*
  ${orderData.products}
  *Имя:* ${orderData.name}
  *Телефон:* ${orderData.phone}
  *Адрес:* ${orderData.address}`;

      try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({chat_id:CHAT_ID,text:message,parse_mode:'Markdown'})
        });
        alert('✅ Заказ успешно отправлен, с вами скоро свяжется продавец');
        orderForm.reset();
        toggleOrderPopup(false);
      } catch(err) {
        alert('Ошибка отправки заказа');
        console.error(err);
      }
    });


  });