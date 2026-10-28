/**
 * ABHA Luxury Indian Fashion E-Commerce - Shared UI & Interaction Engine
 * Powers universal header, footer, cart drawer, measurement studio,
 * search modal, and cross-page state synchronization.
 */

(function () {
  'use strict';

  // 1. Core State
  window.AbhaUI = window.AbhaUI || {};

  const state = {
    cart: JSON.parse(localStorage.getItem('abha_cart') || '[]'),
    wishlist: JSON.parse(localStorage.getItem('abha_wishlist') || '[]'),
    activeProduct: null,
    measurementStep: 1,
    activeUnit: 'in', // 'in' or 'cm'
    pendingCustomization: null,
    products: []
  };

  window.AbhaUI.state = state;

  // Verified Store Facts
  const STORE = {
    name: 'ABHA Clothing & Tailoring',
    tagline: 'Your Style, Your Measurements, Our Experience, Your ABHA.',
    phone1: '+91 9214837104',
    phone2: '+91 9261516194',
    whatsapp: '+919214837104',
    email: 'abhaindia104@gmail.com',
    instagram: '@abha_tailor_and_creation',
    address: '11, Ganesha Tower, in front of D.A.V. College, Arya Samaj, Beawar, Rajasthan – 305901, India',
    mapsUrl: 'https://maps.app.goo.gl/7LgvjMtZ2vYo3rvF8',
    timings: 'Mon – Sat: 10:00 AM – 8:30 PM | Sunday: 11:00 AM – 7:00 PM'
  };

  window.AbhaUI.STORE = STORE;

  // Static Fallback Products
  const FALLBACK_PRODUCTS = [
    {
      id: 'prod-01',
      title: 'Rani Pink Leheriya Pure Cotton Salwar Suit',
      name: 'Rani Pink Leheriya Pure Cotton Salwar Suit',
      sku: 'ABHA-SS-001',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 1650,
      stitchingPrice: 650,
      stitching_price: 650,
      fabric: '100% Pure Breathable Cotton',
      color: 'Rani Pink with White Leheriya Stripes',
      pattern: 'Traditional Rajasthani Leheriya',
      primary_image: 'images/pink-leheriya-cotton-suit.jpg',
      image: 'images/pink-leheriya-cotton-suit.jpg',
      images: ['images/pink-leheriya-cotton-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: true,
      isNewArrival: true,
      description: '100% pure breathable cotton 3-piece salwar suit dress material in vibrant rani pink. Features delicate neck embellishment, matching striped bottom fabric, and pure cotton dupatta. Ample 2.5m lengths for custom tailoring.',
      wash_care: 'Gentle Hand Wash in Cold Water / Dry in Shade',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    },
    {
      id: 'prod-02',
      title: 'Mustard Heritage Bandhani Salwar Suit Material',
      name: 'Mustard Heritage Bandhani Salwar Suit Material',
      sku: 'ABHA-SS-002',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 2450,
      stitchingPrice: 750,
      stitching_price: 750,
      fabric: 'Premium Handloom Cotton with Traditional Bandhej Dupatta',
      color: 'Haldi Mustard & Rani Pink Accents',
      pattern: 'Authentic Hand-Tied Bandhani',
      primary_image: 'images/mustard-bandhani-chanderi-suit.jpg',
      image: 'images/mustard-bandhani-chanderi-suit.jpg',
      images: ['images/mustard-bandhani-chanderi-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: true,
      isNewArrival: true,
      description: 'Timeless mustard yellow salwar suit dress material featuring handcrafted pleated placket with delicate thread embroidery, hanging pearls, and authentic traditional Bandhani tie-dye dupatta with colorful tassels.',
      wash_care: 'Dry Clean Recommended',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    },
    {
      id: 'prod-03',
      title: 'Magenta Festive Fine Cotton Salwar Suit Material',
      name: 'Magenta Festive Fine Cotton Salwar Suit Material',
      sku: 'ABHA-SS-003',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 2850,
      stitchingPrice: 800,
      stitching_price: 800,
      fabric: 'Fine Cotton Loom with Sequin Embroidery & Tree-of-Life Motif',
      color: 'Deep Magenta Wine & Silver Accents',
      pattern: 'Tree-of-Life Fine Threadwork',
      primary_image: 'images/magenta-chanderi-silk-suit.jpg',
      image: 'images/magenta-chanderi-silk-suit.jpg',
      images: ['images/magenta-chanderi-silk-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: true,
      isNewArrival: true,
      description: 'Festive unstitched salwar suit material with rich tree-of-life neckline thread embroidery, subtle diagonal woven texture, matching patterned bottom, and coordinates for celebration occasions.',
      wash_care: 'Dry Clean Recommended',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    },
    {
      id: 'prod-04',
      title: 'Cream Handloom Cotton Mirror-Work Salwar Suit',
      name: 'Cream Handloom Cotton Mirror-Work Salwar Suit',
      sku: 'ABHA-SS-004',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 1950,
      stitchingPrice: 650,
      stitching_price: 650,
      fabric: 'Pure Slub Cotton with Mirror Work & Lime Dupatta',
      color: 'Ivory Cream Kurta & Lime Green Dupatta',
      pattern: 'Artisanal Mirror-Work Lace Placket',
      primary_image: 'images/cream-lime-cotton-suit.jpg',
      image: 'images/cream-lime-cotton-suit.jpg',
      images: ['images/cream-lime-cotton-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: false,
      isNewArrival: true,
      description: 'Natural ivory cream handloom cotton kurta fabric adorned with artisanal mirror-work lace placket and potli buttons. Comes with vibrant lime green floral print dupatta and matching bottom fabric.',
      wash_care: 'Hand Wash Separately in Cold Water',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    },
    {
      id: 'prod-05',
      title: 'Teal Mandala Motif Pure Cotton Salwar Suit',
      name: 'Teal Mandala Motif Pure Cotton Salwar Suit',
      sku: 'ABHA-SS-005',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 1850,
      stitchingPrice: 650,
      stitching_price: 650,
      fabric: '100% Fine Combed Cotton with Block Print',
      color: 'Peacock Teal with Multi-Color Mandala',
      pattern: 'Mandala Geometric Motif',
      primary_image: 'images/teal-geometric-cotton-suit.jpg',
      image: 'images/teal-geometric-cotton-suit.jpg',
      images: ['images/teal-geometric-cotton-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: false,
      isNewArrival: true,
      description: 'Designer peacock teal unstitched salwar suit dress material featuring artistic circular mandala motifs, pearl embroidered neck placket, solid teal bottom, and coordinated soft cotton dupatta with tassel trim.',
      wash_care: 'Gentle Machine Wash or Hand Wash',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    },
    {
      id: 'prod-06',
      title: 'Burgandy Pure Breathable Cotton Salwar Suit',
      name: 'Burgandy Pure Breathable Cotton Salwar Suit',
      sku: 'Abha sku 006',
      category: 'Salwar Suit Dress Materials',
      subcategory: 'Cotton Suits',
      suitType: 'cotton',
      price: 1200,
      stitchingPrice: 650,
      stitching_price: 650,
      fabric: '100% Pure Breathable Cotton (Top 2.5m, Bottom 2.5m, Dupatta 2.5m)',
      color: 'Burgandy Artisanal Weave',
      pattern: 'Traditional Fine Weave',
      primary_image: 'images/burgandy-salwar-suit.jpg',
      image: 'images/burgandy-salwar-suit.jpg',
      images: ['images/burgandy-salwar-suit.jpg'],
      is_unique_item: true,
      stock_quantity: 1,
      isBestSeller: false,
      isNewArrival: true,
      description: '100% pure breathable cotton 3-piece salwar suit dress material in rich burgandy wine. Unstitched 2.5m cuts ready for bespoke custom tailoring.',
      wash_care: 'Gentle Hand Wash in Cold Water / Dry in Shade',
      top_length: '2.5 Meters',
      bottom_length: '2.5 Meters',
      dupatta_length: '2.5 Meters'
    }
  ];

  window.AbhaUI.FALLBACK_PRODUCTS = FALLBACK_PRODUCTS;

  // Fetch or Synchronize Products
  async function loadProducts() {
    try {
      if (window.AbhaStore && typeof window.AbhaStore.apiCall === 'function') {
        const res = await window.AbhaStore.apiCall('/api/products?includeSold=true');
        if (res && res.data && res.data.length > 0) {
          state.products = res.data.map(p => ({
            ...p,
            primary_image: p.primary_image || p.image || 'images/pink-leheriya-cotton-suit.jpg',
            image: p.image || p.primary_image || 'images/pink-leheriya-cotton-suit.jpg',
            images: Array.isArray(p.images) && p.images.length > 0 ? p.images : [p.primary_image || 'images/pink-leheriya-cotton-suit.jpg'],
            stitchingFee: p.stitching_price || p.stitchingPrice || 650,
            price: Number(p.base_price || p.price || 1650),
            suitType: p.suitType || (String(p.fabric || '').toLowerCase().includes('wool') ? 'woollen' : 'cotton')
          }));
          return state.products;
        }
      }
    } catch (e) {
      console.warn('Product sync notice:', e);
    }
    state.products = [...FALLBACK_PRODUCTS];
    return state.products;
  }
  window.AbhaUI.loadProducts = loadProducts;

  // Format INR Currency
  function formatINR(val) {
    const num = Number(val || 0);
    return '₹' + num.toLocaleString('en-IN');
  }
  window.AbhaUI.formatINR = formatINR;

  // Save Cart & Wishlist
  function saveCart() {
    localStorage.setItem('abha_cart', JSON.stringify(state.cart));
    updateCartBadges();
    renderCartDrawerItems();
    if (typeof window.AbhaUI.onCartUpdated === 'function') {
      window.AbhaUI.onCartUpdated(state.cart);
    }
    window.dispatchEvent(new CustomEvent('abha-cart-updated', { detail: { cart: state.cart } }));
  }
  window.AbhaUI.saveCart = saveCart;

  function saveWishlist() {
    localStorage.setItem('abha_wishlist', JSON.stringify(state.wishlist));
    updateWishlistBadges();
    if (typeof window.AbhaUI.onWishlistUpdated === 'function') {
      window.AbhaUI.onWishlistUpdated(state.wishlist);
    }
  }
  window.AbhaUI.saveWishlist = saveWishlist;

  // Cart Badge Counter
  function updateCartBadges() {
    const totalCount = state.cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    document.querySelectorAll('.cart-count-badge').forEach(el => {
      el.textContent = totalCount;
      if (totalCount > 0) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });
  }
  window.AbhaUI.updateCartBadges = updateCartBadges;

  // Wishlist Badge Counter
  function updateWishlistBadges() {
    const totalCount = state.wishlist.length;
    document.querySelectorAll('.wishlist-count-badge').forEach(el => {
      el.textContent = totalCount;
      if (totalCount > 0) {
        el.classList.remove('hidden');
        el.classList.add('flex');
      } else {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });
  }
  window.AbhaUI.updateWishlistBadges = updateWishlistBadges;

  // Add Item to Cart
  function addToCart({ product, isStitched = false, stitchingFee = 0, measurements = null, styling = null, customNotes = '' }) {
    if (!product) return;

    // Check if duplicate item exists
    const existingIndex = state.cart.findIndex(i =>
      i.product.id === product.id &&
      i.isStitched === isStitched &&
      JSON.stringify(i.measurements) === JSON.stringify(measurements)
    );

    if (existingIndex > -1) {
      state.cart[existingIndex].quantity = (state.cart[existingIndex].quantity || 1) + 1;
    } else {
      state.cart.push({
        cartItemId: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        product,
        isStitched: Boolean(isStitched),
        stitchingFee: isStitched ? Number(stitchingFee || product.stitching_price || product.stitchingFee || 650) : 0,
        measurements: measurements || null,
        styling: styling || null,
        customNotes: customNotes || '',
        quantity: 1
      });
    }

    saveCart();

    // Trigger Meta Pixel AddToCart
    if (typeof window.fbq === 'function') {
      try {
        const itemVal = (product.price || 0) + (isStitched ? (stitchingFee || 650) : 0);
        window.fbq('track', 'AddToCart', {
          content_name: product.title || product.name,
          content_category: product.category,
          content_ids: [product.id || product.sku],
          content_type: 'product',
          value: itemVal,
          currency: 'INR'
        });
      } catch (e) {}
    }

    showToast(`✓ "${product.title || product.name}" added to your bag!`);
    openCartDrawer();
  }
  window.AbhaUI.addToCart = addToCart;

  // Toggle Wishlist
  function toggleWishlist(productId, event) {
    if (event) event.stopPropagation();
    const idx = state.wishlist.indexOf(productId);
    if (idx > -1) {
      state.wishlist.splice(idx, 1);
      showToast('Item removed from your wishlist');
    } else {
      state.wishlist.push(productId);
      showToast('❤️ Saved to your wishlist');
    }
    saveWishlist();
    document.querySelectorAll(`[data-wishlist-id="${productId}"]`).forEach(btn => {
      const isSaved = state.wishlist.includes(productId);
      const icon = btn.querySelector('svg');
      if (icon) {
        if (isSaved) {
          icon.setAttribute('class', 'w-4 h-4 fill-red-500 text-red-500');
        } else {
          icon.setAttribute('class', 'w-4 h-4 fill-none text-gray-500');
        }
      }
    });
  }
  window.AbhaUI.toggleWishlist = toggleWishlist;

  // Remove from Cart
  function removeFromCart(cartItemId) {
    state.cart = state.cart.filter(item => item.cartItemId !== cartItemId);
    saveCart();
    showToast('Item removed from shopping bag');
  }
  window.AbhaUI.removeFromCart = removeFromCart;

  // Update Cart Quantity
  function updateCartQuantity(cartItemId, newQty) {
    const item = state.cart.find(i => i.cartItemId === cartItemId);
    if (!item) return;
    if (newQty <= 0) {
      removeFromCart(cartItemId);
    } else {
      item.quantity = newQty;
      saveCart();
    }
  }
  window.AbhaUI.updateCartQuantity = updateCartQuantity;

  // Toast Notification
  function showToast(message) {
    let container = document.getElementById('abhaToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'abhaToastContainer';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'pointer-events-auto bg-charcoal-950 text-ivory-50 text-xs font-semibold px-4 py-3 rounded-lg shadow-xl border border-gold-400/30 flex items-center justify-between gap-3 transform translate-y-4 opacity-0 transition-all duration-300';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-gold-400 font-bold">ABHA:</span>
        <span>${message}</span>
      </div>
      <button type="button" class="text-ivory-300 hover:text-white" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
  window.AbhaUI.showToast = showToast;

  // Open / Close Cart Drawer
  function openCartDrawer() {
    renderCartDrawerItems();
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (drawer && backdrop) {
      backdrop.classList.remove('hidden');
      requestAnimationFrame(() => {
        backdrop.classList.remove('opacity-0');
        drawer.classList.remove('translate-x-full');
      });
      document.body.style.overflow = 'hidden';
    }
  }
  window.AbhaUI.openCartDrawer = openCartDrawer;

  function closeCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const backdrop = document.getElementById('cartDrawerBackdrop');
    if (drawer && backdrop) {
      drawer.classList.add('translate-x-full');
      backdrop.classList.add('opacity-0');
      setTimeout(() => {
        backdrop.classList.add('hidden');
        document.body.style.overflow = '';
      }, 300);
    }
  }
  window.AbhaUI.closeCartDrawer = closeCartDrawer;

  // Render Cart Drawer HTML
  function renderCartDrawerItems() {
    const container = document.getElementById('cartDrawerItemsContainer');
    const subtotalEl = document.getElementById('cartDrawerSubtotal');
    const stitchingEl = document.getElementById('cartDrawerStitching');
    const totalEl = document.getElementById('cartDrawerTotal');
    const footerEl = document.getElementById('cartDrawerFooter');

    if (!container) return;

    if (state.cart.length === 0) {
      container.innerHTML = `
        <div class="py-16 text-center space-y-3">
          <div class="w-16 h-16 mx-auto rounded-full bg-ivory-200/60 flex items-center justify-center text-maroon-900">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          </div>
          <h4 class="font-sans font-bold text-charcoal-950 text-base">Your shopping bag is empty</h4>
          <p class="text-xs text-slateText-600 max-w-xs mx-auto">Explore authentic pure cotton and warm woollen salwar suit dress materials.</p>
          <a href="shop.html" onclick="AbhaUI.closeCartDrawer()" class="inline-block mt-2 px-5 py-2.5 bg-maroon-800 text-ivory-50 text-xs font-bold rounded-md hover:bg-maroon-900 transition">
            Browse Salwar Suits
          </a>
        </div>
      `;
      if (footerEl) footerEl.classList.add('hidden');
      return;
    }

    if (footerEl) footerEl.classList.remove('hidden');

    let fabricSum = 0;
    let stitchSum = 0;

    container.innerHTML = state.cart.map(item => {
      const p = item.product;
      const qty = item.quantity || 1;
      const pPrice = Number(p.price || 0);
      const sFee = item.isStitched ? Number(item.stitchingFee || 650) : 0;
      const lineTotal = (pPrice + sFee) * qty;

      fabricSum += pPrice * qty;
      stitchSum += sFee * qty;

      return `
        <div class="py-4 border-b border-ivory-200 flex gap-3 group">
          <div class="w-20 h-24 rounded-md overflow-hidden bg-ivory-200 shrink-0 border border-ivory-300">
            <img src="${p.primary_image || p.image}" alt="${p.title || p.name}" class="w-full h-full object-cover" onerror="this.src='images/pink-leheriya-cotton-suit.jpg'">
          </div>
          <div class="flex-1 flex flex-col justify-between text-left">
            <div>
              <div class="flex items-start justify-between gap-2">
                <h5 class="text-xs font-bold text-charcoal-950 line-clamp-1 leading-snug">
                  <a href="product.html?id=${p.id}" class="hover:text-maroon-800 transition">${p.title || p.name}</a>
                </h5>
                <button type="button" onclick="AbhaUI.removeFromCart('${item.cartItemId}')" class="text-gray-400 hover:text-red-500 text-sm leading-none p-0.5" title="Remove">&times;</button>
              </div>
              <div class="mt-1 flex items-center gap-1.5 flex-wrap">
                <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.isStitched ? 'bg-gold-100 text-maroon-900 border border-gold-400/40' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'}">
                  ${item.isStitched ? '✂️ Custom Stitched' : '🧵 Unstitched Fabric'}
                </span>
                ${item.isStitched && item.measurements ? `<span class="text-[9px] text-slateText-600 font-medium">Bust: ${item.measurements.bust || item.measurements.size || 'Saved'}"</span>` : ''}
              </div>
              <p class="text-[11px] text-slateText-600 mt-1">
                Fabric: ${formatINR(pPrice)} ${item.isStitched ? `+ Tailoring: ${formatINR(sFee)}` : ''}
              </p>
            </div>

            <div class="flex items-center justify-between mt-2 pt-1 border-t border-ivory-100">
              <div class="flex items-center border border-ivory-300 rounded overflow-hidden bg-white text-xs">
                <button type="button" onclick="AbhaUI.updateCartQuantity('${item.cartItemId}', ${qty - 1})" class="px-2 py-0.5 hover:bg-ivory-100 font-bold">-</button>
                <span class="px-2 py-0.5 font-semibold text-charcoal-950">${qty}</span>
                <button type="button" onclick="AbhaUI.updateCartQuantity('${item.cartItemId}', ${qty + 1})" class="px-2 py-0.5 hover:bg-ivory-100 font-bold">+</button>
              </div>
              <span class="font-bold text-xs text-maroon-950">${formatINR(lineTotal)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const grandTotal = fabricSum + stitchSum;
    if (subtotalEl) subtotalEl.textContent = formatINR(fabricSum);
    if (stitchingEl) stitchingEl.textContent = stitchSum > 0 ? formatINR(stitchSum) : '₹0';
    if (totalEl) totalEl.textContent = formatINR(grandTotal);
  }
  window.AbhaUI.renderCartDrawerItems = renderCartDrawerItems;

  // Open WhatsApp Order Message from Cart
  function checkoutViaWhatsApp() {
    if (state.cart.length === 0) {
      showToast('Your bag is empty!');
      return;
    }

    let text = `*Namaste ABHA Clothing & Tailoring!* 🙏\n`;
    text += `I would like to place an order from your website.\n\n`;
    text += `*Order Summary:*\n`;

    let total = 0;
    state.cart.forEach((item, idx) => {
      const p = item.product;
      const qty = item.quantity || 1;
      const pPrice = Number(p.price || 0);
      const sFee = item.isStitched ? Number(item.stitchingFee || 650) : 0;
      const lineTotal = (pPrice + sFee) * qty;
      total += lineTotal;

      text += `${idx + 1}. *${p.title || p.name}* (SKU: ${p.sku || p.id})\n`;
      text += `   • Type: ${item.isStitched ? 'Custom Stitched' : 'Unstitched Fabric'}\n`;
      text += `   • Qty: ${qty} | Fabric: ₹${pPrice}${item.isStitched ? ` + Tailoring: ₹${sFee}` : ''}\n`;
      if (item.isStitched && item.measurements) {
        text += `   • Measurements: Bust ${item.measurements.bust || ''}", Waist ${item.measurements.waist || ''}", Hip ${item.measurements.hip || ''}", Kurta ${item.measurements.kurtaLength || ''}"\n`;
      }
      if (item.customNotes) {
        text += `   • Notes: ${item.customNotes}\n`;
      }
    });

    text += `\n*Total Order Value:* ${formatINR(total)}\n`;
    text += `*Delivery:* Free Standard Delivery Across India\n\n`;
    text += `Please confirm availability and share payment details. Thank you!`;

    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/919214837104?text=${encoded}`;
    window.open(url, '_blank');
  }
  window.AbhaUI.checkoutViaWhatsApp = checkoutViaWhatsApp;

  // Quick Order for Single Product via WhatsApp
  function orderProductWhatsApp(product, isStitched = false, measurements = null) {
    if (!product) return;
    const basePrice = Number(product.price || 0);
    const stitchFee = isStitched ? Number(product.stitching_price || product.stitchingFee || 650) : 0;
    const total = basePrice + stitchFee;

    let text = `*Namaste ABHA!* 🙏\n`;
    text += `I would like to enquire / order this Salwar Suit:\n\n`;
    text += `*Product:* ${product.title || product.name}\n`;
    text += `*SKU:* ${product.sku || product.id}\n`;
    text += `*Option:* ${isStitched ? 'Custom Stitched to My Measurements (+₹' + stitchFee + ')' : 'Unstitched Dress Material (Fabric Only)'}\n`;
    text += `*Fabric Composition:* ${product.fabric || '100% Pure Cotton'}\n`;
    text += `*Price:* ${formatINR(total)}\n`;
    if (isStitched && measurements) {
      text += `*Measurements:* Bust: ${measurements.bust || '-'}, Waist: ${measurements.waist || '-'}, Hip: ${measurements.hip || '-'}\n`;
    }
    text += `\nPlease confirm availability and dispatch details.`;

    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/919214837104?text=${encoded}`, '_blank');
  }
  window.AbhaUI.orderProductWhatsApp = orderProductWhatsApp;

  // Search Modal
  function openSearchModal() {
    const modal = document.getElementById('globalSearchModal');
    if (modal) {
      modal.classList.remove('hidden');
      const input = document.getElementById('globalSearchInput');
      if (input) {
        input.value = '';
        setTimeout(() => input.focus(), 100);
      }
      renderSearchResults('');
    }
  }
  window.AbhaUI.openSearchModal = openSearchModal;

  function closeSearchModal() {
    const modal = document.getElementById('globalSearchModal');
    if (modal) modal.classList.add('hidden');
  }
  window.AbhaUI.closeSearchModal = closeSearchModal;

  function renderSearchResults(query) {
    const container = document.getElementById('globalSearchResults');
    if (!container) return;

    const q = (query || '').toLowerCase().trim();
    const prods = state.products.length > 0 ? state.products : FALLBACK_PRODUCTS;

    const filtered = !q ? prods.slice(0, 4) : prods.filter(p => {
      const hay = [p.title, p.name, p.fabric, p.color, p.pattern, p.category, p.subcategory, p.sku].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center text-slateText-600">
          <p class="text-sm font-semibold">No salwar suits matching "${query}"</p>
          <p class="text-xs mt-1">Try searching for "cotton", "woollen", "leheriya", or "pink".</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="text-[11px] font-bold uppercase tracking-wider text-slateText-500 mb-2">
        ${!q ? 'Curated Salwar Suits' : `Found ${filtered.length} matching dress materials`}
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
        ${filtered.map(p => `
          <a href="product.html?id=${p.id}" class="flex items-center gap-3 p-2 rounded-lg border border-ivory-200 hover:border-maroon-800/40 bg-white hover:bg-ivory-50 transition group">
            <img src="${p.primary_image || p.image}" alt="${p.title || p.name}" class="w-14 h-18 object-cover rounded bg-ivory-200 shrink-0 border border-ivory-300">
            <div class="flex-1 min-w-0">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${p.suitType === 'woollen' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'}">
                ${p.suitType === 'woollen' ? 'Woollen Suit' : 'Pure Cotton'}
              </span>
              <h5 class="text-xs font-bold text-charcoal-950 truncate group-hover:text-maroon-800 transition mt-1">${p.title || p.name}</h5>
              <p class="text-[11px] text-slateText-600 truncate">${p.fabric || 'Pure Loom'}</p>
              <p class="text-xs font-extrabold text-maroon-900 mt-0.5">${formatINR(p.price)}</p>
            </div>
          </a>
        `).join('')}
      </div>
    `;
  }
  window.AbhaUI.renderSearchResults = renderSearchResults;

  // Measurement Studio Wizard Modal
  function openMeasurementStudio(product, onComplete) {
    state.activeProduct = product;
    window.AbhaUI._onMeasurementComplete = onComplete;
    state.measurementStep = 1;

    const modal = document.getElementById('measurementStudioModal');
    if (modal) {
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      renderMeasurementStep();
    }
  }
  window.AbhaUI.openMeasurementStudio = openMeasurementStudio;

  function closeMeasurementStudio() {
    const modal = document.getElementById('measurementStudioModal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }
  window.AbhaUI.closeMeasurementStudio = closeMeasurementStudio;

  function setMeasurementUnit(unit) {
    state.activeUnit = unit;
    document.querySelectorAll('.unit-toggle-btn').forEach(btn => {
      if (btn.getAttribute('data-unit') === unit) {
        btn.className = 'unit-toggle-btn px-3 py-1 text-xs font-bold bg-maroon-900 text-gold-300 rounded shadow-xs';
      } else {
        btn.className = 'unit-toggle-btn px-3 py-1 text-xs font-semibold text-charcoal-800 hover:bg-ivory-200 rounded';
      }
    });
    document.querySelectorAll('.unit-label-span').forEach(s => s.textContent = unit);
  }
  window.AbhaUI.setMeasurementUnit = setMeasurementUnit;

  function setMeasurementStep(step) {
    state.measurementStep = step;
    renderMeasurementStep();
  }
  window.AbhaUI.setMeasurementStep = setMeasurementStep;

  function renderMeasurementStep() {
    const s1 = document.getElementById('msStep1');
    const s2 = document.getElementById('msStep2');
    const s3 = document.getElementById('msStep3');

    if (!s1 || !s2 || !s3) return;

    s1.classList.add('hidden');
    s2.classList.add('hidden');
    s3.classList.add('hidden');

    if (state.measurementStep === 1) s1.classList.remove('hidden');
    else if (state.measurementStep === 2) s2.classList.remove('hidden');
    else if (state.measurementStep === 3) s3.classList.remove('hidden');

    document.querySelectorAll('.ms-indicator-step').forEach(el => {
      const st = parseInt(el.getAttribute('data-step') || '1', 10);
      if (st === state.measurementStep) {
        el.className = 'ms-indicator-step px-2.5 py-1 text-xs font-bold rounded-full bg-maroon-900 text-gold-300 border border-gold-400/40';
      } else if (st < state.measurementStep) {
        el.className = 'ms-indicator-step px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800';
      } else {
        el.className = 'ms-indicator-step px-2.5 py-1 text-xs font-medium rounded-full bg-ivory-200 text-slateText-600';
      }
    });
  }
  window.AbhaUI.renderMeasurementStep = renderMeasurementStep;

  function saveMeasurementsAndProceed() {
    const bust = document.getElementById('msBust')?.value || '';
    const waist = document.getElementById('msWaist')?.value || '';
    const hip = document.getElementById('msHip')?.value || '';
    const kurtaLength = document.getElementById('msKurtaLength')?.value || '';
    const sleeveLength = document.getElementById('msSleeveLength')?.value || '';
    const bottomStyle = document.querySelector('input[name="msBottomStyle"]:checked')?.value || 'Salwar with Pleats';
    const neckStyle = document.querySelector('input[name="msNeckStyle"]:checked')?.value || 'Standard Round Neck';
    const notes = document.getElementById('msTailorNotes')?.value || '';

    const measurementsData = {
      unit: state.activeUnit,
      bust,
      waist,
      hip,
      kurtaLength,
      sleeveLength,
      bottomStyle,
      neckStyle,
      notes
    };

    closeMeasurementStudio();

    if (typeof window.AbhaUI._onMeasurementComplete === 'function') {
      window.AbhaUI._onMeasurementComplete(measurementsData);
    } else if (state.activeProduct) {
      addToCart({
        product: state.activeProduct,
        isStitched: true,
        stitchingFee: state.activeProduct.stitching_price || state.activeProduct.stitchingFee || 650,
        measurements: measurementsData,
        customNotes: notes
      });
    }
  }
  window.AbhaUI.saveMeasurementsAndProceed = saveMeasurementsAndProceed;

  function selectStandardSize(size) {
    const measurementsData = {
      type: 'STANDARD',
      size: size,
      notes: `Standard Size ${size}`
    };
    closeMeasurementStudio();
    if (typeof window.AbhaUI._onMeasurementComplete === 'function') {
      window.AbhaUI._onMeasurementComplete(measurementsData);
    } else if (state.activeProduct) {
      addToCart({
        product: state.activeProduct,
        isStitched: true,
        stitchingFee: state.activeProduct.stitching_price || state.activeProduct.stitchingFee || 650,
        measurements: measurementsData
      });
    }
  }
  window.AbhaUI.selectStandardSize = selectStandardSize;

  function requestWhatsAppAssistedSizing() {
    const measurementsData = {
      type: 'WHATSAPP_ASSISTED',
      notes: 'Master Tailor will connect on WhatsApp after purchase for measurements.'
    };
    closeMeasurementStudio();
    if (typeof window.AbhaUI._onMeasurementComplete === 'function') {
      window.AbhaUI._onMeasurementComplete(measurementsData);
    } else if (state.activeProduct) {
      addToCart({
        product: state.activeProduct,
        isStitched: true,
        stitchingFee: state.activeProduct.stitching_price || state.activeProduct.stitchingFee || 650,
        measurements: measurementsData
      });
    }
  }
  window.AbhaUI.requestWhatsAppAssistedSizing = requestWhatsAppAssistedSizing;

  // Mobile Menu Toggle
  function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenuDrawer');
    const backdrop = document.getElementById('mobileMenuBackdrop');
    if (menu && backdrop) {
      const isClosed = menu.classList.contains('-translate-x-full');
      if (isClosed) {
        backdrop.classList.remove('hidden');
        requestAnimationFrame(() => {
          backdrop.classList.remove('opacity-0');
          menu.classList.remove('-translate-x-full');
        });
        document.body.style.overflow = 'hidden';
      } else {
        menu.classList.add('-translate-x-full');
        backdrop.classList.add('opacity-0');
        setTimeout(() => {
          backdrop.classList.add('hidden');
          document.body.style.overflow = '';
        }, 300);
      }
    }
  }
  window.AbhaUI.toggleMobileMenu = toggleMobileMenu;

  // Build Universal Modals & Drawers HTML into document
  function injectSharedDrawers() {
    if (document.getElementById('cartDrawer')) return; // already injected

    const wrapper = document.createElement('div');
    wrapper.id = 'abhaSharedComponents';
    wrapper.innerHTML = `
      <!-- CART DRAWER BACKDROP -->
      <div id="cartDrawerBackdrop" onclick="AbhaUI.closeCartDrawer()" class="fixed inset-0 bg-charcoal-950/60 backdrop-blur-xs z-[2000] hidden opacity-0 transition-opacity duration-300"></div>

      <!-- CART SLIDE-OUT DRAWER -->
      <aside id="cartDrawer" class="fixed top-0 right-0 h-full w-full max-w-md bg-[#FAF7F2] shadow-2xl z-[2001] transform translate-x-full transition-transform duration-300 flex flex-col justify-between border-l border-ivory-300" aria-label="Shopping Bag">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-ivory-200 bg-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-maroon-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            <h3 class="font-sans font-bold text-sm text-charcoal-950 uppercase tracking-wider">Your Shopping Bag</h3>
            <span class="cart-count-badge text-[10px] bg-maroon-900 text-gold-300 font-extrabold px-2 py-0.5 rounded-full hidden">0</span>
          </div>
          <button type="button" onclick="AbhaUI.closeCartDrawer()" class="p-1 rounded text-gray-500 hover:text-charcoal-950 hover:bg-ivory-200 transition" aria-label="Close cart">&times;</button>
        </div>

        <!-- Scrollable Items List -->
        <div id="cartDrawerItemsContainer" class="flex-1 overflow-y-auto px-5 py-2 divide-y divide-ivory-200">
          <!-- Dynamic cart items rendered here -->
        </div>

        <!-- Footer Summary & CTA -->
        <div id="cartDrawerFooter" class="px-5 py-4 border-t border-ivory-200 bg-white space-y-3">
          <div class="space-y-1.5 text-xs text-slateText-600">
            <div class="flex justify-between">
              <span>Fabric Subtotal:</span>
              <span id="cartDrawerSubtotal" class="font-semibold text-charcoal-900">₹0</span>
            </div>
            <div class="flex justify-between">
              <span>Master Stitching Fees:</span>
              <span id="cartDrawerStitching" class="font-semibold text-charcoal-900">₹0</span>
            </div>
            <div class="flex justify-between text-emerald-800 font-medium">
              <span>Pan-India Delivery:</span>
              <span class="font-bold">FREE</span>
            </div>
            <div class="flex justify-between text-sm font-extrabold text-maroon-950 pt-2 border-t border-ivory-200">
              <span>Total Amount:</span>
              <span id="cartDrawerTotal" class="text-base text-maroon-900">₹0</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <a href="cart.html" onclick="AbhaUI.closeCartDrawer()" class="w-full py-2.5 text-center bg-ivory-200 hover:bg-ivory-300 text-charcoal-950 text-xs font-bold rounded-md transition flex items-center justify-center">
              View Bag Details
            </a>
            <button type="button" onclick="AbhaUI.checkoutViaWhatsApp()" class="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-md transition flex items-center justify-center gap-1.5 shadow-sm">
              <span>WhatsApp Order</span>
              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.086s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
            </button>
          </div>
          <p class="text-[10px] text-center text-slateText-500">
            🔒 100% Genuine Artisan Fabrics • Free Doorstep Delivery Across India
          </p>
        </div>
      </aside>

      <!-- GLOBAL SEARCH MODAL -->
      <div id="globalSearchModal" class="fixed inset-0 bg-charcoal-950/70 backdrop-blur-xs z-[2100] hidden flex items-start justify-center pt-16 sm:pt-24 px-4">
        <div class="bg-[#FAF7F2] rounded-xl border border-ivory-300 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col" onclick="event.stopPropagation()">
          <div class="p-4 border-b border-ivory-200 bg-white flex items-center gap-3">
            <svg class="w-5 h-5 text-maroon-800 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input type="search" id="globalSearchInput" oninput="AbhaUI.renderSearchResults(this.value)" placeholder="Search salwar suits, cotton, woollen, leheriya, colors..." class="w-full text-sm bg-transparent focus:outline-none text-charcoal-950 placeholder-slateText-500 font-medium">
            <button type="button" onclick="AbhaUI.closeSearchModal()" class="text-xs font-bold text-slateText-600 hover:text-charcoal-950 px-2 py-1 bg-ivory-200 rounded">ESC</button>
          </div>
          <div id="globalSearchResults" class="p-4">
            <!-- Results rendered here -->
          </div>
          <div class="p-3 border-t border-ivory-200 bg-ivory-100 flex items-center justify-between text-[11px] text-slateText-600">
            <span>Quick links:</span>
            <div class="flex gap-2">
              <a href="shop.html?category=cotton" onclick="AbhaUI.closeSearchModal()" class="hover:text-maroon-900 underline">Cotton Suits</a>
              <span>•</span>
              <a href="shop.html?category=woollen" onclick="AbhaUI.closeSearchModal()" class="hover:text-maroon-900 underline">Woollen Suits</a>
              <span>•</span>
              <a href="custom-stitching.html" onclick="AbhaUI.closeSearchModal()" class="hover:text-maroon-900 underline">Custom Stitching</a>
            </div>
          </div>
        </div>
      </div>

      <!-- MEASUREMENT STUDIO MODAL WIZARD -->
      <div id="measurementStudioModal" class="fixed inset-0 bg-charcoal-950/70 backdrop-blur-xs z-[2200] hidden flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        <div class="bg-[#FAF7F2] rounded-xl border border-ivory-300 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col my-auto" onclick="event.stopPropagation()">
          <!-- Header -->
          <div class="px-5 py-4 border-b border-ivory-200 bg-white flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-full bg-gold-100 text-maroon-900 flex items-center justify-center font-bold text-xs">✂️</div>
              <div>
                <h4 class="font-sans font-bold text-sm text-charcoal-950">ABHA Bespoke Tailoring Studio</h4>
                <p class="text-[10px] text-slateText-600">Tailored to your body measurements by master artisans in Beawar</p>
              </div>
            </div>
            <button type="button" onclick="AbhaUI.closeMeasurementStudio()" class="text-gray-400 hover:text-charcoal-950 text-xl font-bold p-1">&times;</button>
          </div>

          <!-- Step Indicators -->
          <div class="px-5 py-2.5 bg-ivory-100 border-b border-ivory-200 flex items-center justify-between">
            <div class="flex items-center gap-1.5">
              <span class="ms-indicator-step" data-step="1">1. Choose Sizing Mode</span>
              <span class="text-gray-400">→</span>
              <span class="ms-indicator-step" data-step="2">2. Enter Body Specs</span>
              <span class="text-gray-400">→</span>
              <span class="ms-indicator-step" data-step="3">3. Neck & Cut Style</span>
            </div>
          </div>

          <!-- Step 1: Mode Selection -->
          <div id="msStep1" class="p-5 space-y-4">
            <p class="text-xs text-charcoal-900 font-semibold">How would you like to provide your stitching measurements?</p>
            
            <div class="space-y-2.5">
              <div onclick="AbhaUI.setMeasurementStep(2)" class="p-3.5 rounded-lg border-2 border-maroon-900/30 hover:border-maroon-900 bg-white cursor-pointer transition flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <span class="text-xl">📏</span>
                  <div class="text-left">
                    <p class="text-xs font-bold text-charcoal-950 group-hover:text-maroon-900">I Have My Measurements (Recommended)</p>
                    <p class="text-[11px] text-slateText-600">Enter Bust, Waist, Hip, and Kurta length in inches or cm.</p>
                  </div>
                </div>
                <span class="text-maroon-800 font-bold text-sm">→</span>
              </div>

              <div onclick="AbhaUI.requestWhatsAppAssistedSizing()" class="p-3.5 rounded-lg border border-ivory-300 hover:border-emerald-600 bg-white cursor-pointer transition flex items-center justify-between group">
                <div class="flex items-center gap-3">
                  <span class="text-xl">💬</span>
                  <div class="text-left">
                    <p class="text-xs font-bold text-charcoal-950 group-hover:text-emerald-700">Guide Me on WhatsApp (Easy & Safe)</p>
                    <p class="text-[11px] text-slateText-600">Master tailor contacts you directly on WhatsApp after booking.</p>
                  </div>
                </div>
                <span class="text-emerald-700 font-bold text-sm">→</span>
              </div>

              <div class="p-3.5 rounded-lg border border-ivory-300 bg-white">
                <div class="flex items-center gap-3 mb-2">
                  <span class="text-xl">👗</span>
                  <div class="text-left">
                    <p class="text-xs font-bold text-charcoal-950">Pick a Standard Indian Size</p>
                    <p class="text-[11px] text-slateText-600">Includes 2-inch inside alterable margin.</p>
                  </div>
                </div>
                <div class="grid grid-cols-5 gap-1.5 pt-1">
                  ${['S (36)', 'M (38)', 'L (40)', 'XL (42)', 'XXL (44)'].map(sz => `
                    <button type="button" onclick="AbhaUI.selectStandardSize('${sz}')" class="py-1.5 px-2 text-center text-xs font-bold rounded border border-ivory-300 hover:border-maroon-800 hover:bg-maroon-900 hover:text-white transition">
                      ${sz}
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Body Measurements Form -->
          <div id="msStep2" class="p-5 space-y-4 hidden">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-charcoal-950">Enter Body Dimensions:</span>
              <div class="flex items-center gap-1 border border-ivory-300 rounded p-0.5 bg-white">
                <button type="button" onclick="AbhaUI.setMeasurementUnit('in')" class="unit-toggle-btn px-3 py-1 text-xs font-bold bg-maroon-900 text-gold-300 rounded" data-unit="in">Inches</button>
                <button type="button" onclick="AbhaUI.setMeasurementUnit('cm')" class="unit-toggle-btn px-3 py-1 text-xs font-semibold text-charcoal-800" data-unit="cm">cm</button>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 text-left">
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Bust Circumference *</label>
                <div class="relative">
                  <input type="number" id="msBust" placeholder="e.g. 38" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Waist Circumference *</label>
                <div class="relative">
                  <input type="number" id="msWaist" placeholder="e.g. 34" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Hip Circumference *</label>
                <div class="relative">
                  <input type="number" id="msHip" placeholder="e.g. 42" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Kurta Length (Shoulder to hem)</label>
                <div class="relative">
                  <input type="number" id="msKurtaLength" placeholder="e.g. 42" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Sleeve Length</label>
                <div class="relative">
                  <input type="number" id="msSleeveLength" placeholder="e.g. 17" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slateText-700 mb-1">Shoulder Width</label>
                <div class="relative">
                  <input type="number" id="msShoulder" placeholder="e.g. 14.5" class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900">
                  <span class="unit-label-span absolute right-3 top-2 text-[10px] text-slateText-500">in</span>
                </div>
              </div>
            </div>

            <div class="flex items-center justify-between pt-2">
              <button type="button" onclick="AbhaUI.setMeasurementStep(1)" class="px-3.5 py-1.5 text-xs font-semibold text-slateText-700 hover:text-charcoal-950">← Back</button>
              <button type="button" onclick="AbhaUI.setMeasurementStep(3)" class="px-4 py-2 bg-maroon-900 text-gold-300 text-xs font-bold rounded-md hover:bg-maroon-950 transition">Next: Bottom & Neck Style →</button>
            </div>
          </div>

          <!-- Step 3: Bottom Style & Custom Notes -->
          <div id="msStep3" class="p-5 space-y-4 hidden text-left">
            <div>
              <label class="block text-xs font-bold text-charcoal-950 mb-2">Preferred Bottom Style:</label>
              <div class="grid grid-cols-3 gap-2">
                <label class="border border-ivory-300 rounded p-2 text-center text-xs cursor-pointer hover:border-maroon-900 bg-white">
                  <input type="radio" name="msBottomStyle" value="Classic Salwar with Pleats" checked class="mr-1">
                  <span>Classic Salwar</span>
                </label>
                <label class="border border-ivory-300 rounded p-2 text-center text-xs cursor-pointer hover:border-maroon-900 bg-white">
                  <input type="radio" name="msBottomStyle" value="Tailored Straight Pants" class="mr-1">
                  <span>Straight Pants</span>
                </label>
                <label class="border border-ivory-300 rounded p-2 text-center text-xs cursor-pointer hover:border-maroon-900 bg-white">
                  <input type="radio" name="msBottomStyle" value="Traditional Churidar" class="mr-1">
                  <span>Churidar</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-xs font-bold text-charcoal-950 mb-1">Tailoring Notes & Specific Instructions:</label>
              <textarea id="msTailorNotes" rows="2" placeholder="e.g. Keep 3/4 sleeves, deep round back, side pocket in pants..." class="w-full text-xs px-3 py-2 border border-ivory-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-maroon-900"></textarea>
            </div>

            <div class="bg-gold-100/70 border border-gold-400/40 rounded p-2.5 text-[11px] text-maroon-950">
              ✨ <strong>ABHA Tailor Assurance:</strong> Master tailors preserve 2 inches of margin on both sides for effortless future adjustments.
            </div>

            <div class="flex items-center justify-between pt-2">
              <button type="button" onclick="AbhaUI.setMeasurementStep(2)" class="px-3.5 py-1.5 text-xs font-semibold text-slateText-700 hover:text-charcoal-950">← Back</button>
              <button type="button" onclick="AbhaUI.saveMeasurementsAndProceed()" class="px-5 py-2.5 bg-maroon-800 text-ivory-50 text-xs font-bold rounded-md hover:bg-maroon-900 transition shadow-sm">Confirm & Save to Bag ✓</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrapper);
  }
  window.AbhaUI.injectSharedDrawers = injectSharedDrawers;

  // Initialize
  document.addEventListener('DOMContentLoaded', async () => {
    injectSharedDrawers();
    updateCartBadges();
    updateWishlistBadges();
    await loadProducts();
  });

})();
