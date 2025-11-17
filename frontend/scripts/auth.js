// =======================
// auth.js — Handles Signup & Login
// =======================

// const API_BASE = "http://localhost:4000";

document.addEventListener("DOMContentLoaded", () => {

  // =======================
  // Show logged-in user name if available
  // =======================
  const navUserEls = document.querySelectorAll("#nav-user");
  const cu = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (navUserEls && cu) {
    navUserEls.forEach(el => (el.textContent = cu.name + " • " + cu.role));
  }

  // =======================
  // SIGNUP
  // =======================
  const signupForm = document.getElementById("signupForm");
  if (signupForm) {
    signupForm.addEventListener("submit", async e => {
      e.preventDefault(); // ✅ stops page from reloading

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;

      try {
        const res = await fetch(API_BASE + "/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Signup failed");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Signup error:", err);
        alert("Network error. Please try again.");
      }
    });
  }

  // =======================
  // LOGIN
  // =======================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault(); // ✅ stops page reload

      const email = document.getElementById("email").value.trim().toLowerCase();
      const password = document.getElementById("password").value;

      try {
        const res = await fetch(API_BASE + "/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.message || "Invalid credentials");
          return;
        }

        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));

        window.location.href = "dashboard.html";
      } catch (err) {
        console.error("Login error:", err);
        alert("Network error. Please try again.");
      }
    });
  }
});
