// ========================================
// FORGOT PASSWORD - FIREBASE
// ========================================

var forgotForm =
    document.getElementById("forgotForm");

var emailInput =
    document.getElementById("email");

var resetBtn =
    document.getElementById("resetBtn");

var message =
    document.getElementById("message");


// ========================================
// Form Submit
// ========================================

forgotForm.addEventListener(
    "submit",
    async function (e) {

        e.preventDefault();


        var email =
            emailInput.value.trim();


        if (email === "") {

            alert("ইমেইল দিন।");

            return;

        }


        resetBtn.disabled = true;

        resetBtn.innerText =
            "পাঠানো হচ্ছে...";


        try {


            // ========================================
            // Firebase Password Reset
            // ========================================

            await auth.sendPasswordResetEmail(
                email
            );


            // ========================================
            // Success
            // ========================================

            message.innerText =
                "✓ আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।";

            message.className =
                "college-message show";


            emailInput.value = "";


            resetBtn.innerText =
                "লিংক পাঠানো হয়েছে";


        } catch (error) {


            console.error(
                "Password Reset Error:",
                error
            );


            // ========================================
            // Firebase Error
            // ========================================

            if (
                error.code ===
                "auth/user-not-found"
            ) {

                alert(
                    "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।"
                );

            }

            else if (
                error.code ===
                "auth/invalid-email"
            ) {

                alert(
                    "সঠিক ইমেইল দিন।"
                );

            }

            else {

                alert(
                    "রিসেট লিংক পাঠানো যায়নি।\n\n" +
                    error.message
                );

            }


            resetBtn.disabled = false;

            resetBtn.innerText =
                "রিসেট লিংক পাঠান";

        }

    }
);