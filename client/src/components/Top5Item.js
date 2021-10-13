import { React, useContext, useState, } from "react";
import { GlobalStoreContext } from '../store'
/*
    This React component represents a single item in our
    Top 5 List, which can be edited or moved around.
    
    @author McKilla Gorilla
*/
function Top5Item(props) {
    const { store } = useContext(GlobalStoreContext);
    const [draggedTo, setDraggedTo] = useState(0);
    //Like ListCard, have a sttae variable called editActive with its own setter
    const [editActive, setEditActive] = useState(false);
    const [text, setText] = useState("");
    function handleDragStart(event) {
        event.dataTransfer.setData("item", event.target.id);
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDragEnter(event) {
        event.preventDefault();
        setDraggedTo(true);
    }

    function handleDragLeave(event) {
        event.preventDefault();
        setDraggedTo(false);
    }

    function handleDrop(event) {
        event.preventDefault();
        let target = event.target;
        let targetId = target.id;
        targetId = targetId.substring(target.id.indexOf("-") + 1);
        let sourceId = event.dataTransfer.getData("item");
        sourceId = sourceId.substring(sourceId.indexOf("-") + 1);
        setDraggedTo(false);

        // UPDATE THE LIST
        store.addMoveItemTransaction(sourceId, targetId);
    }
    function handleToggleEdit(event){
        event.stopPropagation();
        toggleEdit();
    }
    function toggleEdit(){
        let newActive = !editActive;
        if (newActive) {
            store.setItemActive();
        }
        setEditActive(newActive);
    }
    function handleKeyPress(event){
        if (event.code === "Enter") {
            handleBlur(event);
        }
    }
    function handleBlur(event){
        let id = event.target.id.substring("item-".length);
        store.addChangeItemTransaction(id, text);
        toggleEdit();
    } 
    function handleUpdateText(event){
        setText(event.target.value);
    }
    let { index } = props;
    let itemClass = "top5-item";
    if (draggedTo) {
        itemClass = "top5-item-dragged-to";
    }
    let item = 
        <div
            id={'item-' + (index + 1)}
            className={itemClass}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            draggable="true"
        >
            <input
                type="button"
                id={"edit-item-" + index + 1}
                className="list-card-button"
                value={"\u270E"}
                onClick={handleToggleEdit}
            />
            {props.text}
        </div>;
    if (editActive){
        item = 
            <input
                id={"item-" + index + 1}
                className='top5-item'
                type='text'
                onKeyPress={handleKeyPress}
                onBlur={handleBlur}
                defaultValue={props.text}
                onChange={handleUpdateText}
        />
    }
    return (
        item
    );
}

export default Top5Item;