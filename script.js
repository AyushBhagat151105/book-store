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
      toast.className =
        "fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300";
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
    card.className =
      "flex flex-col bg-white rounded-xl shadow-lg p-5 transform hover:scale-105 hover:shadow-2xl transition-all duration-300 border border-gray-100";
    card.innerHTML = `
    <div class="relative group cursor-pointer">
        <img class="w-full h-56 sm:h-64 object-cover rounded-lg shadow-md group-hover:opacity-75 transition-opacity" 
             src="${thumbnail}" alt="Book cover" loading="lazy">
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">View Details</span>
        </div>
    </div>
    <div class="mt-6 space-y-3">
        <h2 class="font-bold text-xl text-gray-800 line-clamp-2 hover:line-clamp-none transition-all duration-300">${title}</h2>
        <div class="space-y-2">
            <p class="text-sm text-gray-600 flex items-center gap-2">
                <i class="fas fa-user-friends"></i> ${authors}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-2">
                <i class="fas fa-building"></i> ${publisher}
            </p>
            <p class="text-sm text-gray-600 flex items-center gap-2">
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
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    </head>
    <body class="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div class="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
            <!-- Navigation Bar -->
            <nav class="flex justify-between items-center mb-8">
                <h1 class="text-2xl font-bold text-gray-800">Book Details</h1>
                <button onclick="window.close()" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <i class="fas fa-times text-gray-600 text-xl"></i>
                </button>
            </nav>

            <!-- Main Content -->
            <div class="flex flex-col lg:flex-row gap-8 bg-white rounded-2xl shadow-xl p-6">
                <!-- Book Image Section -->
                <div class="lg:w-1/3">
                    <div class="relative group">
                        <img class="w-full h-[400px] object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105" 
                             src="${bookData.thumbnail}" 
                             alt="${bookData.title}"
                             onerror="this.src='https://via.placeholder.com/400x600?text=No+Image'">
                        <div class="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity rounded-lg"></div>
                    </div>
                </div>

                <!-- Book Details Section -->
                <div class="lg:w-2/3 space-y-6">
                    <h2 class="text-3xl font-bold text-gray-800 leading-tight">${bookData.title}</h2>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-users text-blue-500"></i>
                            <div>
                                <p class="text-sm text-gray-500">Authors</p>
                                <p class="font-medium">${bookData.authors}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-building text-green-500"></i>
                            <div>
                                <p class="text-sm text-gray-500">Publisher</p>
                                <p class="font-medium">${bookData.publisher}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-2">
                            <i class="fas fa-calendar text-purple-500"></i>
                            <div>
                                <p class="text-sm text-gray-500">Published Date</p>
                                <p class="font-medium">${bookData.publishedDate}</p>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="text-xl font-semibold text-gray-800">Description</h3>
                        <div class="prose max-w-none">
                            <p class="text-gray-600 leading-relaxed">${bookData.description}</p>
                        </div>
                    </div>

                    <div class="flex flex-wrap gap-4 pt-4">
                        <button onclick="window.print()" 
                                class="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            <i class="fas fa-print"></i>
                            Print Details
                        </button>
                        <button onclick="window.close()" 
                                class="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
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
  if (bookContainer.classList.contains("grid")) {
    renderListView();
  } else {
    renderGridView();
  }
}

// Function to render list view
function renderListView() {
  bookContainer.innerHTML = "";
  bookContainer.classList.remove(
    "grid",
    "grid-cols-1",
    "md:grid-cols-2",
    "lg:grid-cols-3",
    "gap-4"
  );
  bookContainer.classList.add("flex", "flex-col", "space-y-4");

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
    card.className =
      "flex flex-row bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition duration-300";
    card.innerHTML = `
            <img class="w-24 h-32 object-cover rounded mr-4" src="${thumbnail}" alt="Book cover">
            <div class="flex-1">
                <h2 class="font-bold text-lg">${title}</h2>
                <p class="text-sm text-gray-600"><strong>Author(s):</strong> ${authors}</p>
                <p class="text-sm text-gray-600"><strong>Publisher:</strong> ${publisher}</p>
                <p class="text-sm text-gray-600"><strong>Published Date:</strong> ${publishedDate}</p>
            </div>
        `;
    card.addEventListener("click", () => openBookDetails(book));
    bookContainer.appendChild(card);
  });
}

// Function to render grid view
function renderGridView() {
  bookContainer.innerHTML = "";
  bookContainer.classList.remove("flex", "flex-col", "space-y-4");
  bookContainer.classList.add(
    "grid",
    "grid-cols-1",
    "md:grid-cols-2",
    "lg:grid-cols-3",
    "gap-4"
  );
  renderBooks(); // Use the existing renderBooks function for grid view
}

toggle.addEventListener("click", toggleView);

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
    card.className =
      "max-w-xs bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-2xl transition duration-300";
    card.innerHTML = `
          <img class="w-full h-48 object-cover rounded" src="${thumbnail}" alt="Book cover">
          <div class="mt-4">
            <h2 class="font-bold text-lg">${title}</h2>
            <p class="text-sm text-gray-600"><strong>Author(s):</strong> ${authors}</p>
            <p class="text-sm text-gray-600"><strong>Publisher:</strong> ${publisher}</p>
            <p class="text-sm text-gray-600"><strong>Published Date:</strong> ${publishedDate}</p>
          </div>
        `;

    card.addEventListener("click", () => openBookDetails(book));
    bookContainer.appendChild(card);
  });
}

// Event Listeners
serach.addEventListener("keyup", searchInput);

sortButtonDate.addEventListener("click", shortDate);

sortButtonTitle.addEventListener("click", sortTitle);

// Initial Fetch
fetchBooks(currentPage);
