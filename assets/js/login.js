// ===========================
// লগইন ফর্ম Validation
// Firebase পরে যোগ করা হবে
// ===========================

var loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();

    // Basic validation
    if (email === "" || password === "") {
        alert("ইমেইল এবং পাসওয়ার্ড দিন।");
        return;
    }

    // TODO: Firebase Authentication যোগ করা হবে

    // এখনকার জন্য সরাসরি dashboard এ নিয়ে যাবে
    alert("লগইন সফল হয়েছে!");
    window.location.href = "./dashboard.html";

});
