// =====================================================
// GROCERY SHOP BILLING SYSTEM
// Firebase Billing System
// =====================================================


// =====================================================
// DOM ELEMENTS
// =====================================================

var productNameInput =
    document.getElementById("productName");

var priceInput =
    document.getElementById("price");

var quantityInput =
    document.getElementById("quantity");

var addProductBtn =
    document.getElementById("addProductBtn");

var productTableBody =
    document.getElementById("productTableBody");

var grandTotalDisplay =
    document.getElementById("grandTotal");

var emptyMessage =
    document.getElementById("emptyMessage");

var printBtn =
    document.getElementById("printBtn");

var clearBtn =
    document.getElementById("clearBtn");

var catalogContainer =
    document.getElementById("productCatalog");


// Modal
var quantityModal =
    document.getElementById("quantityModal");

var modalProductName =
    document.getElementById("modalProductName");

var modalQuantity =
    document.getElementById("modalQuantity");

var modalConfirm =
    document.getElementById("modalConfirm");

var modalCancel =
    document.getElementById("modalCancel");


// =====================================================
// VARIABLES
// =====================================================

var products = [];

var productCatalog = [];

var totalBill = 0;

var editProductId = null;

var selectedCatalogProduct = null;


// =====================================================
// LOAD PRODUCTS FROM FIREBASE
// =====================================================

async function loadFirebaseProducts() {

    try {

        productCatalog =
            await getFirebaseProducts();

        renderCatalog();

    } catch (error) {

        console.error(
            "Product load error:",
            error
        );

        alert(
            "Firebase থেকে পণ্য লোড করা যায়নি।"
        );

    }

}


// =====================================================
// RENDER PRODUCT CATALOG
// =====================================================

function renderCatalog() {

    catalogContainer.innerHTML = "";


    for (var i = 0; i < productCatalog.length; i++) {

        var item = productCatalog[i];


        // Stock শেষ হলে card বন্ধ
        var card =
            document.createElement("div");

        card.className = "product-card";

        card.setAttribute(
            "data-id",
            item.id
        );


        var icon =
            item.icon ||
            "./assets/Icon/rice.png";


        card.innerHTML =

            '<div class="product-icon">' +

            '<img src="' +
            icon +
            '" alt="' +
            item.name +
            '">' +

            '</div>' +

            '<div class="product-name">' +
            item.name +
            '</div>' +

            '<div class="product-price">' +
            '৳' +
            item.price +
            '/' +
            item.unit +
            '</div>' +

            '<div class="product-stock">' +
            'স্টক: ' +
            item.stock +
            '</div>';


        // Stock 0 হলে disabled
        if (Number(item.stock) <= 0) {

            card.style.opacity = "0.5";

            card.style.pointerEvents = "none";

            card.title = "স্টক শেষ";

        } else {

            card.addEventListener(
                "click",
                handleCatalogClick
            );

        }


        catalogContainer.appendChild(card);

    }

}


// =====================================================
// CATALOG PRODUCT CLICK
// =====================================================

function handleCatalogClick(event) {

    var card =
        event.currentTarget;


    var id =
        card.getAttribute("data-id");


    selectedCatalogProduct = null;


    for (
        var i = 0;
        i < productCatalog.length;
        i++
    ) {

        if (
            String(productCatalog[i].id) ===
            String(id)
        ) {

            selectedCatalogProduct =
                productCatalog[i];

            break;

        }

    }


    if (!selectedCatalogProduct) {

        return;

    }


    modalProductName.innerText =

        selectedCatalogProduct.name +
        " — পরিমাণ দিন";


    modalQuantity.value = 1;


    modalQuantity.max =
        selectedCatalogProduct.stock;


    quantityModal.classList.add("show");


    modalQuantity.focus();

}


// =====================================================
// MODAL CONFIRM
// =====================================================

modalConfirm.addEventListener(
    "click",
    function () {

        var qty =
            Number(modalQuantity.value);


        if (
            qty <= 0 ||
            !selectedCatalogProduct
        ) {

            alert("সঠিক পরিমাণ দিন!");

            return;

        }


        if (
            qty >
            Number(selectedCatalogProduct.stock)
        ) {

            alert(
                "পর্যাপ্ত stock নেই!"
            );

            return;

        }


        var product = {

            id: Date.now(),

            productId:
                selectedCatalogProduct.id,

            name:
                selectedCatalogProduct.name,

            price:
                Number(selectedCatalogProduct.price),

            quantity:
                qty

        };


        products.push(product);


        saveProducts();

        loadProducts();


        quantityModal.classList.remove(
            "show"
        );


        selectedCatalogProduct = null;

    }
);


// =====================================================
// MODAL CANCEL
// =====================================================

modalCancel.addEventListener(
    "click",
    function () {

        quantityModal.classList.remove(
            "show"
        );

        selectedCatalogProduct = null;

    }
);


// =====================================================
// CLOSE MODAL
// =====================================================

quantityModal.addEventListener(
    "click",
    function (event) {

        if (
            event.target === quantityModal
        ) {

            quantityModal.classList.remove(
                "show"
            );

            selectedCatalogProduct = null;

        }

    }
);


// =====================================================
// MODAL ENTER KEY
// =====================================================

modalQuantity.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            modalConfirm.click();

        }

    }
);


// =====================================================
// LOCAL STORAGE
// =====================================================

function saveProducts() {

    localStorage.setItem(
        "products",
        JSON.stringify(products)
    );

}


// =====================================================
// SERIAL NUMBER
// =====================================================

function updateSerialNumbers() {

    var rows =
        productTableBody.querySelectorAll("tr");


    for (
        var i = 0;
        i < rows.length;
        i++
    ) {

        rows[i].cells[0].innerText =
            i + 1;

    }

}


// =====================================================
// EMPTY STATE
// =====================================================

function updateEmptyState() {

    if (products.length === 0) {

        emptyMessage.style.display =
            "block";

    } else {

        emptyMessage.style.display =
            "none";

    }

}


// =====================================================
// ADD CUSTOM PRODUCT
// =====================================================

addProductBtn.addEventListener(
    "click",
    function () {

        var name =
            productNameInput.value.trim();

        var productPrice =
            Number(priceInput.value);

        var productQuantity =
            Number(quantityInput.value);


        if (
            name === "" ||
            productPrice <= 0 ||
            productQuantity <= 0
        ) {

            alert(
                "সব তথ্য সঠিকভাবে পূরণ করুন।"
            );

            return;

        }


        // ==========================================
        // EDIT
        // ==========================================

        if (editProductId !== null) {

            var product = null;


            for (
                var i = 0;
                i < products.length;
                i++
            ) {

                if (
                    products[i].id ===
                    editProductId
                ) {

                    product =
                        products[i];

                    break;

                }

            }


            if (!product) {

                return;

            }


            product.name =
                name;

            product.price =
                productPrice;

            product.quantity =
                productQuantity;


            editProductId = null;


            saveProducts();

            loadProducts();


            addProductBtn.innerText =
                "যোগ করুন";


            productNameInput.value =
                "";

            priceInput.value =
                "";

            quantityInput.value =
                "";


            productNameInput.focus();


            return;

        }


        // ==========================================
        // NEW CUSTOM PRODUCT
        // ==========================================

        var newProduct = {

            id: Date.now(),

            productId: null,

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

    }
);


// =====================================================
// DELETE & EDIT
// =====================================================

productTableBody.addEventListener(
    "click",
    function (event) {


        // ==========================================
        // DELETE
        // ==========================================

        if (
            event.target.classList.contains(
                "delete-btn"
            )
        ) {

            var button =
                event.target;


            var row =
                button.closest("tr");


            var id =
                Number(
                    button.getAttribute(
                        "data-id"
                    )
                );


            var newProducts = [];


            for (
                var i = 0;
                i < products.length;
                i++
            ) {

                if (
                    products[i].id !== id
                ) {

                    newProducts.push(
                        products[i]
                    );

                }

            }


            products =
                newProducts;


            saveProducts();

            loadProducts();


            return;

        }


        // ==========================================
        // EDIT
        // ==========================================

        if (
            event.target.classList.contains(
                "edit-btn"
            )
        ) {

            var editId =
                Number(
                    event.target.getAttribute(
                        "data-id"
                    )
                );


            editProduct(editId);

        }

    }
);


// =====================================================
// EDIT PRODUCT
// =====================================================

function editProduct(id) {

    var product = null;


    for (
        var i = 0;
        i < products.length;
        i++
    ) {

        if (
            products[i].id === id
        ) {

            product =
                products[i];

            break;

        }

    }


    if (!product) {

        return;

    }


    productNameInput.value =
        product.name;

    priceInput.value =
        product.price;

    quantityInput.value =
        product.quantity;


    editProductId =
        id;


    addProductBtn.innerText =
        "আপডেট করুন";


    productNameInput.focus();

}


// =====================================================
// ENTER KEY NAVIGATION
// =====================================================

productNameInput.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            priceInput.focus();

        }

    }
);


priceInput.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            quantityInput.focus();

        }

    }
);


quantityInput.addEventListener(
    "keydown",
    function (e) {

        if (e.key === "Enter") {

            e.preventDefault();

            addProductBtn.click();

        }

    }
);


// =====================================================
// PRINT BILL
// =====================================================

printBtn.addEventListener(
    "click",
    async function () {


        if (products.length === 0) {

            alert(
                "আগে পণ্য যোগ করুন।"
            );

            return;

        }


        printBtn.disabled = true;


        try {


            // ======================================
            // SAVE SALE TO FIREBASE
            // ======================================

            var result =
                await saveFirebaseSale(
                    products,
                    0,
                    "নগদ"
                );


            // ======================================
            // PRINT DATE + INVOICE
            // ======================================

            var printDate =
                document.getElementById(
                    "printDate"
                );


            if (printDate) {

                var today =
                    new Date();


                printDate.innerText =

                    today.toLocaleDateString(
                        "bn-BD"
                    ) +

                    " · " +

                    result.invoiceNo;

            }


            // ======================================
            // PRINT
            // ======================================

            window.print();


        } catch (error) {

            console.error(
                "Print/Sale Error:",
                error
            );


            alert(
                error.message ||
                "বিল সংরক্ষণ করা যায়নি।"
            );


        } finally {

            printBtn.disabled =
                false;

        }

    }
);


// =====================================================
// CLEAR BILL
// =====================================================

clearBtn.addEventListener(
    "click",
    function () {

        if (
            !confirm(
                "আপনি কি সত্যিই পুরো বিল মুছে ফেলতে চান?"
            )
        ) {

            return;

        }


        products = [];


        saveProducts();

        loadProducts();


        productNameInput.focus();

    }
);


// =====================================================
// LOAD BILL PRODUCTS
// =====================================================

function loadProducts() {

    var storedProducts =
        JSON.parse(
            localStorage.getItem(
                "products"
            )
        );


    if (
        Array.isArray(
            storedProducts
        )
    ) {

        products =
            storedProducts;

    } else {

        products = [];

    }


    productTableBody.innerHTML =
        "";


    totalBill = 0;


    for (
        var i = 0;
        i < products.length;
        i++
    ) {

        var product =
            products[i];


        var total =
            Number(product.price) *
            Number(product.quantity);


        totalBill += total;


        var row =
            document.createElement("tr");


        row.innerHTML =

            "<td>" +
            (i + 1) +
            "</td>" +

            "<td>" +
            product.name +
            "</td>" +

            "<td>৳" +
            product.price +
            "</td>" +

            "<td>" +
            product.quantity +
            "</td>" +

            "<td>৳" +
            total +
            "</td>" +

            '<td class="no-print">' +

            '<button ' +
            'class="btn btn-outline btn-sm edit-btn" ' +
            'data-id="' +
            product.id +
            '">' +
            "এডিট" +
            "</button> " +

            '<button ' +
            'class="btn btn-danger btn-sm delete-btn" ' +
            'data-id="' +
            product.id +
            '">' +
            "মুছুন" +
            "</button>" +

            "</td>";


        productTableBody.appendChild(
            row
        );

    }


    grandTotalDisplay.innerText =
        "৳" + totalBill;


    updateEmptyState();

}


// =====================================================
// AUTH CHECK + INITIALIZE
// =====================================================

function initializeBilling() {

    firebaseAuth.onAuthStateChanged(
        async function (user) {

            if (!user) {

                window.location.href =
                    "./page/login.html";

                return;

            }


            // Firebase থেকে products আনবে
            await loadFirebaseProducts();


            // পুরোনো/local bill load করবে
            loadProducts();

        }
    );

}


// =====================================================
// START
// =====================================================

initializeBilling();