EV charger simulator. Supports OCPP/J version 1.6 and OCPP/SOAP version 1.5. 
Can be used as CLI program, or as library in any JS environment.

# CLI usage

## Setup

The workspace takes the following variables for configuration

You need to run `az login` with your account, and choose the subscription with the relevant container registry to deploy.

```bash
export CONTAINER_REGISTRY_NAME="faglig"
export OCPP_SIMULATOR_TAG="ocpp-simulator-dev"
export OCPP_SIMULATOR_VERSION=""
```

If unable to run scripts set permission to `chmod +x filename.sh` on the relevant file in the scripts folder.

This should be added to the configuration of the devcontainer, but no time. Run the following command to create a custom builder for multiplatform builds. Will be used by the `buildandpublish.sh` script

```bash
docker buildx create --name container-builder --driver docker-container --use --bootstrap 
```


## Getting started

Install in project
```
yarn add vasyas/charger-simulator
```

or globally
```
yarn global add vasyas/charger-simulator
```

Then launch it with command
```
charger-simulator <URL to central system>
```

You can also run from a cloned git repository
```
yarn start <URL to central system>
```

On successfull launch, you will get this message

```
debug] OCPP connected
[info] Connected to Central System
[info] Supported keys:
    Ctrl+C:   quit

    Control connector 1
    ---
    a:        send Available status
    p:        send Preparing status
    c:        send Charging status
    f:        send Finishing status
```

You can press keys to send connector status updates to central server.

## CLI options
```
charger-simulator

  Start OCPP charging station simulator, connect simulator to Central System
  server.

Options

  -s, --csURL URL                 URL of the Central System server to connect to, ws://server.name/path.
                                  This is also a default option.
  -i, --chargerId ChargerId       OCPP ID to be used for simulating charger.
                                  Default is 'test'.
  -c, --connectorId ConnectorId   ID of the connector to send status when pressing keys.
                                  Defaults to 1.
  -t, --idTag idTag               ID Tag to start transaction.
                                  Defaults to 123456.
```

## Default behavior

By default simulator implements following OCPP operations.

*RemoteStartTransaction*. Will successfully start new transaction. Call RemoteStartTransaction by server
will result in StartTransaction and multiple MeterValues to be sent to central system.

*RemoteStopTransaction*. Will stop running transaction.

*GetConfiguration*. Return charge point configuration.

*ChangeConfiguration*. Change charge point configuration.

*ChangeAvailability, ClearCache, ReserveNow, CancelReservation, Reset*. Return 'Accepted', but do nothing.

*UnlockConnector*. Will return 'Unlocked'.

All other methods are not implemented.

# Library usage

## Getting started
TBD  

## API
TBD  

