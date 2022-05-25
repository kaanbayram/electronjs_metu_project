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

window.addEventListener("DOMContentLoaded", () => {




  async function onClickCalculate(evt) {

    const data = await csv().fromFile("nonStatJul3_movementVector_rOutput_raw.csv");

    let newDataCollection = [];

    data.forEach(_row => {

      _row["movementVector"].split("-").slice(2).forEach((value, index, arr) => {

        if (index % 5 === 0 && index !== 0) {

          let row = {
            "BTRID": arr[index - 5].toString(),
            "Time": arr[index - 4].toString(),
            "Nreading": arr[index - 3].toString(),
            "Staytime": arr[index - 2].toString(),
            "Ttime": arr[index - 1].toString()
          }

          newDataCollection.push(row);
        }

      });
    });

    const newDataCsv = new Parser({ fields: ["BTRID", "Time", "Nreading", "Staytime", "Ttime"] }).parse((newDataCollection));
    fs.writeFileSync("newDataCsv.csv", newDataCsv);
  }

  async function onClickTwoDevice(evt) {

    const data = await csv().fromFile("nonStatJul3_movementVector_rOutput_raw.csv");

    let newDataCollection = [];
    let firstDeviceId = document.getElementById("device1").value.toString();
    let secondDeviceId = document.getElementById("device2").value.toString();

    if (!firstDeviceId || firstDeviceId === "" || secondDeviceId || secondDeviceId === "") {
      alert("Please enter devices that gonn");
    }

    data.forEach(_row => {

      let rowData = _row["movementVector"].split("-");
      let deviceMAC = rowData[0];
      let deviceType = rowData[1];

      rowData.slice(2).forEach((value, index, arr) => {

        if (index % 5 === 0 && index !== 0) {

          let row = {
            "BTRID": arr[index - 5].toString(),
            "Time": arr[index - 4].toString(),
            "Nreading": arr[index - 3].toString(),
            "Staytime": arr[index - 2].toString(),
            "Ttime": arr[index - 1].toString()
          }

          // newDataCollection.push(row);
        }

      });
    });

    const newDataCsv = new Parser({ fields: ["BTRID", "Time", "Nreading", "Staytime", "Ttime"] }).parse((newDataCollection));
    fs.writeFileSync("newDataCsv.csv", newDataCsv);
  }

  document.getElementById('calculateButton').addEventListener('click', onClickCalculate, false);
  document.getElementById('getBetweenTwoDevice').addEventListener('click', onClickTwoDevice, false);

  // (async () => {
  //   const data = await csv().fromFile("nonStatJul3_movementVector_rOutput_raw.csv");


  //   console.log(data[0]["movementVector"].split("-"));

  //   document.getElementById("xlx_json").value = data[0]["movementVector"].split("-");
  // })();

})

