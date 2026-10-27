public package ShipInventoryService.app.dto;

public class ActualizarStockRequest {

    private Integer stockDisponible;
    private Integer stockReservado;
    private String ubicacionAlmacen;
    private String motivoAjuste;

    public ActualizarStockRequest() {
    }

    public ActualizarStockRequest(Integer stockDisponible, Integer stockReservado, String ubicacionAlmacen, String motivoAjuste) {
        this.stockDisponible = stockDisponible;
        this.stockReservado = stockReservado;
        this.ubicacionAlmacen = ubicacionAlmacen;
        this.motivoAjuste = motivoAjuste;
    }

    public Integer getStockDisponible() { return stockDisponible; }
    public void setStockDisponible(Integer stockDisponible) { this.stockDisponible = stockDisponible; }

    public Integer getStockReservado() { return stockReservado; }
    public void setStockReservado(Integer stockReservado) { this.stockReservado = stockReservado; }

    public String getUbicacionAlmacen() { return ubicacionAlmacen; }
    public void setUbicacionAlmacen(String ubicacionAlmacen) { this.ubicacionAlmacen = ubicacionAlmacen; }

    public String getMotivoAjuste() { return motivoAjuste; }
    public void setMotivoAjuste(String motivoAjuste) { this.motivoAjuste = motivoAjuste; }
} {
    
}
