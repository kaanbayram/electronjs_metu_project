// window.addEventListener("DOMContentLoaded", () => {
//   const cihaz1 = document.getElementById("cihaz1");

//   var ExcelToJSON = function () {
//     this.parseExcel = function (file) {
//       var reader = new FileReader();

//       reader.onload = function (e) {
//         var data = e.target.result;
//         var workbook = XLSX.read(data, {
//           type: "binary",
//         });
//         workbook.SheetNames.forEach(function (sheetName) {
//           // Here is your object
//           var XL_row_object = XLSX.utils.sheet_to_row_object_array(
//             workbook.Sheets[sheetName]
//           );
//           var json_object = JSON.stringify(XL_row_object);
//           console.log(JSON.parse(json_object));
//           jQuery("#xlx_json").val(json_object);
//         });
//       };

//       reader.onerror = function (ex) {
//         console.log(ex);
//       };

//       reader.readAsBinaryString(file);
//     };
//   };

//   function handleFileSelect(evt) {
//     var files = evt.target.files; // FileList object
//     var xl2json = new ExcelToJSON();
//     xl2json.parseExcel(files[0]);
//   }

//   document.getElementById('upload').addEventListener('change', handleFileSelect, false);

// });

const fs = require("fs");
const csv = require("csvtojson");
const { Parser } = require("json2csv");
const moment = require('moment');

window.addEventListener("DOMContentLoaded", () => {

  let willExportGridData = null;

  // async function onClickCalculate(evt) {

  //   const data = await csv().fromFile("input.csv");

  //   let table = addHeaderRow();

  //   let newDataCollection = [];

  //   data.splice(0, 500).forEach(_row => {

  //     let rowData = _row["movementVector"].split("-");
  //     let deviceMAC = rowData[0];
  //     let deviceType = rowData[1];

  //     rowData.slice(2).forEach((value, index, arr) => {

  //       if (index % 5 === 0 && index !== 0) {

  //         let row = {
  //           "MACID": deviceMAC,
  //           "Devicetype": deviceType,
  //           "BTRID": arr[index - 5].toString(),
  //           "Time": arr[index - 4].toString(),
  //           "Nreading": arr[index - 3].toString(),
  //           "Staytime": arr[index - 2].toString(),
  //           "Ttime": arr[index - 1].toString()
  //         }

  //         let newRow = document.createElement("tr");

  //         [
  //           deviceMAC,
  //           deviceType,
  //           arr[index - 5].toString(),
  //           arr[index - 4].toString(),
  //           arr[index - 3].toString(),
  //           arr[index - 2].toString(),
  //           arr[index - 1].toString()].forEach((roToAdd, rowToAddIndex) => {
  //             let cell = newRow.insertCell(rowToAddIndex);
  //             cell.innerHTML = roToAdd.toString();
  //           });

  //         table.appendChild(newRow);

  //         newDataCollection.push(row);
  //       }
  //     });
  //   });

  //   const newDataCsv = new Parser({ fields: ["MACID", "Devicetype", "BTRID", "Time", "Nreading", "Staytime", "Ttime"] }).parse((newDataCollection));

  //   willExportGridData = newDataCsv;
  //   // fs.writeFileSync("newDataCsv.csv", newDataCsv);
  // }

  function addHeaderRowForInterval() {
    let table = document.getElementById("dataTable");

    table.innerHTML = "";

    let rowElement = document.createElement("tr");

    [
      "MACID",
      "Devicetype",
      "First BTRID",
      "First Time",
      "First Nreading",
      "First Staytime",
      "First Ttime",
      "Second BTRID",
      "Second Time",
      "Second Nreading",
      "Second Staytime",
      "Second Ttime",
      "Time diffrence"
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

  async function onClickTwoDevice(evt) {

    const data = await csv().fromFile("input.csv");

    let newDataCollection = [];
    let firstPoint = document.getElementById("device1").value.toString();
    let secondPoint = document.getElementById("device2").value.toString();

    console.log(firstPoint);
    console.log(secondPoint);

    if (!firstPoint || secondPoint === "" || !firstPoint || secondPoint === "") {
      alert("Please enter devices that gonna get");
    }

    let table = addHeaderRowForInterval();

    data.forEach(_row => {

      let rowData = _row["movementVector"].split("-");
      let deviceMAC = rowData[0];
      let deviceType = rowData[1];

      rowData.slice(2).forEach((value, index, arr) => { //  10 arlı alındığı için ilk iki elan devicemac ve deviceType bunlar cıkarılığ mod alınıyor böylece bu sayılardan geri gelinerek alanlar alınıyor.

        if (index % 10 === 0 && index !== 0) {


          // console.log(
          //   moment(arr[index - 9].toString(), 'HH:mm:ss').isSameOrAfter(document.getElementById('fromTimeValue').value.toString()),
          //   moment(arr[index - 4].toString(), 'HH:mm:ss').isSameOrBefore(document.getElementById('toTimeValue').value.toString())
          // );

          if (arr[index - 10].toString() === firstPoint && arr[index - 5].toString() === secondPoint && !document.getElementById("intervalStatus").checked) {  // Interval Inactive

            let row = {
              "MACID": deviceMAC,
              "Devicetype": deviceType,
              "First BTRID": arr[index - 10].toString(),
              "First Time": arr[index - 9].toString(),
              "First Nreading": arr[index - 8].toString(),
              "First Staytime": arr[index - 7].toString(),
              "First Ttime": arr[index - 6].toString(),
              "Second BTRID": arr[index - 5].toString(),
              "Second Time": arr[index - 4].toString(),
              "Second Nreading": arr[index - 3].toString(),
              "Second Staytime": arr[index - 2].toString(),
              "Second Ttime": arr[index - 1].toString(),
              "Time diffrence": getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString())
            };

            let newRow = document.createElement("tr");

            [
              deviceMAC,
              deviceType,
              arr[index - 10].toString(),
              arr[index - 9].toString(),
              arr[index - 8].toString(),
              arr[index - 7].toString(),
              arr[index - 6].toString(),
              arr[index - 5].toString(),
              arr[index - 4].toString(),
              arr[index - 3].toString(),
              arr[index - 2].toString(),
              arr[index - 1].toString(),
              getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString())
            ].forEach((roToAdd, rowToAddIndex) => {
              let cell = newRow.insertCell(rowToAddIndex);
              cell.innerHTML = roToAdd.toString();
            });

            table.appendChild(newRow);


            newDataCollection.push(row);

          }
          else if (
            arr[index - 10].toString() === firstPoint &&
            arr[index - 5].toString() === secondPoint &&
            document.getElementById("intervalStatus").checked &&
            moment(arr[index - 9].toString(), 'HH:mm:ss').isSameOrAfter(moment(document.getElementById('fromTimeValue').value.toString(), 'HH:mm:ss')) &&  // firts time interval baslangıctan buyuk mu
            moment(arr[index - 4].toString(), 'HH:mm:ss').isSameOrBefore(moment(document.getElementById('toTimeValue').value.toString(), 'HH:mm:ss'))  // second time interval bitişten kucuk mu
          ) {


            let row = {
              "MACID": deviceMAC,
              "Devicetype": deviceType,
              "First BTRID": arr[index - 10].toString(),
              "First Time": arr[index - 9].toString(),
              "First Nreading": arr[index - 8].toString(),
              "First Staytime": arr[index - 7].toString(),
              "First Ttime": arr[index - 6].toString(),
              "Second BTRID": arr[index - 5].toString(),
              "Second Time": arr[index - 4].toString(),
              "Second Nreading": arr[index - 3].toString(),
              "Second Staytime": arr[index - 2].toString(),
              "Second Ttime": arr[index - 1].toString(),
              "Time diffrence": getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString())
            };

            let newRow = document.createElement("tr");

            [
              deviceMAC,
              deviceType,
              arr[index - 10].toString(),
              arr[index - 9].toString(),
              arr[index - 8].toString(),
              arr[index - 7].toString(),
              arr[index - 6].toString(),
              arr[index - 5].toString(),
              arr[index - 4].toString(),
              arr[index - 3].toString(),
              arr[index - 2].toString(),
              arr[index - 1].toString(),
              getTimeDifference(arr[index - 9].toString(), arr[index - 4].toString())
            ].forEach((roToAdd, rowToAddIndex) => {
              let cell = newRow.insertCell(rowToAddIndex);
              cell.innerHTML = roToAdd.toString();
            });

            table.appendChild(newRow);


            newDataCollection.push(row);

          }

        }

      });

    });

    const newDataCsv = new Parser({
      fields: [
        "MACID",
        "Devicetype",
        "First BTRID",
        "First Time",
        "First Nreading",
        "First Staytime",
        "First Ttime",
        "Second BTRID",
        "Second Time",
        "Second Nreading",
        "Second Staytime",
        "Second Ttime",
        "Time diffrence"
      ]
    }).parse((newDataCollection));
    

    willExportGridData = newDataCsv;

    // fs.writeFileSync("newDataCsv.csv", newDataCsv);
  }

  function getTimeDifference(startTime, endTime) {
    var startTime = moment(startTime, 'HH:mm:ss');
    var endTime = moment(endTime, 'HH:mm:ss');

    // calculate total duration
    var duration = moment.duration(endTime.diff(startTime));

    // duration in hours

    // console.log(duration);

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
    // document.getElementById("intervalStatus").value = !e.target.checked;
    document.getElementById('fromTimeValue').readOnly = !e.target.checked;
    document.getElementById('toTimeValue').readOnly = !e.target.checked;
    if (!e.target.checked) {
      document.getElementById('fromTimeValue').value = "00:00:00";
      document.getElementById('toTimeValue').value = "00:00:00";
    }

  }


  // document.getElementById('calculateButton').addEventListener('click', onClickCalculate, false);
  document.getElementById('getBetweenTwoDevice').addEventListener('click', onClickTwoDevice, false);
  document.getElementById('exportToExcell').addEventListener('click', onClickExportToExcell, false);
  document.getElementById('intervalStatus').addEventListener('click', onClickIntervalStatus, false);

});

