// ========================================
// Firebase Login
// ========================================

var loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    var email = document.getElementById("email").value.trim();

    var password = document.getElementById("password").value;

    var button = loginForm.querySelector('button[type="submit"]');

    button.disabled = true;

    try {

        // Firebase Login
        await auth.signInWithEmailAndPassword(
            email,
            password
        );

        // Login successful
        alert("লগইন সফল হয়েছে!");

        window.location.href = "./dashboard.html";

    } catch (error) {

        console.error(error);

        if (error.code === "auth/invalid-credential") {

            alert("ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।");

        } else if (error.code === "auth/user-not-found") {

            alert("এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।");

        } else if (error.code === "auth/wrong-password") {

            alert("পাসওয়ার্ড সঠিক নয়।");

        } else if (error.code === "auth/invalid-email") {

            alert("সঠিক ইমেইল দিন।");

        } else {

            alert("লগইন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
        }

    } finally {

        button.disabled = false;
    }

});