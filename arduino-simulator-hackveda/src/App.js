import React from "react";
import "./styles.css";
import "@wokwi/elements";
import { parse } from "intel-hex";
import {
  CPU,
  avrInstruction,
  AVRIOPort,
  portDConfig,
  PinState,
  AVRTimer,
  timer0Config
} from "avr8js";

const arduinoCode = `void setup(){
pinMode(7, OUTPUT);
}

void loop(){
  digitalWrite(7, HIGH);
  delay(1000);
  digitalWrite(7, LOW);
  delay(1000);
}`;

const startCode = `void setup(){
pinMode(7, OUTPUT);
}

void loop(){
  digitalWrite(7, HIGH);
}`;

const stopCode = `void setup(){
pinMode(7, OUTPUT);
}

void loop(){
  digitalWrite(7, LOW);
}`;

export default function App() {
  const [ledState, setLedState] = React.useState(false);

  const runCode = async () => {
    // Compile the arduino source code
    const result = await fetch("https://hexi.wokwi.com/build", {
      method: "post",
      body: JSON.stringify({ sketch: arduinoCode }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const { hex, stderr } = await result.json();
    if (!hex) {
      alert(stderr);
      return;
    }
    const { data } = parse(hex);
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
    while (true) {
      for (let i = 0; i < 500000; i++) {
        avrInstruction(cpu);
        timer.tick();
      }
      await new Promise((resolve) => setTimeout(resolve));
    }
  };

  const runCode1 = async () => {
    // Compile the arduino source code
    const result = await fetch("https://hexi.wokwi.com/build", {
      method: "post",
      body: JSON.stringify({ sketch: startCode }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const { hex, stderr } = await result.json();
    if (!hex) {
      alert(stderr);
      return;
    }
    const { data } = parse(hex);
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
    while (true) {
      for (let i = 0; i < 500000; i++) {
        avrInstruction(cpu);
        timer.tick();
      }
      await new Promise((resolve) => setTimeout(resolve));
    }
  };

  const runCode2 = async () => {
    // Compile the arduino source code
    const result = await fetch("https://hexi.wokwi.com/build", {
      method: "post",
      body: JSON.stringify({ sketch: stopCode }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const { hex, stderr } = await result.json();
    if (!hex) {
      alert(stderr);
      return;
    }
    const { data } = parse(hex);
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
    while (true) {
      for (let i = 0; i < 500000; i++) {
        avrInstruction(cpu);
        timer.tick();
      }
      await new Promise((resolve) => setTimeout(resolve));
    }
  };

  return (
    <div className="App">
      <h2>Remote IOT Device Setup</h2>
      <button onClick={runCode1}>Start LED</button>
      <button onClick={runCode2}>Stop LED</button>
      <button onClick={runCode}>Blink LED</button>
      <p>
        <h4>Led & Arduino Uno Device</h4>
        <h5>LED connected to digital pin 7 on Arduino</h5>
        <wokwi-led color="red" value={ledState ? true : ""} />
      </p>

      <p>
        <wokwi-arduino-uno />
      </p>
    </div>
  );
}
