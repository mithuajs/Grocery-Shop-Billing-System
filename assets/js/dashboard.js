// ========================================
// DASHBOARD - FIREBASE FIRESTORE
// ========================================

(function () {

    const $ = s => document.querySelector(s);

    const money = n =>
        '৳' +
        new Intl.NumberFormat('bn-BD')
            .format(Number(n) || 0);

    const bn = n =>
        new Intl.NumberFormat('bn-BD')
            .format(Number(n) || 0);


    // ========================================
    // Firebase Login Check
    // ========================================

    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href =
                "./login.html";

            return;

        }

        loadDashboard(user);

    });


    // ========================================
    // Load Dashboard
    // ========================================

    async function loadDashboard(user) {

        try {

            // ========================================
            // Load Products
            // ========================================

            const productSnapshot =
                await db
                    .collection("products")
                    .get();


            let products = [];


            productSnapshot.forEach(
                function (doc) {

                    products.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            // ========================================
            // Total Products
            // ========================================

            $('#totalProducts').textContent =
                bn(products.length);


            // ========================================
            // Low Stock Products
            // ========================================

            const lowStock =
                products.filter(
                    function (product) {

                        return Number(product.stock) <=
                            Number(product.lowStockAt);

                    }
                );


            $('#lowStockCount').textContent =
                bn(lowStock.length);


            // ========================================
            // Low Stock List
            // ========================================

            $('#lowStockList').innerHTML =

                lowStock.length

                    ?

                    lowStock
                        .slice(0, 5)
                        .map(
                            function (product) {

                                return `

                                <div>

                                    <span>
                                        ${product.name}
                                    </span>

                                    <strong>
                                        ${bn(product.stock)}
                                        ${product.unit}
                                    </strong>

                                </div>

                                `;

                            }
                        )
                        .join('')

                    :

                    'সব পণ্যের stock পর্যাপ্ত।';


            // ========================================
            // Load Sales
            // ========================================

            const salesSnapshot =
                await db
                    .collection("sales")
                    .orderBy(
                        "createdAt",
                        "desc"
                    )
                    .get();


            let sales = [];


            salesSnapshot.forEach(
                function (doc) {

                    sales.push({

                        id: doc.id,

                        ...doc.data()

                    });

                }
            );


            // ========================================
            // Today's Date
            // ========================================

            const today =
                new Date();


            const todayYear =
                today.getFullYear();

            const todayMonth =
                today.getMonth();

            const todayDate =
                today.getDate();


            // ========================================
            // Today's Sales
            // ========================================

            let todayBills = 0;

            let todayRevenue = 0;


            sales.forEach(
                function (sale) {

                    if (
                        !sale.createdAt ||
                        !sale.createdAt.toDate
                    ) {

                        return;

                    }


                    const saleDate =
                        sale.createdAt.toDate();


                    if (

                        saleDate.getFullYear()
                        === todayYear

                        &&

                        saleDate.getMonth()
                        === todayMonth

                        &&

                        saleDate.getDate()
                        === todayDate

                    ) {

                        todayBills++;

                        todayRevenue +=
                            Number(
                                sale.total || 0
                            );

                    }

                }
            );


            // ========================================
            // Dashboard Stats
            // ========================================

            $('#todayBills').textContent =
                bn(todayBills);


            $('#todaySales').textContent =
                money(todayRevenue);


            // ========================================
            // Recent 5 Sales
            // ========================================

            const recentSales =
                sales.slice(0, 5);


            $('#recentSales').innerHTML =

                recentSales.length

                    ?

                    recentSales
                        .map(
                            function (sale) {

                                const itemCount =
                                    (sale.items || [])
                                        .reduce(
                                            function (
                                                total,
                                                item
                                            ) {

                                                return total +
                                                    Number(
                                                        item.quantity || 0
                                                    );

                                            },
                                            0
                                        );


                                let time = '-';


                                if (
                                    sale.createdAt &&
                                    sale.createdAt.toDate
                                ) {

                                    time =
                                        sale.createdAt
                                            .toDate()
                                            .toLocaleTimeString(
                                                'bn-BD',
                                                {
                                                    hour:
                                                        'numeric',

                                                    minute:
                                                        '2-digit'
                                                }
                                            );

                                }


                                return `

                                <tr>

                                    <td>
                                        <strong>
                                            ${sale.invoiceNo || '-'}
                                        </strong>
                                    </td>

                                    <td>
                                        ${time}
                                    </td>

                                    <td>
                                        ${bn(itemCount)}
                                    </td>

                                    <td>
                                        ${sale.paymentMethod
                                    || 'নগদ'
                                    }
                                    </td>

                                    <td>
                                        <strong>
                                            ${money(
                                        sale.total || 0
                                    )}
                                        </strong>
                                    </td>

                                </tr>

                                `;

                            }
                        )
                        .join('')

                    :

                    `

                    <tr>

                        <td colspan="5">
                            এখনো কোনো bill সম্পন্ন হয়নি।
                        </td>

                    </tr>

                    `;


            // ========================================
            // Welcome Message
            // ========================================

            const title =
                document.querySelector(
                    ".dashboard-header h1"
                );


            if (title) {

                title.innerText =
                    "স্বাগতম, " +
                    (
                        user.displayName ||
                        user.email
                    ) +
                    "!";

            }


        } catch (error) {

            console.error(
                "Dashboard Firebase Error:",
                error
            );

            alert(
                "Dashboard-এর তথ্য লোড করা যায়নি।"
            );

        }

    }


    // ========================================
    // Logout
    // ========================================

    document
        .querySelectorAll(
            'a[href$="login.html"]'
        )
        .forEach(
            function (link) {

                link.onclick =
                    async function (e) {

                        e.preventDefault();


                        try {

                            await auth.signOut();


                            window.location.href =
                                "./login.html";


                        } catch (error) {

                            console.error(
                                "Logout error:",
                                error
                            );

                        }

                    };

            }
        );


})();