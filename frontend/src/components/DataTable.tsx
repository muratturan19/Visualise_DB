import React, { useMemo, useState } from 'react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
} from '@tanstack/react-table'
import { UserIcon } from '@heroicons/react/20/solid'
import Button from './ui/Button'
import { Input } from './ui/Input'

const customerHeaders = [
  'müşteriler',
  'müşteri',
  'musteriler',
  'musteri',
  'customer',
  'customers',
]

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
}

export default function DataTable({ data }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})


  const formatValue = (val: unknown, row: Record<string, unknown>) => {
    const isNumeric =
      typeof val === 'number' ||
      (typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val)))

    if (isNumeric) {
      const num = Number(val)
      const formatted = num.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      const rowAny = row as Record<string, unknown>
      const unit =
        rowAny.birim || rowAny.para_birim || rowAny.currency || rowAny.doviz
      return unit ? `${formatted} ${unit}` : formatted
    }
    return String(val)
  }

  const columns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
    if (!data || data.length === 0) return []
    const headers = Object.keys(data[0])
    const defs: ColumnDef<Record<string, unknown>, unknown>[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            disabled={!row.getCanSelect()}
            onChange={row.getToggleSelectedHandler()}
          />
        ),
      },
    ]

    headers.forEach((h) => {
      defs.push({
        accessorKey: h,
        header: h,
        cell: ({ getValue, row }) => {
          const val = getValue()
          const colorClass =
            typeof val === 'number'
              ? val < 0
                ? 'text-red-600'
                : val > 0
                ? 'text-green-600'
                : ''
              : ''
          const isCustomerField = customerHeaders.some((ch) =>
            h.toLowerCase().includes(ch)
          )
          return (
            <div className={`flex items-center gap-1 ${colorClass}`}>
              {isCustomerField && (
                <UserIcon className="w-4 h-4 text-gray-500" />
              )}
              {formatValue(val, row.original)}
            </div>
          )
        },
      })
    })
    return defs
  }, [data])

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    initialState: { pagination: { pageSize: 10 } },
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase()
      return Object.values(row.original).some((v) =>
        String(v).toLowerCase().includes(search)
      )
    },
  })

  if (!data || data.length === 0) {
    return <p>No results.</p>
  }

  const exportCSV = () => {
    const headers = table
      .getAllLeafColumns()
      .filter((c) => c.id !== 'select')
      .map((c) => c.id)
    const rows = table.getFilteredRowModel().rows
    const csv = [headers.join(',')]
    rows.forEach((row) => {
      const vals = headers.map((h) => JSON.stringify(row.original[h] ?? ''))
      csv.push(vals.join(','))
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'table.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportExcel = async () => {
    const XLSX = await import('xlsx')
    const rows = table.getFilteredRowModel().rows.map((r) => r.original)
    const sheet = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, sheet, 'Data')
    XLSX.writeFile(wb, 'table.xlsx')
  }

  const exportPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default
    const headers = table
      .getAllLeafColumns()
      .filter((c) => c.id !== 'select')
      .map((c) => c.id)
    const rows = table
      .getFilteredRowModel()
      .rows.map((r) => headers.map((h) => String(r.original[h] ?? '')))
    const doc = new jsPDF()
    autoTable(doc, { head: [headers], body: rows })
    doc.save('table.pdf')
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />
        <div className="ml-auto flex gap-2">
          <Button type="button" onClick={exportCSV} className="px-2 py-1">
            CSV
          </Button>
          <Button type="button" onClick={exportExcel} className="px-2 py-1">
            Excel
          </Button>
          <Button type="button" onClick={exportPDF} className="px-2 py-1">
            PDF
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-100 dark:bg-gray-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 text-left font-semibold select-none cursor-pointer"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {header.column.getCanSort() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === 'asc'
                          ? '▲'
                          : header.column.getIsSorted() === 'desc'
                          ? '▼'
                          : ''}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="even:bg-gray-50 dark:even:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between pt-2 text-sm">
        <div className="space-x-2">
          <Button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1"
          >
            Prev
          </Button>
          <Button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1"
          >
            Next
          </Button>
        </div>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
        </span>
      </div>
    </div>
  )
}
