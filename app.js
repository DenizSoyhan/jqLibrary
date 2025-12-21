//get the books
$.getJSON(
    "https://openlibrary.org/search.json?q=classic&limit=25",
    function (data) {
      data.docs.slice(0,25).forEach(i =>{
        console.log(i)      })  
      const books = data.docs.slice(0, 25).map(book => (     
    {
    
        title: book.title,
        author: book.author_name ? book.author_name[0] : "Unknown",
        year: book.first_publish_year || null,
        isbn: book.isbn ? book.isbn[0] : null,
        olid: book?.[0] || null, // OLID for images
        coverKey: book.cover_edition_key || null // example URL: https://covers.openlibrary.org/b/olid/OL46536526M-S.jpg
      }));

      //extract images 
      books.forEach(book => {
        const coverUrl = book.coverKey ? `https://covers.openlibrary.org/b/olid/${book.coverKey}-L.jpg` : '/images/placeHolder.png';

        //add elements by one by
        $("#list").append(`
          <div class="book">
            <img src="${coverUrl}" onerror="this.src='no-cover.png'">
            <h4>${book.title}</h4>
            <p>${book.author} (${book.year})</p>
          </div>
        `);
      });

      console.log(books);
    }
  );




  
  