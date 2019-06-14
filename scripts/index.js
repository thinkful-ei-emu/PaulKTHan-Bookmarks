'use strict';
/* global bookmarkList, store, Item, Api */
// eslint-disable-next-line no-unused-vars
$(document).ready(function() {
  bookmarkList.bindEventListeners();
  bookmarkList.render();
  Api.getItems()
    .then((items) => {
      items.forEach((item) => store.addItem(item));
      bookmarkList.render();
    });
});