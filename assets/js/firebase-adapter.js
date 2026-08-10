// ==========================================
// FIREBASE ADAPTER
// Grocery Shop Billing System
// ==========================================

(function () {

    // Firebase check
    if (typeof firebase === "undefined") {
        console.error("Firebase SDK load হয়নি!");
        return;
    }


    // Firebase
    var auth = firebase.auth();
    var db = firebase.firestore();


    // Global access
    window.firebaseAuth = auth;
    window.firebaseDB = db;


    // ==========================================
    // GET CURRENT USER
    // ==========================================

    window.getCurrentUser = function () {

        return auth.currentUser;

    };


    // ==========================================
    // GET PRODUCTS FROM FIRESTORE
    // ==========================================

    window.getFirebaseProducts = async function () {

        var snapshot = await db
            .collection("products")
            .get();

        var products = [];


        snapshot.forEach(function (doc) {

            var data = doc.data();

            products.push({

                id: doc.id,

                name: data.name || "",

                price: Number(data.price) || 0,

                unit: data.unit || "পিস",

                stock: Number(data.stock) || 0,

                lowStockAt:
                    Number(data.lowStockAt) || 10,

                icon:
                    data.icon ||
                    "./assets/Icon/rice.png"

            });

        });


        return products;

    };


    // ==========================================
    // SAVE SALE TO FIRESTORE
    // ==========================================

    window.saveFirebaseSale = async function (
        items,
        discount,
        paymentMethod
    ) {


        // Login check
        if (!auth.currentUser) {

            throw new Error(
                "লগইন করা নেই।"
            );

        }


        // ======================================
        // CALCULATE TOTAL
        // ======================================

        var total = 0;


        items.forEach(function (item) {

            total +=
                Number(item.price) *
                Number(item.quantity);

        });


        discount =
            Number(discount) || 0;


        total =
            total - discount;


        if (total < 0) {

            total = 0;

        }


        // ======================================
        // INVOICE NUMBER
        // ======================================

        var invoiceNo =
            "INV-" + Date.now();


        // ======================================
        // SALE DATA
        // ======================================

        var saleData = {

            invoiceNo: invoiceNo,

            items: items,

            discount: discount,

            paymentMethod:
                paymentMethod || "নগদ",

            total: total,

            userId:
                auth.currentUser.uid,

            createdAt:
                firebase.firestore.FieldValue
                    .serverTimestamp()

        };


        // ======================================
        // SAVE SALE
        // ======================================

        var saleRef =
            await db
                .collection("sales")
                .add(saleData);


        // ======================================
        // UPDATE STOCK
        // ======================================

        var batch =
            db.batch();


        for (
            var i = 0;
            i < items.length;
            i++
        ) {

            var item =
                items[i];


            // Firebase catalog product
            if (item.productId) {

                var productRef =
                    db
                        .collection("products")
                        .doc(
                            String(item.productId)
                        );


                var productSnap =
                    await productRef.get();


                if (productSnap.exists) {

                    var productData =
                        productSnap.data();


                    var oldStock =
                        Number(
                            productData.stock
                        ) || 0;


                    var quantity =
                        Number(
                            item.quantity
                        ) || 0;


                    var newStock =
                        oldStock - quantity;


                    if (newStock < 0) {

                        newStock = 0;

                    }


                    batch.update(
                        productRef,
                        {
                            stock: newStock
                        }
                    );

                }

            }

        }


        // Commit stock update
        await batch.commit();


        // ======================================
        // RETURN RESULT
        // ======================================

        return {

            id: saleRef.id,

            invoiceNo: invoiceNo,

            total: total

        };

    };


})();