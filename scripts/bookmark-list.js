'use strict';
/* global store, $, Api */

// eslint-disable-next-line no-unused-vars
const bookmarkList = (function(){

  function generateItemElement(item) {
    const theRating = item.rating? item.rating : 'Rating not found';
    let itemRating='<span class="bookmark-item-rating">';
    if(theRating!=='Rating not found'){
      let numStars=parseInt(theRating);
      for(let i=0;i<numStars;i++){
        itemRating+='<span class="fa fa-star colorOrange"></span>';
      }
      for(let i=0;i<5-numStars;i++){
        itemRating+='<span class="fa fa-star"></span>';
      }
    }
    else{
      itemRating+=`Rating: ${theRating}`;
    }
    itemRating+='</span>';
    const theDescription = item.desc? item.desc : 'Description not found';
    let itemTitle = `<span class="bookmark-item-title">${item.title}</span>`;
    let itemDescription = `<span class="bookmark-item-desc">Description: ${theDescription}</span>`;
    let itemURL = `<a href="${item.url}">Visit site</a>`;
    //let itemRating=`<span class="bookmark-item-rating">Rating: ${theRating}</span>`;


    if (item.isEditing) {
      itemRating = `
        <form class="js-edit-item">
          <label for="bookmark-item-rating${item.id}">Rating:</label><br>
          <select name="new rating" id="bookmark-item-rating${item.id}" class="bookmark-item-rating">
      `;
      for(let i=1;i<6;i++){
        if(parseInt(theRating)===i){
          itemRating+=`<option value="${i}" selected>${i}</option>`;
        }
        else{
          itemRating+=`<option value="${i}">${i}</option>`;
        }
      }
      itemRating+='</select>';
      itemDescription =`
        <label for="bookmark-item-desc${item.id}">Description:</label><br>
        <textarea id="bookmark-item-desc${item.id}" class="bookmark-item-desc" rows="3">${theDescription}
        </textarea>
        <br>
        <button type='submit'> Submit edits </button>
      </form>
    `;
    }
    let itemDetails=`${itemTitle}<br>${itemRating}`;
    itemDetails+= item.expanded? `<br>${itemDescription}<br>${itemURL}` :  '';

    let expandOrDeflate=item.expanded? 'Collapse' : 'Expand';
    let constantButtons=` 
    <button class="bookmark-item-toggle js-item-toggle">
      <span class="button-label">${expandOrDeflate}</span>
    </button>
    <button class="bookmark-item-delete js-item-delete">
      <span class="button-label">Delete</span>
    </button>`;
    let editButton=item.expanded? `
    <button class="bookmark-item-edit js-item-edit">
      <span class="button-label">
        Edit
      </span>
    </button>` : '';
    return `
      <li class="js-item-element" data-item-id="${item.id}">
        ${itemDetails}
        <div class="bookmark-item-controls">
          ${constantButtons}
          ${editButton}
        </div>
      </li>`;
  }
  
  
  function generatebookmarkItemsString(bookmarkList) {
    const items = bookmarkList.map((item) => generateItemElement(item));
    return items.join('');
  }
  
  
  function render() {
    // Filter item list if store prop is true by item.checked === false
    if(store.errorKey){
      $('.error-message').html(`${store.errorKey} <br>`);
      $('.error-pop').removeClass('hidden');
    }
    let items = [ ...store.items ];
    console.log(items);
    // Filter item list by stars
    if (store) {
      items = items.filter(item => {
        if(item['rating']>=store.ratingFilter){
          return true;
        }
        if(item['rating']===null){
          return true;
        }
      });
    }
  
    // render the bookmark list in the DOM
    console.log('`render` ran');
    const bookmarkListItemsString = generatebookmarkItemsString(items);
    store.setErrorKey('');
  
    // insert that HTML into the DOM
    $('.js-bookmark-list').html(bookmarkListItemsString);
  }
  
  function handleCloseNewItemForm(){
    $('#js-make-add-form-disappear').on('click', (e)=>{
      e.preventDefault();
      $('#js-add-bookmark-form').addClass('hidden');
      $('#js-make-add-form-appear').removeClass('hidden');
      $('.declare-add-button').removeClass('hidden');
    });
  }


  function handleNewItemSubmit() {
    $('#js-add-bookmark-form-submit').on('click',function (event) {
      event.preventDefault();
      Api.createItem($(event.currentTarget).closest('form'))
        .then(response=> {
          store.addItem(response);
          $('#js-add-bookmark-form').addClass('hidden');
          $('#js-make-add-form-appear').removeClass('hidden');
          $('.declare-add-button').removeClass('hidden');
          $('.js-bookmark-title-entry').val('');
          $('.js-bookmark-url-entry').val('');
          $('.js-bookmark-desc-entry').val('');
          $('.js-bookmark-rating-entry').val(1);
          render();

        })
        .catch(error=>{
          store.setErrorKey(`Unable to add. ${error.message}`);
          render();
        });
        
      
    });
  }
  
  function getItemIdFromElement(item) {
    return $(item)
      .closest('.js-item-element')
      .data('item-id');
  }
  
  function handleItemExpandClicked() {
    $('.js-bookmark-list').on('click', '.js-item-toggle', event => {
      const id = getItemIdFromElement(event.currentTarget);
      const foundItem = store.findById(id);
      const updateObj = {
        expanded: !foundItem.expanded,
      };
      store.findAndUpdate(id, updateObj);
      render();
    });
  }
  
  function handleDeleteItemClicked() {
    $('.js-bookmark-list').on('click', '.js-item-delete', event => {
      const id = getItemIdFromElement(event.currentTarget);
      Api.deleteItem(id)
        .then(()=> {
          store.findAndDelete(id);
          render();
        })
        .catch(error=>{
          store.setErrorKey(`Unable to delete. ${error.message}`);
          render();
        });
    });
  }
  
  function handleEditBookmarkItemSubmit() {
    $('.js-bookmark-list').on('submit', '.js-edit-item', event => {
      event.preventDefault();
      const id = getItemIdFromElement(event.currentTarget);
      const newName = {
        rating: $(event.currentTarget).find('.bookmark-item-rating').val(),
        desc: $(event.currentTarget).find('.bookmark-item-desc').val()
      };
      Api.updateItem(id, newName)
        .then(()=>{
          store.findAndUpdate(id, newName);
          store.findById(id).isEditing=false;
          render();
        })
        .catch(error=>{
          store.setErrorKey(`Unable to edit. ${error.message}`);
          render();
        });
      
    });
  }


  function handleItemStartEditing() {
    $('.js-bookmark-list').on('click', '.js-item-edit', event => {
      const id = getItemIdFromElement(event.target);
      const foundItem=store.findById(id);
      store.setItemIsEditing(id, !foundItem.isEditing);
      render();
    });
  }

  function handleCloseErrorPop(){
    $('.error-pop').on('click','.error-close', (e)=>{
      e.preventDefault();
      $(e.delegateTarget).addClass('hidden');
      $(e.delegateTarget).children('p').html('');
      store.setErrorKey('');
    });
  }

  function handleAddBookmarkToggle(){
    $('#js-make-add-form-appear').on('click',(e)=>{
      e.preventDefault();
      $('#js-add-bookmark-form').removeClass('hidden');
      $('#js-make-add-form-appear').addClass('hidden');
      $('.declare-add-button').addClass('hidden');
    });
  }

  function handleFilterByRating(){
    $('#js-ratings-select').on('click',(e)=>{
      e.preventDefault();
      store.setRatingFilter($('#js-ratings-select').val());
      render();
    });
  }
  
  function bindEventListeners() {
    handleNewItemSubmit();
    handleItemExpandClicked();
    handleDeleteItemClicked();
    handleEditBookmarkItemSubmit();
    handleItemStartEditing();
    handleCloseErrorPop();
    handleAddBookmarkToggle();
    handleFilterByRating();
    handleCloseNewItemForm();
  }

  // This object contains the only exposed methods from this module:
  return {
    render: render,
    bindEventListeners: bindEventListeners,
  };
}());
