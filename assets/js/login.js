var loginForm = document.getElementById("loginForm");
loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var username = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var button = loginForm.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
var response = await fetch("/api/auth/login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({username:username,password:password}) });
        var result = await response.json();
        if (!response.ok) throw new Error(result.error || "লগইন ব্যর্থ হয়েছে");
        window.location.href = "./dashboard.html";
    } catch (error) { alert(error.message === "Invalid username or password" ? "ইউজারনেম অথবা পাসওয়ার্ড সঠিক নয়।" : error.message); }
    finally { button.disabled = false; }
});

