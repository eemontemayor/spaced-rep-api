function buildList(LL, head, arr) {

    if(!head) {
      return  LL;
    }
  
    LL.insertLast(head);
  
    const next = arr.filter(word => word.id === head.next);
  
    buildList(LL, next[0], arr);
  }



const ListService = {

 displayList(list){
    let currNode = list.head;
    while (currNode !== null) {
        console.log(currNode.value);
        currNode = currNode.next;
    }
},

 size(lst){
    let counter = 0;
    let currNode = lst.head;
    if(!currNode){
        return counter;
    }
    else
        counter++;
    while (!(currNode.next == null)) {
        counter++;
        currNode = currNode.next;
    }
    return counter;
},

 isEmpty(lst){
    let currNode = lst.head;
    if(!currNode){
        return true;
    }
    else {
        return false;
    }
},

 findPrevious(lst, item) {
     let currNode = lst.head;
     console.log('-------------------------------------')

     console.log(currNode)
     console.log('-------------------------------------')
     while ((currNode !== null) && (currNode.next !== item)) {
        currNode = currNode.next;
    }
    return currNode;
},

 findLast(lst){
    if(lst.head === null){
        return 'list is empty';
    } 
    let tempNode = lst.head;
    while(tempNode.next !== null){
        tempNode = tempNode.next;
    }
      return tempNode;
},


}
module.exports = { ListService, buildList };