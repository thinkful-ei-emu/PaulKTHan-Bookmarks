'use strict';
/* global Item*/
// eslint-disable-next-line no-unused-vars

$.fn.extend({
  serializeJson: function() {
    const formData = new FormData(this[0]);
    const o = {};
    formData.forEach((val, name) => o[name] = val);
    return JSON.stringify(o);
  }
});

const store = (function(){
  const addItem = function(item) {
    this.items.push(item);
  };

  const findById = function(id) {
    return this.items.find(item => item.id === id);
  };

  const findAndUpdate = function(id,newData){
    const foundItem=this.items.find((item)=>item.id===id);
    const originallyExpanded=foundItem.expanded;
    Object.assign(foundItem,newData);
    if(originallyExpanded && !foundItem.expanded){
      foundItem.isEditing=false;
    }


  };

  const findAndDelete = function(id) {
    this.items = this.items.filter(item => item.id !== id);
  };

  const toggleCheckedFilter = function() {
    this.hideCheckedItems = !this.hideCheckedItems;
  };

  const setItemIsEditing = function(id, isEditing) {
    const item = this.findById(id);
    item.isEditing = isEditing;
  };

  const setSearchTerm = function(term) {
    this.searchTerm = term;
  };

  const setErrorKey = function(errormessage){
    this.errorKey=errormessage;
  };

  const setRatingFilter = function(filter){
    this.ratingFilter=filter;
  };

  return {
    items: [],
    hideCheckedItems: false,
    ratingFilter: 1,
    errorKey : '',
    addItem,
    findById,
    findAndDelete,
    findAndUpdate,
    toggleCheckedFilter,
    setSearchTerm,
    setItemIsEditing,
    setErrorKey,
    setRatingFilter,
  };
  
}());
