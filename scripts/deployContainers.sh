#!/usr/bin/bash 
myUniquePrefix=hih
az group create --name ocpp-testsimulation-$myUniquePrefix-rg --location norwayeast

az identity create --resource-group ocpp-testsimulation-$myUniquePrefix-rg --name simulationACRId-$myUniquePrefix

userid=$(az identity show --resource-group ocpp-testsimulation-$myUniquePrefix-rg --name simulationACRId-$myUniquePrefix --query id --output tsv)
spid=$(az identity show --resource-group ocpp-testsimulation-$myUniquePrefix-rg --name simulationACRId-$myUniquePrefix --query principalId --output tsv)

az role assignment create --assignee $spid \
    --scope /subscriptions/032f1ffd-60f5-47e8-a8eb-24f6c9996fdd/resourceGroups/felles/providers/Microsoft.ContainerRegistry/registries/faglig \
    --role acrpull

centralSystemDomain=ocpp-centralsystem-group1.greensky-f82bf600.norwayeast.azurecontainerapps.io
echo $userid
echo $spid

for instancenumber in {1..3}
do
    echo "Going to create instance with number $instancenumber"
    az container create \
        --resource-group ocpp-testsimulation-$myUniquePrefix-rg \
        --name simulationcontainer$instancenumber \
        --image faglig.azurecr.io/ocpp/ocpp-simulator-dev:0.1-amd64 \
        --dns-name-label sim-$myUniquePrefix-$instancenumber \
        --command-line "wss://${centralSystemDomain}/ocpp -i charger$instancenumber"\
        --registry-login-server faglig.azurecr.io \
        --acr-identity $userid --assign-identity $userid
done