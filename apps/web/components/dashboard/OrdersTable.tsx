"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { useOrders, type Order } from "@/hooks/useOrders";
import { useOrderStore } from "@/lib/stores/order.store";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import OrderStatusDropdown from "./OrderStatusDropdown";
import ClaimOrderButton from "./ClaimOrderButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import SkeletonRow from "@/components/shared/SkeletonRow";
import SharedEmptyState from "@/components/shared/EmptyState";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const columnHelper = createColumnHelper<Order>();

const columns = [
  columnHelper.accessor("order_number", {
    header: "No. Order",
    cell: (info) => (
      <span className="font-mono text-xs font-semibold">{info.getValue()}</span>
    ),
  }),
  columnHelper.accessor("customer_name", {
    header: "Customer",
    cell: (info) => (
      <div>
        <p className="font-medium text-sm">{info.getValue()}</p>
        <p className="text-xs text-gray-400">{info.row.original.customer_email}</p>
      </div>
    ),
  }),
  columnHelper.accessor("total_amount", {
    header: "Total",
    cell: (info) => (
      <span className="font-semibold text-sm">{formatRupiah(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("paid_status", {
    header: "Bayar",
    cell: (info) => {
      const v = info.getValue();
      return (
        <Badge
          className={
            v === "PAID"
              ? "bg-green-100 text-green-700"
              : v === "FAILED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }
        >
          {v}
        </Badge>
      );
    },
  }),
  columnHelper.accessor("order_status", {
    header: "Status",
    cell: (info) => (
      <OrderStatusDropdown
        orderId={info.row.original.id}
        currentStatus={info.getValue()}
      />
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Tanggal",
    cell: (info) => (
      <span className="text-xs text-gray-500">
        {new Date(info.getValue()).toLocaleDateString("id-ID")}
      </span>
    ),
  }),
  columnHelper.display({
    id: "actions",
    header: "Aksi",
    cell: (info) => (
      <ClaimOrderButton
        orderId={info.row.original.id}
        handledById={info.row.original.handled_by_id}
      />
    ),
  }),
];

export default function OrdersTable() {
  const queryClient = useQueryClient();
  const wsOrders = useOrderStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [paidStatus, setPaidStatus] = useState("");

  const { data: orders = [], isLoading } = useOrders({
    search: search || undefined,
    order_status: orderStatus || undefined,
    paid_status: paidStatus || undefined,
  });

  // Invalidate query saat ada order baru dari WebSocket
  useEffect(() => {
    if (wsOrders.length > 0) {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    }
  }, [wsOrders.length, queryClient]);

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input
          placeholder="Cari order, customer, email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs text-sm"
        />
        <select
          value={orderStatus}
          onChange={(e) => setOrderStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">Semua Status Order</option>
          {["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={paidStatus}
          onChange={(e) => setPaidStatus(e.target.value)}
          className="border rounded px-3 py-2 text-sm bg-white"
        >
          <option value="">Semua Status Bayar</option>
          {["UNPAID","PAID","FAILED"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-white">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-gray-50 border-b">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={7} />
                ))}
              </>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <SharedEmptyState
                    icon="📋"
                    title="Tidak ada order"
                    subtitle="Order yang masuk akan muncul di sini."
                  />
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}