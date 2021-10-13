import jsTPS_Transaction from "../common/jsTPS.js"

/**
 * ChangeItemTransaction
 * 
 * This class represents a transaction that updates the text
 * for a given item. It will be managed by the transaction stack.
 * 
 * @author McKilla Gorilla
 * @author ?
 */
export default class ChangeItemTransaction extends jsTPS_Transaction {
    constructor(initStore, initIndex, initOldText, initNewText) {
        super();
        this.store = initStore;
        this.index = initIndex;
        this.oldText = initOldText;
        this.newText = initNewText;
    }

    doTransaction() {
        this.store.changeItemName(this.index, this.newText);
    }
    
    undoTransaction() {
        this.store.changeItemName(this.index, this.oldText);
    }
}