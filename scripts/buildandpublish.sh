#!/usr/bin/bash 
# This script is assuming the presence of the az cli and a logged in session
# Verifying required environment variables
if [[ -z "${CONTAINER_REGISTRY_NAME}" ]]; then
    echo "Name of container registry to push images to required."
    exit 1
fi
if [[ -z "${OCPP_SIMULATOR_TAG}" ]]; then
    echo "Docker image tag required."
    exit 1
fi
if [[ -z "${OCPP_SIMULATOR_VERSION}" ]]; then
    echo "Docker image version required."
    exit 1
fi

echo ""
echo "Building OCPP charging simulator"
echo ""

pushd ./..

echo "Building docker image for arm64"
docker build --builder=container-builder --platform linux/arm64 -t ${CONTAINER_REGISTRY_NAME}.azurecr.io/ocpp/${OCPP_SIMULATOR_TAG}:${OCPP_SIMULATOR_VERSION}-arm64 --output type=docker .

echo "Building docker image for amd64"
docker build --builder=container-builder --platform linux/amd64 -t ${CONTAINER_REGISTRY_NAME}.azurecr.io/ocpp/${OCPP_SIMULATOR_TAG}:${OCPP_SIMULATOR_VERSION}-amd64 --output type=docker .

popd

az acr login --name $CONTAINER_REGISTRY_NAME
docker push ${CONTAINER_REGISTRY_NAME}.azurecr.io/ocpp/${OCPP_SIMULATOR_TAG}:${OCPP_SIMULATOR_VERSION}-arm64
docker push ${CONTAINER_REGISTRY_NAME}.azurecr.io/ocpp/${OCPP_SIMULATOR_TAG}:${OCPP_SIMULATOR_VERSION}-amd64