// aside opening and closing
let asideToggle = document.getElementById("asideToggle");
let aside = document.getElementById("aside");
let toggleBars = document.getElementById("toggleBars");
window.addEventListener("load", () => {
  aside.classList.remove("no-animation");
});

asideToggle.addEventListener("click", () => {
  aside.classList.toggle("open");
  aside.classList.toggle("closed");
  toggleBars.classList.toggle("fa-x");
  toggleBars.classList.toggle("fa-bars");
});

// validation form
const form = document.getElementById("Contact");
const submitBtn = form.querySelector("button[type='submit']");

const fields = {
  username: /^[A-Za-z ]{3,20}$/,
  userEmail: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  userPhone: /^01[0-2,5][0-9]{8}$/,
  userAge: /^(1[6-9]|[2-9][0-9]|100)$/,
  userPasword: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
};

function getOrCreateError(input) {
  let msg = input.nextElementSibling;
  if (!msg || !msg.classList.contains("invalid-feedback")) {
    msg = document.createElement("div");
    msg.className = "invalid-feedback";
    input.insertAdjacentElement("afterend", msg);
  }
  return msg;
}

function validateField(id) {
  const input = document.getElementById(id);
  const value = input.value.trim();

  if (id === "rePassword") {
    const pass = document.getElementById("userPasword").value;
    const msg = getOrCreateError(input);

    if (value === pass && pass !== "") {
      input.classList.remove("is-invalid");
      input.classList.add("is-valid");
      msg.textContent = "";
      return true;
    } else {
      input.classList.remove("is-valid");
      input.classList.add("is-invalid");
      msg.textContent = "Passwords do not match.";
      return false;
    }
  }

  const regex = fields[id];
  const msg = getOrCreateError(input);

  if (regex.test(value)) {
    input.classList.remove("is-invalid");
    input.classList.add("is-valid");
    msg.textContent = "";
    return true;
  } else {
    input.classList.remove("is-valid");
    input.classList.add("is-invalid");
    msg.textContent = "Please enter a valid value.";
    return false;
  }
}

function validateAll() {
  let allGood = true;

  for (let id in fields) {
    if (!validateField(id)) allGood = false;
  }

  if (!validateField("rePassword")) allGood = false;

  return allGood;
}

Object.keys(fields).forEach((id) => {
  const input = document.getElementById(id);
  input.addEventListener("input", () => validateField(id));
  input.addEventListener("blur", () => validateField(id));
});

document
  .getElementById("rePassword")
  .addEventListener("input", () => validateField("rePassword"));
document
  .getElementById("rePassword")
  .addEventListener("blur", () => validateField("rePassword"));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ok = validateAll();

  if (ok) {
    form.reset();

    form.querySelectorAll(".is-valid, .is-invalid").forEach((el) => {
      el.classList.remove("is-valid", "is-invalid");
    });
  } else {
    const firstInvalid = form.querySelector(".is-invalid");
    if (firstInvalid) firstInvalid.focus();
  }
});

// fetching api
const apiKey = 'eba8b9a7199efdcb0ca1f96879b83c44'; 

const endpoints = {
  'Now Playing': `https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}`,
  'Popular': `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`,
  'Top Rated': `https://api.themoviedb.org/3/movie/top_rated?api_key=${apiKey}`,
  'Upcoming': `https://api.themoviedb.org/3/movie/upcoming?api_key=${apiKey}`,
  'Trending': `https://api.themoviedb.org/3/trending/all/day?api_key=${apiKey}`
};

const moviesRow = document.getElementById('moviesRow');
const asideLinks = document.querySelectorAll('#aside ul li[data-section]');
const searchInput = document.getElementById('movieSearch');

let currentMovies = []; 

async function fetchMovies(url) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results;
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
}

function createStars(rating) {
  rating = Number(rating.toFixed(1));
  const fullStars = Math.floor(rating / 2);
  const halfStar = rating % 2 >= 1 ? 1 : 0;
  return (
    '<i class="fa-solid fa-star"></i>'.repeat(fullStars) +
    '<i class="fa-solid fa-star-half-stroke"></i>'.repeat(halfStar)
  );
}

function truncateOverview(text) {
  const maxLength = 300; 
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}

function renderMovies(movies) {
  moviesRow.innerHTML = '';
  movies.forEach(movie => {
    const title = movie.title || movie.name;
    const overview = truncateOverview(movie.overview || '');
    const release = movie.release_date || movie.first_air_date || '';
    let rating = movie.vote_average || 0;
    rating = Number(rating.toFixed(1));

    const poster = movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : 'https://via.placeholder.com/500x750';

    const col = document.createElement('div');
    col.className = 'col-12 col-md-6 col-lg-4';
    col.innerHTML = `
      <div class="inner">
        <div class="img-container position-relative overflow-hidden">
          <img src="${poster}" class="w-100" alt="">
          <div class="img-hover p-4 position-absolute top-0 bottom-0 start-0 end-0">
            <h3 class="fs-4 text-center">${title}</h3>
            <p class="fw-light text">${overview}</p>
            <p class="fw-light">Release Date: ${release}</p>
            <div class="rating">
              ${createStars(rating)}
              <p class="num-rating my-3">${rating}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    moviesRow.appendChild(col);
  });
}

asideLinks.forEach(link => {
  link.addEventListener('click', async () => {
    const section = link.getAttribute('data-section');
    if (!endpoints[section]) return;

    asideLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    currentMovies = await fetchMovies(endpoints[section]); 
    renderMovies(currentMovies);
  });
});

searchInput.addEventListener('input', () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filteredMovies = currentMovies.filter(movie => {
    const title = (movie.title || movie.name || '').toLowerCase();
    return title.startsWith(searchTerm); 
  });
  renderMovies(filteredMovies);
});

document.querySelector('#aside ul li[data-section="Now Playing"]').click();
