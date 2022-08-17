import React, { Component, useEffect, useRef, useState } from 'react';
import axios from 'axios'
import { createPortal } from 'react-dom';

import Filelist from './Filelist';
import DocArea from './DocArea';
import MiscPortals from './MiscPortals'
import { GutsContext } from './GutsContext';
import { useQuery } from '@tanstack/react-query';
import loadGuts from './utils/Guts';
import { RESOLVING } from './utils/Utils';
import { getGentle, getInfos, getSettings } from './utils/Queries';

const FilelistPortal = () => createPortal(
    <Filelist />,
    document.getElementById('file-list')
);

const DocAreaPortal = () => createPortal(
    <DocArea />,
    document.getElementById('dashboard')
);

function App(props) {
    const infosLatestModified = useRef(0);
    
    const [ localhost ] = useState(location.hostname === 'localhost');    // eslint-disable-line no-restricted-globals
    const [ docs, setDocs ] = useState({});
    const [ guts ] = useState(() => loadGuts());
    const [ calcIntense, setCalcIntense ] = useState(RESOLVING);
    const [ gentlePort, setGentlePort ] = useState(RESOLVING);
    const [ foundGentle, setFoundGentle ] = useState(RESOLVING);
    const [ focusedDocID, setFocusedDocID ] = useState(null);

    // --- START init const functions

    const initSettings = () => {
        // get settings from server so we know some basic drift settings
        getSettings().then(({ calc_intense, gentle_port }) => {
            setCalcIntense(calc_intense);
            setGentlePort(gentle_port);
        })
    }

    const pushNewDocs = data => {        
        infosLatestModified.current = Math.max(infosLatestModified.current, ...data.map(doc => doc.modified_time));

        let newDocs = { ...docs };

        for (let doc of data) {
            if (newDocs[doc.id])
                Object.assign(newDocs[doc.id], doc);
            else
                newDocs[doc.id] = Object.assign(doc, { grabbed: false, opened: false });
        }
        
        setDocs(newDocs);
    };

    const findGentle = () => {
        if (gentlePort === RESOLVING)
            return;
            
        setFoundGentle(RESOLVING);
      
        if (localhost) {
            getGentle({ gentlePort })
                .then(() => {
                    console.log(`Gentle seems to be running! (on port ${ gentlePort })`);
                    setFoundGentle(true);
                })
                .catch(() => {
                    console.log(`Gentle not found on port ${ gentlePort }`);
                    setFoundGentle(false);
                });
        }
        
    };

    const printDocs = () => {
        console.log('from docs', docs);
    };

    const updateDoc = (docid, updatedAttrs) => {
        if (typeof updatedAttrs === 'function')
            setDocs(oldDocs => ({
                ...oldDocs,
                [docid]: {
                    ...oldDocs[docid],
                    ...updatedAttrs(oldDocs[docid]),
                }
            }));
        else
            setDocs(oldDocs => ({
                ...oldDocs,
                [docid]: {
                    ...oldDocs[docid],
                    ...updatedAttrs,
                }
            }));
    };

    const deleteDoc = docid => {
        console.log("TODO Appjs delete doc")
    };

    // --- END init const functions

    // --- START hooks
    
    useEffect(initSettings, []);

    // whenever gentlePort changes (e.g. through settings), we need to recheck if gentle is running on said port
    useEffect(findGentle, [gentlePort]);

    useEffect(printDocs, [docs]);

    // *this is where it all starts---get all docs from server and add them to our state
    useQuery(['infos'], () => getInfos({ since: infosLatestModified.current }), {
            refetchInterval: 3000,      // refetch the data every 3 seconds
            onSuccess: pushNewDocs,
        },
    );

    // --- END hooks

    return (
        <GutsContext.Provider value={{
            localhost,
            docs, 
            setDocs,
            updateDoc,
            guts,
            calcIntense,
            setCalcIntense,
            gentlePort,
            setGentlePort,
            foundGentle,
            setFoundGentle,
            focusedDocID,
            setFocusedDocID,
        }}>
            <FilelistPortal />
            <DocAreaPortal />
            <MiscPortals />
        </GutsContext.Provider>
    );
}

export default App;