import './App.css';
import SurfaceComponent from "./components/Drawing"
import React, {useState, useRef, useEffect} from "react";

function App() {
    const [tx, setTx] = useState(0);
    const [rx, setRx] = useState(0);
    const changeTx = () => {
        setTx(tx + 1);
    }
    const changeRx = () => {
        setRx(rx + 1);
    }
    return (
        <div className="App">
            <div style={{display: "flex"}}>
                {["Tx:", tx, "/Rx:", rx].join(" ")}
                <button
                    style={{marginLeft: 5}}
                    onClick={changeTx}>
                    {["Tx:", tx].join(" ")}
                </button>
                <button
                    style={{marginLeft: 5}}
                    onClick={changeRx}>
                    {["Rx:", rx].join(" ")}
                </button>
            </div>

            <SurfaceComponent tx={tx} rx={rx}/>
        </div>
    );
}

export default App;
