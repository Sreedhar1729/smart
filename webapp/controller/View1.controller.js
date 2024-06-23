sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/syncStyleClass",

],
    function (Controller, ODataModel, MessageBox, Fragment, Filter, FilterOperator,syncStyleClass) {
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


                //  Edit Book details
               
            },


            onSave: async function () {
                var id = this.getView().byId("idEditBookIDVal").getValue();
                if (id == "" || id == undefined) {
                    sap.m.MessageBox.error("please enter requite")
                    this.oDialog.close();

                }
                var name = this.getView().byId("idEditBookISBNVal").getValue();
                var des = this.getView().byId("idEditBookTitleVal").getValue();

                const oUnique = await this.checkIfExist(id);
                if (oUnique) {
                    this.oDialog.close();
                    sap.m.MessageBox.error("Exist");

                    return;
                }

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
                    success: function (odata, responses) {

                        MessageBox.success("Product created successfully");
                        this.oDialog.close();

                    }.bind(this),
                    error: function (error) {
                        MessageBox.error("Failed to create product: " + error.message);
                        this.byId("idEditBookForm").close();

                    }.bind(this)
                })
            },

            onClose: function () {
                if (this.oDialog.isOpen()) {
                    this.oDialog.close()
                }
            },

            onDelete: function (oEvent) {
                let oModel = this.getView().byId("SmartTable").getModel();
                oModel.setUseBatch(false);
                let items = this.getView().byId("idTable").getSelectedItems();
                items.forEach(val => {
                    let id = val.getBindingContext().getProperty("ID");
                    oModel.remove("/Products(" + id + ")");
                })
            },
            checkIfExist: function (sid) {
                return new Promise(function (resolve, reject) {
                    var oModel = this.getView().getModel("Products");
                    oModel.setUseBatch(false);

                    var oFilter = new Filter("ID", FilterOperator.EQ, sid);

                    oModel.read("/Products", {
                        filters: [oFilter],
                        success: function (oData) {
                            var isExist = oData.results.length > 0; // Check if any results were returned
                            resolve(isExist);
                        },
                        error: function (error) {
                            reject(error); // Handle error case
                        }
                    });
                }.bind(this));
            },

            onAdd: async function () {
                this.oDialog ??= await this.loadFragment({
                    name: "com.app.project1.fragments.new"
                });
                var id = this.getView().byId("idEditBookIDVal").setValue();

                var name = this.getView().byId("idEditBookISBNVal").setValue();
                var des = this.getView().byId("idEditBookTitleVal").setValue();


                this.oDialog.open();
            },
            onEdit: async function () {

                var oTable = this.getView().byId("SmartTable").getTable();
                oTable.setMode("MultiSelect");
                oTable.attachSelectionChange(this.onTableSelection, this);
                this.oDialog1 ??= await this.loadFragment({
                    name: "com.app.project1.fragments.edit"
                });
                this.oDialog1.getContent()[0].setContexts(this.getView().byId("SmartTable").getTable().getSelectedContexts());
                syncStyleClass("sapUiSizeCompact", this.getView(), this.oDialog1);


                this.oDialog1.open();
                 
            },

            onCloseDialog: function () {
                this.oDialog1.close();
                this.oDialog1.destroy();
            },
            onTableSelection: function () {
                var aSelectedItems = this.getView().byId("SmartTable").getTable().getSelectedItems();
                // this.getView().byId("btnMultiEdit").setEnabled(aSelectedItems.length > 0);
            },
            onDialogSaveButton:function(){
                var oMultiEditContainer = this.oDialog1.getContent()[0];
                this.oDialog1.setBusy(true);
                oMultiEditContainer.getErroneousFieldsAndTokens().then(function (aErrorFields) {
                    this.oDialog1.setBusy(false);
                    if (aErrorFields.length === 0) {
                        this._saveChanges();
                    }
                }.bind(this)).catch(function () {
                    this.oDialog1.setBusy(false);
                }.bind(this));
            },
            _saveChanges: function () {
                var oMultiEditContainer = this.oDialog1.getContent()[0],
                    that = this,
                    aUpdatedContexts,
                    oContext,
                    oUpdatedData,
                    oObjectToUpdate,
                    oUpdatedDataCopy;
                    
                    oModel.setUseBatch(false);


                    var fnHandler = function (oField) {
                        var sPropName = oField.getPropertyName(),
                            sUomPropertyName = oField.getUnitOfMeasurePropertyName();
                        if (!oField.getApplyToEmptyOnly() || !oObjectToUpdate[sPropName]
                            || (typeof oObjectToUpdate[sPropName] == "string" && !oObjectToUpdate[sPropName].trim())) {
                            oUpdatedDataCopy[sPropName] = oUpdatedData[sPropName];
                        }
                        if (oField.isComposite()) {
                            if (!oField.getApplyToEmptyOnly() || !oObjectToUpdate[sUomPropertyName]) {
                                oUpdatedDataCopy[sUomPropertyName] = oUpdatedData[sUomPropertyName];
                            }
                        }
                    };
        
                    MessageBox.success("Save action started", {
                        onClose: function () {
                            oMultiEditContainer.getAllUpdatedContexts(true).then(function (result) {
                                MessageBox.show("Updated contexts available", {
                                    onClose: function () {
                                        aUpdatedContexts = result;
                                        for (var i = 0; i < aUpdatedContexts.length; i++) {
                                            oContext = aUpdatedContexts[i].context;
                                            oUpdatedData = aUpdatedContexts[i].data;
                                            oObjectToUpdate = oContext.getModel().getObject(oContext.getPath());
                                            oUpdatedDataCopy = {};
                                            this._getFields().filter(function (oField) {
                                                return !oField.isKeepExistingSelected();
                                            }).forEach(fnHandler);
                                            oContext.getModel().update(oContext.getPath(), oUpdatedDataCopy);
                                        }
                                        MessageBox.success("Model was updated");
        
                                        that.onCloseDialog();
                                    }.bind(this)
                                });
                            }.bind(oMultiEditContainer));
                        }
                    });
                    this.oMultiEditDialog.close();
                
            }


        });
    });
