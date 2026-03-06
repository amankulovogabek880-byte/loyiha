const destinationDetail = document.getElementById("destinationDetail");
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

async function loadDestinationDetail() {
  if (!id) {
    destinationDetail.innerHTML = "<h2>Manzil topilmadi</h2>";
    return;
  }

  try {
    const response = await fetch(`/api/destinations/${id}`);
    const result = await response.json();

    if (!response.ok || !result.success) {
      destinationDetail.innerHTML = "<h2>Manzil topilmadi</h2>";
      return;
    }

    const item = result.data;

    destinationDetail.innerHTML = `
      <img class="destination-banner" src="${item.image}" alt="${item.city}" />
      <h1 class="destination-title">${item.city}</h1>
      <p class="destination-country">${item.country}</p>
      <p class="detail-desc">${item.description}</p>

      <div class="show-more-wrap" style="justify-content:flex-start; margin-top: 0;">
        <a href="/#booking" class="show-more-btn">Shu yerga bron qilish</a>
      </div>

      <h2 style="margin-top:40px;">Mashhur joylar</h2>

      <div class="places-grid">
        ${item.places
          .map(
            (place) => `
          <div class="place-card">
            <img src="${place.image}" alt="${place.name}" />
            <div class="place-card-body">
              <h3>${place.name}</h3>
              <p>${place.text}</p>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  } catch (error) {
    destinationDetail.innerHTML = "<h2>Xatolik yuz berdi</h2>";
  }
}

loadDestinationDetail();