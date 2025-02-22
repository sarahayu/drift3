import { useContext } from "react";
import { GutsContext } from 'context/GutsContext';
import { bytesToMB, ENTER_KEY, prevDefStopProp, prevDefStopPropCb } from "utils/Utils";

function FileListItem({ id, opened, grabbed, title, size, toggleOpenDoc, onDragStart, onDragEnter, onDragEnd }) {

    const { deleteDoc } = useContext(GutsContext);

    const getClasses = () => `list-item ${opened ? 'active' : ''} ${grabbed ? 'grabbed' : ''}`;
    const getTooltip = () => `${title}\nSize: ${bytesToMB(size)}MB`;

    const enterKeyToggleOpen = ev => {
        if (ev.target === ev.currentTarget && ev.keyCode == ENTER_KEY) {
            ev.preventDefault();
            ev.stopPropagation();
            toggleOpenDoc(id);
        }
    };

    const handleDeleteDoc = ev => {
        ev.stopPropagation();
        deleteDoc(id);
    };

    return (
        <li className={ getClasses() } title={ getTooltip() } tabIndex={ 0 }
            onPointerOver={ () => onDragEnter(id) } onClick={ () => toggleOpenDoc(id) }
            onKeyDown={ enterKeyToggleOpen }>
            <img onMouseDown={ prevDefStopPropCb(() => onDragStart(id)) } onClick={ prevDefStopProp }
                src="hamburger.svg" alt="drag indicator" draggable={ false } title="Drag to change order of document" />
            <span>{ title }</span>
            <button className="deleter" onClick={ handleDeleteDoc }>
                <img src="delete.svg" alt="delete icon" draggable={ false } />
            </button>
        </li>
    );
}

export default FileListItem;