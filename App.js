import React from "react";
import "./styles.css";
import "@wokwi/elements";
import {
    parse
} from "intel-hex";
import {
    CPU,
    avrInstruction,
    AVRIOPort,
    portDConfig,
    PinState,
    AVRTimer,
    timer0Config
} from "avr8js";

export default function App() {
    const [ledState, setLedState] = React.useState(false);
    let textCode = "";
    
    const fetchCode = async () =>{
        
        const arduinoCode = await fetch("http://devanshushukla.in/iot/iotservice.php", {
            method: "post",
            body: JSON.stringify({
                type: "fetchCode"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(r => r.text())
            .then(text => {
                console.log('text decoded:', text);
                textCode = text;
                updateStatus("Code Fetch: "+text);
            });
        
        await console.log("Arduino Code: " + arduinoCode);
        
    };
    
    const updateStatus = async (devicestatus) =>{
        const result = await fetch("http://devanshushukla.in/iot/iotservice.php", {
            method: "post",
            body: JSON.stringify({
                type: "setStatus",
                statusData: devicestatus
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
    };
    
    const runCode = async () => {
        
        // Compile the arduino source code
        const result = await fetch("https://hexi.wokwi.com/build", {
            method: "post",
            body: JSON.stringify({
                sketch: textCode
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        await updateStatus("Code Build (Intel Hex): " + result);
        
        const {
            hex,
            stderr
        } = await result.json();
        if (!hex) {
            alert(stderr);
            return;
        }
        const {
            data
        } = parse(hex);
        const progData = new Uint8Array(data);
        await updateStatus("Code Build (Machine Code): " + progData);
        console.log(data);
        // Setup the Simulation
        const cpu = new CPU(new Uint16Array(progData.buffer));

        // Attach the virtual hardware
        const port = new AVRIOPort(cpu, portDConfig);
        port.addListener(() => {
            const turnOn = port.pinState(7) === PinState.High;
            setLedState(turnOn);

            console.log("LED", turnOn);
            //const turnOff = port.pinState(7) === PinState.Low;
            
            //updateStatus("TurnOn: "+turnOn+" - TurnOff: "+turnOff);
        });
        await updateStatus("Virtual Hardward: Attached");
        const timer = new AVRTimer(cpu, timer0Config);
        
        // Run the simulation
        await updateStatus("Device Running");
        
        while (true) {
            for (let i = 0; i < 500000; i++) {
                avrInstruction(cpu);
                timer.tick();
            }
            await new Promise((resolve) => setTimeout(resolve));
        }
    };
    
     
    const stopLed = async () => {
        await updateStatus("Device Stop: Initiated");
        const stopCode = `
        void setup(){
        pinMode(7, OUTPUT);
        }
        void loop(){
        pinMode(7, LOW);
        }
        `;
        
        // Compile the arduino source code
        const result = await fetch("https://hexi.wokwi.com/build", {
            method: "post",
            body: JSON.stringify({
                sketch: stopCode
            }),
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        const {
            hex,
            stderr
        } = await result.json();
        if (!hex) {
            alert(stderr);
            return;
        }
        const {
            data
        } = parse(hex);
        const progData = new Uint8Array(data);

        console.log(data);
        // Setup the Simulation
        const cpu = new CPU(new Uint16Array(progData.buffer));

        // Attach the virtual hardware
        const port = new AVRIOPort(cpu, portDConfig);
        port.addListener(() => {
            const turnOn = port.pinState(7) === PinState.High;
            setLedState(turnOn);
            console.log("LED", turnOn);
            
        });
        const timer = new AVRTimer(cpu, timer0Config);
        // Run the simulation
        await updateStatus("Device Stopped");
        while (true) {
            for (let i = 0; i < 500000; i++) {
                avrInstruction(cpu);
                timer.tick();
            }
            await new Promise((resolve) => setTimeout(resolve));
        }
    };

    return ( <div className="App">
     
     <p>
      <h2>Remote IOT Device Setup</h2>
      <button onClick={fetchCode}>Fetch & Compile</button>
      <button onClick={runCode}>Build & Run</button>
      <button onClick={stopLed}>Stop Device</button>
      </p>
      
      <p>
      <wokwi-led color="red" value={ledState ? true : ""} />
      </p><p>
      <wokwi-arduino-uno />
      </p>
      </div>
    );
}