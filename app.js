//get the books
let bookList = []

$.getJSON(
    "https://openlibrary.org/search.json?q=classic&limit=45",
    function (data) {
      /*data.docs.slice(0,25).forEach(i =>{
        console.log(i)      })*/ 
      const books = data.docs.slice(0, 45).map(book => (     
    {
    
        title: book.title,
        author: book.author_name ? book.author_name[0] : "Unknown",
        year: book.first_publish_year || null,
        isbn: book.isbn ? book.isbn[0] : null,
        olid: book?.[0] || null, // OLID for images
        coverKey: book.cover_edition_key || null // example URL: https://covers.openlibrary.org/b/olid/OL46536526M-S.jpg
      }));

      //extract images 
      bookList = books;
      createShelfElements(bookList);
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

      shelf.insertAdjacentHTML("beforeend", `
        <div class="book">
          <img src="${coverUrl}" onerror="this.src='/images/placeHolder.png'">
          <h4>${book.title}</h4>
          <p>${book.author} (${book.year ?? "N/A"})</p>
        </div>
      `);
    }
  });
}


  
