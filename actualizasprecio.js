if (this.stoDescargosLin.count() > 0) {
            this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(0, 1);
            this.filtraArticulosPorPlato(this.stoDescargosLin.first().get("SERVCODI"), this.stoDescargosLin.first().get("DESCTIPO"));
           
            for (var cont = 0; cont < this.stoDescargosLin.count(); cont++) {
                var servcodi = this.stoDescargosLin.data.items[cont].data.SERVCODI;
                var desctipo = this.stoDescargosLin.data.items[cont].data.DESCTIPO;

                // Filtrar artículos por plato actual
                this.filtraArticulosPorPlato(servcodi, desctipo);
                console.log("Detalles después de filtrar para SERVCODI:", servcodi);
                this.stoDescargosLinDet.each(function (rec) {
                    console.log(" ->", rec.get("SERVCODI"), rec.get("DELDIMPORTE"));
                });
                var servcodi = this.stoDescargosLin.data.items[cont].data.SERVCODI;

                var desclin = this.stoDescargosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                // Recalcula los importes del descargo
                desclin.set("DELNIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
                desclin.set("DELNIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
                desclin.set("DELNIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
                desclin.set("DELNIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

                // Recalcula el precio del descargo
                desclin.set("DELNPRECIO", Common.redondea(desclin.data.DELNIMPORTE / desclin.data.DELNCANT, 5));
                desclin.set("DELNPRECIOUMB", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOLOC", Common.redondea(desclin.data.DELNIMPORTELOC / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOCONS", Common.redondea(desclin.data.DELNIMPORTECONS / desclin.data.DELNCANTUMB, 5));
                desclin.set("DELNPRECIOUSD", Common.redondea(desclin.data.DELNIMPORTEUSD / desclin.data.DELNCANTUMB, 5));

                var descelab = this.stoElaboradosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                if (descelab != null) {

                    // Recalcula los importes del elaborado
                    descelab.set("DELEIMPORTE", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTE"), 2));
                    descelab.set("DELEIMPORTELOC", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTELOC"), 2));
                    descelab.set("DELEIMPORTECONS", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTECONS"), 2));
                    descelab.set("DELEIMPORTEUSD", Common.redondea(this.stoDescargosLinDet.sum("DELDIMPORTEUSD"), 2));

                    // Recalcula el precio del elaborado
                    descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELEIMPORTE / descelab.data.DELECANT, 5));
                    descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELEIMPORTELOC / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELEIMPORTECONS / descelab.data.DELECANTUMB, 5));
                    descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELEIMPORTEUSD / descelab.data.DELECANTUMB, 5));

                }

            }

            this.actualizaPrecios();
        }