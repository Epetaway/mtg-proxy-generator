$(document).ready(function () {
    $('#search-button').on('click', function () {
      const query = $('#card-search').val().trim();
      if (query) {
        searchCards(query);
      }
    });
  
    function searchCards(query) {
      $('#search-results').empty();
      $.getJSON(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`, function (data) {
        if (data.data && data.data.length > 0) {
          data.data.forEach(card => {
            if (card.image_uris && card.image_uris.normal) {
              const cardDiv = $('<div class="card-result"></div>');
              const cardImg = $('<img>').attr('src', card.image_uris.small);
              const cardName = $('<p></p>').text(card.name);
              cardDiv.append(cardImg, cardName);
              cardDiv.on('click', function () {
                addToGallery(card.image_uris.normal);
              });
              $('#search-results').append(cardDiv);
            }
          });
        } else {
          $('#search-results').text('No results found.');
        }
      });
    }
  
    function addToGallery(imageUrl) {
      const img = $('<img>').attr('src', imageUrl);
      const card = $('<div class="card"></div>').append(img);
      $('#gallery').append(card);
    }
  });
  