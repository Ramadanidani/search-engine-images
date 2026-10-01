/* ========================================
   IMAGE SEARCH ENGINE
   Unsplash API
   ======================================== */

// Unsplash Access Key
const accessKey = "HndJ_JvkJqQ6UQfZa4JlqVUrQpks0Q3QTvIMAX1dvQY";

/* ========================================
   DOM ELEMENTS
   ======================================== */

const searchForm = document.getElementById("search-form");
const searchBox = document.getElementById("search-box");
const searchResult = document.getElementById("search-result");
const showMoreBtn = document.getElementById("show-more-btn");

const searchKeywordElement = document.getElementById("search-keyword");

const resultCountElement = document.getElementById("result-count");

/* ========================================
   VARIABLES
   ======================================== */

let keyword = "";
let page = 1;

let totalPages = 0;
let totalResults = 0;

let isLoading = false;

/* ========================================
   SEARCH IMAGES
   ======================================== */

async function searchImages() {
  // Jangan jalankan request jika masih loading
  if (isLoading) {
    return;
  }

  // Ambil keyword
  const searchKeyword = searchBox.value.trim();

  // Jika input kosong
  if (!searchKeyword) {
    searchBox.focus();

    return;
  }

  // Simpan keyword
  keyword = searchKeyword;

  // Loading
  isLoading = true;

  showMoreBtn.style.display = "none";

  // Jika halaman pertama,
  // bersihkan hasil sebelumnya
  if (page === 1) {
    searchResult.innerHTML = `
      <div class="search-status">
        <div class="loading-spinner"></div>
        <p>Searching for images...</p>
      </div>
    `;
  }

  try {
    /* ------------------------------------
       UNSPLASH API
       ------------------------------------ */

    const url =
      `https://api.unsplash.com/search/photos` +
      `?page=${page}` +
      `&query=${encodeURIComponent(keyword)}` +
      `&client_id=${accessKey}` +
      `&per_page=12`;

    const response = await fetch(url);

    /* ------------------------------------
       ERROR HANDLING
       ------------------------------------ */

    if (!response.ok) {
      const errorData = await response.json();

      console.error("Unsplash Error:", errorData);

      throw new Error(`Unsplash API Error: ${response.status}`);
    }

    const data = await response.json();

    searchKeywordElement.textContent = `"${keyword}"`;

    resultCountElement.textContent = data.total.toLocaleString();

    console.log("Unsplash Response:", data);

    /* ------------------------------------
       DATA
       ------------------------------------ */

    totalPages = data.total_pages || 0;

    totalResults = data.total || 0;

    /* ------------------------------------
       EMPTY STATE
       ------------------------------------ */

    if (data.results.length === 0 && page === 1) {
      searchResult.innerHTML = `
        <div class="search-status">
          <div class="empty-icon">⌕</div>

          <h3>No images found</h3>

          <p>
            We couldn't find any images for
            "<strong>${keyword}</strong>".
          </p>

          <p>
            Try another keyword.
          </p>
        </div>
      `;

      return;
    }

    /* ------------------------------------
       CLEAR LOADING
       ------------------------------------ */

    if (page === 1) {
      searchResult.innerHTML = "";
    }

    /* ------------------------------------
       DISPLAY RESULTS
       ------------------------------------ */

    data.results.forEach((result) => {
      /* ---------- Image Card ---------- */

      const imageLink = document.createElement("a");

      imageLink.href = result.links.html;
      imageLink.target = "_blank";
      imageLink.rel = "noopener noreferrer";

      imageLink.className = "image-card";

      /* ---------- Image ---------- */

      const image = document.createElement("img");

      image.src = result.urls.small;

      image.alt =
        result.alt_description ||
        result.description ||
        `Image related to ${keyword}`;

      image.loading = "lazy";
      image.decoding = "async";

      /* ---------- Card Info ---------- */

      const cardInfo = document.createElement("div");

      cardInfo.className = "card-info";

      /* ---------- Photographer ---------- */

      const photographer = document.createElement("div");

      photographer.className = "photographer";

      photographer.innerHTML = `
  <div class="photographer-avatar">
    ${result.user.name.charAt(0).toUpperCase()}
  </div>

  <div class="photographer-details">
    <span class="photographer-name">
      ${result.user.name}
    </span>

    <span class="photographer-source">
      Photo on Unsplash
    </span>
  </div>
`;

      /* ---------- Open Icon ---------- */

      const openIcon = document.createElement("span");

      openIcon.className = "open-icon";

      openIcon.innerHTML = "↗";

      /* ---------- Assemble ---------- */

      cardInfo.appendChild(photographer);
      cardInfo.appendChild(openIcon);

      imageLink.appendChild(image);
      imageLink.appendChild(cardInfo);

      searchResult.appendChild(imageLink);

      /* ---------- Source ---------- */

      const source = document.createElement("span");

      source.className = "image-source";

      source.textContent = "Unsplash";

      /* ---------- Assemble ---------- */

      imageLink.appendChild(image);

      searchResult.appendChild(imageLink);
    });

    /* ------------------------------------
       RESULTS INFO
       ------------------------------------ */

    updateResultsInfo();

    /* ------------------------------------
       SHOW MORE
       ------------------------------------ */

    if (page < totalPages) {
      showMoreBtn.style.display = "block";

      showMoreBtn.textContent = "Show More";
    } else {
      showMoreBtn.style.display = "none";
    }
  } catch (error) {
    console.error("Search Error:", error);

    /* ------------------------------------
       ERROR MESSAGE
       ------------------------------------ */

    if (page === 1) {
      searchResult.innerHTML = `
        <div class="search-status">
          <div class="error-icon">!</div>

          <h3>Something went wrong</h3>

          <p>
            We couldn't load the images.
          </p>

          <p>
            Please check your internet
            connection or try again.
          </p>

          <button
            id="retry-btn"
            type="button"
          >
            Try Again
          </button>
        </div>
      `;

      const retryBtn = document.getElementById("retry-btn");

      retryBtn.addEventListener("click", () => {
        searchImages();
      });
    }
  } finally {
    isLoading = false;
  }
}

/* ========================================
   RESULTS INFORMATION
   ======================================== */

function updateResultsInfo() {
  let resultsInfo = document.getElementById("results-info");

  // Buat element jika belum ada
  if (!resultsInfo) {
    resultsInfo = document.createElement("div");

    resultsInfo.id = "results-info";

    searchResult.parentNode.insertBefore(resultsInfo, searchResult);
  }

  resultsInfo.innerHTML = `
    <span>
      Showing results for
      <strong>"${keyword}"</strong>
    </span>

    <span class="result-count">
      ${totalResults.toLocaleString()}
      results
    </span>
  `;

  resultsInfo.style.display = "none";
}

/* ========================================
   SEARCH FORM
   ======================================== */

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();

  page = 1;

  searchImages();
});

/* ========================================
   SHOW MORE
   ======================================== */

showMoreBtn.addEventListener("click", () => {
  if (isLoading) {
    return;
  }

  if (page >= totalPages) {
    showMoreBtn.style.display = "none";

    return;
  }

  page++;

  searchImages();
});

/* ========================================
   ESCAPE KEY
   ======================================== */

searchBox.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    searchBox.value = "";

    searchBox.focus();
  }
});
