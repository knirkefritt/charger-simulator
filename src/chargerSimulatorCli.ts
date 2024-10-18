import * as commandLineArgs from "command-line-args"
import * as commandLineUsage from "command-line-usage"
import * as readline from "readline"
import { v4 } from 'uuid';

import {log} from "./log"
import {ChargerSimulator} from "./ChargerSimulator"

const optionList = [
  {
    name: "csURL",
    type: String,
    description:
      "URL of the Central System server to connect to, ws://server.name/path.\nThis is also a default option.",
    typeLabel: "{underline URL}",
    alias: "s",
    defaultOption: true,
  },
  {
    name: "cpPort",
    type: Number,
    description:
      "Port number to bind ChargePoint SOAP service. If specified, emulator will use SOAP protocol to connect to Central System, otherwise, WebSocket will be used",
    typeLabel: "{underline Number}",
    alias: "p",
  },
  {
    name: "chargerId",
    type: String,
    description: "OCPP ID to be used for simulating charger.\nDefault is 'test'.",
    typeLabel: "{underline ChargerId}",
    alias: "i",
    defaultValue: "test",
  },
  {
    name: "connectorId",
    type: String,
    description: "ID of the connector to send status when pressing keys.\nDefaults to 1.",
    typeLabel: "{underline ConnectorId}",
    alias: "c",
    defaultValue: 1,
  },
  {
    name: "idTag",
    type: String,
    description: "ID Tag to start transaction.\nDefaults to 123456.",
    typeLabel: "{underline idTag}",
    alias: "t",
    defaultValue: "12345678",
  }
]

const usageSections = [
  {
    header: "charger-simulator",
    content: "Start OCPP charging station simulator, connect simulator to Central System server.",
  },
  {
    header: "Options",
    optionList,
  },
]

;(async () => {
  let {connectorId, csURL, cpPort, idTag, chargerId } = commandLineArgs(optionList)
  var started = false

  chargerId = chargerId === 'test' ? `charger${v4()}` : chargerId
  csURL = csURL ?? 'wss://group2.knirkefritt.dev/ocpp'

  if (!connectorId || !csURL || !chargerId) {
    const usage = commandLineUsage(usageSections)
    console.log(usage)
    return
  }

  log.info("Starting charger simulator", {
    csURL,
    connectorId,
    chargerId,
    idTag,
  })

  const simulator = new ChargerSimulator({
    centralSystemEndpoint: csURL,
    chargerIdentity: chargerId,
    chargePointPort: cpPort,
  })
  await simulator.start()

  log.info(`Supported keys:
    Ctrl+C:   quit
    
    --
    b:        send BootNotification
    o:        send BootNotification with optional parameters
    d:        send DataTransfer
    i:        disconnect from Central System
    
    Connector ${connectorId} status
    ---
    a:        send Available status 
    p:        send Preparing status
    c:        send Charging status
    e:        send SuspendedEV status
    f:        send Finishing status
    
    Transaction on connector ${connectorId}, tag ${idTag}
    --
    u:        Authorize
    s:        StartTransaction
    t:        StopTransaction
  `)

  async function sendStatus(status: string) {
    await simulator.centralSystem.StatusNotification({
      connectorId: connectorId,
      errorCode: "NoError",
      status,
    })
  }

  const commands = {
    b: () =>
      simulator.centralSystem.BootNotification({
        chargePointVendor: "OC",
        chargePointModel: "OCX",
      }),
    o: () =>
      simulator.centralSystem.BootNotification({
        chargePointVendor: "OC",
        chargePointModel: "OCX",
        chargePointSerialNumber: "1234-5678",
        meterSerialNumber: "1234-5678-AA-BB",
        meterType: "Single-phase",
        firmwareVersion: "AA-001",
        iccid: "OMEGA-PEPEGA",
        imsi: "ENERGY-001",
      }),
    d: () =>
      simulator.centralSystem.DataTransfer({
        vendorId: "Emulator",
        messageId: "MessageID",
        data: "Data",
      }),

    i: () => simulator.disconnect(),

    a: () => sendStatus("Available"),
    p: () => sendStatus("Preparing"),
    c: () => sendStatus("Charging"),
    e: () => sendStatus("SuspendedEV"),
    f: () => sendStatus("Finishing"),

    u: () => simulator.centralSystem.Authorize({idTag}),
    s: () => simulator.startTransaction({idTag, connectorId}, false),
    t: () => simulator.stopTransaction(false),
  }

  const delay = (ms) => {
    return new Promise(resolve => {
      setTimeout(() => resolve(undefined), ms);
    });
  };
  
  const simulateChargeSession = async () => {
    commands.p();
    await delay(2000); // milliseconds (2 seconds)
    commands.c();
    await delay(2000);
    commands.f();
    await delay(5000);
  };
  
  const startChargingSession = async () => {
    if (!started) {
      console.log("Start sending meter values please");
      commands.s();
      commands.o();
  
      while (true) {
        await simulateChargeSession();
      }
    }
  };

  startChargingSession();
})()
