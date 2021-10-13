import { createContext, useState } from 'react'
import jsTPS from '../common/jsTPS'
import api from '../api'
import MoveItem_Transaction from '../transactions/MoveItem_Transaction'
import ChangeItemTransaction from '../transactions/ChangeItemTransaction'
export const GlobalStoreContext = createContext({});
/*
    This is our global data store. Note that it uses the Flux design pattern,
    which makes use of things like actions and reducers. 
    
    @author McKilla Gorilla
*/

// THESE ARE ALL THE TYPES OF UPDATES TO OUR GLOBAL
// DATA STORE STATE THAT CAN BE PROCESSED
export const GlobalStoreActionType = {
    CHANGE_LIST_NAME: "CHANGE_LIST_NAME",
    CLOSE_CURRENT_LIST: "CLOSE_CURRENT_LIST",
    LOAD_ID_NAME_PAIRS: "LOAD_ID_NAME_PAIRS",
    SET_CURRENT_LIST: "SET_CURRENT_LIST",
    SET_LIST_NAME_EDIT_ACTIVE: "SET_LIST_NAME_EDIT_ACTIVE",
    SET_DELETE_LIST: "SET_DELETE_LIST",
    CREATE_NEW_LIST: "CREATE_NEW_LIST",
    SET_ITEM_ACTIVE: "SET_ITEM_ACTIVE"
}

// WE'LL NEED THIS TO PROCESS TRANSACTIONS
const tps = new jsTPS();

// WITH THIS WE'RE MAKING OUR GLOBAL DATA STORE
// AVAILABLE TO THE REST OF THE APPLICATION
export const useGlobalStore = () => {
    // THESE ARE ALL THE THINGS OUR DATA STORE WILL MANAGE
    const [store, setStore] = useState({
        idNamePairs: [],
        currentList: null,
        newListCounter: 0,
        listNameActive: false,
        isItemEditActive: false,
        listMarkedForDeletion: null,
        listCreated: false,
        hasUndo: tps.hasTransactionToUndo(), 
        hasRedo: tps.hasTransactionToRedo() 
    });

    // HERE'S THE DATA STORE'S REDUCER, IT MUST
    // HANDLE EVERY TYPE OF STATE CHANGE
    const storeReducer = (action) => {
        let { type, payload } = action;
        switch (type) {
            // LIST UPDATE OF ITS NAME
            case GlobalStoreActionType.CHANGE_LIST_NAME: {
                return setStore({
                    idNamePairs: payload.idNamePairs,
                    currentList: payload.top5List,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            // STOP EDITING THE CURRENT LIST
            case GlobalStoreActionType.CLOSE_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: null,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                })
            }
            // GET ALL THE LISTS SO WE CAN PRESENT THEM
            case GlobalStoreActionType.LOAD_ID_NAME_PAIRS: {
                //For deleting a list: if the deleted list wasn't also the 
                //current list, then make sure to not set currentList to null 
                let isCurrent = null;
                if (typeof payload.isCurrent !== 'undefined'){
                    isCurrent = store.currentList;
                    //If .isCurrent exists, that means deleteMarkedList 
                    //called this type. So payload has to be set to .pairs to setStore
                    payload = payload.pairs;
                }
                return setStore({
                    idNamePairs: payload,
                    currentList: isCurrent,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: store.isListNameEditActive,
                    isItemEditActive: store.isItemEditActive,
                    listMarkedForDeletion: store.listMarkedForDeletion,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            // UPDATE A LIST
            case GlobalStoreActionType.SET_CURRENT_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            // START EDITING A LIST NAME
            case GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: payload,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: true,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            //If a user clicked on a item, set itemEditActive to true
            case GlobalStoreActionType.SET_ITEM_ACTIVE: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    isListNameEditActive: false,
                    isItemEditActive: true,
                    listMarkedForDeletion: null,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            case GlobalStoreActionType.SET_DELETE_LIST: {
                return setStore({
                    idNamePairs: store.idNamePairs,
                    currentList: store.currentList,
                    newListCounter: store.newListCounter,
                    listMarkedForDeletion: payload,
                    isItemEditActive: store.isItemEditActive,
                    isListNameEditActive: store.isListNameEditActive,
                    listCreated: false,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            //If a new list is created, make sure to update the new list counter
            //to reflect this, along with the keyname pairs, currentList references, and 
            //listCreated boolean (so that this new list can be in edit mode right away)
            case GlobalStoreActionType.CREATE_NEW_LIST: {
                return setStore({
                    currentList: payload.currList,
                    newListCounter: store.newListCounter+1,
                    idNamePairs: payload.pairs,
                    isListNameEditActive: false,
                    isItemEditActive: false,
                    listMarkedForDeletion: null,
                    listCreated: true,
                    hasUndo: tps.hasTransactionToUndo(), 
                    hasRedo: tps.hasTransactionToRedo() 
                });
            }
            //Update the name of the current delete modal, so tht it shows in the modal
            default:
                return store;
        }
    }
    store.createNewList = function() {
        async function asyncCreateNewList() {
            //Create and add a new list to the database with payload being the current list counter
            let name = "Untitled " + store.newListCounter;
            let pair = ["?", "?", "?", "?", "?"];
            //Send in a object with name, and pair as a payload
            let response = await api.createTop5List({name: name, items: pair});
            if (response.data.success){
                    let top5List = response.data.top5List;
                    response = await api.getTop5ListPairs();
                        if (response.data.success){
                            let pairs = response.data.idNamePairs;
                            storeReducer({
                                type: GlobalStoreActionType.CREATE_NEW_LIST,
                                payload: {currList : top5List, pairs: pairs}
                            });
                        }
            }
        }
        asyncCreateNewList();
    }
    // THESE ARE THE FUNCTIONS THAT WILL UPDATE OUR STORE AND
    // DRIVE THE STATE OF THE APPLICATION. WE'LL CALL THESE IN 
    // RESPONSE TO EVENTS INSIDE OUR COMPONENTS.
    store.setCurrentList = function (id) {
        async function asyncSetCurrentList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                response = await api.updateTop5ListById(top5List._id, top5List);
                if (response.data.success) {
                    storeReducer({
                        type: GlobalStoreActionType.SET_CURRENT_LIST,
                        payload: top5List
                    });
                    store.history.push("/top5list/" + top5List._id);
                }
            }
        }
        asyncSetCurrentList(id);
    }
    // THIS FUNCTION PROCESSES CHANGING A LIST NAME
    store.changeListName = function (id, newName) {
        // GET THE LIST
        async function asyncChangeListName(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                top5List.name = newName;
                async function updateList(top5List) {
                    response = await api.updateTop5ListById(top5List._id, top5List);
                    if (response.data.success) {
                        async function getListPairs(top5List) {
                            response = await api.getTop5ListPairs();
                            if (response.data.success) {
                                let pairsArray = response.data.idNamePairs;
                                storeReducer({
                                    type: GlobalStoreActionType.CHANGE_LIST_NAME,
                                    payload: {
                                        idNamePairs: pairsArray,
                                        top5List: top5List
                                    }
                                });
                            }
                        }
                        getListPairs(top5List);
                    }
                }
                updateList(top5List);
            }
        }
        asyncChangeListName(id);
    }
    // THIS FUNCTION PROCESSES CLOSING THE CURRENTLY LOADED LIST
    store.closeCurrentList = function () {
        //Make sure to clear the transaction stack upon a close
        tps.clearAllTransactions();
        storeReducer({
            type: GlobalStoreActionType.CLOSE_CURRENT_LIST,
            payload: {}
        });
    }

    // THIS FUNCTION LOADS ALL THE ID, NAME PAIRS SO WE CAN LIST ALL THE LISTS
    store.loadIdNamePairs = function () {
        async function asyncLoadIdNamePairs() {
            const response = await api.getTop5ListPairs();
            if (response.data.success) {
                let pairsArray = response.data.idNamePairs;
                storeReducer({
                    type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                    payload: pairsArray
                });
            }
            else {
                console.log("API FAILED TO GET THE LIST PAIRS");
            }
        }
        asyncLoadIdNamePairs();
    }
    //This function updates the list marked for deletion, so that the name of it
    //can be shown in the delete modal before possibly being deleted
    store.setDeleteList = function (id) {
        async function asyncSetDeleteList(id) {
            let response = await api.getTop5ListById(id);
            if (response.data.success) {
                let top5List = response.data.top5List;
                //If the right list is able to be retrieved from the db, then call storeReducer w 
                //the list as the payload
                storeReducer({
                    type: GlobalStoreActionType.SET_DELETE_LIST,
                    payload: top5List
                });
            }
        }
        asyncSetDeleteList(id);
    }
    store.hideDeleteListModal = function () {
        let modal = document.getElementById("delete-modal");
        modal.classList.remove("is-visible");
    }
    store.showDeleteModal = function(){
        let modal = document.getElementById("delete-modal");
        modal.classList.add("is-visible");
    }
    store.deleteMarkedList = function() {
        async function asyncDeleteMarkedList(){
            //If the marked delete list is equal to the current list, make sure to close 
            //the UI after deleting this list
            let isEqual = false;
            if (store.listMarkedForDeletion && store.currentList){
                isEqual = store.listMarkedForDeletion._id === store.currentList._id;
            }
            let response = await api.deleteTop5ListById(store.listMarkedForDeletion._id).then(async function(){
                    //Make sure the delete  modal is dismissed
                    store.hideDeleteListModal();
                    let response2 = await api.getTop5ListPairs().then(response2 => function(){
                            let newPairs = response2.data.idNamePairs;
                            storeReducer({
                                type: GlobalStoreActionType.LOAD_ID_NAME_PAIRS,
                                payload: {pairs: newPairs, isCurrent: isEqual}
                            });
                        });
                    });
                }
        asyncDeleteMarkedList();
    }
    // THE FOLLOWING 8 FUNCTIONS ARE FOR COORDINATING THE UPDATING
    // OF A LIST, WHICH INCLUDES DEALING WITH THE TRANSACTION STACK. THE
    // FUNCTIONS ARE setCurrentList, addMoveItemTransaction, addUpdateItemTransaction,
    // moveItem, updateItem, updateCurrentList, undo, and redo
    store.addMoveItemTransaction = function (start, end) {
        let transaction = new MoveItem_Transaction(store, start, end);
        tps.addTransaction(transaction);
    }
    store.moveItem = function (start, end) {
        start -= 1;
        end -= 1;
        if (start < end) {
            let temp = store.currentList.items[start];
            for (let i = start; i < end; i++) {
                store.currentList.items[i] = store.currentList.items[i + 1];
            }
            store.currentList.items[end] = temp;
        }
        else if (start > end) {
            let temp = store.currentList.items[start];
            for (let i = start; i > end; i--) {
                store.currentList.items[i] = store.currentList.items[i - 1];
            }
            store.currentList.items[end] = temp;
        }

        // NOW MAKE IT OFFICIAL
        store.updateCurrentList();
    }
    store.updateCurrentList = function() {
        async function asyncUpdateCurrentList() {
            const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
            if (response.data.success) {
                storeReducer({
                    type: GlobalStoreActionType.SET_CURRENT_LIST,
                    payload: store.currentList
                });
            }
        }
        asyncUpdateCurrentList();
    }
    store.undo = function () {
        tps.undoTransaction();
    }
    store.redo = function () {
        tps.doTransaction();
    }

    // THIS FUNCTION ENABLES THE PROCESS OF EDITING A LIST NAME
    store.setIsListNameEditActive = function () {
        storeReducer({
            type: GlobalStoreActionType.SET_LIST_NAME_EDIT_ACTIVE,
            payload: null
        });
    }
    store.setItemActive = function() {
        storeReducer({
            type: GlobalStoreActionType.SET_ITEM_ACTIVE,
            payload: store.currentList
        })
    }
    store.addChangeItemTransaction = function(id, newName){
        let oldText = store.currentList.items[id-1];
        let transaction = new ChangeItemTransaction(store, id, oldText, newName);
        tps.addTransaction(transaction);
    }
    store.changeItemName = async function(id, newName) {
        store.currentList.items[id-1] = newName;
        const response = await api.updateTop5ListById(store.currentList._id, store.currentList);
        if (response.data.success){
            storeReducer({
                type: GlobalStoreActionType.SET_CURRENT_LIST,
                payload: store.currentList
            });
        }
    }
    // THIS GIVES OUR STORE AND ITS REDUCER TO ANY COMPONENT THAT NEEDS IT
    return { store, storeReducer };
}