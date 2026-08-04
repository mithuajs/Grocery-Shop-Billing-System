
// ===========================
// DOM Elements
// ===========================

var productNameInput = document.getElementById("productName");
var priceInput = document.getElementById("price");
var quantityInput = document.getElementById("quantity");

var addProductBtn = document.getElementById("addProductBtn");

var productTableBody = document.getElementById("productTableBody");
var grandTotalDisplay = document.getElementById("grandTotal");
var emptyMessage = document.getElementById("emptyMessage");

var printBtn = document.getElementById("printBtn");
var clearBtn = document.getElementById("clearBtn");

var catalogContainer = document.getElementById("productCatalog");

// Modal elements
var quantityModal = document.getElementById("quantityModal");
var modalProductName = document.getElementById("modalProductName");
var modalQuantity = document.getElementById("modalQuantity");
var modalConfirm = document.getElementById("modalConfirm");
var modalCancel = document.getElementById("modalCancel");

// ===========================
// Variables
// ===========================

var serial = 1;
var totalBill = 0;
var products = [];
var editProductId = null;
var selectedCatalogProduct = null;

// ===========================
// Render Product Catalog
// ===========================

function renderCatalog() {

    catalogContainer.innerHTML = "";

    for (var i = 0; i < productCatalog.length; i++) {

        var item = productCatalog[i];

        var card = document.createElement("div");
        card.className = "product-card";
        card.setAttribute("data-id", item.id);

        card.innerHTML =
            '<div class="product-icon"><img src="' + item.icon + '" alt="' + item.name + '"></div>' +
            '<div class="product-name">' + item.name + '</div>' +
            '<div class="product-price">৳' + item.price + '/' + item.unit + '</div>';

        card.addEventListener("click", handleCatalogClick);

        catalogContainer.appendChild(card);
    }
}

// ===========================
// Catalog Product Click
// ===========================

function handleCatalogClick(event) {

    var card = event.currentTarget;
    var id = Number(card.getAttribute("data-id"));

    // Find the product from catalog
    selectedCatalogProduct = null;

    for (var i = 0; i < productCatalog.length; i++) {
        if (productCatalog[i].id === id) {
            selectedCatalogProduct = productCatalog[i];
            break;
        }
    }

    if (!selectedCatalogProduct) return;

    // Show quantity modal
    modalProductName.innerText = selectedCatalogProduct.name + " — পরিমাণ দিন";
    modalQuantity.value = 1;
    quantityModal.classList.add("show");
    modalQuantity.focus();
}

// ===========================
// Modal Confirm
// ===========================

modalConfirm.addEventListener("click", function () {

    var qty = Number(modalQuantity.value);

    if (qty <= 0 || !selectedCatalogProduct) {
        alert("সঠিক পরিমাণ দিন!");
        return;
    }

    // Add catalog product to bill
    var product = {
        id: Date.now(),
        name: selectedCatalogProduct.name,
        price: selectedCatalogProduct.price,
        quantity: qty
    };

    products.push(product);
    saveProducts();
    loadProducts();

    // Close modal
    quantityModal.classList.remove("show");
    selectedCatalogProduct = null;
});

// ===========================
// Modal Cancel
// ===========================

modalCancel.addEventListener("click", function () {
    quantityModal.classList.remove("show");
    selectedCatalogProduct = null;
});

// Close modal on overlay click
quantityModal.addEventListener("click", function (event) {
    if (event.target === quantityModal) {
        quantityModal.classList.remove("show");
        selectedCatalogProduct = null;
    }
});

// Modal quantity enter key
modalQuantity.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        modalConfirm.click();
    }
});

// ===========================
// Save to LocalStorage
// ===========================

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

// ===========================
// Update Serial Numbers
// ===========================

function updateSerialNumbers() {

    var rows = productTableBody.querySelectorAll("tr");

    for (var i = 0; i < rows.length; i++) {
        rows[i].cells[0].innerText = i + 1;
    }

    serial = rows.length + 1;
}

// ===========================
// Update Empty State
// ===========================

function updateEmptyState() {
    if (products.length === 0) {
        emptyMessage.style.display = "block";
    } else {
        emptyMessage.style.display = "none";
    }
}

// ===========================
// Add Custom Product
// ===========================

addProductBtn.addEventListener("click", function () {

    var name = productNameInput.value.trim();
    var productPrice = Number(priceInput.value);
    var productQuantity = Number(quantityInput.value);

    if (name === "" || productPrice <= 0 || productQuantity <= 0) {
        alert("সব তথ্য সঠিকভাবে পূরণ করুন।");
        return;
    }

    // Edit Mode
    if (editProductId !== null) {

        var product = null;

        for (var i = 0; i < products.length; i++) {
            if (products[i].id === editProductId) {
                product = products[i];
                break;
            }
        }

        if (!product) return;

        product.name = name;
        product.price = productPrice;
        product.quantity = productQuantity;

        editProductId = null;

        saveProducts();
        loadProducts();

        addProductBtn.innerText = "যোগ করুন";

        productNameInput.value = "";
        priceInput.value = "";
        quantityInput.value = "";

        productNameInput.focus();

        return;
    }

    // Add New Product
    var newProduct = {
        id: Date.now(),
        name: name,
        price: productPrice,
        quantity: productQuantity
    };

    products.push(newProduct);

    saveProducts();
    loadProducts();

    productNameInput.value = "";
    priceInput.value = "";
    quantityInput.value = "";

    productNameInput.focus();

});

// ===========================
// Delete & Edit Product
// ===========================

productTableBody.addEventListener("click", function (event) {

    // Delete
    if (event.target.classList.contains("delete-btn")) {

        var button = event.target;
        var row = button.closest("tr");
        var rowTotal = Number(button.getAttribute("data-total"));

        totalBill -= rowTotal;
        grandTotalDisplay.innerText = "৳" + totalBill;

        var id = Number(button.getAttribute("data-id"));

        var newProducts = [];
        for (var i = 0; i < products.length; i++) {
            if (products[i].id !== id) {
                newProducts.push(products[i]);
            }
        }
        products = newProducts;

        saveProducts();

        row.remove();

        updateSerialNumbers();
        updateEmptyState();
    }

    // Edit
    if (event.target.classList.contains("edit-btn")) {

        var editId = Number(event.target.getAttribute("data-id"));

        editProduct(editId);
    }

});

function editProduct(id) {

    var product = null;

    for (var i = 0; i < products.length; i++) {
        if (products[i].id === id) {
            product = products[i];
            break;
        }
    }

    if (!product) return;

    productNameInput.value = product.name;
    priceInput.value = product.price;
    quantityInput.value = product.quantity;

    editProductId = id;

    addProductBtn.innerText = "আপডেট করুন";

    productNameInput.focus();

}

// ===========================
// Enter Key Navigation
// ===========================

productNameInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        priceInput.focus();
    }
});

priceInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        quantityInput.focus();
    }
});

quantityInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        e.preventDefault();
        addProductBtn.click();
    }
});

// ===========================
// Print Bill
// ===========================

printBtn.addEventListener("click", async function () {
    if (products.length === 0) { alert("আগে পণ্য যোগ করুন।"); return; }
    printBtn.disabled = true;
    try {
        var response = await fetch("/api/sales", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items: products, discount: 0, paymentMethod: "নগদ" })
        });
        var result = await response.json();
        if (response.status === 401) { window.location.href = "./page/login.html"; return; }
        if (!response.ok) throw new Error(result.error || "বিল সংরক্ষণ করা যায়নি");
        var today = new Date();
        var printDate = document.getElementById("printDate");
        if (printDate) printDate.innerText = today.toLocaleDateString("bn-BD") + " · " + result.sale.invoiceNo;
        window.print();
    } catch (error) { alert(error.message); }
    finally { printBtn.disabled = false; }
});

// ===========================
// Clear Bill
// ===========================

clearBtn.addEventListener("click", function () {

    if (!confirm("আপনি কি সত্যিই পুরো বিল মুছে ফেলতে চান?")) {
        return;
    }

    productTableBody.innerHTML = "";

    totalBill = 0;

    grandTotalDisplay.innerText = "৳০";

    serial = 1;

    products = [];

    localStorage.removeItem("products");

    updateEmptyState();

    productNameInput.focus();

});


// ===========================
// Load Products
// ===========================

function loadProducts() {

    var storedProducts = JSON.parse(localStorage.getItem("products"));

    if (storedProducts) {
        products = storedProducts;
    }

    productTableBody.innerHTML = "";

    totalBill = 0;

    for (var i = 0; i < products.length; i++) {

        var product = products[i];
        var total = product.price * product.quantity;

        totalBill += total;

        var row = '<tr>' +
            '<td>' + (i + 1) + '</td>' +
            '<td>' + product.name + '</td>' +
            '<td>৳' + product.price + '</td>' +
            '<td>' + product.quantity + '</td>' +
            '<td>৳' + total + '</td>' +
            '<td class="no-print">' +
                '<button class="btn btn-outline btn-sm edit-btn" data-id="' + product.id + '">এডিট</button>' +
                '<button class="btn btn-danger btn-sm delete-btn" data-id="' + product.id + '" data-total="' + total + '">মুছুন</button>' +
            '</td>' +
        '</tr>';

        productTableBody.innerHTML += row;

    }

    grandTotalDisplay.innerText = "৳" + totalBill;

    serial = products.length + 1;

    addProductBtn.innerText = "যোগ করুন";

    updateEmptyState();

}

// ===========================
// Initialize
// ===========================

async function initializeBilling() {
    try {
        var me = await fetch("/api/auth/me");
        if (!me.ok) { window.location.href = "./page/login.html"; return; }
        var response = await fetch("/api/products");
        var data = await response.json();
        if (response.ok && data.products) productCatalog = data.products;
    } catch (error) { console.error("Backend connection failed", error); }
    renderCatalog();
    loadProducts();
}

document.querySelectorAll('a[href$="login.html"]').forEach(function (link) {
    link.addEventListener("click", async function (event) {
        event.preventDefault();
        try { await fetch("/api/auth/logout", { method: "POST" }); } catch (_) {}
        window.location.href = link.getAttribute("href");
    });
});

initializeBilling();