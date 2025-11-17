// main.js - navigation helpers & API base
window.API_BASE = "http://localhost:4000";

function goTo(path) {
  window.location.href = path;
}

function getToken() {
  return localStorage.getItem("token");
}

function setToken(t) {
  if (t) localStorage.setItem("token", t);
  else localStorage.removeItem("token");
}

function requireAuth() {
  const user = JSON.parse(localStorage.getItem("currentUser") || "null");
  const token = localStorage.getItem("token");

  if (!user || !token) {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
    window.location.href = "index.html";
    return null;
  }

  return user;
}

// Logout
document.addEventListener("click", (e) => {
  if (e.target?.id === "logoutBtn") {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    window.location.href = "index.html";
  }
});
