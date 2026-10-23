/* Shared site interactions: trip note, stay search, and demo booking. */
document.addEventListener('DOMContentLoaded', () => {
  // The responsive menu uses Bootstrap's collapse component.
  const tripForm = document.querySelector('#trip-form');
  const toast = document.querySelector('.toast');

  if (tripForm && toast) {
    tripForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const name = document.querySelector('#name').value.trim();
      toast.textContent = `Thanks${name ? `, ${name}` : ''}! Your trip note is ready. Email hello@elsewhere.travel and we’ll help you plan.`;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 5500);
    });
  }

  const searchForm = document.querySelector('#search-form');
  const stayList = document.querySelector('#stay-list');
  if (!searchForm || !stayList) return;

  // Sample inventory for this front-end booking demo.
  const stays = [
    { name: 'The Cedar House', area: 'Himachal', place: 'Manali, Himachal Pradesh', type: 'Mountain lodge', price: 7800, image: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=900&q=80', alt: 'A cosy mountain lodge' },
    { name: 'Stillwater House', area: 'Kerala', place: 'Alleppey, Kerala', type: 'Backwater retreat', price: 9200, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=900&q=80', alt: 'A tropical retreat beside the water' },
    { name: 'Gulabi Haveli', area: 'Rajasthan', place: 'Jaipur, Rajasthan', type: 'Heritage haveli', price: 6500, image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=900&q=80', alt: 'A warmly lit heritage guest room' },
    { name: 'Fern & Mist', area: 'Meghalaya', place: 'Shillong, Meghalaya', type: 'Forest cabin', price: 7100, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', alt: 'A small cabin tucked into the forest' },
    { name: 'The Palm Courtyard', area: 'Goa', place: 'Assagao, Goa', type: 'Coastal stay', price: 8400, image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=900&q=80', alt: 'A relaxed coastal hideaway' },
    { name: 'Above the Clouds', area: 'Ladakh', place: 'Leh, Ladakh', type: 'High-altitude guesthouse', price: 5900, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=900&q=80', alt: 'A remote mountain guesthouse' }
  ];

  const checkIn = document.querySelector('#checkin');
  const checkOut = document.querySelector('#checkout');
  const bookingPanel = document.querySelector('#booking-panel');
  const resultCount = document.querySelector('#result-count');
  let selectedStay = null;
  let numberOfNights = 3;

  function formatDateValue(date) {
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }

  function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  const today = new Date();
  const defaultCheckIn = new Date(today);
  defaultCheckIn.setDate(today.getDate() + 30);
  const defaultCheckOut = new Date(defaultCheckIn);
  defaultCheckOut.setDate(defaultCheckIn.getDate() + 3);

  checkIn.min = formatDateValue(today);
  checkIn.value = formatDateValue(defaultCheckIn);
  checkOut.min = checkIn.value;
  checkOut.value = formatDateValue(defaultCheckOut);

  checkIn.addEventListener('change', () => {
    checkOut.min = checkIn.value;
    if (!checkOut.value || checkOut.value <= checkIn.value) {
      const nextDay = new Date(`${checkIn.value}T12:00:00`);
      nextDay.setDate(nextDay.getDate() + 1);
      checkOut.value = formatDateValue(nextDay);
    }
  });

  function renderStays() {
    if (!searchForm.reportValidity()) return;

    const stayLength = (new Date(`${checkOut.value}T12:00:00`) - new Date(`${checkIn.value}T12:00:00`)) / 86400000;
    if (stayLength < 1) {
      checkOut.setCustomValidity('Choose a check-out date after check-in.');
      checkOut.reportValidity();
      checkOut.setCustomValidity('');
      return;
    }

    numberOfNights = stayLength;
    const destination = document.querySelector('#destination').value;
    const guests = Number(document.querySelector('#guests').value);
    const availableStays = stays.filter((stay) => destination === 'All' || stay.area === destination);

    resultCount.textContent = `${availableStays.length} ${availableStays.length === 1 ? 'stay' : 'stays'} · ${numberOfNights} nights · ${guests} ${guests === 1 ? 'guest' : 'guests'}`;
    bookingPanel.classList.remove('open');
    selectedStay = null;

    if (!availableStays.length) {
      stayList.innerHTML = '<div class="empty-results">No stays found for that destination. Try another place.</div>';
      return;
    }

    stayList.innerHTML = availableStays.map((stay, index) => `
      <article class="stay-result">
        <img src="${stay.image}" alt="${stay.alt}">
        <div class="stay-info">
          <div class="stay-location">${stay.place} · ${stay.type}</div>
          <h3>${stay.name}</h3>
          <p>A thoughtful, locally rooted place to slow down and settle in. Breakfast and a warm welcome included.</p>
          <div class="stay-perks">✦ Free cancellation · ✦ Locally hosted</div>
        </div>
        <div class="stay-price">
          <div>
            <div class="price">${formatCurrency(stay.price)} <small>/ night</small></div>
            <div class="price-note">${formatCurrency(stay.price * numberOfNights)} estimated stay total</div>
          </div>
          <button class="btn choose-stay" type="button" data-stay-index="${index}">Choose stay →</button>
        </div>
      </article>`).join('');

    stayList.querySelectorAll('.choose-stay').forEach((button) => {
      button.addEventListener('click', () => {
        selectedStay = availableStays[Number(button.dataset.stayIndex)];
        const displayDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        const guestLabel = document.querySelector('#guests').selectedOptions[0].text;
        document.querySelector('#booking-summary').innerHTML = `<strong>${selectedStay.name}</strong> · ${selectedStay.place}<br>${displayDate(checkIn.value)} – ${displayDate(checkOut.value)} · ${numberOfNights} nights · ${guestLabel}<br>Estimated total: <strong>${formatCurrency(selectedStay.price * numberOfNights)}</strong>`;
        bookingPanel.classList.add('open');
        bookingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    renderStays();
  });
  renderStays();

  const guestForm = document.querySelector('#guest-form');
  if (guestForm && toast) {
    guestForm.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!selectedStay) return;
      const guestName = document.querySelector('#guest-name').value.trim();
      toast.textContent = `Thanks${guestName ? `, ${guestName}` : ''}! Your request for ${selectedStay.name} is ready. No live reservation was made.`;
      toast.classList.add('show');
      window.setTimeout(() => toast.classList.remove('show'), 6000);
      guestForm.reset();
    });
  }
});
