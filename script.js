const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer TMDB_API_KEY",
  },
};
async function start() {
  await getMovies();

  boxGenerator();
  document.querySelector(".button").style.display = "none";
}

start();
function boxGenerator() {
  const sections = [
    {
      header: "Trending Now",
      movies: trendingMovies,
    },
    {
      header: "Top Rated",
      movies: topRatedMovies,
    },
    {
      header: "New Releases",
      movies: newReleases,
    },
    {
      header: "Popular This Week",
      movies: popularThisWeek,
    },
    {
      header: "Popular In Action",
      movies: popularInAction,
    },
    {
      header: "Popular In Horror",
      movies: popularInHorror,
    },
  ];

  let boxHTML = "";

  sections.forEach((section) => {
    boxHTML += `
      <h1>${section.header}</h1>
      <div class="flex-boxes">
    `;

    section.movies.forEach((movie) => {
      boxHTML += `
        <div class="box" onclick="getTrailer(${movie.id})">
          <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.original_title} image" loading="lazy">
        </div>
      `;
    });

    boxHTML += `</div>`;
  });

  document.querySelector(".js-adder").innerHTML = boxHTML;
}

let trendingMovies;
let topRatedMovies;
let newReleases;
let popularThisWeek;
let popularInAction;
let popularInHorror;
async function getMovies() {
  const [
    trendingResponse,
    topRatedResponse,
    newReleasesResponse,
    popularResponse,
    actionResponse,
    horrorResponse,
  ] = await Promise.all([
    fetch("https://api.themoviedb.org/3/trending/movie/week", options),

    fetch("https://api.themoviedb.org/3/movie/top_rated", options),

    fetch("https://api.themoviedb.org/3/movie/now_playing", options),

    fetch("https://api.themoviedb.org/3/movie/popular", options),

    fetch(
      "https://api.themoviedb.org/3/discover/movie?with_genres=28",
      options,
    ),
    fetch(
      "https://api.themoviedb.org/3/discover/movie?with_genres=27",
      options,
    ),
  ]);

  const [
    trendingData,
    topRatedData,
    newReleasesData,
    popularData,
    actionData,
    horrorData,
  ] = await Promise.all([
    trendingResponse.json(),
    topRatedResponse.json(),
    newReleasesResponse.json(),
    popularResponse.json(),
    actionResponse.json(),
    horrorResponse.json(),
  ]);

  trendingMovies = trendingData.results;
  topRatedMovies = topRatedData.results;
  newReleases = newReleasesData.results;
  popularThisWeek = popularData.results;
  popularInAction = actionData.results;
  popularInHorror = horrorData.results;
}

async function getMovieByName(movieName) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movieName)}`,
    options,
  );

  const data = await response.json();
  let inputValue = document.querySelector("input").value;
  const movie = data.results[0];

  if (movie !== undefined) {
    document.querySelector(".js-adder").innerHTML = /*html*/ `
  <div class="search-movie" onclick="getTrailer(${movie.id})">
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.original_title} image">
  </div>
  `;
    document.querySelector(".error").style.display = "none";
    document.querySelector(".results-info").style.display = "block";
    document.querySelector(".results-info").innerHTML =
      `Showing results for ${inputValue}`;
    document.querySelector(".js-error-2").innerHTML = "";
  } else {
    document.querySelector(".js-adder").innerHTML = "";
    document.querySelector(".error").style.display = "block";
    document.querySelector(".error-2").style.display = "block";
    document.querySelector(".results-info").innerHTML = "";
    document.querySelector(".js-error-2").innerHTML = `
  Check spelling on 
  <a href="https://www.google.com/search?q=${encodeURIComponent(inputValue)}" target="_blank">
    Google
  </a>
`;
  }
  document.querySelector("input").value = "";
  document.querySelector(".button").style.display = "block";
}

async function getTrailer(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}/videos`,
    options,
  );

  const data = await response.json();

  const trailer = data.results.find(
    (video) => video.site === "YouTube" && video.type === "Trailer",
  );

  if (trailer !== undefined) {
    const trailerKey = trailer.key;
    document.querySelector(".trailer").innerHTML = `
    <iframe
      
      src="https://www.youtube.com/embed/${trailerKey}"
      allowfullscreen>
    </iframe>
  `;
    document.querySelector(".trailer-modal").style.display = "flex";
  } else {
    document.querySelector(".trailer").innerHTML =
      "Sorry trailer not available";
    document.querySelector(".trailer-modal").style.display = "flex";
  }
}

document.querySelector(".close-trailer").addEventListener("click", () => {
  document.querySelector(".trailer-modal").style.display = "none";

  document.querySelector(".trailer").innerHTML = "";
});

document.querySelector("input").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    getMovieByName(document.querySelector("input").value);
  }
});

function toggleSwitch() {
  const button = document.querySelector(".toggle");

  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    button.innerHTML = "Light Mode";
  } else {
    button.innerHTML = "Dark Mode";
  }
}
