// ========================================
// Products System - Firebase Firestore
// ========================================

(function () {

    const $ = s => document.querySelector(s);

    const money = n =>
        '৳' + new Intl.NumberFormat('bn-BD')
            .format(Number(n) || 0);

    const bn = n =>
        new Intl.NumberFormat('bn-BD')
            .format(Number(n) || 0);


    let products = [];


    // ========================================
    // Check Login
    // ========================================

    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href = "./login.html";

            return;
        }

        loadProducts();

    });


    // ========================================
    // Message
    // ========================================

    function message(text, error) {

        const m = $('#message');

        m.textContent =
            (error ? '! ' : '✓ ') + text;

        m.className =
            'college-message show' +
            (error ? ' error' : '');

        setTimeout(function () {

            m.className =
                'college-message';

        }, 2200);

    }


    // ========================================
    // Reset Form
    // ========================================

    function resetForm() {

        $('#productForm').reset();

        $('#editId').value = '';

        $('#lowStockAt').value = 10;

        $('#formTitle').textContent =
            'নতুন পণ্য যোগ করুন';

        $('#saveBtn').textContent =
            'সংরক্ষণ';

        $('#cancelEdit').classList.add('hidden');

    }


    // ========================================
    // Render Products
    // ========================================

    function render() {

        const q =
            $('#search').value
                .trim()
                .toLowerCase();


        const list =
            products.filter(function (p) {

                return p.name
                    .toLowerCase()
                    .includes(q);

            });


        $('#productCount').textContent =
            bn(products.length);


        $('#productRows').innerHTML =
            list.length

                ?

                list.map(function (p, i) {

                    return `
                    <tr>

                        <td>${bn(i + 1)}</td>

                        <td>
                            <strong>${p.name}</strong>
                        </td>

                        <td>
                            ${money(p.price)}
                        </td>

                        <td>
                            ${p.unit}
                        </td>

                        <td>
                            ${bn(p.stock)}
                        </td>

                        <td>

                            <span class="stock-status ${p.stock <= p.lowStockAt
                            ? 'low'
                            : ''
                        }">

                                ${p.stock <= p.lowStockAt
                            ? 'কম স্টক'
                            : 'পর্যাপ্ত'
                        }

                            </span>

                        </td>

                        <td>

                            <button
                                class="btn btn-outline btn-sm"
                                data-edit="${p.id}">

                                এডিট

                            </button>

                            <button
                                class="btn btn-danger btn-sm"
                                data-delete="${p.id}">

                                মুছুন

                            </button>

                        </td>

                    </tr>
                    `;

                }).join('')

                :

                'পণ্য পাওয়া যায়নি।';


        // Edit buttons

        document.querySelectorAll('[data-edit]')
            .forEach(function (button) {

                button.onclick = function () {

                    edit(
                        button.dataset.edit
                    );

                };

            });


        // Delete buttons

        document.querySelectorAll('[data-delete]')
            .forEach(function (button) {

                button.onclick = function () {

                    remove(
                        button.dataset.delete
                    );

                };

            });

    }


    // ========================================
    // Load Products
    // ========================================

    async function loadProducts() {

        try {

            const snapshot =
                await db.collection("products")
                    .orderBy("name")
                    .get();


            products = [];


            snapshot.forEach(function (doc) {

                products.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            render();


        } catch (error) {

            console.error(error);

            message(
                "পণ্য লোড করা যায়নি।",
                true
            );

        }

    }


    // ========================================
    // Edit Product
    // ========================================

    function edit(id) {

        const p =
            products.find(function (x) {

                return x.id === id;

            });


        if (!p) return;


        $('#editId').value = p.id;

        $('#name').value = p.name;

        $('#price').value = p.price;

        $('#unit').value = p.unit;

        $('#stock').value = p.stock;

        $('#lowStockAt').value =
            p.lowStockAt;


        $('#formTitle').textContent =
            'পণ্য আপডেট করুন';

        $('#saveBtn').textContent =
            'আপডেট';

        $('#cancelEdit')
            .classList
            .remove('hidden');


        window.scrollTo({

            top: 0,

            behavior: 'smooth'

        });

    }


    // ========================================
    // Delete Product
    // ========================================

    async function remove(id) {

        if (!confirm(
            'পণ্যটি মুছে ফেলবেন?'
        )) {

            return;

        }


        try {

            await db
                .collection("products")
                .doc(id)
                .delete();


            message(
                'পণ্য মুছে ফেলা হয়েছে'
            );


            await loadProducts();


        } catch (error) {

            console.error(error);

            message(
                'পণ্য মুছতে সমস্যা হয়েছে।',
                true
            );

        }

    }


    // ========================================
    // Add / Update Product
    // ========================================

    $('#productForm').onsubmit =
        async function (e) {

            e.preventDefault();


            const id =
                $('#editId').value;


            const body = {

                name:
                    $('#name')
                        .value
                        .trim(),

                price:
                    Number(
                        $('#price').value
                    ),

                unit:
                    $('#unit').value,

                stock:
                    Number(
                        $('#stock').value
                    ),

                lowStockAt:
                    Number(
                        $('#lowStockAt').value
                    )

            };


            // ========================================
            // Validation
            // ========================================

            if (
                body.name === '' ||
                body.price <= 0 ||
                body.stock < 0 ||
                body.lowStockAt < 0
            ) {

                message(
                    'সব তথ্য সঠিকভাবে দিন।',
                    true
                );

                return;

            }


            try {


                // ========================================
                // Update
                // ========================================

                if (id) {

                    await db
                        .collection("products")
                        .doc(id)
                        .update({

                            name: body.name,

                            price: body.price,

                            unit: body.unit,

                            stock: body.stock,

                            lowStockAt:
                                body.lowStockAt,

                            updatedAt:
                                firebase.firestore.FieldValue
                                    .serverTimestamp()

                        });


                    message(
                        'পণ্য আপডেট হয়েছে'
                    );

                }


                // ========================================
                // Add New Product
                // ========================================

                else {

                    await db
                        .collection("products")
                        .add({

                            name: body.name,

                            price: body.price,

                            unit: body.unit,

                            stock: body.stock,

                            lowStockAt:
                                body.lowStockAt,

                            createdAt:
                                firebase.firestore.FieldValue
                                    .serverTimestamp()

                        });


                    message(
                        'নতুন পণ্য যোগ হয়েছে'
                    );

                }


                resetForm();

                await loadProducts();


            } catch (error) {

                console.error(error);

                message(
                    'কাজটি সম্পন্ন করা যায়নি।',
                    true
                );

            }

        };


    // ========================================
    // Cancel Edit
    // ========================================

    $('#cancelEdit').onclick =
        resetForm;


    // ========================================
    // Search
    // ========================================

    $('#search').oninput =
        render;


    // ========================================
    // Logout
    // ========================================

    document
        .querySelectorAll(
            'a[href$="login.html"]'
        )
        .forEach(function (a) {

            a.onclick =
                async function (e) {

                    e.preventDefault();

                    try {

                        await auth.signOut();

                        window.location.href =
                            './login.html';

                    } catch (error) {

                        console.error(error);

                    }

                };

        });


})();