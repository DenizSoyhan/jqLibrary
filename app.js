//get the books
let bookList = []

$.getJSON(
    "https://openlibrary.org/search.json?q=classic&limit=45",
    function (data) {
      /*data.docs.slice(0,25).forEach(i =>{
        console.log(i)      }) */
      const books = data.docs.slice(0, 45).map(book => ({
          title: book.title,
          author: book.author_name ? book.author_name[0] : "Unknown",
          year: book.first_publish_year || null,
          workId: book.key.replace("/works/", ""),
          coverKey: book.cover_edition_key || null,
          description: null // gets added later otherwise it takes way too long to load
        }));
        

      //extract images 
      bookList = books;

      createShelfElements(bookList);
      const descriptionPromises = bookList.map(book =>
        getBookDescription(book).then(desc => {
          book.description = desc; // stored in the object
        })
      );
      
      //loads everything asyncly
      Promise.all(descriptionPromises).then(() => {
        bookList = books;
        //console.log(bookList);
      });

  })

function createShelfElements(aBookList) {
  let index = 0;
  let shelfIndex = 0;

  while (index < aBookList.length) {

    if (shelfIndex === 0) {
      $("#bookCase").append(`<h2 class="section-title">Most Popular</h2>`);
    }

    if (shelfIndex === 1) {
      $("#bookCase").append(`<h2 class="section-title">The Classics</h2>`);
    }

    const shelf = $("<div>").addClass("shelf");
    $("#bookCase").append(shelf);

    index += 3;
    shelfIndex++;
  }

  const shelves = document.querySelectorAll(".shelf");
  createBookElements(shelves, aBookList);
  }
function createBookElements(shelves, books) {
  let bookIndex = 0;

  shelves.forEach(shelf => {
    for (let i = 0; i < 3 && bookIndex < books.length; i++) {
      const book = books[bookIndex++];
    
      const coverUrl = book.coverKey
        ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg`
        : "/images/placeHolder.png";

        //data index is there to easily choose what book to choose for the details modal
        shelf.insertAdjacentHTML("beforeend", `
          <div class="book" data-index="${bookIndex - 1}">
            <button class="fav-btn" data-index="${bookIndex - 1}">
              <i class="${isFavorite(book.workId) ? "fa-solid" : "fa-regular"} fa-heart"></i> 
            </button>
        
            <img src="${coverUrl}" onerror="this.src='/images/placeHolder.png'">
            <h4>${book.title}</h4>
            <p>${book.author} (${book.year ?? "N/A"})</p>
          </div>
        `);
        
    }
  });
  
  $("#loader").fadeOut(1500);
}

function getBookDescription(book) {
  return $.getJSON(`https://openlibrary.org/works/${book.workId}.json`)
    .then(data => {
      if (typeof data.description === "string") {
        return data.description;
      }
      if (data.description?.value) {
        return data.description.value;
      }
      return "No description available.";
    })
    .catch(() => "No description available.");

}

//FAV button logic

$(document).on("click", ".fav-btn", function (e) {
  e.stopPropagation();

  const index = $(this).data("index");
  const book = bookList[index];

  toggleFavorite(book);
  updateAllFavoriteIcons(book.workId);
});


//MODAL LOGIC

function openBookModal(book, index) {
  const coverUrl = book.coverKey
    ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg`
    : "/images/placeHolder.png";

  $("#modalCover").attr("src", coverUrl);
  $("#modalTitle").text(book.title);
  $("#modalAuthor").text(`by ${book.author}`);
  $("#modalYear").text(book.year ? `Published: ${book.year}` : "");
  $("#bookModal").data("index", index);

  $("#modalDescription").text(
    book.description
      ? truncate(book.description, 900)
      : "Loading description…"
  );

  

  $("#bookModal")
  .data("index", index)
  .data("workid", book.workId);

  updateAllFavoriteIcons(book.workId);

$("#bookModal").removeClass("hidden");
}

$(document).on("click", ".book", function () {
  const index = $(this).data("index");
  openBookModal(bookList[index], index);
});

// close modal
$(".modal-overlay, .modal-close").on("click", function () {
  $("#bookModal").addClass("hidden");
});

//some descriptions are far too long and maxLength is characters
function truncate(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength
    ? text.slice(0, maxLength) + "…"
    : text;
}

//Search bar logic

$("#searchInput").on("input", function () {
  const query = $(this).val().toLowerCase().trim(); //clean the input
  const resultsBox = $("#searchResults");

  resultsBox.empty();

  if (!query) {
    resultsBox.hide();
    return;
  }

  const matches = bookList.filter(book =>
    book.title.toLowerCase().includes(query) ||
    book.author.toLowerCase().includes(query)
  );

  if (matches.length === 0) {
    resultsBox.hide();
    return;
  }

  matches.slice(0, 10).forEach(book => {
    const index = bookList.indexOf(book);

    resultsBox.append(`
      <div class="searchItem" data-index="${index}">
        <strong>${book.title}</strong>
        <small>${book.author}</small>
      </div>
    `);
  });

  resultsBox.show();
});

//adding function to the search bar
$(document).on("click", ".searchItem", function () {
  const index = $(this).data("index");
  const book = bookList[index];

  openBookModal(book, index);

  $("#searchResults").hide();
  $("#searchInput").val("");
});

//favorite logic

const FAVORITES_KEY = "favoriteBooks";

function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}

function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}

function isFavorite(workId) {
  return getFavorites().some(book => book.workId === workId);
}

function toggleFavorite(book) {
  let favs = getFavorites();

  const existingIndex = favs.findIndex(b => b.workId === book.workId);

  if (existingIndex !== -1) {
    // remove from favorites
    favs.splice(existingIndex, 1);
  } else {
// storing the whole object to show in favorites
    favs.push({
      title: book.title,
      author: book.author,
      year: book.year,
      workId: book.workId,
      coverKey: book.coverKey,
      description: book.description
    });
  }

  saveFavorites(favs);
}

$("#modalFavBtn").on("click", function () {
  const index = $("#bookModal").data("index");
  const book = bookList[index];

  toggleFavorite(book);
  updateAllFavoriteIcons(book.workId);
});

function updateAllFavoriteIcons(workId) {
  const isFav = isFavorite(workId);

  // update all book cards
  $(".book").each(function () {
    const index = $(this).data("index");
    if (bookList[index].workId === workId) {
      $(this).find(".fav-btn i")
        .attr("class", isFav ? "fa-solid fa-heart" : "fa-regular fa-heart");
    }
  });

  // update modal heart
  $("#modalFavBtn i")
    .attr("class", isFav ? "fa-solid fa-heart" : "fa-regular fa-heart");
}