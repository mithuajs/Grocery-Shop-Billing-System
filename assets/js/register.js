// ========================================
// Firebase Register
// ========================================

var registerForm = document.getElementById("registerForm");

registerForm.addEventListener("submit", async function (e) {

    e.preventDefault();

    var name = document.getElementById("name").value.trim();

    var email = document.getElementById("email").value.trim();

    var password = document.getElementById("password").value;

    var confirmPassword =
        document.getElementById("confirmPassword").value;

    // ========================================
    // Validation
    // ========================================

    if (
        name === "" ||
        email === "" ||
        password === "" ||
        confirmPassword === ""
    ) {

        alert("সব তথ্য পূরণ করুন।");

        return;
    }


    if (password.length < 6) {

        alert("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।");

        return;
    }


    if (password !== confirmPassword) {

        alert("পাসওয়ার্ড মিলছে না।");

        return;
    }


    try {

        // ========================================
        // Create Firebase Account
        // ========================================

        var userCredential =
            await auth.createUserWithEmailAndPassword(
                email,
                password
            );


        var user = userCredential.user;


        // ========================================
        // Save User Information
        // Firestore
        // ========================================

        await db.collection("users")
            .doc(user.uid)
            .set({

                name: name,

                email: email,

                role: "user",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp()

            });


        // ========================================
        // Success
        // ========================================

        alert("রেজিস্ট্রেশন সফল হয়েছে!");

        window.location.href = "./login.html";


    } catch (error) {

        console.error(error);


        if (error.code === "auth/email-already-in-use") {

            alert("এই ইমেইল দিয়ে ইতিমধ্যে অ্যাকাউন্ট আছে।");

        } else if (error.code === "auth/invalid-email") {

            alert("সঠিক ইমেইল দিন।");

        } else if (error.code === "auth/weak-password") {

            alert("পাসওয়ার্ড আরও শক্তিশালী দিন।");

        } else {

            alert(
                "রেজিস্ট্রেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
            );
        }

    }

});