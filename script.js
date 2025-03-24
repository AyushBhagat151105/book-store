const bookContainer = document.getElementById("bookContainer");
const loadButton = document.getElementById("loadMore");
const sortButtonTitle = document.getElementById("sortTitle");
const sortButtonDate = document.getElementById("sortDate");
const serach = document.getElementById("searchInput");
const toggle = document.getElementById("toggleView");

let currentPage = 1; // Track the page number
const limit = 10; // Books per request
const query = "all"; // Search keyword
let fetchedBookIds = new Set(); // Store book IDs to avoid duplicates
let bookList = []; // Store all fetched books

// get Data
async function fetchBooks(page) {
  try {
    const response = await axios.get(
      "https://api.freeapi.app/api/v1/public/books",
      {
        params: {
          page: page,
          limit: limit,
          inc: "kind,id,etag,volumeInfo",
          query: query,
        },
        headers: { accept: "application/json" },
      }
    );

    const newBooks = response.data.data.data || []; // Get new books

    console.log(`Fetched Books for Page ${page}:`, newBooks); // Debugging

    if (newBooks.length === 0) {
      // Create toast element
      const toast = document.createElement("div");
      toast.className = "toast";
      toast.textContent = "No more books available.";

      // Add to document
      document.body.appendChild(toast);

      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
      }, 3000);

      console.log("No more books available.");
      loadButton.style.display = "none"; // Hide button if no more books
      return;
    }

    newBooks.forEach((book) => {
      if (fetchedBookIds.has(book.id)) return; // Skip duplicates

      fetchedBookIds.add(book.id); // Mark as fetched
      bookList.push(book); // Store the book

      renderBooks(); // Re-render the book list
    });

    // Hide button if fewer books are returned (end of list)
    if (newBooks.length < limit) {
      loadButton.style.display = "none";
    }
  } catch (error) {
    console.error("Error fetching books:", error);
  }
}

// Render Books to UI
function renderBooks() {
  bookContainer.innerHTML = ""; // Clear container before re-rendering

  bookList.forEach((book) => {
    const title = book.volumeInfo?.title || "No Title Available";
    const authors = book.volumeInfo?.authors
      ? book.volumeInfo.authors.join(", ")
      : "Unknown Author";
    const publisher = book.volumeInfo?.publisher || "Unknown Publisher";
    const publishedDate = book.volumeInfo?.publishedDate || "Unknown Date";
    const thumbnail =
      book.volumeInfo?.imageLinks?.thumbnail ||
      "https://via.placeholder.com/128x192?text=No+Image";

    // Create book card using Tailwind CSS
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
    <div class="book-image-container">
        <img class="book-image" 
             src="${thumbnail}" alt="Book cover" loading="lazy">
        <div class="book-overlay">
            <span class="view-details">View Details</span>
        </div>
    </div>
    <div class="book-info">
        <h2 class="book-title">${title}</h2>
        <div class="book-details">
            <p class="book-detail">
                <i class="fas fa-user-friends"></i> ${authors}
            </p>
            <p class="book-detail">
                <i class="fas fa-building"></i> ${publisher}
            </p>
            <p class="book-detail">
                <i class="fas fa-calendar-alt"></i> ${publishedDate}
            </p>
        </div>
    </div>
`;

    // Attach event listener for book details
    card.addEventListener("click", () => openBookDetails(book));

    bookContainer.appendChild(card); // Append book card
  });
}

// Sort by Title
async function sortTitle() {
  try {
    bookList.sort((a, b) => {
      const titleA = a.volumeInfo?.title?.toLowerCase() || "";
      const titleB = b.volumeInfo?.title?.toLowerCase() || "";
      return titleA.localeCompare(titleB);
    });

    renderBooks(); // Re-render sorted books
  } catch (error) {
    console.log("Error sorting books by title:", error);
  }
}

// Short by date
async function shortDate() {
  try {
    bookList.sort((a, b) => {
      const dateA = a.volumeInfo?.publishedDate || "";
      const dateB = b.volumeInfo?.publishedDate || "";
      return dateA.localeCompare(dateB);
    });

    renderBooks();
  } catch (error) {
    console.log("Error sorting books by date:", error);
  }
}

// open book details
function openBookDetails(book) {
  const bookData = {
    title: book.volumeInfo?.title || "No Title Available",
    authors: book.volumeInfo?.authors
      ? book.volumeInfo.authors.join(", ")
      : "Unknown Author",
    publisher: book.volumeInfo?.publisher || "Unknown Publisher",
    publishedDate: book.volumeInfo?.publishedDate || "Unknown Date",
    description: book.volumeInfo?.description || "No description available.",
    thumbnail:
      book.volumeInfo?.imageLinks?.thumbnail ||
      "https://via.placeholder.com/300x400?text=No+Image",
  };

  // Open a new blank tab
  const newTab = window.open("", "_blank");

  // Generate HTML content dynamically
  newTab.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${bookData.title}</title>
        <link rel="stylesheet" href="css.css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body>
        <div class="book-details-container">
            <!-- Navigation Bar -->
            <nav class="book-details-nav">
                <h1 class="book-details-title">Book Details</h1>
                <button onclick="window.close()" class="close-btn">
                    <i class="fas fa-times close-icon"></i>
                </button>
            </nav>

            <!-- Main Content -->
            <div class="book-details-content">
                <!-- Book Image Section -->
                <div class="book-details-image-container">
                    <div class="book-details-image-container">
                        <img class="book-details-image" 
                             src="${bookData.thumbnail}" 
                             alt="${bookData.title}"
                             onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
                        <div class="book-details-image-overlay"></div>
                    </div>
                </div>

                <!-- Book Details Section -->
                <div class="book-details-info">
                    <h2 class="book-details-main-title">${bookData.title}</h2>
                    
                    <div class="book-details-meta">
                        <div class="book-meta-item">
                            <i class="fas fa-users meta-icon-blue"></i>
                            <div>
                                <p class="meta-label">Authors</p>
                                <p class="meta-value">${bookData.authors}</p>
                            </div>
                        </div>
                        <div class="book-meta-item">
                            <i class="fas fa-building meta-icon-green"></i>
                            <div>
                                <p class="meta-label">Publisher</p>
                                <p class="meta-value">${bookData.publisher}</p>
                            </div>
                        </div>
                        <div class="book-meta-item">
                            <i class="fas fa-calendar meta-icon-purple"></i>
                            <div>
                                <p class="meta-label">Published Date</p>
                                <p class="meta-value">${bookData.publishedDate}</p>
                            </div>
                        </div>
                    </div>

                    <div class="book-description-container">
                        <h3 class="book-description-title">Description</h3>
                        <div class="book-description">
                            <p>${bookData.description}</p>
                        </div>
                    </div>

                    <div class="book-actions">
                        <button onclick="window.print()" 
                                class="btn-print">
                            <i class="fas fa-print"></i>
                            Print Details
                        </button>
                        <button onclick="window.close()" 
                                class="btn-close">
                            <i class="fas fa-times"></i>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add smooth scrolling -->
        <style>
            html {
                scroll-behavior: smooth;
            }
            @media (prefers-reduced-motion: reduce) {
                html {
                    scroll-behavior: auto;
                }
            }
        </style>
    </body>
    </html>
`);

  // Close the document stream
  newTab.document.close();
}

// create a function that toggles the view between tha gride to list
function toggleView() {
  if (bookContainer.classList.contains("book-grid")) {
    renderListView();
  } else {
    renderGridView();
  }
}

// Function to render list view
function renderListView() {
  bookContainer.innerHTML = "";
  bookContainer.classList.remove("book-grid");
  bookContainer.classList.add("book-list");

  bookList.forEach((book) => {
    const title = book.volumeInfo?.title || "No Title Available";
    const authors = book.volumeInfo?.authors
      ? book.volumeInfo.authors.join(", ")
      : "Unknown Author";
    const publisher = book.volumeInfo?.publisher || "Unknown Publisher";
    const publishedDate = book.volumeInfo?.publishedDate || "Unknown Date";
    const thumbnail =
      book.volumeInfo?.imageLinks?.thumbnail ||
      "https://via.placeholder.com/128x192?text=No+Image";

    const card = document.createElement("div");
    card.className = "book-list-item";
    card.innerHTML = `
            <img class="book-list-image" src="${thumbnail}" alt="Book cover">
            <div class="book-list-info">
                <h2 class="book-list-title">${title}</h2>
                <p class="book-list-detail"><strong>Author(s):</strong> ${authors}</p>
                <p class="book-list-detail"><strong>Publisher:</strong> ${publisher}</p>
                <p class="book-list-detail"><strong>Published Date:</strong> ${publishedDate}</p>
            </div>
        `;
    card.addEventListener("click", () => openBookDetails(book));
    bookContainer.appendChild(card);
  });
}

// Function to render grid view
function renderGridView() {
  bookContainer.innerHTML = "";
  bookContainer.classList.remove("book-list");
  bookContainer.classList.add("book-grid");
  renderBooks(); // Use the existing renderBooks function for grid view
}

// Event Listeners
loadButton.addEventListener("click", () => {
  currentPage++;
  fetchBooks(currentPage);
});

// create auto serach function
function searchInput() {
  try {
    const searchValue = serach.value.toLowerCase();

    const searchBooks = bookList.filter((book) => {
      const title = book.volumeInfo?.title?.toLowerCase() || "";
      const authors = book.volumeInfo?.authors
        ? book.volumeInfo.authors.join(", ").toLowerCase()
        : "";
      return title.includes(searchValue) || authors.includes(searchValue);
    });

    renderFilteredBooks(searchBooks); // Render the filtered books
  } catch (error) {
    console.log("Error searching books:", error);
  }
}

// Function to render only filtered books
function renderFilteredBooks(filteredBooks) {
  bookContainer.innerHTML = ""; // Clear previous books

  filteredBooks.forEach((book) => {
    const title = book.volumeInfo?.title || "No Title Available";
    const authors = book.volumeInfo?.authors
      ? book.volumeInfo.authors.join(", ")
      : "Unknown Author";
    const publisher = book.volumeInfo?.publisher || "Unknown Publisher";
    const publishedDate = book.volumeInfo?.publishedDate || "Unknown Date";
    const thumbnail =
      book.volumeInfo?.imageLinks?.thumbnail ||
      "https://via.placeholder.com/128x192?text=No+Image";

    // Create book card
    const card = document.createElement("div");
    card.className = "book-card";
    card.innerHTML = `
    <img class="book-image" src="${thumbnail}" alt="Book cover">
    <div class="book-info">
    <h2 class="book-title">${title}</h2>
    <p class="book-detail"><strong>Author(s):</strong> ${authors}</p>
    <p class="book-detail"><strong>Publisher:</strong> ${publisher}</p>
    <p class="book-detail"><strong>Published Date:</strong> ${publishedDate}</p>
    </div>
    `;

    card.addEventListener("click", () => openBookDetails(book));
    bookContainer.appendChild(card);
  });
}

// Event Listeners
toggle.addEventListener("click", toggleView);

serach.addEventListener("keyup", searchInput);

sortButtonDate.addEventListener("click", shortDate, toggleView);

sortButtonTitle.addEventListener("click", sortTitle, toggleView);

// Initial Fetch
fetchBooks(currentPage);
