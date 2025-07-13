document.addEventListener('DOMContentLoaded', function () {
  // Navigation functionality
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section');

  navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      navLinks.forEach(l => l.classList.remove('active'));
      sections.forEach(s => s.classList.remove('active-section'));
      this.classList.add('active');
      const targetId = this.getAttribute('href').substring(1);
      document.getElementById(targetId).classList.add('active-section');
      document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
  });
  document.querySelector('.nav-link').click();

  // Image upload functionality
  const addImageBtn = document.getElementById('add-image-btn');
  const imageUpload = document.getElementById('image-upload');
  const galleryContainer = document.querySelector('.gallery-container');

  if (addImageBtn && imageUpload && galleryContainer) {
    addImageBtn.addEventListener('click', function () {
      imageUpload.click();
    });

    imageUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const img = document.createElement('img');
          img.src = event.target.result;
          img.alt = "Uploaded Image";
          img.style.width = "30%";
          img.style.marginBottom = "1rem";
          img.style.borderRadius = "5px";
          img.style.boxShadow = "0 3px 10px rgba(0, 0, 0, 0.2)";
          galleryContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // CTA button
  const ctaButton = document.getElementById('cta-button');
  if (ctaButton) {
    ctaButton.addEventListener('click', function () {
      document.querySelector('a[href="#contact"]').click();
    });
  }

  // Contact form
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const message = document.getElementById('message').value;
      const contact = {
        name, email, phone, message, timestamp: new Date().toISOString()
      };
      let contacts = JSON.parse(localStorage.getItem('leadbuzzContacts')) || [];
      contacts.push(contact);
      localStorage.setItem('leadbuzzContacts', JSON.stringify(contacts));
      contactForm.reset();
      contactForm.style.display = 'none';
      document.getElementById('confirmation-message').style.display = 'block';
      setTimeout(() => {
        document.getElementById('confirmation-message').style.display = 'none';
        contactForm.style.display = 'block';
      }, 5000);
    });
  }

  // Maintain current section after reload
  const hash = window.location.hash;
  if (hash) {
    const targetLink = document.querySelector(`a[href="${hash}"]`);
    if (targetLink) targetLink.click();
  }

  // Product filtering
  const categoryTabs = document.querySelectorAll('.category-tab');
  const productCards = document.querySelectorAll('.product-card');

  categoryTabs.forEach(tab => {
    tab.addEventListener('click', function () {
      categoryTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      const category = this.getAttribute('data-category');
      productCards.forEach(card => {
        card.style.display = (category === 'all' || card.getAttribute('data-category') === category) ? 'block' : 'none';
      });
    });
  });

  // Shopping Cart
  const cartIcon = document.querySelector('.cart-icon');
  const cartModal = document.querySelector('.cart-modal');
  const closeCart = document.querySelector('.close-cart');
  const cartItemsContainer = document.querySelector('.cart-items');
  const cartCount = document.querySelector('.cart-count');
  const totalAmount = document.querySelector('.total-amount');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const checkoutModal = document.querySelector('.checkout-modal');
  const closeCheckout = document.querySelector('.close-checkout');
  const addToCartButtons = document.querySelectorAll('.add-to-cart');
  const checkoutSteps = document.querySelectorAll('.checkout-step');
  const checkoutForms = document.querySelectorAll('.checkout-form');
  const backBtn = document.querySelector('.back-btn');
  const nextBtn = document.querySelector('.next-btn');
  const orderSubtotal = document.querySelector('.order-subtotal');
  const orderTax = document.querySelector('.order-tax');
  const orderTotal = document.querySelector('.order-total');

  let cart = [];
  let currentStep = 1;

  // Initialize cart from localStorage if available
  if (localStorage.getItem('leadbuzzCart')) {
    cart = JSON.parse(localStorage.getItem('leadbuzzCart'));
    updateCart();
  }

  // Event listeners
  cartIcon.addEventListener('click', () => cartModal.style.display = 'flex');
  closeCart.addEventListener('click', () => cartModal.style.display = 'none');
  closeCheckout.addEventListener('click', () => checkoutModal.style.display = 'none');

  checkoutBtn.addEventListener('click', function () {
    if (!cart.length) return;
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'flex';
    updateOrderSummary();
  });

  addToCartButtons.forEach(button => {
    button.addEventListener('click', function () {
      const productCard = this.closest('.product-card');
      const productId = productCard.getAttribute('data-id') || Math.random().toString(36).substr(2, 9);
      const productTitle = productCard.querySelector('.product-title').textContent;
      const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('₹', '').replace(',', ''));
      const productImage = productCard.querySelector('.product-image img').src;
      
      const existingItem = cart.find(item => item.id === productId);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ 
          id: productId, 
          title: productTitle, 
          price: productPrice, 
          image: productImage, 
          quantity: 1 
        });
      }
      
      updateCart();
      cartModal.style.display = 'flex';
    });
  });

  // Payment method selection
  document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === 'upi') {
        document.getElementById('upi-payment-details').style.display = 'block';
        document.getElementById('card-payment-details').style.display = 'none';
        // Update QR code with current amount when switching to UPI
        const total = parseFloat(document.querySelector('.order-total').textContent.replace('₹', '').replace(/,/g, ''));
        updateUPIQRCode(total);
      } else if (this.value === 'credit-card') {
        document.getElementById('upi-payment-details').style.display = 'none';
        document.getElementById('card-payment-details').style.display = 'block';
      }
    });
  });

  // Copy UPI ID functionality
  document.getElementById('copy-upi-btn').addEventListener('click', function(e) {
    e.preventDefault();
    const upiId = '7337026195@ybl';
    navigator.clipboard.writeText(upiId).then(() => {
      const originalText = this.innerHTML;
      this.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        this.innerHTML = originalText;
      }, 2000);
    });
  });

  // Update UPI QR code with current amount
  function updateUPIQRCode(amount) {
    const qrCodeImg = document.getElementById('upi-qr-code');
    // Format amount to 2 decimal places for UPI
    const formattedAmount = amount.toFixed(2);
    // Create UPI deep link with amount parameter
    const upiLink = `upi://pay?pa=7337026195@ybl&pn=LeadBuzz&am=${formattedAmount}&cu=INR&tn=Payment for order`;
    // Generate QR code using the UPI link
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
    
    // Update the displayed amount
    document.querySelector('.qr-amount-display').textContent = `Amount: ₹${formattedAmount}`;
  }

  // Handle payment proof upload
  document.getElementById('payment-proof').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        const paymentData = {
          timestamp: new Date().toISOString(),
          amount: document.querySelector('.order-total').textContent,
          proof: event.target.result,
          cart: cart
        };
        
        let payments = JSON.parse(localStorage.getItem('leadbuzzPayments')) || [];
        payments.push(paymentData);
        localStorage.setItem('leadbuzzPayments', JSON.stringify(payments));
        
        // Show confirmation
        alert('Payment proof uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  });

  // Update cart function
  function updateCart() {
    cartItemsContainer.innerHTML = '';
    if (!cart.length) {
      cartItemsContainer.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
      cartCount.textContent = '0';
      totalAmount.textContent = '₹0';
      checkoutBtn.disabled = true;
      localStorage.removeItem('leadbuzzCart');
      return;
    }

    let total = 0;
    cart.forEach(item => {
      const cartItem = document.createElement('div');
      cartItem.className = 'cart-item';
      cartItem.innerHTML = `
        <div class="cart-item-image"><img src="${item.image}" alt="${item.title}"></div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString()}</div>
          <div class="cart-item-quantity">
            <button class="quantity-btn minus">-</button>
            <input type="text" class="quantity-input" value="${item.quantity}" readonly>
            <button class="quantity-btn plus">+</button>
            <button class="remove-item">Remove</button>
          </div>
        </div>`;
      cartItemsContainer.appendChild(cartItem);
      total += item.price * item.quantity;
      
      // Add event listeners for quantity controls
      cartItem.querySelector('.minus').addEventListener('click', () => {
        if (item.quantity > 1) item.quantity--;
        updateCart();
      });
      
      cartItem.querySelector('.plus').addEventListener('click', () => {
        item.quantity++;
        updateCart();
      });
      
      cartItem.querySelector('.remove-item').addEventListener('click', () => {
        cart = cart.filter(ci => ci.id !== item.id);
        updateCart();
      });
    });
    
    cartCount.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
    totalAmount.textContent = `₹${total.toLocaleString()}`;
    checkoutBtn.disabled = false;
    
    // Save cart to localStorage
    localStorage.setItem('leadbuzzCart', JSON.stringify(cart));
    
    // Update order summary and QR code
    updateOrderSummary();
  }

  // Update order summary
  function updateOrderSummary() {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% tax
    const total = subtotal + tax;
    
    orderSubtotal.textContent = `₹${subtotal.toLocaleString()}`;
    orderTax.textContent = `₹${tax.toLocaleString()}`;
    orderTotal.textContent = `₹${total.toLocaleString()}`;
    
    // Update UPI QR code with current total
    updateUPIQRCode(total);
  }

  // Update checkout steps
  function updateCheckoutSteps() {
    checkoutSteps.forEach(step => {
      const stepNum = parseInt(step.getAttribute('data-step'));
      step.classList.remove('active', 'completed');
      if (stepNum < currentStep) step.classList.add('completed');
      else if (stepNum === currentStep) step.classList.add('active');
    });

    checkoutForms.forEach(form => {
      form.classList.remove('active');
      const step = parseInt(form.getAttribute('data-step'));
      if (step === currentStep) {
        form.classList.add('active');
      }
    });

    backBtn.style.display = currentStep === 1 ? 'none' : 'block';

    if (currentStep === 3) {
      nextBtn.style.display = 'none';
      backBtn.style.display = 'none';
      document.querySelector('.order-id').textContent = `LBZ-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Clear cart after successful order
      cart = [];
      updateCart();
    } else {
      nextBtn.style.display = 'block';
      nextBtn.textContent = currentStep === 2 ? 'Place Order' : 'Next';
    }
  }

  // Next button handler
  nextBtn.addEventListener('click', function() {
    if (currentStep === 1) {
      // Validate address form
      const addressForm = document.getElementById('address-form');
      const requiredFields = addressForm.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value) {
          isValid = false;
          field.style.borderColor = 'red';
        } else {
          field.style.borderColor = '#ddd';
        }
      });
      
      if (!isValid) return;
    } else if (currentStep === 2) {
      // Validate payment method
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked');
      if (!paymentMethod) {
        alert('Please select a payment method');
        return;
      }
      
      if (paymentMethod.value === 'upi') {
        const paymentProof = document.getElementById('payment-proof').files[0];
        if (!paymentProof) {
          alert('Please upload payment proof for UPI payment');
          return;
        }
      } else if (paymentMethod.value === 'credit-card') {
        // Validate card details
        const cardNumber = document.getElementById('card-number').value;
        const cardExpiry = document.getElementById('card-expiry').value;
        const cardCvv = document.getElementById('card-cvv').value;
        const cardName = document.getElementById('card-name').value;
        
        if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
          alert('Please fill all card details');
          return;
        }
        
        // Simple validation
        if (!/^\d{16}$/.test(cardNumber.replace(/\s/g, ''))) {
          alert('Please enter a valid 16-digit card number');
          return;
        }
        
        if (!/^\d{3,4}$/.test(cardCvv)) {
          alert('Please enter a valid CVV (3 or 4 digits)');
          return;
        }
      }
    }
    
    currentStep++;
    updateCheckoutSteps();
  });

  // Back button handler
  backBtn.addEventListener('click', function() {
    currentStep--;
    updateCheckoutSteps();
  });

  // Initialize checkout steps
  updateCheckoutSteps();
});