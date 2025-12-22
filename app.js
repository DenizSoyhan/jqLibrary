//get the books
let bookList = []

$.getJSON(
    "https://openlibrary.org/search.json?q=classic&limit=45",
    function (data) {
      data.docs.slice(0,25).forEach(i =>{
        console.log(i)      }) 
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
        console.log(bookList);
      });

  })

  function createShelfElements(aBookList){


    for(let i = 0; i < (aBookList.length/3) ;i++){
      const shelf = $("<div>").addClass("shelf");
      $("#bookCase").append(
        shelf
      )
    }
    let listOfShelves = document.querySelectorAll(".shelf");
    
    createBookElements(listOfShelves,aBookList);

    
    
    
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

//MODAL LOGIC

$(document).on("click", ".book", function () {
  const index = $(this).data("index");
  const book = bookList[index];

  const coverUrl = book.coverKey
    ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg`
    : "/images/placeHolder.png";

  $("#modalCover").attr("src", coverUrl);
  $("#modalTitle").text(book.title);
  $("#modalAuthor").text(`by ${book.author}`);
  $("#modalYear").text(book.year ? `Published: ${book.year}` : "");
  $("#modalDescription").text(book.description || "Loading description…");

  $("#modalDescription").text(
    truncate(book.description, 900)
  );
  
  $("#bookModal").removeClass("hidden");
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


  
