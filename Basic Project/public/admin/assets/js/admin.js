document.getElementById("adminLoginForm").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const username = document.getElementById("adminUsername").value;
    const password = document.getElementById("adminPassword").value;

    const response = await fetch("http://localhost:3000/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("adminToken", data.token);
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("adminLoginError").textContent = data.message;
    }
});
