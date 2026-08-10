// ========================================
// SALES HISTORY - FIREBASE FIRESTORE
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

    let sales = [];


    // ========================================
    // Login Check
    // ========================================

    auth.onAuthStateChanged(function (user) {

        if (!user) {

            window.location.href =
                "./login.html";

            return;
        }

        loadSales();

    });


    // ========================================
    // Load Sales
    // ========================================

    async function loadSales() {

        try {

            const snapshot =
                await db
                    .collection("sales")
                    .orderBy("createdAt", "desc")
                    .get();


            sales = [];


            snapshot.forEach(function (doc) {

                sales.push({

                    id: doc.id,

                    ...doc.data()

                });

            });


            renderSales();


        } catch (error) {

            console.error(
                "Sales loading error:",
                error
            );

            alert(
                "বিক্রয়ের তথ্য লোড করা যায়নি।"
            );

        }

    }


    // ========================================
    // Render Sales
    // ========================================

    function renderSales() {

        $('#salesCount').textContent =
            bn(sales.length);


        const totalSales =
            sales.reduce(
                function (sum, sale) {

                    return sum +
                        Number(sale.total || 0);

                },
                0
            );


        $('#salesTotal').textContent =
            money(totalSales);


        $('#emptySales').style.display =
            sales.length
                ? 'none'
                : 'block';


        $('#salesRows').innerHTML =
            sales.length

                ?

                sales.map(function (sale) {

                    // Firebase Timestamp
                    let date;


                    if (
                        sale.createdAt &&
                        sale.createdAt.toDate
                    ) {

                        date =
                            sale.createdAt.toDate();

                    } else {

                        date =
                            new Date();

                    }


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


                    return `

                    <tr>

                        <td>
                            <strong>
                                ${sale.invoiceNo || '-'}
                            </strong>
                        </td>

                        <td>
                            ${date.toLocaleDateString(
                        'bn-BD'
                    )}
                        </td>

                        <td>
                            ${date.toLocaleTimeString(
                        'bn-BD',
                        {
                            hour: 'numeric',
                            minute: '2-digit'
                        }
                    )}
                        </td>

                        <td>
                            ${bn(itemCount)}
                        </td>

                        <td>
                            ${sale.paymentMethod || 'নগদ'}
                        </td>

                        <td>
                            ${money(
                        sale.discount || 0
                    )}
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

                }).join('')

                :

                '';

    }


    // ========================================
    // Export CSV
    // ========================================

    $('#exportCsv').onclick =
        function () {

            if (!sales.length) {

                alert(
                    'এখনো কোনো বিক্রয় নেই।'
                );

                return;

            }


            const rows = [

                [
                    'Invoice',
                    'Date',
                    'Items',
                    'Payment',
                    'Discount',
                    'Total'
                ]

            ];


            sales.forEach(
                function (sale) {

                    let date;


                    if (
                        sale.createdAt &&
                        sale.createdAt.toDate
                    ) {

                        date =
                            sale.createdAt.toDate();

                    } else {

                        date =
                            new Date();

                    }


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


                    rows.push([

                        sale.invoiceNo || '',

                        date.toLocaleString(
                            'bn-BD'
                        ),

                        itemCount,

                        sale.paymentMethod ||
                        'নগদ',

                        sale.discount || 0,

                        sale.total || 0

                    ]);

                }
            );


            const csv =
                '\ufeff' +

                rows
                    .map(
                        function (row) {

                            return row
                                .map(
                                    function (value) {

                                        return '"' +
                                            String(value)
                                                .replaceAll(
                                                    '"',
                                                    '""'
                                                ) +
                                            '"';

                                    }
                                )
                                .join(',');

                        }
                    )
                    .join('\n');


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            'text/csv;charset=utf-8'
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const a =
                document.createElement('a');


            a.href = url;

            a.download =
                'sales-report.csv';


            a.click();


            URL.revokeObjectURL(url);

        };


    // ========================================
    // Logout
    // ========================================

    document
        .querySelectorAll(
            'a[href$="login.html"]'
        )
        .forEach(
            function (a) {

                a.onclick =
                    async function (e) {

                        e.preventDefault();


                        try {

                            await auth.signOut();

                            window.location.href =
                                './login.html';

                        } catch (error) {

                            console.error(
                                error
                            );

                        }

                    };

            }
        );

})();