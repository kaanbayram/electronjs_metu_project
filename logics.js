
const fs = require("fs");
const csv = require("csvtojson");
const { Parser } = require("json2csv");
const moment = require('moment');

window.addEventListener("DOMContentLoaded", () => {

  let willExportGridData = null;

  function addHeaderRowForInterval() {
    let table = document.getElementById("dataTable");

    table.innerHTML = "";

    let rowElement = document.createElement("tr");

    [
      "MACID",
      "Devicetype",
      "First_BTRID",
      "First_Time",
      "First_Time_Seconds",
      "First_Nreading",
      "First_Staytime",
      "First_Ttime",
      "Second_BTRID",
      "Second_Time",
      "Second_Nreading",
      "Second_Staytime",
      "Second_Ttime",
      "Time_diffrence",
      "First_to_First_F2F",
      "Last_to_Last_L2L",
      "Mid_to_Mid_M2M",
      "First_to_Last_F2L",
      "Distance",
      "Velocity_km/h"
    ].forEach((value, index) => {
      let cell = rowElement.insertCell(index);
      cell.innerHTML = value.toString();
    });

    table.appendChild(rowElement);

    return table;
  }

  function addHeaderRow() {
    let table = document.getElementById("dataTable");

    table.innerHTML = "";

    let rowElement = document.createElement("tr");

    [
      "MACID",
      "Devicetype",
      "BTRID",
      "Time",
      "Nreading",
      "Staytime",
      "Ttime",
    ].forEach((value, index) => {
      let cell = rowElement.insertCell(index);
      cell.innerHTML = value.toString();
    });

    table.appendChild(rowElement);

    return table;
  }

  async function onClickOdMatrixButton() {
    const data = await csv().fromFile("input.csv");

    let newDataCollection = [];
    let firstRowOfOD = ["_"];
    let generalMatrixForOD = [];
    let excellExportedData = [];

    data.forEach(_row => {

      let rowData = _row["movementVector"].split("-");
      let deviceMAC = rowData[0];
      let deviceType = rowData[1];


      rowData.slice(2).forEach((value, index, arr) => { //  10 arlı alındığı için ilk iki elan devicemac ve deviceType bunlar cıkarılığ mod alınıyor böylece bu sayılardan geri gelinerek alanlar alınıyor.

        if (index % 10 === 0 && index !== 0) {


          let row = {
            "MACID": deviceMAC,
            "Devicetype": deviceType,
            "First_BTRID": arr[index - 10].toString(),
            "First_Time": arr[index - 9].toString(),
            "First_Time_Seconds": moment(arr[index - 9].toString(), 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'),
            "First_Nreading": arr[index - 8].toString(),
            "First_Staytime": arr[index - 7].toString(),
            "First_Ttime": arr[index - 6].toString(),
            "Second_BTRID": arr[index - 5].toString(),
            "Second_Time": arr[index - 4].toString(),
            "Second_Nreading": arr[index - 3].toString(),
            "Second_Staytime": arr[index - 2].toString(),
            "Second_Ttime": arr[index - 1].toString(),
            "Time_diffrence": getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString()),
          };

          newDataCollection.push(row);

          let first_BTRID = arr[index - 10].toString();
          let second_BTRID = arr[index - 5].toString();

          if (!firstRowOfOD.find(btrid => btrid === first_BTRID)) {
            firstRowOfOD.push(first_BTRID);
          }
          if (!firstRowOfOD.find(btrid => btrid === second_BTRID)) {
            firstRowOfOD.push(second_BTRID);
          }


        }

      });

    });

    generalMatrixForOD.push(firstRowOfOD);

    let _firstRowOfOD = firstRowOfOD.slice(1);

    _firstRowOfOD.forEach((btrid, index, _array) => {
      let row = [];
      row.push(btrid);

      for (let i = 0; i < _array.length; i++) {
        row.push("");
      }

      generalMatrixForOD.push(row);
    });




    firstRowOfOD.forEach((_column, columnIndex, _columArray) => {
      if (_column !== "_") {
        _columArray.forEach((_row, rowIndex) => {
          if (_row !== "_") {
            let count = newDataCollection.filter(data => data["First_BTRID"] === _column && data["Second_BTRID"] === _row)?.length;
            generalMatrixForOD[columnIndex][rowIndex] = count;
          }
        })
      }

    });

    // console.table(generalMatrixForOD);

    generalMatrixForOD.forEach((_row, index) => {
      if (index !== 0) {

        let row = {};
        _row.forEach((element, index) => {

          row[firstRowOfOD[index]] = element;

        });

        excellExportedData.push(row);

      }

    });

    const newDataCsv = new Parser({
      fields: firstRowOfOD
    }).parse((excellExportedData));


    if (!newDataCsv) {
      alert("You did not get the any table yet");
    }
    else {
      let willExportedFileName = "OD_Matrix";
      fs.writeFileSync(`${willExportedFileName}.csv`, newDataCsv);
    }

    // excellExportedData

  }


  async function onClickTwoDevice(evt) {


    const data = await csv().fromFile("input.csv");
    const distanceData = await csv().fromFile("distanceMatrix.csv");

    let newDataCollection = [];
    let firstPoint = document.getElementById("device1").value.toString();
    let secondPoint = document.getElementById("device2").value.toString();

    if (!firstPoint || secondPoint === "" || !firstPoint || secondPoint === "") {
      alert("Please enter devices that gonna get");
    }

    let table = addHeaderRowForInterval();
    let tableDatas = [];


    data.forEach(_row => {

      let rowData = _row["movementVector"].split("-");
      let deviceMAC = rowData[0];
      let deviceType = rowData[1];


      rowData.slice(2).forEach((value, index, arr) => { //  10 arlı alındığı için ilk iki elan devicemac ve deviceType bunlar cıkarılığ mod alınıyor böylece bu sayılardan geri gelinerek alanlar alınıyor.

        if (index % 10 === 0 && index !== 0) {

          if (arr[index - 10].toString() === firstPoint && arr[index - 5].toString() === secondPoint && !document.getElementById("intervalStatus").checked) {  // Interval Inactive


            const distances = getDistances(distanceData);
            const distanceMatrixBTRarray = distances[0];

            const verticalIndex = distanceMatrixBTRarray.findIndex((btr) => btr === arr[index - 10].toString()); // from
            const horizontalIndex = distanceMatrixBTRarray.findIndex((btr) => btr === arr[index - 5].toString());  // to
            let distance = "";
            let velocity = "";
            let velocityKm = "";

            if (verticalIndex > -1 && horizontalIndex > -1) {

              distance = distances[verticalIndex][horizontalIndex];

              let _first_Staytime = arr[index - 7].toString();
              let _second_Staytime = arr[index - 2].toString();

              _first_Staytime = _first_Staytime === "NA" ? 0 : Number(_first_Staytime);
              _second_Staytime = _second_Staytime === "NA" ? 0 : Number(_second_Staytime);



              velocity = (Number(distance) / (Number(arr[index - 1]) + ((_first_Staytime + _second_Staytime) / 2)));
              velocity = velocity.toString().includes(".") ? velocity.toFixed(4).toString() : velocity.toString();

              velocityKm = velocity * (3600 / 1000);
              velocityKm = velocityKm.toString().includes(".") ? velocityKm.toFixed(4).toString() : velocityKm.toString();

              // console.log(_first_Staytime, _second_Staytime, (_first_Staytime + _second_Staytime), Number(distance), velocity, velocityKm);

            }


            let row = {
              "MACID": deviceMAC,
              "Devicetype": deviceType,
              "First_BTRID": arr[index - 10].toString(),
              "First_Time": arr[index - 9].toString(),
              "First_Time_Seconds": moment(arr[index - 9].toString(), 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'),
              "First_Nreading": arr[index - 8].toString(),
              "First_Staytime": arr[index - 7].toString(),
              "First_Ttime": arr[index - 6].toString(),
              "Second_BTRID": arr[index - 5].toString(),
              "Second_Time": arr[index - 4].toString(),
              "Second_Nreading": arr[index - 3].toString(),
              "Second_Staytime": arr[index - 2].toString(),
              "Second_Ttime": arr[index - 1].toString(),
              "Time_diffrence": getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString()),
              "First_to_First_F2F": getTravelTime("F2F", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Last_to_Last_L2L": getTravelTime("L2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Mid_to_Mid_M2M": getTravelTime("M2M", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "First_to_Last_F2L": getTravelTime("F2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Distance": distance,
              "Velocity_km/h": velocityKm.replace(".", ",")
            };

            tableDatas.push([
              deviceMAC,
              deviceType,
              arr[index - 10].toString(),
              arr[index - 9].toString(),
              moment(arr[index - 9].toString(), 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'),
              arr[index - 8].toString(),
              arr[index - 7].toString(),
              arr[index - 6].toString(),
              arr[index - 5].toString(),
              arr[index - 4].toString(),
              arr[index - 3].toString(),
              arr[index - 2].toString(),
              arr[index - 1].toString(),
              getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString()),
              getTravelTime("F2F", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("L2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("M2M", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("F2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              distance,
              velocityKm.replace(".", ","),
            ]);

            newDataCollection.push(row);

          }
          else if (    // Interval Active
            arr[index - 10].toString() === firstPoint &&
            arr[index - 5].toString() === secondPoint &&
            document.getElementById("intervalStatus").checked &&
            moment(arr[index - 9].toString(), 'HH:mm:ss').isSameOrAfter(moment(document.getElementById('fromTimeValue').value.toString(), 'HH:mm:ss')) &&  // firts time interval baslangıctan buyuk mu
            moment(arr[index - 4].toString(), 'HH:mm:ss').isSameOrBefore(moment(document.getElementById('toTimeValue').value.toString(), 'HH:mm:ss'))  // second time interval bitişten kucuk mu
          ) {

            const distances = getDistances(distanceData);
            const distanceMatrixBTRarray = distances[0];

            const verticalIndex = distanceMatrixBTRarray.findIndex((btr) => btr === arr[index - 10].toString()); // from
            const horizontalIndex = distanceMatrixBTRarray.findIndex((btr) => btr === arr[index - 5].toString());  // to
            let distance = "";
            let velocity = "";
            let velocityKm = "";

            if (verticalIndex > -1 && horizontalIndex > -1) {

              distance = distances[verticalIndex][horizontalIndex];

              let _first_Staytime = arr[index - 7].toString();
              let _second_Staytime = arr[index - 2].toString();

              _first_Staytime = _first_Staytime === "NA" ? 0 : Number(_first_Staytime);
              _second_Staytime = _second_Staytime === "NA" ? 0 : Number(_second_Staytime);



              velocity = (Number(distance) / (Number(arr[index - 1]) + ((_first_Staytime + _second_Staytime) / 2)));
              velocity = velocity.toString().includes(".") ? velocity.toFixed(4).toString() : velocity.toString();

              velocityKm = velocity * (3600 / 1000);
              velocityKm = velocityKm.toString().includes(".") ? velocityKm.toFixed(4).toString() : velocityKm.toString();

              // console.log(_first_Staytime, _second_Staytime, (_first_Staytime + _second_Staytime), Number(distance), velocity, velocityKm);

            }
            let row = {
              "MACID": deviceMAC,
              "Devicetype": deviceType,
              "First_BTRID": arr[index - 10].toString(),
              "First_Time": arr[index - 9].toString(),
              "First_Time_Seconds": moment(arr[index - 9].toString(), 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'),
              "First_Nreading": arr[index - 8].toString(),
              "First_Staytime": arr[index - 7].toString(),
              "First_Ttime": arr[index - 6].toString(),
              "Second_BTRID": arr[index - 5].toString(),
              "Second_Time": arr[index - 4].toString(),
              "Second_Nreading": arr[index - 3].toString(),
              "Second_Staytime": arr[index - 2].toString(),
              "Second_Ttime": arr[index - 1].toString(),
              "Time_diffrence": getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString()),
              "First_to_First_F2F": getTravelTime("F2F", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Last_to_Last_L2L": getTravelTime("L2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Mid_to_Mid_M2M": getTravelTime("M2M", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "First_to_Last_F2L": getTravelTime("F2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              "Distance": distance,
              "Velocity_km/h": velocityKm.replace(".", ",")
            };

            tableDatas.push([
              deviceMAC,
              deviceType,
              arr[index - 10].toString(),
              arr[index - 9].toString(),
              moment(arr[index - 9].toString(), 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'),
              arr[index - 8].toString(),
              arr[index - 7].toString(),
              arr[index - 6].toString(),
              arr[index - 5].toString(),
              arr[index - 4].toString(),
              arr[index - 3].toString(),
              arr[index - 2].toString(),
              arr[index - 1].toString(),
              getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString()),
              getTravelTime("F2F", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("L2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("M2M", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              getTravelTime("F2L", arr[index - 7].toString(), arr[index - 2].toString(), arr[index - 1].toString()),
              distance,
              velocityKm.replace(".", ",")
            ]);

            newDataCollection.push(row);

          }

        }

      });

    });


    let sortingValue = document.querySelector('input[name="sort"]:checked').value;

    const sortedTable = tableDatas.sort((a, b) => {

      if (sortingValue === "asc") {
        return moment(a[12], 'HH:mm:ss').diff(moment(b[12], 'HH:mm:ss'))
      }
      else {
        return moment(b[12], 'HH:mm:ss').diff(moment(a[12], 'HH:mm:ss'))
      }
    });

    sortedTable.forEach((row) => {
      let newRow = document.createElement("tr");

      row.forEach((roToAdd, rowToAddIndex) => {
        let cell = newRow.insertCell(rowToAddIndex);
        cell.innerHTML = roToAdd.toString();
      });

      table.appendChild(newRow);

    });


    const sortedExcellData = newDataCollection.sort((a, b) => {

      if (sortingValue === "asc") {
        return moment(a["Time_diffrence"], 'HH:mm:ss').diff(moment(b["Time_diffrence"], 'HH:mm:ss'))
      }
      else {
        return moment(b["Time_diffrence"], 'HH:mm:ss').diff(moment(a["Time_diffrence"], 'HH:mm:ss'))
      }
    });

    const newDataCsv = new Parser({
      fields: [
        "MACID",
        "Devicetype",
        "First_BTRID",
        "First_Time",
        "First_Time_Seconds",
        "First_Nreading",
        "First_Staytime",
        "First_Ttime",
        "Second_BTRID",
        "Second_Time",
        "Second_Nreading",
        "Second_Staytime",
        "Second_Ttime",
        "Time_diffrence",
        "First_to_First_F2F",
        "Last_to_Last_L2L",
        "Mid_to_Mid_M2M",
        "First_to_Last_F2L",
        "Distance",
        "Velocity_km/h"
      ]
    }).parse((sortedExcellData));

    // new Parser({excelStrings:})


    willExportGridData = newDataCsv;

    // fs.writeFileSync("newDataCsv.csv", newDataCsv);
  }

  function getTravelTime(travelType, first_Staytime, second_Staytime, second_Ttime) {
    const _first_Staytime = first_Staytime === "NA" ? 0 : Number(first_Staytime);
    const _second_Staytime = second_Staytime === "NA" ? 0 : Number(second_Staytime);
    const _second_Ttime = Number(second_Ttime);
    let calculus = 0;

    switch (travelType) {
      case "F2F": {
        calculus = _second_Ttime + _first_Staytime;
        break;
      }
      case "L2L": {
        calculus = _second_Ttime + _second_Staytime;
        break;
      }
      case "M2M": {
        calculus = _second_Ttime + ((_first_Staytime + _second_Staytime) / 2);
        break;
      }
      case "F2L": {
        calculus = _second_Ttime + _first_Staytime + _second_Staytime;
        break;
      }
      default:
        calculus = _second_Ttime;
        break;
    }

    // return moment.utc(calculus * 1000).format('HH:mm:ss');
    return calculus.toString().replace(".", ",");
  }

  function getTimeDifference(startTime, endTime) {
    var startTime = moment(startTime, 'HH:mm:ss');
    var endTime = moment(endTime, 'HH:mm:ss');

    // calculate total duration
    var duration = moment.duration(endTime.diff(startTime));

    // duration in hours



    var hours = parseInt(duration.asHours());

    // duration in minutes
    var minutes = parseInt(duration.asMinutes()) % 60;

    var seconds = parseInt(duration.asSeconds()) % 60;

    return `${hours}:${minutes}:${seconds}`
  }

  function onClickExportToExcell(e) {
    if (!willExportGridData) {
      alert("You did not get the any table yet");
    }
    else {
      let willExportedFileName = document.getElementById("excellFileName").value || "NewData";
      fs.writeFileSync(`${willExportedFileName}.csv`, willExportGridData);
    }
  }

  function onClickIntervalStatus(e) {
    document.getElementById('fromTimeValue').readOnly = !e.target.checked;
    document.getElementById('toTimeValue').readOnly = !e.target.checked;
    if (!e.target.checked) {
      document.getElementById('fromTimeValue').value = "00:00:00";
      document.getElementById('toTimeValue').value = "00:00:00";
    }
  }

  function getDistances(data) {


    const newMatrix = [];
    data.forEach((row) => {
      newMatrix.push(Object.values(row)[0].split(";"));
    })

    const columnHeaders = [];

    newMatrix.forEach((_row) => {
      columnHeaders.push(_row[0]);
    });

    columnHeaders.unshift("_");

    newMatrix.unshift(columnHeaders);

    return newMatrix;
  }

  // document.getElementById('calculateButton').addEventListener('click', onClickCalculate, false);
  document.getElementById('getBetweenTwoDevice').addEventListener('click', onClickTwoDevice, false);
  document.getElementById('exportToExcell').addEventListener('click', onClickExportToExcell, false);
  document.getElementById('intervalStatus').addEventListener('click', onClickIntervalStatus, false);
  document.getElementById('createOdMatrix').addEventListener('click', onClickOdMatrixButton, false);

});

