// ===========================
// রেজিস্টার ফর্ম Validation
// Firebase পরে যোগ করা হবে
// ===========================

var registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", function (e) {

    e.preventDefault();

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value.trim();
    var confirmPassword = document.getElementById("confirmPassword").value.trim();

    // Basic validation
    if (name === "" || email === "" || password === "" || confirmPassword === "") {
        alert("সব তথ্য পূরণ করুন।");
        return;
    }

    if (password.length < 6) {
        alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");
        return;
    }

    if (password !== confirmPassword) {
        alert("পাসওয়ার্ড মিলছে না। আবার চেষ্টা করুন।");
        return;
    }

    // TODO: Firebase Authentication যোগ করা হবে

    alert("রেজিস্ট্রেশন সফল হয়েছে! লগইন করুন।");
    window.location.href = "./login.html";

});
