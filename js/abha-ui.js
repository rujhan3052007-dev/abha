/**
 * ABHA E-Commerce UI & Experience Engine
 * Conforming strictly to the Master Specification & Option C (Preserve & Refine ABHA Identity)
 * Provides shared Header, Navigation, Search, Buy Now Modal, and Footer across all pages.
 */

(function (window) {
  'use strict';

  const STORE_DETAILS = {
    name: 'ABHA',
    tagline: 'Premium Dress Materials + Personalized Stitching',
    address: '11, Ganesha Tower, in front of D.A.V. College, Arya Samaj, Beawar, Rajasthan – 305901, India',
    phones: ['+91 9214837104', '+91 9261516194'],
    phonePrimary: '+91 9214837104',
    whatsapp: '+919214837104',
    instagram: '@abha_tailor_and_creation',
    instagramUrl: 'https://www.instagram.com/abha_tailor_and_creation/',
    mapsUrl: 'https://maps.app.goo.gl/7LgvjMtZ2vYo3rvF8'
  };

  const AbhaUI = {
    activeProduct: null,
    buyNowState: {
      step: 1,
      orderType: 'UNSTITCHED', // 'UNSTITCHED' or 'STITCHED'
      measurementMode: 'SELF', // 'SELF', 'ASSISTANCE', 'VISIT_STORE'
      stitchingConfig: {
        neckDesign: 'Round Neck with V-Slit',
        sleeveStyle: '3/4th Sleeves',
        bottomStyle: 'Straight Pants with Pocket',
        measurements: {},
        unit: 'INCHES',
        notes: ''
      },
      assistanceDetails: {
        contactMethod: 'WHATSAPP',
        notes: ''
      },
      shipping: {
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'Beawar',
        state: 'Rajasthan',
        pincode: '305901',
        notes: ''
      },
      paymentMethod: 'UPI'
    },

    init: function () {
      this.injectStyles();
      this.renderHeader();
      this.renderFooter();
      this.renderModals();
      this.bindGlobalEvents();
      this.updateCustomerUI();
    },

    injectStyles: function () {
      if (document.getElementById('abha-ui-styles')) return;
      const style = document.createElement('style');
      style.id = 'abha-ui-styles';
      style.textContent = `
        .abha-modal-backdrop {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(24, 21, 19, 0.72);
          backdrop-filter: blur(4px);
          display: none; align-items: center; justify-content: center;
          padding: 1rem;
        }
        .abha-modal-backdrop.open { display: flex; }
        .abha-modal-card {
          background: #FAF7F2; border-radius: 12px;
          border: 1px solid #EAE4D9; box-shadow: 0 20px 40px rgba(74, 16, 29, 0.18);
          width: 100%; max-width: 640px; max-height: 90vh;
          overflow-y: auto; position: relative;
        }
        .abha-btn-primary {
          background: #6B1D2F; color: #FAF7F2; font-weight: 600;
          padding: 0.75rem 1.25rem; border-radius: 6px; border: 1px solid #4A101D;
          transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          cursor: pointer; text-decoration: none;
        }
        .abha-btn-primary:hover { background: #85253B; }
        .abha-btn-outline {
          background: #FFFFFF; color: #6B1D2F; font-weight: 600;
          padding: 0.75rem 1.25rem; border-radius: 6px; border: 1px solid #6B1D2F;
          transition: all 0.2s ease; display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          cursor: pointer; text-decoration: none;
        }
        .abha-btn-outline:hover { background: #F5EFEB; }
        .abha-badge-gold {
          background: #FBF5E8; color: #996515; border: 1px solid #E5D5B5;
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 0.2rem 0.5rem; border-radius: 4px;
        }
        .abha-badge-soldout {
          background: #FEE2E2; color: #991B1B; border: 1px solid #FCA5A5;
          font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.05em; padding: 0.2rem 0.5rem; border-radius: 4px;
        }
        .abha-radio-card {
          border: 1.5px solid #EAE4D9; background: #FFFFFF; border-radius: 8px;
          padding: 0.85rem; cursor: pointer; transition: all 0.2s;
        }
        .abha-radio-card.active {
          border-color: #6B1D2F; background: #FBF5F7;
        }
      `;
      document.head.appendChild(style);
    },

    renderHeader: function () {
      const headerPlaceholder = document.getElementById('abhaGlobalHeader');
      if (!headerPlaceholder) return;

      const currentPath = window.location.pathname.toLowerCase();
      const isActive = (path) => currentPath.includes(path) ? 'text-maroon-800 font-bold border-b-2 border-maroon-800 pb-0.5' : 'text-charcoal-900 hover:text-maroon-800 transition-colors';

      headerPlaceholder.innerHTML = `
        <!-- Top Announcement Utility Bar -->
        <aside class="bg-gradient-to-r from-maroon-950 via-maroon-900 to-maroon-950 text-ivory-50 text-xs py-1.5 px-3 sm:px-6 border-b border-maroon-800/40">
          <div class="max-w-7xl mx-auto flex items-center justify-between text-left gap-2">
            <div class="text-[11px] font-medium tracking-wide flex items-center gap-1.5 truncate">
              <span class="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0"></span>
              <span class="truncate">✨ Authentic Salwar Suit Materials • Bespoke Stitching Atelier • Flagship Store in Beawar</span>
            </div>
            <div class="hidden md:flex items-center gap-4 text-[11px] font-medium shrink-0 uppercase tracking-wider">
              <a href="tel:+919214837104" class="hover:text-gold-400 transition-colors flex items-center gap-1">
                <span>📞 Hotline: +91 9214837104</span>
              </a>
              <span class="text-maroon-700">|</span>
              <a href="store.html" class="hover:text-gold-400 transition-colors">📍 Visit Beawar Store</a>
              <span class="text-maroon-700">|</span>
              <a href="${STORE_DETAILS.instagramUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-gold-400 transition-colors">📸 @abha_tailor_and_creation</a>
            </div>
          </div>
        </aside>

        <!-- Main Header -->
        <header class="sticky top-0 z-40 bg-ivory-50/95 backdrop-blur-md border-b border-ivory-200 transition-luxury">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-20">
              
              <!-- Mobile Menu Trigger -->
              <div class="flex items-center lg:hidden">
                <button type="button" onclick="AbhaUI.toggleMobileMenu()" class="p-2 -ml-2 text-charcoal-900 hover:text-maroon-800" aria-label="Open Navigation Menu">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
              </div>

              <!-- Brand Logo (Official Crest + Maroon Wordmark) -->
              <div class="flex-shrink-0 flex items-center">
                <a href="index.html" class="group flex items-center gap-2.5 sm:gap-3 focus:outline-none" title="ABHA Homepage">
                  <img src="images/logo/abha-crest-simplified.png?v=20260913_4" alt="ABHA Royal Crest" class="h-11 w-11 sm:h-12 sm:w-12 object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105" />
                  <img src="images/logo/abha-text-maroon.png?v=20260913_4" alt="ABHA Clothing & Tailoring" class="h-9 sm:h-10 w-auto object-contain filter drop-shadow-sm" />
                </a>
              </div>

              <!-- Primary Navigation Links -->
              <nav class="hidden lg:flex items-center space-x-7 text-sm font-medium" aria-label="Primary Navigation">
                <a href="index.html" class="${isActive('index')}">Home</a>
                <a href="shop.html" class="${isActive('shop')}">Shop</a>
                <a href="collections.html" class="${isActive('collections')}">Collections</a>
                <a href="stitching.html" class="${isActive('stitching')}">Stitching</a>
                <a href="style-ai.html" class="${isActive('style-ai')} flex items-center gap-1.5">
                  <span>Style AI</span>
                  <span class="abha-badge-gold text-[9px] py-0.5 px-1.5">Coming Soon</span>
                </a>
                <a href="track-order.html" class="${isActive('track-order')}">Track Order</a>
                <a href="account.html" class="${isActive('account')} flex items-center gap-1">
                  <span>Account</span>
                  <span id="headerCustomerName" class="text-xs text-maroon-800 font-bold"></span>
                </a>
              </nav>

              <!-- Utility Actions -->
              <div class="flex items-center space-x-2 sm:space-x-3 text-charcoal-900">
                <!-- Search Button -->
                <button type="button" onclick="AbhaUI.openSearchModal()" class="p-2 hover:text-maroon-800 transition-colors" aria-label="Search Products">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </button>

                <!-- Customer Account -->
                <a href="account.html" class="p-2 hover:text-maroon-800 transition-colors hidden sm:block" aria-label="Customer Account">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </a>

                <!-- Shop Now Header CTA -->
                <a href="shop.html" class="hidden sm:inline-flex abha-btn-primary text-xs py-2 px-3.5 shadow-sm">
                  <span>Shop Materials</span>
                  <span>&rarr;</span>
                </a>
              </div>

            </div>
          </div>

          <!-- Mobile Menu Drawer -->
          <div id="abhaMobileMenu" class="hidden lg:hidden border-t border-ivory-200 bg-ivory-50 px-4 pt-3 pb-6 space-y-3">
            <a href="index.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Home</a>
            <a href="shop.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200 flex items-center justify-between">
              <span>Shop All Materials</span>
              <span class="text-maroon-800 text-sm font-bold">5 Available &rarr;</span>
            </a>
            <a href="collections.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Featured Collections</a>
            <a href="stitching.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Personalized Stitching Atelier</a>
            <a href="measurement-guide.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Measurement Guide</a>
            <a href="track-order.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Track Order Status</a>
            <a href="account.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">My Account &amp; Saved Measurements</a>
            <a href="local-delivery.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Local Delivery in Beawar</a>
            <a href="store.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200">Visit Physical Store (Beawar)</a>
            <a href="style-ai.html" class="block text-base font-semibold text-charcoal-950 py-1.5 border-b border-ivory-200 flex items-center gap-2">
              <span>ABHA Style AI</span>
              <span class="abha-badge-gold">Coming Soon</span>
            </a>
            
            <div class="pt-3 flex flex-col gap-2 text-xs">
              <a href="tel:+919214837104" class="text-maroon-900 font-bold flex items-center gap-1.5">
                <span>📞 Hotline: +91 9214837104</span>
              </a>
              <a href="${STORE_DETAILS.instagramUrl}" target="_blank" rel="noopener noreferrer" class="text-maroon-800 font-bold flex items-center gap-1.5">
                <span>📸 @abha_tailor_and_creation</span>
              </a>
            </div>
          </div>
        </header>

        <!-- Mobile Sticky Bottom Bar -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-ivory-50/98 border-t border-ivory-200 backdrop-blur-md py-2 px-3 flex items-center justify-around text-center text-[10px] font-semibold text-charcoal-900 shadow-lg">
          <a href="index.html" class="flex flex-col items-center gap-0.5 ${isActive('index')}">
            <span class="text-base">🏠</span>
            <span>Home</span>
          </a>
          <a href="shop.html" class="flex flex-col items-center gap-0.5 ${isActive('shop')}">
            <span class="text-base">🛍️</span>
            <span>Shop</span>
          </a>
          <a href="collections.html" class="flex flex-col items-center gap-0.5 ${isActive('collections')}">
            <span class="text-base">✨</span>
            <span>Collections</span>
          </a>
          <a href="track-order.html" class="flex flex-col items-center gap-0.5 ${isActive('track-order')}">
            <span class="text-base">🚚</span>
            <span>Track</span>
          </a>
          <a href="account.html" class="flex flex-col items-center gap-0.5 ${isActive('account')}">
            <span class="text-base">👤</span>
            <span>Account</span>
          </a>
        </nav>
      `;
    },

    renderFooter: function () {
      const footerPlaceholder = document.getElementById('abhaGlobalFooter');
      if (!footerPlaceholder) return;

      footerPlaceholder.innerHTML = `
        <footer class="bg-charcoal-950 text-ivory-100 border-t border-gold-900/30 pt-16 pb-24 lg:pb-12 text-sm">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-ivory-200/10">
              
              <!-- Brand Identity -->
              <div class="lg:col-span-2 space-y-4">
                <div class="flex items-center gap-3">
                  <img src="images/logo/abha-crest-simplified.png?v=20260913_4" alt="ABHA Crest" class="h-12 w-12 object-contain filter brightness-110" />
                  <div>
                    <h3 class="font-serif text-xl font-bold tracking-widest text-ivory-50 uppercase">ABHA</h3>
                    <p class="text-[11px] text-gold-400 font-medium tracking-wider">BEAWAR • RAJASTHAN</p>
                  </div>
                </div>
                <p class="text-xs text-ivory-200/80 leading-relaxed max-w-sm">
                  Authentic Indian Salwar Suit dress materials and personalized artisan tailoring. Delivering pure breathable cottons, heritage Bandhani, and festive Chanderi silks to your doorstep or ready for pickup at our Beawar store.
                </p>
                <div class="text-xs text-ivory-200/90 space-y-1 pt-1">
                  <p class="flex items-center gap-2"><span>📍</span> <span>11, Ganesha Tower, in front of D.A.V. College, Arya Samaj, Beawar, Rajasthan – 305901</span></p>
                  <p class="flex items-center gap-2"><span>📞</span> <a href="tel:+919214837104" class="hover:text-gold-400 transition-colors">+91 9214837104</a> / <a href="tel:+919261516194" class="hover:text-gold-400 transition-colors">+91 9261516194</a></p>
                  <p class="flex items-center gap-2"><span>💬</span> <a href="https://wa.me/919214837104" target="_blank" rel="noopener noreferrer" class="hover:text-gold-400 transition-colors">WhatsApp Master Tailor (+91 9214837104)</a></p>
                </div>
              </div>

              <!-- Shop & Collections -->
              <div>
                <h4 class="font-serif text-sm font-semibold tracking-wider text-gold-400 uppercase mb-4">Shop &amp; Fabrics</h4>
                <ul class="space-y-2.5 text-xs text-ivory-200/80">
                  <li><a href="shop.html" class="hover:text-gold-300 transition-colors">Shop All Materials</a></li>
                  <li><a href="shop.html?fabric=cotton" class="hover:text-gold-300 transition-colors">Pure Cotton Suits</a></li>
                  <li><a href="shop.html?fabric=chanderi" class="hover:text-gold-300 transition-colors">Festive Chanderi Silk</a></li>
                  <li><a href="shop.html?pattern=bandhani" class="hover:text-gold-300 transition-colors">Rajasthani Bandhani</a></li>
                  <li><a href="collections.html" class="hover:text-gold-300 transition-colors">Curated Collections</a></li>
                  <li><a href="style-ai.html" class="hover:text-gold-300 transition-colors flex items-center gap-1.5">
                    <span>ABHA Style AI</span>
                    <span class="text-[9px] bg-gold-400/20 text-gold-300 px-1 py-0.2 rounded">Coming Soon</span>
                  </a></li>
                </ul>
              </div>

              <!-- Customer Experience -->
              <div>
                <h4 class="font-serif text-sm font-semibold tracking-wider text-gold-400 uppercase mb-4">Tailoring &amp; Services</h4>
                <ul class="space-y-2.5 text-xs text-ivory-200/80">
                  <li><a href="stitching.html" class="hover:text-gold-300 transition-colors">How Stitching Works</a></li>
                  <li><a href="measurement-guide.html" class="hover:text-gold-300 transition-colors">Measurement Guide</a></li>
                  <li><a href="local-delivery.html" class="hover:text-gold-300 transition-colors">Local Delivery in Beawar</a></li>
                  <li><a href="store.html" class="hover:text-gold-300 transition-colors">Visit Physical Store</a></li>
                  <li><a href="track-order.html" class="hover:text-gold-300 transition-colors">Track Your Order</a></li>
                  <li><a href="account.html" class="hover:text-gold-300 transition-colors">My Saved Measurements</a></li>
                </ul>
              </div>

              <!-- Help & Information -->
              <div>
                <h4 class="font-serif text-sm font-semibold tracking-wider text-gold-400 uppercase mb-4">About &amp; Policies</h4>
                <ul class="space-y-2.5 text-xs text-ivory-200/80">
                  <li><a href="about.html" class="hover:text-gold-300 transition-colors">About ABHA</a></li>
                  <li><a href="contact.html" class="hover:text-gold-300 transition-colors">Contact Us</a></li>
                  <li><a href="faq.html" class="hover:text-gold-300 transition-colors">Frequently Asked Questions</a></li>
                  <li><a href="policies.html" class="hover:text-gold-300 transition-colors">Shipping &amp; Delivery Policy</a></li>
                  <li><a href="policies.html#cancellation" class="hover:text-gold-300 transition-colors">Cancellation &amp; Alteration Policy</a></li>
                  <li><a href="policies.html#privacy" class="hover:text-gold-300 transition-colors">Privacy Policy</a></li>
                  <li class="pt-2"><a href="admin.html" class="text-gold-500/80 hover:text-gold-400 transition-colors font-medium flex items-center gap-1"><span>👑</span> <span>Staff / Admin Portal</span></a></li>
                </ul>
              </div>

            </div>

            <!-- Bottom Legal Bar -->
            <div class="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ivory-300/60 gap-4">
              <p>&copy; 2026 ABHA. All rights reserved. Beawar, Rajasthan, India.</p>
              <p class="flex items-center gap-3">
                <span>Handcrafted with pride in Rajasthan</span>
                <span>•</span>
                <a href="${STORE_DETAILS.instagramUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-gold-400">Instagram</a>
                <span>•</span>
                <a href="${STORE_DETAILS.mapsUrl}" target="_blank" rel="noopener noreferrer" class="hover:text-gold-400">Directions</a>
              </p>
            </div>
          </div>
        </footer>
      `;
    },

    renderModals: function () {
      if (document.getElementById('abhaSearchModal')) return;

      const container = document.createElement('div');
      container.id = 'abhaModalsContainer';
      container.innerHTML = `
        <!-- GLOBAL SEARCH MODAL -->
        <div id="abhaSearchModal" class="abha-modal-backdrop" onclick="AbhaUI.closeSearchModal(event)">
          <div class="abha-modal-card p-6" onclick="event.stopPropagation()">
            <div class="flex items-center justify-between pb-3 border-b border-ivory-200">
              <h3 class="font-serif text-lg font-bold text-maroon-950">Search Dress Materials</h3>
              <button type="button" onclick="AbhaUI.closeSearchModal()" class="text-charcoal-700 hover:text-maroon-800 text-xl font-bold p-1">&times;</button>
            </div>
            
            <div class="mt-4">
              <div class="relative">
                <input type="text" id="abhaGlobalSearchInput" oninput="AbhaUI.handleSearch(this.value)" placeholder="Search by fabric, color, pattern, style (e.g. Cotton, Bandhani, Silk)..." class="w-full bg-white border border-ivory-200 rounded-lg px-4 py-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-maroon-800" autofocus />
                <span class="absolute left-3.5 top-3.5 text-charcoal-400">🔍</span>
              </div>
            </div>

            <div id="abhaSearchResults" class="mt-4 max-h-80 overflow-y-auto space-y-2">
              <p class="text-xs text-slate-500 py-6 text-center">Type above to search authentic dress materials...</p>
            </div>
          </div>
        </div>

        <!-- MULTI-STEP BUY NOW CHECKOUT MODAL -->
        <div id="abhaBuyNowModal" class="abha-modal-backdrop" onclick="AbhaUI.closeBuyNowModal(event)">
          <div class="abha-modal-card p-5 sm:p-7" onclick="event.stopPropagation()">
            
            <!-- Header with Close button -->
            <div class="flex items-start justify-between pb-3.5 border-b border-ivory-200">
              <div>
                <span id="buyNowStepBadge" class="text-[10px] font-bold text-gold-600 uppercase tracking-wider">Step 1 of 3: Product Configuration</span>
                <h3 id="buyNowTitle" class="font-serif text-lg font-bold text-maroon-950 mt-0.5">Configure Your Order</h3>
              </div>
              <button type="button" onclick="AbhaUI.closeBuyNowModal()" class="text-charcoal-600 hover:text-maroon-800 text-2xl font-bold p-1 line-height-1">&times;</button>
            </div>

            <!-- Product Quick Summary Row -->
            <div id="buyNowProductSummary" class="py-3 px-3.5 my-3 bg-white rounded-lg border border-ivory-200 flex items-center gap-3">
              <img id="buyNowProductImg" src="images/pink-leheriya-cotton-suit.jpg" alt="Selected Product" class="w-14 h-16 object-cover rounded border border-ivory-200 shrink-0" />
              <div class="min-w-0 flex-1">
                <h4 id="buyNowProductName" class="text-xs sm:text-sm font-bold text-charcoal-950 truncate">Product Name</h4>
                <p id="buyNowProductFabric" class="text-[11px] text-slate-600 truncate">100% Pure Cotton</p>
                <div class="flex items-center gap-2 mt-0.5">
                  <span id="buyNowProductPrice" class="text-xs sm:text-sm font-bold text-maroon-900">₹1,650</span>
                  <span id="buyNowStitchingFeeNotice" class="text-[10px] text-gold-600 font-semibold bg-gold-50 px-1.5 py-0.2 rounded">+₹650 Stitching</span>
                </div>
              </div>
            </div>

            <!-- Dynamic Step Content Form -->
            <form id="buyNowForm" onsubmit="AbhaUI.handleBuyNowSubmit(event)">
              <div id="buyNowStepContent">
                <!-- Injected dynamically by AbhaUI.renderBuyNowStep() -->
              </div>

              <!-- Error & Notice Box -->
              <div id="buyNowErrorBox" style="display: none;" class="mt-3 p-2.5 text-xs text-red-700 bg-red-50 border border-red-200 rounded"></div>

              <!-- Modal Navigation Actions -->
              <div class="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-ivory-200">
                <button type="button" id="buyNowBtnBack" onclick="AbhaUI.prevBuyNowStep()" class="abha-btn-outline text-xs py-2 px-4" style="display: none;">
                  &larr; Back
                </button>
                <div class="ml-auto flex items-center gap-3">
                  <button type="button" onclick="AbhaUI.closeBuyNowModal()" class="text-xs text-slate-600 hover:text-charcoal-900 font-medium">Cancel</button>
                  <button type="submit" id="buyNowBtnNext" class="abha-btn-primary text-xs py-2.5 px-5 shadow-sm">
                    Continue to Delivery &rarr;
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      `;
      document.body.appendChild(container);
    },

    toggleMobileMenu: function () {
      const menu = document.getElementById('abhaMobileMenu');
      if (menu) menu.classList.toggle('hidden');
    },

    openSearchModal: function () {
      const modal = document.getElementById('abhaSearchModal');
      if (!modal) return;
      modal.classList.add('open');
      const input = document.getElementById('abhaGlobalSearchInput');
      if (input) {
        input.value = '';
        input.focus();
        this.handleSearch('');
      }
    },

    closeSearchModal: function (e) {
      if (e && e.target !== e.currentTarget && e.target.tagName !== 'BUTTON') return;
      const modal = document.getElementById('abhaSearchModal');
      if (modal) modal.classList.remove('open');
    },

    handleSearch: function (query) {
      const resultsContainer = document.getElementById('abhaSearchResults');
      if (!resultsContainer) return;
      const q = (query || '').trim().toLowerCase();
      const allProducts = window.AbhaStore ? window.AbhaStore.getProducts(false) : [];

      if (!q) {
        resultsContainer.innerHTML = `
          <div class="py-4 text-center">
            <p class="text-xs text-slate-500">Popular searches: 
              <button type="button" onclick="AbhaUI.quickSearch('Cotton')" class="underline text-maroon-800 font-medium ml-1">Pure Cotton</button>,
              <button type="button" onclick="AbhaUI.quickSearch('Bandhani')" class="underline text-maroon-800 font-medium ml-1">Bandhani</button>,
              <button type="button" onclick="AbhaUI.quickSearch('Silk')" class="underline text-maroon-800 font-medium ml-1">Chanderi Silk</button>,
              <button type="button" onclick="AbhaUI.quickSearch('Leheriya')" class="underline text-maroon-800 font-medium ml-1">Leheriya</button>
            </p>
          </div>
        `;
        return;
      }

      const matches = allProducts.filter(p => {
        const text = `${p.title || p.name} ${p.fabric} ${p.color} ${p.pattern} ${p.category} ${p.subcategory || ''} ${p.description}`.toLowerCase();
        return text.includes(q);
      });

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div class="py-8 text-center px-4 bg-white rounded-lg border border-ivory-200">
            <span class="text-3xl">🧵</span>
            <h4 class="font-serif text-sm font-bold text-charcoal-900 mt-2">No dress materials found</h4>
            <p class="text-xs text-slate-500 mt-1">Try another search or explore our curated collections.</p>
            <a href="shop.html" onclick="AbhaUI.closeSearchModal()" class="abha-btn-outline text-xs mt-3 py-1.5 px-3">View All Shop Materials</a>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = matches.map(p => `
        <div class="p-2.5 bg-white rounded-lg border border-ivory-200 flex items-center justify-between gap-3 hover:border-maroon-700 transition-colors">
          <div class="flex items-center gap-3 min-w-0">
            <img src="${p.primary_image || p.image}" alt="${p.title}" class="w-12 h-14 object-cover rounded border border-ivory-200 shrink-0" />
            <div class="min-w-0">
              <h5 class="text-xs font-bold text-charcoal-950 truncate">${p.title || p.name}</h5>
              <p class="text-[11px] text-slate-500 truncate">${p.fabric}</p>
              <span class="text-xs font-bold text-maroon-800">₹${p.price || p.base_price}</span>
            </div>
          </div>
          <div class="shrink-0 flex items-center gap-2">
            <a href="product.html?id=${p.id}" onclick="AbhaUI.closeSearchModal()" class="text-xs text-slate-600 hover:text-maroon-800 underline">View</a>
            <button type="button" onclick="AbhaUI.closeSearchModal(); AbhaUI.openBuyNow('${p.id}')" class="abha-btn-primary text-xs py-1.5 px-3">BUY NOW</button>
          </div>
        </div>
      `).join('');
    },

    quickSearch: function (term) {
      const input = document.getElementById('abhaGlobalSearchInput');
      if (input) {
        input.value = term;
        this.handleSearch(term);
      }
    },

    // =========================================================================
    // MULTI-STEP DIRECT BUY NOW FLOW (RULE: NO ADD TO CART BUTTON)
    // Flow: Product -> Stitched/Unstitched -> Measurements -> Checkout -> Payment -> Confirmation
    // =========================================================================

    openBuyNow: function (productId) {
      if (!window.AbhaStore) return;
      const all = window.AbhaStore.getProducts(true);
      const prod = all.find(p => p.id === productId || p.sku === productId);
      if (!prod) {
        alert('Selected dress material is not available.');
        return;
      }
      if (prod.is_sold_out || prod.stock_quantity <= 0) {
        alert('This authentic one-of-a-kind salwar suit has already been purchased.');
        return;
      }

      this.activeProduct = prod;
      this.buyNowState.step = 1;
      this.buyNowState.orderType = 'UNSTITCHED';
      this.buyNowState.measurementMode = 'SELF';

      // Pre-fill customer info if logged in
      const customer = window.AbhaStore.getCurrentCustomer();
      if (customer) {
        this.buyNowState.shipping.name = customer.name || '';
        this.buyNowState.shipping.phone = customer.phone || '';
        this.buyNowState.shipping.email = customer.email || '';
      }

      // Update product info in modal
      const modal = document.getElementById('abhaBuyNowModal');
      document.getElementById('buyNowProductName').textContent = prod.title || prod.name;
      document.getElementById('buyNowProductFabric').textContent = prod.fabric;
      document.getElementById('buyNowProductPrice').textContent = `₹${prod.price || prod.base_price}`;
      document.getElementById('buyNowProductImg').src = prod.primary_image || prod.image;
      document.getElementById('buyNowStitchingFeeNotice').textContent = `+₹${prod.stitchingPrice || prod.stitching_price || 650} Stitching`;

      this.renderBuyNowStep();
      modal.classList.add('open');
    },

    closeBuyNowModal: function (e) {
      if (e && e.target !== e.currentTarget && e.target.tagName !== 'BUTTON') return;
      const modal = document.getElementById('abhaBuyNowModal');
      if (modal) modal.classList.remove('open');
    },

    renderBuyNowStep: function () {
      const stepContent = document.getElementById('buyNowStepContent');
      const stepBadge = document.getElementById('buyNowStepBadge');
      const stepTitle = document.getElementById('buyNowTitle');
      const btnBack = document.getElementById('buyNowBtnBack');
      const btnNext = document.getElementById('buyNowBtnNext');
      const errBox = document.getElementById('buyNowErrorBox');
      if (errBox) errBox.style.display = 'none';

      const prod = this.activeProduct;
      const basePrice = prod.price || prod.base_price;
      const stitchFee = prod.stitchingPrice || prod.stitching_price || 650;

      if (this.buyNowState.step === 1) {
        // STEP 1: Product Configuration (Unstitched vs Stitched)
        stepBadge.textContent = 'Step 1 of 3: Choose Product Type';
        stepTitle.textContent = 'How would you like to receive this dress material?';
        btnBack.style.display = 'none';
        btnNext.textContent = this.buyNowState.orderType === 'UNSTITCHED' ? 'Proceed to Delivery Details →' : 'Next: Measurement Choice →';

        const isUnstitched = this.buyNowState.orderType === 'UNSTITCHED';

        stepContent.innerHTML = `
          <div class="space-y-3">
            <!-- Unstitched Option -->
            <div class="abha-radio-card ${isUnstitched ? 'active' : ''}" onclick="AbhaUI.setOrderType('UNSTITCHED')">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="orderTypeChoice" value="UNSTITCHED" ${isUnstitched ? 'checked' : ''} class="text-maroon-800 focus:ring-maroon-800" />
                  <div>
                    <h5 class="text-sm font-bold text-charcoal-950">Unstitched Dress Material</h5>
                    <p class="text-xs text-slate-600 mt-0.5">Delivered as pure woven fabric (Top 2.5m, Bottom 2.5m, Dupatta 2.5m) ready for your local tailor.</p>
                  </div>
                </div>
                <span class="text-sm font-bold text-charcoal-900 shrink-0">₹${basePrice}</span>
              </div>
            </div>

            <!-- Stitched Option -->
            <div class="abha-radio-card ${!isUnstitched ? 'active' : ''}" onclick="AbhaUI.setOrderType('STITCHED')">
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-2.5">
                  <input type="radio" name="orderTypeChoice" value="STITCHED" ${!isUnstitched ? 'checked' : ''} class="text-maroon-800 focus:ring-maroon-800" />
                  <div>
                    <div class="flex items-center gap-2">
                      <h5 class="text-sm font-bold text-charcoal-950">Custom Stitched to Your Measurements</h5>
                      <span class="abha-badge-gold">Bespoke Fit</span>
                    </div>
                    <p class="text-xs text-slate-600 mt-0.5">Handcrafted by Master Tailors at our Beawar atelier. Custom neck, sleeve, and fit specifications.</p>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-sm font-bold text-maroon-800">₹${basePrice + stitchFee}</span>
                  <span class="block text-[10px] text-slate-500">(Includes ₹${stitchFee} stitching)</span>
                </div>
              </div>
            </div>
          </div>
        `;
        return;
      }

      if (this.buyNowState.step === 2) {
        // If Stitched, Step 2 is MEASUREMENTS CHOICE!
        // If Unstitched, Step 2 is SHIPPING & DELIVERY DETAILS!
        if (this.buyNowState.orderType === 'STITCHED') {
          stepBadge.textContent = 'Step 2 of 4: Tailoring Measurements';
          stepTitle.textContent = 'How would you like to provide your measurements?';
          btnBack.style.display = 'inline-flex';
          btnNext.textContent = 'Continue to Delivery →';

          const mode = this.buyNowState.measurementMode;
          const customer = window.AbhaStore.getCurrentCustomer();
          const savedProfiles = customer ? window.AbhaStore.getCustomerMeasurements(customer.id) : [];

          stepContent.innerHTML = `
            <div class="space-y-3.5">
              
              <!-- 3 Measurement Choices -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div class="abha-radio-card text-center p-3 ${mode === 'SELF' ? 'active' : ''}" onclick="AbhaUI.setMeasurementMode('SELF')">
                  <span class="text-xl">📏</span>
                  <h6 class="text-xs font-bold text-charcoal-900 mt-1">Enter Measurements</h6>
                  <p class="text-[10px] text-slate-500 mt-0.5">Self-measured or from saved profile</p>
                </div>
                <div class="abha-radio-card text-center p-3 ${mode === 'ASSISTANCE' ? 'active' : ''}" onclick="AbhaUI.setMeasurementMode('ASSISTANCE')">
                  <span class="text-xl">📞</span>
                  <h6 class="text-xs font-bold text-charcoal-900 mt-1">Request Assistance</h6>
                  <p class="text-[10px] text-slate-500 mt-0.5">Master Tailor will call / WhatsApp you</p>
                </div>
                <div class="abha-radio-card text-center p-3 ${mode === 'VISIT_STORE' ? 'active' : ''}" onclick="AbhaUI.setMeasurementMode('VISIT_STORE')">
                  <span class="text-xl">📍</span>
                  <h6 class="text-xs font-bold text-charcoal-900 mt-1">Visit Beawar Store</h6>
                  <p class="text-[10px] text-slate-500 mt-0.5">Get measured in-person</p>
                </div>
              </div>

              <!-- Content for Option 1: SELF MEASUREMENTS -->
              <div id="measurementSelfSec" style="display: ${mode === 'SELF' ? 'block' : 'none'};" class="space-y-3 pt-2">
                ${savedProfiles.length > 0 ? `
                  <div class="p-2.5 bg-gold-50 border border-gold-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span class="text-xs font-bold text-charcoal-900">Use Saved Profile:</span>
                      <p class="text-[11px] text-slate-600">Quickly apply your saved fit</p>
                    </div>
                    <select onchange="AbhaUI.applySavedProfile(this.value)" class="text-xs bg-white border border-ivory-200 rounded p-1.5 font-semibold text-maroon-900">
                      <option value="">Select Saved Fit...</option>
                      ${savedProfiles.map(p => `<option value="${p.id}">${p.profileName}</option>`).join('')}
                    </select>
                  </div>
                ` : ''}

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Kurta Length (in)</label>
                    <input type="number" id="stitchKurtaLength" value="${this.buyNowState.stitchingConfig.measurements.kurtaLength || 42}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Shoulder (in)</label>
                    <input type="number" step="0.5" id="stitchShoulder" value="${this.buyNowState.stitchingConfig.measurements.shoulder || 14.5}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Bust / Chest (in)</label>
                    <input type="number" step="0.5" id="stitchBust" value="${this.buyNowState.stitchingConfig.measurements.bust || 36}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Waist (in)</label>
                    <input type="number" step="0.5" id="stitchWaist" value="${this.buyNowState.stitchingConfig.measurements.waist || 32}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Hips (in)</label>
                    <input type="number" step="0.5" id="stitchHips" value="${this.buyNowState.stitchingConfig.measurements.hips || 38}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Sleeve Length (in)</label>
                    <input type="number" step="0.5" id="stitchSleeveLength" value="${this.buyNowState.stitchingConfig.measurements.sleeveLength || 17}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Armhole (in)</label>
                    <input type="number" step="0.5" id="stitchArmhole" value="${this.buyNowState.stitchingConfig.measurements.armhole || 16}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Bottom Length (in)</label>
                    <input type="number" id="stitchBottomLength" value="${this.buyNowState.stitchingConfig.measurements.bottomLength || 38}" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs" />
                  </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Neck Design</label>
                    <select id="stitchNeckChoice" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs">
                      <option value="Round Neck with V-Slit">Round Neck with V-Slit</option>
                      <option value="Classic Sweetheart Neck">Classic Sweetheart Neck</option>
                      <option value="Mandarin Collar Placket">Mandarin Collar Placket</option>
                      <option value="Boat Neck">Boat Neck</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Sleeve Style</label>
                    <select id="stitchSleeveChoice" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs">
                      <option value="3/4th Sleeves">3/4th Regular Sleeves</option>
                      <option value="Full Sleeves">Full Length Sleeves</option>
                      <option value="Half Sleeves">Half Sleeves</option>
                      <option value="Sleeveless">Sleeveless</option>
                    </select>
                  </div>
                  <div>
                    <label class="block font-medium text-slate-700 mb-1">Bottom Style</label>
                    <select id="stitchBottomChoice" class="w-full bg-white border border-ivory-200 rounded p-2 text-xs">
                      <option value="Straight Pants with Pocket">Straight Pants with Pocket</option>
                      <option value="Traditional Pleated Salwar">Traditional Pleated Salwar</option>
                      <option value="Comfort Palazzo">Comfort Wide Palazzo</option>
                      <option value="Churidar">Churidar</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Content for Option 2: REQUEST ASSISTANCE -->
              <div id="measurementAssistanceSec" style="display: ${mode === 'ASSISTANCE' ? 'block' : 'none'};" class="p-3.5 bg-white border border-ivory-200 rounded-lg space-y-2.5 text-xs">
                <div class="flex items-center gap-2 text-maroon-900 font-bold">
                  <span>📞</span> <span>Personalized Measurement Assistance</span>
                </div>
                <p class="text-slate-600 leading-relaxed">
                  Our Master Tailor will reach out directly to guide you step-by-step through taking simple measurements over WhatsApp or phone call.
                </p>
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Preferred Contact Method</label>
                  <div class="flex gap-4">
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="assistMethod" value="WHATSAPP" checked class="text-maroon-800" />
                      <span>WhatsApp Message</span>
                    </label>
                    <label class="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="assistMethod" value="PHONE" class="text-maroon-800" />
                      <span>Phone Call</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label class="block font-medium text-slate-700 mb-1">Optional Note for Tailor</label>
                  <textarea id="assistNote" rows="2" placeholder="e.g. Please call in the evening / prefer loose comfort fit..." class="w-full bg-ivory-50 border border-ivory-200 rounded p-2 text-xs"></textarea>
                </div>
                <p class="text-[11px] text-gold-600 font-semibold italic">ABHA will contact you regarding your measurements after order confirmation.</p>
              </div>

              <!-- Content for Option 3: VISIT STORE -->
              <div id="measurementStoreSec" style="display: ${mode === 'VISIT_STORE' ? 'block' : 'none'};" class="p-3.5 bg-white border border-ivory-200 rounded-lg space-y-2.5 text-xs">
                <div class="flex items-center gap-2 text-maroon-900 font-bold">
                  <span>📍</span> <span>Visit ABHA Store for In-Person Measurements</span>
                </div>
                <p class="text-slate-600 leading-relaxed">
                  You are warmly invited to visit our boutique in Beawar. Our Master Tailor will take precise in-person measurements for your custom dress material.
                </p>
                <div class="bg-ivory-50 p-2.5 rounded border border-ivory-200 space-y-1 text-[11px] text-charcoal-900">
                  <p><strong>Address:</strong> 11, Ganesha Tower, in front of D.A.V. College, Arya Samaj, Beawar, Rajasthan – 305901</p>
                  <p><strong>Hotline:</strong> +91 9214837104 / +91 9261516194</p>
                </div>
                <div class="flex items-center gap-2 pt-1">
                  <a href="${STORE_DETAILS.mapsUrl}" target="_blank" rel="noopener noreferrer" class="abha-btn-outline text-[11px] py-1.5 px-3">
                    📍 Get Directions on Google Maps
                  </a>
                  <a href="https://wa.me/919214837104" target="_blank" rel="noopener noreferrer" class="text-[11px] text-maroon-800 font-bold underline">
                    WhatsApp Store Team
                  </a>
                </div>
              </div>

            </div>
          `;
          return;
        } else {
          // If UNSTITCHED, Step 2 is SHIPPING DETAILS!
          this.renderShippingStep(stepBadge, stepTitle, btnBack, btnNext, stepContent);
          return;
        }
      }

      if (this.buyNowState.step === 3) {
        // If Stitched, Step 3 is SHIPPING DETAILS!
        // If Unstitched, Step 3 is PAYMENT METHOD!
        if (this.buyNowState.orderType === 'STITCHED') {
          this.renderShippingStep(stepBadge, stepTitle, btnBack, btnNext, stepContent);
          return;
        } else {
          this.renderPaymentStep(stepBadge, stepTitle, btnBack, btnNext, stepContent);
          return;
        }
      }

      if (this.buyNowState.step === 4) {
        // Only Stitched reaches step 4 for PAYMENT!
        this.renderPaymentStep(stepBadge, stepTitle, btnBack, btnNext, stepContent);
        return;
      }
    },

    renderShippingStep: function (stepBadge, stepTitle, btnBack, btnNext, stepContent) {
      stepBadge.textContent = 'Shipping & Delivery Address';
      stepTitle.textContent = 'Where should we deliver your order?';
      btnBack.style.display = 'inline-flex';
      btnNext.textContent = 'Continue to Payment →';

      const s = this.buyNowState.shipping;
      const isBeawar = (s.pincode || '').trim() === '305901';

      stepContent.innerHTML = `
        <div class="space-y-3 text-xs">
          
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input type="text" id="shipName" required value="${s.name}" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" placeholder="e.g. Priya Sharma" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">Mobile Phone (for delivery SMS) *</label>
              <input type="tel" id="shipPhone" required value="${s.phone}" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" placeholder="e.g. 9829000000" />
            </div>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Delivery Street Address *</label>
            <input type="text" id="shipAddress" required value="${s.address}" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" placeholder="House / Flat / Street / Landmark" />
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div>
              <label class="block font-medium text-slate-700 mb-1">PIN Code *</label>
              <input type="text" id="shipPincode" required value="${s.pincode}" oninput="AbhaUI.handlePincodeChange(this.value)" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" placeholder="e.g. 305901" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">City *</label>
              <input type="text" id="shipCity" required value="${s.city}" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" />
            </div>
            <div>
              <label class="block font-medium text-slate-700 mb-1">State *</label>
              <input type="text" id="shipState" required value="${s.state}" class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" />
            </div>
          </div>

          <!-- Dynamic Local Beawar Delivery Highlight -->
          <div id="pincodeDeliveryNotice" class="p-2.5 rounded-lg border ${isBeawar ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-ivory-100 border-ivory-200 text-slate-700'}">
            <div class="flex items-center gap-1.5 font-bold text-xs">
              <span>${isBeawar ? '🟢' : '🚚'}</span>
              <span id="deliveryNoticeTitle">${isBeawar ? 'Local Beawar Doorstep Delivery (FREE ₹0)' : 'Pan-India Express Courier Delivery'}</span>
            </div>
            <p id="deliveryNoticeDesc" class="text-[11px] mt-0.5 opacity-90">
              ${isBeawar ? 'Delivered directly to your doorstep in Beawar by ABHA staff.' : 'Delivered safely via express tracked courier service across India.'}
            </p>
          </div>

          <div>
            <label class="block font-medium text-slate-700 mb-1">Order Notes (Optional)</label>
            <input type="text" id="shipNotes" value="${s.notes}" placeholder="Landmark or specific instructions..." class="w-full bg-white border border-ivory-200 rounded p-2.5 text-xs" />
          </div>

        </div>
      `;
    },

    renderPaymentStep: function (stepBadge, stepTitle, btnBack, btnNext, stepContent) {
      stepBadge.textContent = 'Payment & Final Order Confirmation';
      stepTitle.textContent = 'Select Payment Method';
      btnBack.style.display = 'inline-flex';
      btnNext.textContent = 'Place Order & Complete Purchase';

      const prod = this.activeProduct;
      const basePrice = prod.price || prod.base_price;
      const isStitched = this.buyNowState.orderType === 'STITCHED';
      const stitchFee = isStitched ? (prod.stitchingPrice || prod.stitching_price || 650) : 0;
      const isBeawar = (this.buyNowState.shipping.pincode || '').trim() === '305901';
      const deliveryFee = 0; // Local Beawar is free; outstation free above 2000
      const grandTotal = basePrice + stitchFee + deliveryFee;

      const pMethod = this.buyNowState.paymentMethod;

      stepContent.innerHTML = `
        <div class="space-y-3.5 text-xs">
          
          <!-- Order Breakdown Card -->
          <div class="p-3 bg-white border border-ivory-200 rounded-lg space-y-1.5">
            <div class="flex justify-between text-slate-600">
              <span>Fabric Price (${prod.title || prod.name})</span>
              <span class="font-semibold text-charcoal-900">₹${basePrice}</span>
            </div>
            ${isStitched ? `
              <div class="flex justify-between text-slate-600">
                <span>Custom Stitching & Tailoring</span>
                <span class="font-semibold text-maroon-800">+₹${stitchFee}</span>
              </div>
            ` : ''}
            <div class="flex justify-between text-slate-600">
              <span>Delivery (${isBeawar ? 'Beawar Doorstep' : 'Pan-India Courier'})</span>
              <span class="font-semibold text-emerald-700">FREE</span>
            </div>
            <div class="flex justify-between text-sm font-bold text-maroon-950 pt-2 border-t border-ivory-200">
              <span>Total Payable</span>
              <span>₹${grandTotal}</span>
            </div>
          </div>

          <!-- Clean Indian Payment Method Selectors -->
          <div>
            <label class="block font-semibold text-charcoal-900 mb-2">Choose Payment Option</label>
            <div class="space-y-2">
              
              <div class="abha-radio-card ${pMethod === 'UPI' ? 'active' : ''}" onclick="AbhaUI.setPaymentMethod('UPI')">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="paymentOption" value="UPI" ${pMethod === 'UPI' ? 'checked' : ''} class="text-maroon-800" />
                    <span class="font-bold text-charcoal-950">UPI (Google Pay, PhonePe, Paytm, BHIM)</span>
                  </div>
                  <span class="text-xs">⚡ Instant</span>
                </div>
              </div>

              <div class="abha-radio-card ${pMethod === 'CARD' ? 'active' : ''}" onclick="AbhaUI.setPaymentMethod('CARD')">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="paymentOption" value="CARD" ${pMethod === 'CARD' ? 'checked' : ''} class="text-maroon-800" />
                    <span class="font-bold text-charcoal-950">Credit / Debit Card (Visa, MasterCard, RuPay)</span>
                  </div>
                  <span class="text-xs">💳 Cards</span>
                </div>
              </div>

              <div class="abha-radio-card ${pMethod === 'NETBANKING' ? 'active' : ''}" onclick="AbhaUI.setPaymentMethod('NETBANKING')">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="paymentOption" value="NETBANKING" ${pMethod === 'NETBANKING' ? 'checked' : ''} class="text-maroon-800" />
                    <span class="font-bold text-charcoal-950">Net Banking (All Indian Banks)</span>
                  </div>
                  <span class="text-xs">🏦 Banking</span>
                </div>
              </div>

              <div class="abha-radio-card ${pMethod === 'COD' ? 'active' : ''}" onclick="AbhaUI.setPaymentMethod('COD')">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <input type="radio" name="paymentOption" value="COD" ${pMethod === 'COD' ? 'checked' : ''} class="text-maroon-800" />
                    <span class="font-bold text-charcoal-950">Cash on Delivery (Available in Beawar)</span>
                  </div>
                  <span class="text-xs">💵 COD</span>
                </div>
              </div>

            </div>
          </div>

          <div class="p-2.5 bg-ivory-100 rounded text-[11px] text-slate-600 flex items-center gap-2">
            <span>🔒</span>
            <span>Zero payment processing fabrication: Orders are confirmed safely and synchronized directly into ABHA atelier and local delivery logs.</span>
          </div>

        </div>
      `;
    },

    setOrderType: function (type) {
      this.buyNowState.orderType = type;
      this.renderBuyNowStep();
    },

    setMeasurementMode: function (mode) {
      this.buyNowState.measurementMode = mode;
      this.renderBuyNowStep();
    },

    setPaymentMethod: function (method) {
      this.buyNowState.paymentMethod = method;
      this.renderBuyNowStep();
    },

    applySavedProfile: function (profileId) {
      if (!profileId || !window.AbhaStore) return;
      const profiles = window.AbhaStore.getCustomerMeasurements();
      const p = profiles.find(item => item.id === profileId);
      if (!p) return;

      if (document.getElementById('stitchKurtaLength')) document.getElementById('stitchKurtaLength').value = p.kurtaLength || 42;
      if (document.getElementById('stitchShoulder')) document.getElementById('stitchShoulder').value = p.shoulder || 14.5;
      if (document.getElementById('stitchBust')) document.getElementById('stitchBust').value = p.bust || 36;
      if (document.getElementById('stitchWaist')) document.getElementById('stitchWaist').value = p.waist || 32;
      if (document.getElementById('stitchHips')) document.getElementById('stitchHips').value = p.hips || 38;
      if (document.getElementById('stitchSleeveLength')) document.getElementById('stitchSleeveLength').value = p.sleeveLength || 17;
      if (document.getElementById('stitchArmhole')) document.getElementById('stitchArmhole').value = p.armhole || 16;
      if (document.getElementById('stitchBottomLength')) document.getElementById('stitchBottomLength').value = p.bottomLength || 38;
    },

    handlePincodeChange: function (pincode) {
      const isBeawar = pincode.trim() === '305901';
      const notice = document.getElementById('pincodeDeliveryNotice');
      const title = document.getElementById('deliveryNoticeTitle');
      const desc = document.getElementById('deliveryNoticeDesc');
      if (!notice || !title || !desc) return;

      if (isBeawar) {
        notice.className = 'p-2.5 rounded-lg border bg-emerald-50 border-emerald-200 text-emerald-800';
        title.innerHTML = '🟢 Local Beawar Doorstep Delivery (FREE ₹0)';
        desc.textContent = 'Delivered directly to your doorstep in Beawar by ABHA staff.';
      } else {
        notice.className = 'p-2.5 rounded-lg border bg-ivory-100 border-ivory-200 text-slate-700';
        title.innerHTML = '🚚 Pan-India Express Courier Delivery';
        desc.textContent = 'Delivered safely via express tracked courier service across India.';
      }
    },

    prevBuyNowStep: function () {
      if (this.buyNowState.step > 1) {
        this.buyNowState.step -= 1;
        this.renderBuyNowStep();
      }
    },

    handleBuyNowSubmit: async function (e) {
      e.preventDefault();
      const errBox = document.getElementById('buyNowErrorBox');
      if (errBox) errBox.style.display = 'none';

      // Step transitions
      if (this.buyNowState.step === 1) {
        this.buyNowState.step = 2;
        this.renderBuyNowStep();
        return;
      }

      if (this.buyNowState.step === 2) {
        if (this.buyNowState.orderType === 'STITCHED') {
          // Read measurements if in SELF mode
          if (this.buyNowState.measurementMode === 'SELF') {
            this.buyNowState.stitchingConfig.measurements = {
              kurtaLength: parseFloat(document.getElementById('stitchKurtaLength')?.value || 42),
              shoulder: parseFloat(document.getElementById('stitchShoulder')?.value || 14.5),
              bust: parseFloat(document.getElementById('stitchBust')?.value || 36),
              waist: parseFloat(document.getElementById('stitchWaist')?.value || 32),
              hips: parseFloat(document.getElementById('stitchHips')?.value || 38),
              sleeveLength: parseFloat(document.getElementById('stitchSleeveLength')?.value || 17),
              armhole: parseFloat(document.getElementById('stitchArmhole')?.value || 16),
              bottomLength: parseFloat(document.getElementById('stitchBottomLength')?.value || 38)
            };
            this.buyNowState.stitchingConfig.neckDesign = document.getElementById('stitchNeckChoice')?.value || 'Round Neck with V-Slit';
            this.buyNowState.stitchingConfig.sleeveStyle = document.getElementById('stitchSleeveChoice')?.value || '3/4th Sleeves';
            this.buyNowState.stitchingConfig.bottomStyle = document.getElementById('stitchBottomChoice')?.value || 'Straight Pants with Pocket';
          } else if (this.buyNowState.measurementMode === 'ASSISTANCE') {
            this.buyNowState.assistanceDetails.notes = document.getElementById('assistNote')?.value || '';
            const assistRadio = document.querySelector('input[name="assistMethod"]:checked');
            this.buyNowState.assistanceDetails.contactMethod = assistRadio ? assistRadio.value : 'WHATSAPP';
          }
          this.buyNowState.step = 3;
          this.renderBuyNowStep();
          return;
        } else {
          // Unstitched: Validate shipping
          this.saveShippingInputs();
          this.buyNowState.step = 3;
          this.renderBuyNowStep();
          return;
        }
      }

      if (this.buyNowState.step === 3) {
        if (this.buyNowState.orderType === 'STITCHED') {
          this.saveShippingInputs();
          this.buyNowState.step = 4;
          this.renderBuyNowStep();
          return;
        }
      }

      // FINAL SUBMISSION (Step 3 for Unstitched, Step 4 for Stitched)
      const btnNext = document.getElementById('buyNowBtnNext');
      const origText = btnNext.textContent;
      btnNext.disabled = true;
      btnNext.textContent = 'Processing Order...';

      try {
        const prod = this.activeProduct;
        const s = this.buyNowState.shipping;

        const stitchingPayload = this.buyNowState.orderType === 'STITCHED' ? {
          mode: this.buyNowState.measurementMode,
          measurement_mode: this.buyNowState.measurementMode,
          neck_design: this.buyNowState.stitchingConfig.neckDesign || 'Round Neck with Slit',
          sleeve_style: this.buyNowState.stitchingConfig.sleeveStyle || '3/4th Regular Sleeves',
          bottom_style: this.buyNowState.stitchingConfig.bottomStyle || 'Straight Pants',
          kurta_design: 'Straight Fit Standard',
          measurements: this.buyNowState.stitchingConfig.measurements || {},
          contactMethod: this.buyNowState.assistanceDetails.contactMethod,
          notes: this.buyNowState.assistanceDetails.notes
        } : null;

        const order = window.AbhaStore.createBuyNowOrder({
          productId: prod.id,
          orderType: this.buyNowState.orderType,
          stitchingConfig: stitchingPayload,
          customer: { name: s.name, phone: s.phone, email: s.email },
          shipping: s,
          deliveryType: s.pincode === '305901' ? 'BEAWAR_LOCAL_DELIVERY' : 'PAN_INDIA_COURIER'
        });

        // Set payment method
        order.payment_method = this.buyNowState.paymentMethod;

        // Render Confirmation Screen
        this.renderOrderConfirmation(order);

      } catch (err) {
        if (errBox) {
          errBox.textContent = err.message || 'Could not place order. Please check details.';
          errBox.style.display = 'block';
        }
        btnNext.disabled = false;
        btnNext.textContent = origText;
      }
    },

    saveShippingInputs: function () {
      const name = document.getElementById('shipName')?.value || '';
      const phone = document.getElementById('shipPhone')?.value || '';
      const address = document.getElementById('shipAddress')?.value || '';
      const pincode = document.getElementById('shipPincode')?.value || '305901';
      const city = document.getElementById('shipCity')?.value || 'Beawar';
      const state = document.getElementById('shipState')?.value || 'Rajasthan';
      const notes = document.getElementById('shipNotes')?.value || '';

      if (!name || !phone || !address || !pincode) {
        throw new Error('Please fill in complete delivery details (Name, Phone, Address, PIN code).');
      }

      this.buyNowState.shipping = { name, phone, address, pincode, city, state, notes };
    },

    renderOrderConfirmation: function (order) {
      const stepBadge = document.getElementById('buyNowStepBadge');
      const stepTitle = document.getElementById('buyNowTitle');
      const stepContent = document.getElementById('buyNowStepContent');
      const btnBack = document.getElementById('buyNowBtnBack');
      const btnNext = document.getElementById('buyNowBtnNext');

      stepBadge.textContent = 'Order Placed Successfully';
      stepTitle.textContent = 'Dhanyawaad! Order Confirmed';
      btnBack.style.display = 'none';
      btnNext.style.display = 'none';

      stepContent.innerHTML = `
        <div class="py-6 px-2 text-center space-y-4">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold border border-emerald-300">
            ✓
          </div>
          <div>
            <h4 class="font-serif text-lg font-bold text-charcoal-950">Thank You, ${order.customer_name}!</h4>
            <p class="text-xs text-slate-600 mt-1">Your order has been registered in the ABHA store system.</p>
          </div>

          <div class="p-4 bg-white rounded-lg border border-ivory-200 text-left space-y-2 text-xs max-w-md mx-auto">
            <div class="flex justify-between border-b border-ivory-200 pb-2">
              <span class="text-slate-500">Order Number:</span>
              <span class="font-mono font-bold text-maroon-900">${order.order_number}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Product:</span>
              <span class="font-medium text-charcoal-900">${order.product_title}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Order Type:</span>
              <span class="font-semibold ${order.order_type === 'STITCHED' ? 'text-gold-600' : 'text-slate-700'}">${order.order_type === 'STITCHED' ? '✨ Stitched to Measurements' : 'Unstitched Fabric'}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500">Delivery Method:</span>
              <span class="font-medium text-charcoal-900">${order.delivery_type === 'BEAWAR_LOCAL_DELIVERY' ? '🟢 Beawar Doorstep Delivery' : '🚚 Pan-India Express Courier'}</span>
            </div>
            <div class="flex justify-between border-t border-ivory-200 pt-2 font-bold text-sm text-maroon-950">
              <span>Total Amount:</span>
              <span>₹${order.total_amount}</span>
            </div>
          </div>

          ${order.stitching_config?.mode === 'ASSISTANCE' ? `
            <div class="p-3 bg-gold-50 border border-gold-200 rounded-lg text-xs text-gold-900 text-left max-w-md mx-auto">
              <strong>Measurement Assistance Requested:</strong>
              <p class="mt-0.5">Our Master Tailor will contact you at <strong>${order.customer_phone}</strong> via ${order.stitching_config.contactMethod || 'WhatsApp'} to confirm your measurements.</p>
            </div>
          ` : ''}

          <div class="pt-3 flex flex-wrap items-center justify-center gap-3">
            <a href="track-order.html?order=${order.order_number}" class="abha-btn-primary text-xs py-2.5 px-5">
              <span>🚚 Track Your Order Live</span>
            </a>
            <a href="shop.html" class="abha-btn-outline text-xs py-2.5 px-5">
              <span>Continue Shopping</span>
            </a>
          </div>
        </div>
      `;
    },

    updateCustomerUI: function () {
      if (!window.AbhaStore) return;
      const cust = window.AbhaStore.getCurrentCustomer();
      const badge = document.getElementById('headerCustomerName');
      if (badge && cust) {
        badge.textContent = `(${cust.name.split(' ')[0]})`;
      }
    },

    bindGlobalEvents: function () {
      // Escape key to close modals
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeSearchModal();
          this.closeBuyNowModal();
        }
      });
    }
  };

  // Expose to window
  window.AbhaUI = AbhaUI;

  // Auto-boot on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AbhaUI.init());
  } else {
    AbhaUI.init();
  }

})(window);
