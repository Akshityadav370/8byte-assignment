/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import React, { useMemo } from 'react'

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { usePortfolio } from '../hooks/usePortfolio'
import MyInfo from './MyInfo'

import type { ColumnDef } from '@tanstack/react-table'

interface TableRow {
  name: string
  symbol?: string
  sector: string
  quantity?: number
  purchasePrice?: number
  cmp?: number
  investment: number
  presentValue: number
  gainLoss: number
  peRatio?: number | null
  peRatioWithSource?: string
  latestEarnings?: number | null
  portfolioPercent?: number
  latestEarningsWithSource?: string
  isSector?: boolean
}

const COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#06b6d4',
  '#84cc16',
]

const PortfolioTable: React.FC = () => {
  const { data, loading, error, lastUpdated, refetch } = usePortfolio(15000)

  const calculatePortfolioPercent = (
    investment: number,
    totalInvestment: number,
  ) => {
    return ((investment / totalInvestment) * 100).toFixed(2)
  }

  const columns = useMemo<ColumnDef<TableRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Particulars',
        cell: ({ row, getValue }) => (
          <div
            className={`flex items-center ${row.original.isSector ? 'pl-0' : 'pl-6'}`}
          >
            <span className={row.original.isSector ? 'font-bold' : ''}>
              {getValue() as string}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'purchasePrice',
        header: 'Purchase Price',
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined
          return value ? `₹${value.toFixed(2)}` : ''
        },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined
          return value ? value.toLocaleString() : '-'
        },
      },
      {
        accessorKey: 'investment',
        header: 'Investment',
        cell: ({ getValue }) => {
          const value = getValue() as number
          return value
            ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
            : '-'
        },
      },
      {
        accessorKey: 'portfolioPercent',
        header: 'Portfolio (%)',
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined
          return value ? `${value}%` : ''
        },
      },
      {
        accessorKey: 'symbol',
        header: 'NSE/BSE',
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined
          return value ? value.replace('.NS', '') : ''
        },
      },
      {
        accessorKey: 'cmp',
        header: 'CMP',
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined
          return value ? `₹${value.toFixed(2)}` : '-'
        },
      },
      {
        accessorKey: 'presentValue',
        header: 'Present Value',
        cell: ({ getValue }) => {
          const value = getValue() as number
          return value
            ? `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
            : '-'
        },
      },
      {
        accessorKey: 'gainLoss',
        header: 'Gain/Loss',
        cell: ({ getValue }) => {
          const value = getValue() as number
          const isPositive = value >= 0
          return (
            <span
              className={
                isPositive
                  ? 'text-green-600 font-semibold'
                  : 'text-red-600 font-semibold'
              }
            >
              {isPositive ? '+' : ''}
              {value
                ? value.toLocaleString('en-IN', { maximumFractionDigits: 2 })
                : '-'}
            </span>
          )
        },
      },
      {
        accessorKey: 'peRatioWithSource',
        header: 'P/E Ratio',
        cell: ({ getValue }) => {
          // const value = getValue() as number | null | undefined
          // return value ? value.toFixed(2) : '-'
          const value = getValue() as string | undefined
          return value ? value : ''
        },
      },
      {
        accessorKey: 'latestEarningsWithSource',
        header: 'Earnings',
        cell: ({ getValue }) => {
          // const value = getValue() as number | null | undefined
          // return value ? value.toFixed(2) : '-'
          const value = getValue() as string | undefined
          return value ? value : ''
        },
      },
    ],
    [],
  )

  const flattenedData = useMemo(() => {
    if (!data?.sectors) return []
    const totalInvestment = data.summary.totalInvestment
    const rows: TableRow[] = []

    data.sectors.forEach((sector) => {
      const sectorPercent = calculatePortfolioPercent(
        sector.totalInvestment,
        totalInvestment,
      )

      rows.push({
        name: sector.sectorName,
        sector: sector.sectorName,
        investment: sector.totalInvestment,
        presentValue: sector.totalPresentValue,
        gainLoss: sector.totalGainLoss,
        portfolioPercent: parseFloat(sectorPercent),
        purchasePrice: sector.totalPurchasePrice,
        quantity: sector.totalQty,
        isSector: true,
      })

      sector.stocks.forEach((stock) => {
        rows.push({
          ...stock,
          portfolioPercent: parseFloat(
            calculatePortfolioPercent(stock.investment, totalInvestment),
          ),
          isSector: false,
          peRatioWithSource: stock.peRatio
            ? `${stock.peRatio} (${stock.source})`
            : '-',
          latestEarningsWithSource: stock.latestEarnings
            ? `${stock.latestEarnings} (${stock.source})`
            : '-',
        })
      })
    })
    return rows
  }, [data])

  const sectorDataKey = useMemo(() => {
    if (!data?.sectors) return ''
    return data.sectors
      .map((s) => `${s.sectorName}-${s.totalInvestment}`)
      .join('|')
  }, [data?.sectors])

  const pieChartData = useMemo(() => {
    if (!data?.sectors) return []
    return data.sectors.map((sector) => ({
      name: sector.sectorName,
      value: sector.totalInvestment,
    }))
  }, [sectorDataKey])

  const MemoizedPieChart = useMemo(() => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              percent !== undefined
                ? `${name}: ${(percent * 100).toFixed(1)}%`
                : name
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value?: number) =>
              typeof value === 'number'
                ? `₹${value.toLocaleString('en-IN')}`
                : '-'
            }
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    )
  }, [pieChartData])

  const table = useReactTable({
    data: flattenedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-lg text-gray-500">Loading portfolio...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white rounded-lg p-8 max-w-md shadow-md">
          <div className="text-red-500 mb-4">Error: {error}</div>
          <button
            onClick={refetch}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalGainLoss = data?.summary?.totalGainLoss || 0
  const gainLossPercent = data?.summary?.totalInvestment
    ? ((totalGainLoss / data.summary.totalInvestment) * 100).toFixed(2)
    : '0.00'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 w-full flex items-center justify-between">
          <div>
            <MyInfo />
          </div>
          <div className="flex items-center justify-end gap-4 text-sm text-gray-500">
            <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
            <span>Auto-refresh: 15s</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg border border-gray-200 flex justify-around flex-col">
            <div>
              <div className="text-xl text-gray-500 mb-2">Total Investment</div>
              <div className="text-4xl font-semibold text-gray-900">
                ₹{data?.summary?.totalInvestment?.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-full border-[0.5px] border-gray-300"></div>
            <div>
              <div className="text-xl text-gray-500 mb-2">Present Value</div>
              <div className="text-4xl font-semibold text-gray-900">
                ₹{data?.summary?.totalPresentValue?.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="w-full border-[0.5px] border-gray-300"></div>
            <div>
              <div className="text-xl text-gray-500 mb-2">Total Gain/Loss</div>
              <div
                className={`text-4xl font-semibold ${
                  totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {totalGainLoss >= 0 ? '+' : ''}₹
                {totalGainLoss.toLocaleString('en-IN')}
              </div>
              <div
                className={`text-xl mt-1 ${
                  totalGainLoss >= 0 ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {totalGainLoss >= 0 ? '+' : ''}
                {gainLossPercent}%
              </div>
            </div>
          </div>
          <div className="bg-white col-span-2 rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sector Allocation
            </h2>
            {MemoizedPieChart}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr
                    key={headerGroup.id}
                    className="bg-gray-50 border-b border-gray-200"
                  >
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
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
                    className={`${
                      row.original.isSector ? 'bg-gray-50' : 'bg-white'
                    } border-b border-gray-200`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`px-4 py-3 text-sm text-gray-900 ${
                          row.original.isSector ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PortfolioTable
