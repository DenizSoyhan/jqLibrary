const FAVORITES_KEY = "favoriteBooks";

/*Helpers and copy pasted code from app.js */
function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function isFavorite(workId) {
  return getFavorites().some(b => b.workId === workId);
}

function removeFavorite(workId) {
    const favs = getFavorites().filter(b => b.workId !== workId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    loadFavorites();
  }

  function truncate(text, maxLength) {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength) + "…"
      : text;
  }



  function openBookModal(book) {
    const coverUrl = book.coverKey
      ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg`
      : "./images/placeHolder.png";
  
    $("#modalCover").attr("src", coverUrl);
    $("#modalTitle").text(book.title);
    $("#modalAuthor").text(`by ${book.author}`);
    $("#modalYear").text(book.year ? `Published: ${book.year}` : "");
    $("#modalDescription").text(truncate(book.description, 900));
  
    // Store the workId in the modal so the modal button can access it
    $("#bookModal").data("workid", book.workId);
  
    // Update the modal heart to be filled (solid) since it's a favorite
    $("#modalFavBtn i").attr("class", "fa-solid fa-heart");
  
    $("#bookModal").removeClass("hidden");
  }



function loadFavorites() {
    $("#bookCase").empty();
    $("#emptyState").addClass("hidden");
  
    favoriteBooks = getFavorites();
  
    if (favoriteBooks.length === 0) {
      $("#emptyState").removeClass("hidden");
      return;
    }
  
    renderFavorites();
  }
  

function renderFavorites() {
    let index = 0;
  
    while (index < favoriteBooks.length) {
      const shelf = $("<div>").addClass("shelf");
      $("#bookCase").append(shelf);
  
      for (let i = 0; i < 3 && index < favoriteBooks.length; i++) {
        const book = favoriteBooks[index++];
  
        const coverUrl = book.coverKey
          ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg`
          : "./images/placeHolder.png";
  
        shelf.append(`
          <div class="book" data-id="${book.workId}">
            <button class="fav-btn" data-id="${book.workId}">
              <i class="fa-solid fa-heart"></i>
            </button>
  
            <img src="${coverUrl}">
            <h4>${book.title}</h4>
            <p>${book.author} (${book.year ?? "N/A"})</p>
          </div>
        `);
      }
    }
  }

//adding functionallity to the elements

$(document).on("click", ".fav-btn", function (e) {
  e.stopPropagation();
  const workId = $(this).data("id");
  removeFavorite(workId);
});

$("#modalFavBtn").on("click", function () {
  const workId = $("#bookModal").data("workid");
  if (workId) {
    removeFavorite(workId);
    $("#bookModal").addClass("hidden");
  }
});

$(document).on("click", ".book", function () {
  const workId = $(this).data("id");
  const book = favoriteBooks.find(b => b.workId === workId);
  openBookModal(book);
});

$(".modal-overlay, .modal-close").on("click", function () {
  $("#bookModal").addClass("hidden");
});


loadFavorites();