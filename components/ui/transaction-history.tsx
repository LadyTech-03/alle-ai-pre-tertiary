import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DataTable } from "./txn/data-table";
import { columns, invoiceColumns } from "./txn/columns";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Wallet, Loader, RefreshCw } from "lucide-react";
import { Transaction, Invoice } from "@/lib/types";
import { paymentApi } from "@/lib/api/payment";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
  }

export function TransactionHistoryModal({ isOpen, onClose }: ModalProps) {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchInvoices = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await paymentApi.getInvoices();
            if (response.status) {
                setInvoices(response.invoices);
            } else {
                setError('Failed to fetch invoices');
            }
        } catch (err: any) {
            setError(err.response.data.error || err.response.data.message || 'Failed to fetch invoices');
            // console.error('Error fetching invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInvoices();
        }
    }, [isOpen]);

    const totalAmount = invoices
        .filter(invoice => invoice.status === 'paid')
        .reduce((acc, invoice) => acc + invoice.amount_due, 0);

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[1000px] h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold">Invoice History</DialogTitle>
            </div>
          </DialogHeader>
  
          <div className="mt-4 flex-1 overflow-hidden">
            {loading && invoices.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader className="h-4 w-4 animate-spin" />
                  Loading invoices...
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <p className="text-red-500 mb-2">{error}</p>
                  <Button variant="outline" size="sm" onClick={fetchInvoices}>
                    Try Again
                  </Button>
                </div>
              </div>
            ) : invoices.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center text-muted-foreground">
                  <Wallet className="h-8 w-8 mx-auto mb-2" />
                  <p>No invoices found</p>
                </div>
              </div>
            ) : (
              <DataTable columns={invoiceColumns} data={invoices} />
            )}
          </div>
  
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div>
                Showing {invoices.length} invoices
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-1">
                <Wallet className="h-4 w-4" />
                Total paid: £{totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }