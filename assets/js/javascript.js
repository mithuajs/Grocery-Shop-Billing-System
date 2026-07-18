
// =============================
// DOM Elements
// =============================

const productName = document.getElementById("productName");
const price = document.getElementById("price");
const quantity = document.getElementById("quantity");

const addProductBtn = document.getElementById("addProductBtn");

const productTableBody = document.getElementById("productTableBody");
const grandTotal = document.getElementById("grandTotal");

const printBtn = document.getElementById("printBtn");
const clearBtn = document.getElementById("clearBtn");

// =============================
// Variables
// =============================

let serial = 1;
let totalBill = 0;
let products = [];

// =============================
// Save Local Storage
// =============================

function saveProducts() {
    localStorage.setItem("products", JSON.stringify(products));
}

// =============================
// Update Serial Number
// =============================

function updateSerialNumbers() {

    const rows = productTableBody.querySelectorAll("tr");

    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });

    serial = rows.length + 1;
}



// =============================
// Add Product
// =============================

addProductBtn.addEventListener("click", function () {

    const name = productName.value.trim();
    const productPrice = Number(price.value);
    const productQuantity = Number(quantity.value);

    if (name === "" || productPrice <= 0 || productQuantity <= 0) {
        alert("Please fill all fields correctly.");
        return;
    }

    // Edit Mode
    if (editProductId !== null) {

        const product = products.find(product => product.id === editProductId);

        if (!product) return;

        product.name = name;
        product.price = productPrice;
        product.quantity = productQuantity;

        saveProducts();

        loadProducts();

        editProductId = null;

        addProductBtn.innerText = "Add Product";

        productName.value = "";
        price.value = "";
        quantity.value = "";

        productName.focus();

        return;
    }

    const total = productPrice * productQuantity;

    totalBill += total;

    grandTotal.innerText = "৳" + totalBill;

    const product = {
        id: Date.now(),
        name: name,
        price: productPrice,
        quantity: productQuantity
    };

    products.push(product);

    saveProducts();

    const row = `
<tr>
    <td>${serial}</td>
    <td>${name}</td>
    <td>৳${productPrice}</td>
    <td>${productQuantity}</td>
    <td>৳${total}</td>
   <td class="space-x-2">

    <button
        class="btn btn-info btn-sm edit-btn"
        data-id="${product.id}">
        Edit
    </button>

    <button
        class="btn btn-error btn-sm delete-btn"
        data-id="${product.id}"
        data-total="${total}">
        Delete
    </button>

</td>
</tr>
`;

    productTableBody.innerHTML += row;

    serial++;

    productName.value = "";
    price.value = "";
    quantity.value = "";

    productName.focus();

});

// =============================
// Delete & Edit Product
// =============================

productTableBody.addEventListener("click", function (event) {

    // Delete
    if (event.target.classList.contains("delete-btn")) {

        const button = event.target;

        const row = button.closest("tr");

        const rowTotal = Number(button.dataset.total);

        totalBill -= rowTotal;

        grandTotal.innerText = "৳" + totalBill;

        const id = Number(button.dataset.id);

        products = products.filter(product => product.id !== id);

        saveProducts();

        row.remove();

        updateSerialNumbers();
    }

    // Edit
    if (event.target.classList.contains("edit-btn")) {

        const id = Number(event.target.dataset.id);

        editProduct(id);
    }

});

function editProduct(id) {

    const product = products.find(product => product.id === id);

    if (!product) return;

    productName.value = product.name;
    price.value = product.price;
    quantity.value = product.quantity;

    editProductId = id;

    addProductBtn.innerText = "Update Product";

    productName.focus();

}
// =============================
// Enter Key Navigation
// =============================

productName.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        price.focus();

    }

});

price.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        quantity.focus();

    }

});

quantity.addEventListener("keydown", function (e) {

    if (e.key === "Enter") {

        e.preventDefault();

        addProductBtn.click();

    }

});

// =============================
// Print Bill
// =============================

printBtn.addEventListener("click", function () {

    window.print();

});

// =============================
// Clear Bill
// =============================

clearBtn.addEventListener("click", function () {

    if (!confirm("Are you sure you want to clear the bill?")) {
        return;
    }

    productTableBody.innerHTML = "";

    totalBill = 0;

    grandTotal.innerText = "৳0";

    serial = 1;

    products = [];

    localStorage.removeItem("products");

    productName.focus();

});


// =============================
// Load Products
// =============================

function loadProducts() {

    const storedProducts = JSON.parse(localStorage.getItem("products"));

    if (!storedProducts) return;

    products = storedProducts;

    productTableBody.innerHTML = "";

    totalBill = 0;

    products.forEach((product, index) => {

        const total = product.price * product.quantity;

        totalBill += total;

        const row = `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>৳${product.price}</td>
            <td>${product.quantity}</td>
            <td>৳${total}</td>

            <td class="space-x-2">

                <button
                    class="btn btn-info btn-sm edit-btn"
                    data-id="${product.id}">
                    Edit
                </button>

                <button
                    class="btn btn-error btn-sm delete-btn"
                    data-id="${product.id}"
                    data-total="${total}">
                    Delete
                </button>

            </td>

        </tr>
        `;

        productTableBody.innerHTML += row;

    });

    grandTotal.innerText = "৳" + totalBill;

    serial = products.length + 1;

}

// =============================
// Load Saved Data
// =============================

loadProducts();