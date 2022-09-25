import { useRef } from "react";
import { getTranscriptBoundsFromAlign } from "../utils/MathUtils";
import { prevDef, useProsodicData } from "../utils/Utils";
import OverviewSVG from "./OverviewSVG";
import OverviewSVGInteractor from "./OverviewSVGInteractor";

function Overview(props) {

    let {
        id,
        docReady,
    } = props;

    return (
        <div className="overview">
            { docReady && <OverviewHeader { ...props }/> }
            <div id={ id + "-ov-wrapper" } className="overview-wrapper">
                {
                    docReady
                        ? <OverviewSVGInteractor { ...props }>
                            <OverviewSVG { ...props } />
                        </OverviewSVGInteractor>
                        : <div className="loading-placement">Loading... If this is taking too long, try reloading the webpage, turning off AdBlock, or reuploading this data file</div>

                }
            </div>
        </div>
    );
}

function OverviewHeader(props) {

    let { 
        id,
        playing,
        seekAudioTime,
        resetRazor,
        autoscroll,
        setAutoScroll,
        setSelection,
        docObject,
    } = props;

    const { alignData } = useProsodicData(docObject);

    const [ transcriptStart, transcriptEnd ] = getTranscriptBoundsFromAlign(alignData);

    const goToBegOfTranscript = () => {
        setSelection({
            start_time: transcriptStart,
            end_time: Math.min(transcriptStart + 20, transcriptEnd),
        })

        if (playing)
            seekAudioTime(transcriptStart);
        else
            resetRazor();
    }

    const onContScrollToggle = () => setAutoScroll(oldAutoScroll => !oldAutoScroll);

    return (        
        <div className="overview-top">
            <p>Drag to select a region</p>
            <div className="play-opt">
                {/* prevent focus on mousedown */}
                <button onMouseDown={ prevDef } onClick={ goToBegOfTranscript }>jump to start of transcript</button>

                <label htmlFor={ id + "-rad1" } title="auto-select next region on playthrough">continuous scrolling</label>
                <input id={ id + "-rad1" } type="checkbox" name="playopt" checked={ autoscroll } 
                    onChange={ onContScrollToggle } onMouseDown={ prevDef }></input>
            </div>
        </div>
    );

}

export default Overview;