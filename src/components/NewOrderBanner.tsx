import { useState } from "react";
import { Bell, CheckCircle, XOctagon, Clock, User, ShoppingBag, MapPin, Phone, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { brl } from "@/lib/data";
import type { OnlineOrder } from "@/lib/online-order";
import { normalizeItems } from "@/lib/online-order";

interface NewOrderBannerProps {
  /** Lista de pedidos pendentes (ainda não aceitos) */
  pendingOrders: OnlineOrder[];
  /** Callback quando um pedido é aceito */
  onAccept: (orderId: string) => void;
  /** Callback quando um pedido é recusado */
  onReject: (orderId: string, reason: string) => void;
}

export function NewOrderBanner({ pendingOrders, onAccept, onReject }: NewOrderBannerProps) {
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  if (pendingOrders.length === 0) return null;

  function openRejectDialog(orderId: string) {
    setRejectOrderId(orderId);
    setRejectReason("");
    setRejectDialogOpen(true);
  }

  async function handleReject() {
    if (!rejectOrderId || !rejectReason.trim()) return;
    await onReject(rejectOrderId, rejectReason.trim());
    setRejectDialogOpen(false);
    setRejectOrderId(null);
    setRejectReason("");
  }

  function openOrderDetail(order: OnlineOrder) {
    setSelectedOrder(order);
  }

  return (
    <>
      {/* Banner principal */}
      <div className="mb-6 rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-lg">
        {/* Cabeçalho do banner */}
        <div className="flex items-center justify-between border-b border-orange-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600 animate-pulse" />
            <h2 className="font-display text-lg font-bold text-orange-800">
              🔔 Novos Pedidos Recebidos
            </h2>
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-orange-500 px-2.5 py-0.5 text-sm font-bold text-white">
              {pendingOrders.length}
            </span>
          </div>
          <span className="text-xs text-orange-600">
            Aguardando aceite ou recusa
          </span>
        </div>

        {/* Lista de pedidos pendentes */}
        <div className="divide-y divide-orange-100">
          {pendingOrders.map((order) => {
            const itens = normalizeItems(order.itens);
            const createdAt = new Date(order.created_at);
            const timeAgo = getTimeAgo(createdAt);

            return (
              <div
                key={order.id}
                className="cursor-pointer px-4 py-3 hover:bg-orange-100/50 transition"
                onClick={() => openOrderDetail(order)}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Informações do pedido */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-base text-foreground">
                        {order.cliente}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                        🌐 Online
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {timeAgo}
                      </span>
                    </div>

                    {/* Resumo dos itens */}
                    <div className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground mb-2">
                      <ShoppingBag className="h-3 w-3" />
                      {itens.slice(0, 3).map((item: any, idx: number) => (
                        <span key={idx}>
                          {item.quantidade}× {item.nome}
                          {idx < itens.length - 1 ? ", " : ""}
                        </span>
                      ))}
                      {itens.length > 3 && (
                        <span className="text-muted-foreground">+{itens.length - 3} mais</span>
                      )}
                    </div>

                    {/* Contato e endereço */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.telefone}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {order.endereco}
                      </span>
                    </div>
                  </div>

                  {/* Valor e botões de ação */}
                  <div className="flex flex-col items-end gap-2" onClick={(e) => e.stopPropagation()}>
                    <div className="text-right">
                      <div className="font-display text-xl font-bold text-primary">
                        {brl(Number(order.total))}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => onAccept(order.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                        onClick={() => openRejectDialog(order.id)}
                      >
                        <XOctagon className="h-4 w-4 mr-1" />
                        Recusar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de detalhes do pedido */}
      {selectedOrder && (
        <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <DialogTitle>Novo Pedido Recebido</DialogTitle>
              </div>
              <DialogDescription>
                Pedido de {selectedOrder.cliente} — aguardando aceite ou recusa
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informações do cliente */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                  <User className="h-4 w-4" />
                  Informações do Cliente
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{selectedOrder.cliente}</span>
                  </div>
                  {selectedOrder.telefone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedOrder.telefone}</span>
                    </div>
                  )}
                  {selectedOrder.endereco && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{selectedOrder.endereco}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Recebido em {new Date(selectedOrder.created_at).toLocaleString("pt-BR", {
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Itens do pedido */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 flex items-center gap-2 font-semibold text-primary">
                  <ShoppingBag className="h-4 w-4" />
                  Itens do Pedido
                </h3>
                <div className="space-y-2">
                  {normalizeItems(selectedOrder.itens).map((item: any, idx: number) => (
                    <div key={idx} className="flex items-start justify-between gap-4 rounded-lg border bg-card p-3">
                      <div className="flex-1">
                        <div className="font-medium">{item.nome}</div>
                        {item.descricao && (
                          <div className="text-xs text-muted-foreground mt-0.5">{item.descricao}</div>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.quantidade}× {brl(item.preco_unitario || 0)}
                        </div>
                      </div>
                      <div className="font-semibold text-primary whitespace-nowrap">
                        {brl((item.preco_unitario || 0) * item.quantidade)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo financeiro */}
              <div className="rounded-lg border bg-muted/30 p-4">
                <h3 className="mb-3 font-semibold text-primary">Resumo Financeiro</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>{brl(Number(selectedOrder.subtotal))}</span>
                  </div>
                  {Number(selectedOrder.desconto) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto{selectedOrder.cupom ? ` (${selectedOrder.cupom})` : ""}:</span>
                      <span>-{brl(Number(selectedOrder.desconto))}</span>
                    </div>
                  )}
                  {Number(selectedOrder.taxa_entrega) > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span>{brl(Number(selectedOrder.taxa_entrega))}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2 font-display text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-primary">{brl(Number(selectedOrder.total))}</span>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  onClick={() => {
                    onAccept(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  ✅ Aceitar Pedido
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  size="lg"
                  onClick={() => {
                    openRejectDialog(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                >
                  <XOctagon className="h-5 w-5 mr-2" />
                  ❌ Recusar Pedido
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Diálogo de recusa */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <DialogTitle>Recusar pedido</DialogTitle>
            </div>
            <DialogDescription>
              Informe o motivo da recusa. Este motivo será enviado ao cliente em tempo real.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                ⚠️ O pedido será arquivado e não entrará na fila de produção.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Motivo da recusa</label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ex: Produto indisponível, fora da área de entrega, etc."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim()}
            >
              <XOctagon className="h-4 w-4 mr-1" />
              Recusar pedido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** Formata o tempo decorrido desde uma data */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins}min atrás`;
  if (diffHours < 24) return `${diffHours}h${diffMins % 60}min atrás`;
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
