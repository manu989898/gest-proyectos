        this.app.initModule("isf.eco.widgetDescargos");
   //244

   if (this.app.moduleRegister.map["isf.eco.widgetDescargos"]) {
            var connW = new isf.lib.Connection("GetWidgetDescargos");
            connW.addParam('p_centcodi', this.app.centcodi);
            this.app.loadModule("isf.eco.widgetDescargos").getData(connW);
        }

    //284

    
