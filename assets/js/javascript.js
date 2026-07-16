
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
        <td>
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
// Delete Product
// =============================

productTableBody.addEventListener("click", function (event) {

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

});

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
            <td>
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