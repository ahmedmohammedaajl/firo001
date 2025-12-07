// Initial Sample Data
let products = [
    { id: 1, name: "برجر كلاسيك", price: 25.00, category: "burger", image: "🍔" },
    { id: 2, name: "دبل تشيز برجر", price: 32.00, category: "burger", image: "🍔" },
    { id: 3, name: "بيتزا مارغريتا", price: 30.00, category: "pizza", image: "🍕" },
    { id: 4, name: "بيتزا بيبروني", price: 38.00, category: "pizza", image: "🍕" },
    { id: 5, name: "بيبسي", price: 5.00, category: "drink", image: "🥤" },
    { id: 6, name: "عصير برتقال", price: 12.00, category: "drink", image: "🥤" },
    { id: 7, name: "قهوة لاتيه", price: 15.00, category: "drink", image: "☕" },
    { id: 8, name: "بطاطس مقلية", price: 8.00, category: "other", image: "🍟" },
];

let cart = [];
let currentCategory = 'all';

// DOM Elements
const menuGrid = document.getElementById('menuGrid');
const cartItemsContainer = document.getElementById('cartItems');
const subTotalEl = document.getElementById('subTotal');
const taxEl = document.getElementById('taxAmount');
const totalEl = document.getElementById('totalAmount');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('addItemModal');
const addItemBtn = document.getElementById('addItemBtn');
const closeBtn = document.querySelector('.close-btn');
const addItemForm = document.getElementById('addItemForm');

// Initialize
function init() {
    renderMenu();
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Load from local storage if needed (optional feature)
    // loadProducts();
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('dateTime').innerText = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

// Render Menu
function renderMenu(filter = 'all') {
    menuGrid.innerHTML = '';

    const filteredProducts = products.filter(p => {
        const matchesCategory = filter === 'all' || p.category === filter;
        const matchesSearch = p.name.toLowerCase().includes(searchInput.value.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (filteredProducts.length === 0) {
        menuGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888;">لا توجد أصناف مطابقة</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product-card';
        div.innerHTML = `
            <span class="emoji-img">${product.image}</span>
            <h4>${product.name}</h4>
            <div class="price">${product.price.toFixed(2)} ر.س</div>
        `;
        div.onclick = () => addToCart(product.id);
        menuGrid.appendChild(div);
    });
}

// Filter Function
function filterMenu(category) {
    currentCategory = category;
    // Update active button state
    document.querySelectorAll('.sidebar nav button').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    renderMenu(currentCategory);
}

// Search Function
searchInput.addEventListener('input', () => {
    renderMenu(currentCategory);
});

// Add to Cart
function addToCart(id) {
    const product = products.find(p => p.id === id);
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }

    renderCart();
}

// Update Cart UI
function renderCart() {
    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-msg">
                <i class="fas fa-shopping-basket"></i>
                <p>السلة فارغة</p>
            </div>`;
    } else {
        cart.forEach(item => {
            const div = document.createElement('div');
            div.className = 'cart-item';
            div.innerHTML = `
                <div class="item-info">
                    <h5>${item.name}</h5>
                    <span class="item-price">${(item.price * item.qty).toFixed(2)} ر.س</span>
                </div>
                <div class="item-controls">
                    <button class="qty-btn minus" onclick="changeQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn plus" onclick="changeQty(${item.id}, 1)">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });
    }

    calculateTotals();
}

function changeQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;

    if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== id);
    }

    renderCart();
}

function calculateTotals() {
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const tax = subTotal * 0.15;
    const total = subTotal + tax;

    subTotalEl.innerText = subTotal.toFixed(2) + ' ر.س';
    taxEl.innerText = tax.toFixed(2) + ' ر.س';
    totalEl.innerText = total.toFixed(2) + ' ر.س';
}

// Modal Functions
addItemBtn.onclick = () => modal.style.display = 'flex';
closeBtn.onclick = () => modal.style.display = 'none';
window.onclick = (e) => {
    if (e.target == modal) modal.style.display = 'none';
}

// Add New Item
addItemForm.onsubmit = (e) => {
    e.preventDefault();

    const name = document.getElementById('newItemName').value;
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const category = document.getElementById('newItemCategory').value;
    const imageKey = document.getElementById('newItemImage').value;

    const emojis = {
        'burger': '🍔',
        'pizza': '🍕',
        'fries': '🍟',
        'drink': '🥤',
        'coffee': '☕'
    };

    const newProduct = {
        id: Date.now(), // Generate unique ID
        name,
        price,
        category,
        image: emojis[imageKey] || '🍱'
    };

    products.push(newProduct);
    renderMenu(currentCategory);

    modal.style.display = 'none';
    addItemForm.reset();

    // Be fancy and show success indicator (not implemented in this minimal version)
    alert('تم إضافة الصنف بنجاح!');
}

// Print Receipt
function printReceipt() {
    if (cart.length === 0) {
        alert('السلة فارغة!');
        return;
    }

    // Fill Receipt Data
    const receiptBody = document.getElementById('receiptBody');
    receiptBody.innerHTML = '';

    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.qty}</td>
            <td>${(item.price * item.qty).toFixed(2)}</td>
        `;
        receiptBody.appendChild(row);
    });

    document.getElementById('receiptTotal').innerText = totalEl.innerText;
    document.getElementById('receiptDate').innerText = new Date().toLocaleString();
    document.getElementById('receiptOrderNum').innerText = document.getElementById('orderNumber').innerText;

    window.print();

    // Optional: Clear cart after print
    // cart = [];
    // renderCart();
    // document.getElementById('orderNumber').innerText = parseInt(document.getElementById('orderNumber').innerText) + 1;
}

// Start
init();
