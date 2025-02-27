sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("weeklydata.controller.List", {
        onInit: function () {
            this.initWeekDropdowns();
            // this.generateTable(26, 2, 2); // Default: Week 26 with Offset 2 Before & After
        },

        initWeekDropdowns: function () {
            var oView = this.getView();
            var oWeekSelect = oView.byId("idWeekSelect");

            oWeekSelect.destroyItems(); // Clear existing items

            // Generate Week Numbers (1-52)
            var aWeeks = [];
            for (var i = 1; i <= 52; i++) {
                oWeekSelect.addItem(new sap.ui.core.Item({ key: i, text: "Week " + i }));
            }
            
            // oWeekSelect.setSelectedKey(26); // Default to Week 26
        },

        onFilterChange: function () {
            var oView = this.getView();

            // Get filter values
            var iSelectedWeek = parseInt(oView.byId("idWeekSelect").getSelectedKey(), 10);
            var iOffsetFrom = parseInt(oView.byId("idOffsetFrom").getSelectedKey(), 10);
            var iOffsetTo = parseInt(oView.byId("idOffsetTo").getSelectedKey(), 10);

            if (isNaN(iSelectedWeek)) {
                MessageToast.show("Please select a valid week.");
                return;
            }

            // Compute start and end week based on offsets
            var iStartWeek = Math.max(1, iSelectedWeek - iOffsetFrom);
            var iEndWeek = Math.min(52, iSelectedWeek + iOffsetTo);

            this.generateTable(iSelectedWeek, iOffsetFrom, iOffsetTo);
        },

        generateTable: function (iSelectedWeek, iOffsetFrom, iOffsetTo) {
            var oTable = this.getView().byId("idDynamicTable");

            // Compute the week range
            var iStartWeek = Math.max(1, iSelectedWeek - iOffsetFrom);
            var iEndWeek = Math.min(52, iSelectedWeek + iOffsetTo);

            // Clear existing columns & rows
            oTable.removeAllColumns();
            // oTable.bindItems(null);

            // Generate week headers dynamically
            var aWeeks = [];
            for (var i = iStartWeek; i <= iEndWeek; i++) {
                aWeeks.push({ week: "Week " + i });
            }

            var oModel = new JSONModel({ weeks: aWeeks });
            this.getView().setModel(oModel);

            // Define the first column (Static)
            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({ text: "Material" })
            }));
            oTable.addColumn(new sap.m.Column({
                header: new sap.m.Label({ text: "Plant" })
            }));

            // Add dynamic columns for each selected week
            aWeeks.forEach(function (week) {
                oTable.addColumn(new sap.m.Column({
                    header: new sap.m.Label({ text: week.week }),
                    hAlign: "Center"
                }));
            });

            // Sample Employee Data (Random values for selected weeks)
            var aMaterialData = [
                { Material: "Material 1", Plant: 'PLANT1', weekData: [] },
                { Material: "Material 2", Plant: 'PLANT2', weekData: [] }
            ];

            aMaterialData.forEach(function (employee) {
                var weekData = [];
                for (var i = iStartWeek; i <= iEndWeek; i++) {
                    weekData.push({
                        Quantity: Math.floor(Math.random() * 10),
                        Source:Math.floor(Math.random() * 4) + 1
                    } ); // Random values
                }
                employee.weekData = weekData;
            });

            var oMaterialModel = new JSONModel({ TableData: aMaterialData });
            this.getView().setModel(oMaterialModel, "materialModel");

            // Bind Items (Rows)
            oTable.bindItems({
                path: "materialModel>/TableData",
                template: new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.Text({ text: "{materialModel>Material}" }),
                        new sap.m.Text({ text: "{materialModel>Plant}" }) 
                    ].concat(aWeeks.map((week, index) => 
                        new sap.m.ObjectStatus({ text: "{materialModel>weekData/" + index + "/Quantity}",
                            inverted: true,
                            state: "{= ${materialModel>weekData/" + index + "/Source} === 1 ? 'Success' : "
                                        +" ${materialModel>weekData/" + index + "/Source} === 2 ? 'Error' :"
                                        +" ${materialModel>weekData/" + index + "/Source} === 3 ? 'Warning' : 'Information'}"
                         })
                    ))
                })
            });
        }
    });
});
