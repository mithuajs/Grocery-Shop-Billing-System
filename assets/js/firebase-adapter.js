(function () {
    "use strict";

    var firebaseConfig = {
        apiKey: "AIzaSyC45lErBqukWkSPcO4EMuLqG5PK3pcHX3g",
        authDomain: "grocery-shop-billing-system.firebaseapp.com",
        projectId: "grocery-shop-billing-system",
        storageBucket: "grocery-shop-billing-system.firebasestorage.app",
        messagingSenderId: "266121251405",
        appId: "1:266121251405:web:ab77cb5facf42e0cb8aa04"
    };

    var ADMIN_USERNAME = "Admin";
    var ADMIN_EMAIL = "admin@grocery-shop-billing-system.firebaseapp.com";
    var SDK_BASE = "https://www.gstatic.com/firebasejs/12.16.0/";
    var nativeFetch = window.fetch.bind(window);
    var firebase;

    var seedProducts = [
        { id: 1, name: "চাল", price: 70, unit: "কেজি", stock: 80, lowStockAt: 15, icon: "./assets/Icon/rice.png" },
        { id: 2, name: "ডাল", price: 120, unit: "কেজি", stock: 40, lowStockAt: 10, icon: "./assets/Icon/coffee-beans.png" },
        { id: 3, name: "সয়াবিন তেল", price: 180, unit: "লিটার", stock: 25, lowStockAt: 8, icon: "./assets/Icon/oil.png" },
        { id: 4, name: "চিনি", price: 100, unit: "কেজি", stock: 35, lowStockAt: 10, icon: "./assets/Icon/sugar.png" },
        { id: 5, name: "লবণ", price: 40, unit: "কেজি", stock: 8, lowStockAt: 10, icon: "./assets/Icon/salt.png" },
        { id: 6, name: "আটা", price: 55, unit: "কেজি", stock: 45, lowStockAt: 12, icon: "./assets/Icon/flour.png" },
        { id: 7, name: "দুধ", price: 90, unit: "লিটার", stock: 14, lowStockAt: 10, icon: "./assets/Icon/milk.png" },
        { id: 8, name: "ডিম", price: 12, unit: "পিস", stock: 90, lowStockAt: 24, icon: "./assets/Icon/eggs.png" },
        { id: 9, name: "সাবান", price: 35, unit: "পিস", stock: 30, lowStockAt: 8, icon: "./assets/Icon/soap.png" }
    ];

    var ready = Promise.all([
        import(SDK_BASE + "firebase-app.js"),
        import(SDK_BASE + "firebase-auth.js"),
        import(SDK_BASE + "firebase-firestore.js")
    ]).then(async function (modules) {
        var appModule = modules[0];
        var authModule = modules[1];
        var storeModule = modules[2];
        var app = appModule.initializeApp(firebaseConfig);
        var auth = authModule.getAuth(app);
        await authModule.setPersistence(auth, authModule.browserLocalPersistence);
        await new Promise(function (resolve) {
            var unsubscribe = authModule.onAuthStateChanged(auth, function () {
                unsubscribe();
                resolve();
            });
        });
        firebase = { app: app, auth: auth, db: storeModule.getFirestore(app), authModule: authModule, storeModule: storeModule };
        return firebase;
    });

    window.firebaseReady = ready;
    window.groceryFirebase = { config: firebaseConfig, adminUsername: ADMIN_USERNAME, adminEmail: ADMIN_EMAIL };

    function response(data, status) {
        return new Response(JSON.stringify(data), {
            status: status || 200,
            headers: { "Content-Type": "application/json; charset=utf-8" }
        });
    }

    function requestBody(input, options) {
        if (options && typeof options.body === "string") return JSON.parse(options.body || "{}");
        if (input instanceof Request) return input.clone().json();
        return Promise.resolve({});
    }

    function firebaseError(error) {
        console.error("Firebase request failed", error);
        var code = String(error && error.code || "");
        if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
            return response({ error: "Invalid username or password" }, 401);
        }
        if (code.includes("too-many-requests")) return response({ error: "Too many login attempts. একটু পরে চেষ্টা করুন।" }, 429);
        if (code.includes("permission-denied")) return response({ error: "Firestore permission denied. Firebase Rules publish করুন।" }, 403);
        if (code.includes("network-request-failed")) return response({ error: "Firebase network connection পাওয়া যায়নি।" }, 503);
        return response({ error: error && error.message ? error.message : "Firebase request failed" }, 500);
    }

    function dateKey(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, "0");
        var d = String(date.getDate()).padStart(2, "0");
        return y + "-" + m + "-" + d;
    }

    async function requireAdmin() {
        await ready;
        var user = firebase.auth.currentUser;
        if (!user || String(user.email || "").toLowerCase() !== ADMIN_EMAIL.toLowerCase()) return null;
        return user;
    }

    async function allProducts(seedIfEmpty) {
        var f = firebase.storeModule;
        var snapshot = await f.getDocs(f.collection(firebase.db, "products"));
        if (snapshot.empty && seedIfEmpty) {
            var batch = f.writeBatch(firebase.db);
            seedProducts.forEach(function (product) {
                batch.set(f.doc(firebase.db, "products", "product-" + product.id), product);
            });
            await batch.commit();
            return seedProducts.slice();
        }
        return snapshot.docs.map(function (item) { return item.data(); }).sort(function (a, b) { return Number(a.id) - Number(b.id); });
    }

    async function allSales() {
        var f = firebase.storeModule;
        var snapshot = await f.getDocs(f.collection(firebase.db, "sales"));
        return snapshot.docs.map(function (item) { return item.data(); }).sort(function (a, b) {
            return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
        });
    }

    async function handleApi(url, input, options) {
        await ready;
        var method = String((options && options.method) || (input instanceof Request && input.method) || "GET").toUpperCase();
        var path = url.pathname;
        var f = firebase.storeModule;

        if (path === "/api/health" && method === "GET") return response({ ok: true, service: "firebase" });

        if (path === "/api/auth/login" && method === "POST") {
            var login = await requestBody(input, options);
            var username = String(login.username || "").trim();
            if (username.toLowerCase() !== ADMIN_USERNAME.toLowerCase() && username.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
                return response({ error: "Invalid username or password" }, 401);
            }
            await firebase.authModule.signInWithEmailAndPassword(firebase.auth, ADMIN_EMAIL, String(login.password || ""));
            var loggedIn = firebase.auth.currentUser;
            return response({ user: { id: loggedIn.uid, username: ADMIN_USERNAME, role: "ADMIN" } });
        }

        if (path === "/api/auth/logout" && method === "POST") {
            await firebase.authModule.signOut(firebase.auth);
            return response({ ok: true });
        }

        if (path === "/api/auth/me" && method === "GET") {
            var current = await requireAdmin();
            return current ? response({ user: { id: current.uid, username: ADMIN_USERNAME, role: "ADMIN" } }) : response({ error: "Authentication required" }, 401);
        }

        var user = await requireAdmin();
        if (!user) return response({ error: "Authentication required" }, 401);

        if (path === "/api/products" && method === "GET") {
            var products = await allProducts(true);
            var search = String(url.searchParams.get("q") || "").toLowerCase();
            var filtered = products.filter(function (product) { return String(product.name || "").toLowerCase().includes(search); });
            return response({ count: filtered.length, products: filtered });
        }

        if (path === "/api/products" && method === "POST") {
            var create = await requestBody(input, options);
            if (!create.name || !(Number(create.price) > 0) || !(Number(create.stock) >= 0)) return response({ error: "name, positive price and stock are required" }, 422);
            var id = Date.now();
            var product = { id: id, name: String(create.name).trim(), price: Number(create.price), unit: String(create.unit || "পিস"), stock: Number(create.stock), lowStockAt: Number(create.lowStockAt || 10), icon: create.icon || null };
            await f.setDoc(f.doc(firebase.db, "products", "product-" + id), product);
            return response({ product: product }, 201);
        }

        var productMatch = path.match(/^\/api\/products\/(\d+)$/);
        if (productMatch && (method === "PATCH" || method === "DELETE")) {
            var productId = Number(productMatch[1]);
            var productRef = f.doc(firebase.db, "products", "product-" + productId);
            var existing = await f.getDoc(productRef);
            if (!existing.exists()) return response({ error: "Product not found" }, 404);
            if (method === "DELETE") {
                await f.deleteDoc(productRef);
                return response({ product: existing.data() });
            }
            var patch = await requestBody(input, options);
            var changes = {};
            ["name", "unit", "icon"].forEach(function (key) { if (patch[key] !== undefined) changes[key] = String(patch[key]); });
            for (var i = 0; i < ["price", "stock", "lowStockAt"].length; i++) {
                var key = ["price", "stock", "lowStockAt"][i];
                if (patch[key] !== undefined) {
                    var value = Number(patch[key]);
                    if (!Number.isFinite(value) || value < 0) return response({ error: "Invalid " + key }, 422);
                    changes[key] = value;
                }
            }
            await f.updateDoc(productRef, changes);
            return response({ product: Object.assign({}, existing.data(), changes) });
        }

        if (path === "/api/sales" && method === "GET") {
            var sales = await allSales();
            var from = url.searchParams.get("from");
            var to = url.searchParams.get("to");
            if (from) sales = sales.filter(function (sale) { return sale.date >= from; });
            if (to) sales = sales.filter(function (sale) { return sale.date <= to; });
            return response({ count: sales.length, sales: sales });
        }

        if (path === "/api/sales" && method === "POST") {
            var checkout = await requestBody(input, options);
            if (!Array.isArray(checkout.items) || !checkout.items.length) return response({ error: "At least one item is required" }, 422);
            var catalog = await allProducts(false);
            var catalogById = new Map(catalog.map(function (product) { return [Number(product.id), product]; }));
            var catalogByName = new Map(catalog.map(function (product) { return [String(product.name), product]; }));
            var lines = [];
            var required = new Map();
            for (var lineIndex = 0; lineIndex < checkout.items.length; lineIndex++) {
                var raw = checkout.items[lineIndex];
                var quantity = Number(raw.quantity);
                if (!(quantity > 0)) return response({ error: "Invalid quantity" }, 422);
                var found = raw.productId ? catalogById.get(Number(raw.productId)) : catalogByName.get(String(raw.name));
                var price = found ? Number(found.price) : Number(raw.price);
                if (!(price > 0)) return response({ error: "Invalid price" }, 422);
                lines.push({ productId: found ? Number(found.id) : null, name: found ? found.name : String(raw.name), unitPrice: price, quantity: quantity, lineTotal: price * quantity });
                if (found) required.set(Number(found.id), (required.get(Number(found.id)) || 0) + quantity);
            }
            var now = new Date();
            var saleRef = f.doc(f.collection(firebase.db, "sales"));
            var sale = await f.runTransaction(firebase.db, async function (transaction) {
                var currentProducts = new Map();
                for (var entry of required.entries()) {
                    var ref = f.doc(firebase.db, "products", "product-" + entry[0]);
                    var snapshot = await transaction.get(ref);
                    if (!snapshot.exists()) throw new Error("Product not found");
                    currentProducts.set(entry[0], { ref: ref, product: snapshot.data(), quantity: entry[1] });
                }
                currentProducts.forEach(function (entry) {
                    if (Number(entry.product.stock) < entry.quantity) throw new Error("Insufficient stock: " + entry.product.name);
                });
                var subtotal = lines.reduce(function (sum, line) { return sum + line.lineTotal; }, 0);
                var discount = Math.min(Math.max(Number(checkout.discount) || 0, 0), subtotal);
                var saleData = { id: saleRef.id, invoiceNo: "INV-" + String(Date.now()).slice(-8), date: dateKey(now), createdAt: now.toISOString(), subtotal: subtotal, discount: discount, total: subtotal - discount, paymentMethod: checkout.paymentMethod === "মোবাইল" ? "মোবাইল" : "নগদ", cashierId: user.uid, items: lines };
                currentProducts.forEach(function (entry) { transaction.update(entry.ref, { stock: Number(entry.product.stock) - entry.quantity }); });
                transaction.set(saleRef, saleData);
                return saleData;
            });
            return response({ sale: sale }, 201);
        }

        if (path === "/api/dashboard/summary" && method === "GET") {
            var dashboardProducts = await allProducts(true);
            var dashboardSales = await allSales();
            var today = dateKey(new Date());
            var todaySales = dashboardSales.filter(function (sale) { return sale.date === today; });
            var lowStock = dashboardProducts.filter(function (product) { return Number(product.stock) <= Number(product.lowStockAt); });
            return response({
                todayRevenue: todaySales.reduce(function (sum, sale) { return sum + Number(sale.total || 0); }, 0),
                todayBills: todaySales.length,
                totalProducts: dashboardProducts.length,
                totalStockUnits: dashboardProducts.reduce(function (sum, product) { return sum + Number(product.stock || 0); }, 0),
                lowStockCount: lowStock.length,
                lowStock: lowStock,
                recentSales: dashboardSales.slice(0, 5)
            });
        }

        return response({ error: "API route not found" }, 404);
    }

    window.fetch = function (input, options) {
        var rawUrl = input instanceof Request ? input.url : String(input);
        var url = new URL(rawUrl, window.location.href);
        if (url.origin !== window.location.origin || !url.pathname.startsWith("/api/")) return nativeFetch(input, options);
        return handleApi(url, input, options).catch(firebaseError);
    };
})();
