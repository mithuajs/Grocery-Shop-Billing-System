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