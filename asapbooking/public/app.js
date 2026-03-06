const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
const bookingForm = document.getElementById("bookingForm");
const formMessage = document.getElementById("formMessage");
const departure = document.getElementById("departure");
const returnDate = document.getElementById("returnDate");
const tripType = document.getElementById("tripType");
const destinationsGrid = document.getElementById("destinationsGrid");
const showMoreBtn = document.getElementById("showMoreBtn");

let allDestinations = [];
let expanded = false;

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("show");
  });

  document.addEventListener("click", (e) => {
    if (!menuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
      mobileMenu.classList.remove("show");
    }
  });

  document.querySelectorAll(".mobile-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("show");
    });
  });
}

if (departure && returnDate) {
  const today = new Date().toISOString().split("T")[0];
  departure.min = today;
  returnDate.min = today;

  departure.addEventListener("change", () => {
    returnDate.min = departure.value || today;

    if (returnDate.value && returnDate.value < departure.value) {
      returnDate.value = "";
    }
  });
}

if (tripType && returnDate) {
  tripType.addEventListener("change", () => {
    if (tripType.value === "Bir tomonga") {
      returnDate.disabled = true;
      returnDate.value = "";
    } else {
      returnDate.disabled = false;
    }
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bookingData = {
      tripType: document.getElementById("tripType").value.trim(),
      travelers: document.getElementById("travelers").value.trim(),
      classType: document.getElementById("classType").value.trim(),
      from: document.getElementById("from").value.trim(),
      to: document.getElementById("to").value.trim(),
      departure: document.getElementById("departure").value,
      returnDate: document.getElementById("returnDate").value,
      email: document.getElementById("email").value.trim(),
      name: document.getElementById("name").value.trim(),
      phone: document.getElementById("phone").value.trim()
    };

    try {
      formMessage.textContent = "Yuborilmoqda...";
      formMessage.style.color = "#0d4ea6";

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bookingData)
      });

      const result = await response.json();

      if (!response.ok) {
        formMessage.textContent = result.message || "Xatolik yuz berdi.";
        formMessage.style.color = "red";
        return;
      }

      formMessage.textContent = result.message;
      formMessage.style.color = "green";
      bookingForm.reset();
      returnDate.disabled = false;
    } catch (error) {
      formMessage.textContent = "Server bilan ulanishda xatolik bo‘ldi.";
      formMessage.style.color = "red";
    }
  });
}

async function loadDestinations() {
  if (!destinationsGrid) return;

  try {
    const response = await fetch("/api/destinations");
    const result = await response.json();

    if (!response.ok || !result.success) {
      destinationsGrid.innerHTML = "<p>Manzillarni yuklab bo‘lmadi.</p>";
      return;
    }

    allDestinations = result.data;
    renderDestinations();
  } catch (error) {
    destinationsGrid.innerHTML = "<p>Manzillarni yuklashda xatolik bo‘ldi.</p>";
  }
}

function renderDestinations() {
  const data = expanded ? allDestinations : allDestinations.slice(0, 6);

  destinationsGrid.innerHTML = data
    .map(
      (item) => `
      <div class="card" data-id="${item.id}">
        <img src="${item.image}" alt="${item.city}" />
        <div class="card-body">
          <h3>${item.city}</h3>
          <p>${item.country}</p>
        </div>
      </div>
    `
    )
    .join("");

  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      window.location.href = `/destination?id=${id}`;
    });
  });

  if (showMoreBtn) {
    showMoreBtn.textContent = expanded ? "Kamroq ko‘rish" : "Ko‘proq ko‘rish";
  }
}

if (showMoreBtn) {
  showMoreBtn.addEventListener("click", () => {
    expanded = !expanded;
    renderDestinations();
  });
}

loadDestinations();