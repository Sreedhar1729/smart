sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment"
],
function (Controller,ODataModel,MessageBox,Fragment) {
    "use strict";

    return Controller.extend("com.app.project1.controller.View1", {
        onInit: function () {
        
                // Initialize the OData model (replace with your service URL)
                var sServiceUrl = "/V2/(S(ftca0w4iw33m13hinzmkzzmk))/OData/OData.svc/"; // Replace with your actual OData service URL
                var oModel = new ODataModel(sServiceUrl, {
             // Expect JSON responses
                    useBatch: false // Disable batch processing
                });
                this.getView().setModel(oModel, "Products");

        },

        onAdd: async function() {
            if (!this.oCreateEmployeeDialog) {
                this.oCreateEmployeeDialog = await Fragment.load({
                    id: this.getView().getId(),
                    name: "com.app.project1.fragments.new",
                    controller: this
                });
                this.getView().addDependent(this.oCreateEmployeeDialog);
            }

            this.oCreateEmployeeDialog.open();
        },

        onClose: function(){
            if(this.oCreateEmployeeDialog.isOpen()){
                this.oCreateEmployeeDialog.close()
            }  
        },
        onSave: function() {
            var id = this.getView().byId("idEditBookIDVal").getValue();
            var name = this.getView().byId("idEditBookISBNVal").getValue();
            var des = this.getView().byId("idEditBookTitleVal").getValue();
            var oPayload = {
                "ID": id,
                "Name": name,
                "Description": des,
                "ReleaseDate": new Date()
            };
        
            // Replace with your actual OData service URL
            var sServiceUrl = "/V2/(S(ftca0w4iw33m13hinzmkzzmk))/OData/OData.svc/";
            
            // Create a new instance of ODataModel
            var oModel = new sap.ui.model.odata.v2.ODataModel(sServiceUrl, {
                json: true, // Expect JSON responses
                useBatch: false // Disable batch processing
            });
        
            // Set the model on the view
            this.getView().setModel(oModel, "products");
        
            // Create a new entry in the Products collection
            oModel.create("/Products", oPayload, {
                success: function(odata, responses) {
                    this.oCreateEmployeeDialog.close();
                    MessageBox.success("Product created successfully");
               
                },
                error: function(error) {
                    MessageBox.error("Failed to create product: " + error.message);
                    this.oCreateEmployeeDialog.close();
                
        }
            })
            

        },
        onDelete: function (oEvent) {
            let oModel = this.getView().byId("SmartTable").getModel();
                oModel.setUseBatch(false);
                let items = this.getView().byId("idTable").getSelectedItems();
                items.forEach(val =>{
                        let id = val.getBindingContext().getProperty("ID");
                        oModel.remove("/Products("+id+")");
                   })
            }
    });
});
