'use strict';

const list = (function() {


  function generateItemString(bookmarklist) {
    let entries = bookmarklist.map((item) => generateItemHTML(item));
    return entries.join('');
  }

  function getId(bookmark) {
    return $(bookmark)
      .closest('.bookmark-element')
      .data('item-id');
  }

  function generateForm() {
    return `<form id="add-form">
    <fieldset>
    <div><label for="title"><span>Title</span></label></div>
    <div><input name="title" id="title" type="text" placeholder="Reddit" required></div>

      <div><label for="url"><span>URL</span></label></div>
      <div><input name="url" id="url" type="url" placeholder="https://www.reddit.com"required></div>

      <div><label for="desc"><span>Description</span></label></div>
      <div><textarea name="desc"type="textarea" placeholder="A short description of the website"></textarea></div>

      <div><label for="rating"><span>Rating</span></label></div>
      <div><select name="rating"id="rating"></div>
      <option value=''>Select Rating</option>
      <option value="1">&#x2605;</option> 
      <option value="2">&#x2605;&#x2605;</option>
      <option value="3">&#x2605;&#x2605;&#x2605;</option>
      <option value="4">&#x2605;&#x2605;&#x2605;&#x2605;</option>
      <option value="5">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605;</option>
    </select></div>
    </fieldset>
    <button class="button" type="submit">Submit</button>
    <button class="button" id="cancel">Cancel</button>
  </form>`;
  }

  function handleCancelAdd() {
    $('body').on('click', '#cancel', function() {
      store.resetAdd();
      render();
    });
  }

  function addForm() {
    $('#main-add').click(function(){
      store.addState();
      let form = generateForm();
      $('.add-item').html(form);
      handleCancelAdd();
    });
  }
  

  function generateError(message) {
    return `
      <section class="error">
        <button id="cancel-error">X</button>
        <p>${message}</p>
      </section>
    `;
  }

  function renderError() {
    if (store.error) {
      const el = generateError(store.error);
      $('.error').html(el);
    }
    else {
      $('.error').empty();
    }
  }

  function generateItemHTML(bookmark) {
    const expanded = bookmark.expanded ? '' : 'hidden';

    let starRating;
    
    switch(bookmark.rating) {
    case 1:
      starRating =
           `<span class="fa fa-star checked"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>`;
      break;
    case 2:
      starRating = 
         `<span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>`;
      break;

    case 3:
      starRating =
         `<span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star"></span>
          <span class="fa fa-star"></span>`;
      break;

    case 4:
      starRating = 
          `<span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star checked"></span>
          <span class="fa fa-star"></span>`;
      break;
    case 5: 
      starRating =
        `<span class="fa fa-star checked"></span>
        <span class="fa fa-star checked"></span>
        <span class="fa fa-star checked"></span>
        <span class="fa fa-star checked"></span>
        <span class="fa fa-star checked"></span>`;
      break;

    }

    if (bookmark.expanded === true) {
      return `<li class="bookmark-element" data-item-id="${bookmark.id}"> 
      <div class="star-rating">Your rating: ${starRating}</div>
      <div class="title-element"><p><a target="_blank" href="${bookmark.url}">${bookmark.title}</p></a></div>
      <div class = "bookmark-info ${expanded}">
          <p>${bookmark.desc}</p>
          <div class="visit">
            <a target="_blank" href="${bookmark.url}">Visit Site</a>
          </div>
        </div>
      <div  class="bookmark-controls">
          <button class="item-controls expand">Less</button>
          <button class="item-controls delete">Delete</button>
      </div>
    </li>`;
    }

    else { 
      return `<li class="bookmark-element" data-item-id="${bookmark.id}"> 
      <div class="star-rating">Your rating: ${starRating}</div>
      <div class="title-element"><p><a target="_blank" href="${bookmark.url}">${bookmark.title}</p></a></div>
      <div  class="bookmark-controls">
          <button class="expand">More</button>
      </div>
    </li>`;
    }
  }

  function render() {
    let bookmarksStore = [...store.bookmarks];

    if (store.adding === true) {
      const bookmarksString = generateForm();
      $('.add-item').html(bookmarksString);
    } else {
      $('.add-item').empty();
    }

    if (store.filterVal !== undefined) {
      bookmarksStore = bookmarksStore.filter(bookmark => bookmark.rating >= store.filterVal);
    }
    const bookmarksString = generateItemString(bookmarksStore);
    $('.list-display').html(bookmarksString);
  }

  function serializeJson(form) {
    const formData = new FormData(form);
    const o = {};
    formData.forEach((val, name) => o[name]=val);
    return o;
  }

  function handleBookmarkSubmit() {
    $('body').on('submit', '#add-form', function(event) {
      event.preventDefault();
      store.resetAdd();
      let form = document.querySelector('#add-form');
      let item = serializeJson(form);
      let newItem = bookmark.create(item);
      api.createBookmark(newItem)
        .then(res => {
          if (res.ok) {
            return res.json();
          }
          throw new Error(res.statusText);
        })
        .then(resJson => {
          let storeJson = resJson;
          storeJson.expanded = false;
          store.addBookmark(storeJson);
          render();
        })
        .catch((err) => {
          store.setError(err.message);
          renderError();
        });
    });
  }


  function handleBookmarkDelete() {
    $('.list-display').on('click', '.delete', function(event) {
      const id = getId(event.currentTarget);
      api.deleteBookmark(id)
        .then(()=> {
          store.deleteBookmark(id);
          render();
        })
        .catch((err) => {
          store.setError(err.message);
          renderError();
        });
    });
  }



  function handleFilter() {
    $('#main-filter').on('mouseup', function() {
      let filterVal = $('#main-filter').val();
      store.filterAdd(filterVal);
      render();
    });
  }


  function toggleExtended(bookmark) {
    bookmark.expanded = !bookmark.expanded;
  }


  function handleBookmarkExpand() {
    $('.list-display').on('click', '.expand', function(event) {
      const id = getId(event.currentTarget);
      const bookmark = store.findBookmark(id);
      toggleExtended(bookmark);
      render();
    });
  }

  function eventListeners() {
    handleBookmarkExpand();
    handleBookmarkDelete();
    addForm();
    handleFilter();
    handleBookmarkSubmit();
   
  }



  return {
    eventListeners,
    render
  };




})();