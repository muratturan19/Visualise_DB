import { useRef, useState } from 'react'
import type { Chart as ChartJS } from 'chart.js'
import ChartWrapper, { baseOptions, defaultPalette } from './ChartWrapper'
import Button from '../ui/Button'
import { useTheme } from '../../hooks/useTheme'

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[]
  chartType: 'bar' | 'line' | 'scatter' | 'pie' | 'doughnut'
  x: string
  y: string | string[]
}

export default function ChartView({ data, chartType, x, y }: Props) {
  const chartRef = useRef<ChartJS>(null)
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(data.length)
  const { theme } = useTheme()

  if (!data || data.length === 0) {
    return <p>No results for chart.</p>
  }

  const labels = data.map((d) => d[x])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const unitSource = data[0] as any
  const unit =
    unitSource.birim || unitSource.para_birim || unitSource.currency || unitSource.doviz
  const numberFormatter = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  const textColor = theme === 'dark' ? '#dbeafe' : '#1e3a8a'
  const gridColor = theme === 'dark' ? '#334155' : '#e2e8f0'

  let yKeys = Array.isArray(y) ? y : y.split(',').map((s) => s.trim())
  if (!yKeys[0]) {
    yKeys = Object.keys(data[0]).filter((k) => k !== x)
  }
  yKeys = yKeys.filter((k) => typeof data[0][k] === 'number')

  const datasets = yKeys.map((key, idx) => ({
    label: key,
    data: data.map((d) => d[key]),
    borderColor: defaultPalette[idx % defaultPalette.length],
    backgroundColor: defaultPalette[idx % defaultPalette.length],
    fill: false,
  }))

  const options = {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      title: { display: true, text: yKeys.join(' vs '), color: textColor },
      tooltip: {
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: (ctx: any) => {
            const value = ctx.parsed.y ?? ctx.parsed
            const formatted = numberFormatter.format(value)
            return `${ctx.dataset.label || ''}: ${formatted}${unit ? ' ' + unit : ''}`
          },
        },
      },
      rangeFilter: {
        start,
        end,
      },
      legend: { ...baseOptions.plugins.legend, labels: { color: textColor } },
    },
    scales: {
      y: {
        ticks: {
          color: textColor,
          callback: (val: string | number) =>
            numberFormatter.format(Number(val)) + (unit ? ' ' + unit : ''),
        },
        grid: { color: gridColor },
      },
      x: {
        ticks: { color: textColor },
        grid: { color: gridColor },
      },
    },
  }

  const chartData =
    chartType === 'scatter'
      ? {
          datasets: yKeys.slice(0, 2).map((key, idx) => ({
            label: key,
            data: data.map((d) => ({ x: d[x], y: d[key] })),
            borderColor: defaultPalette[idx % defaultPalette.length],
            backgroundColor: defaultPalette[idx % defaultPalette.length],
          })),
        }
      : chartType === 'pie' || chartType === 'doughnut'
      ? {
          labels,
          datasets: [
            {
              label: yKeys[0],
              data: data.map((d) => d[yKeys[0]]),
              backgroundColor: defaultPalette,
            },
          ],
        }
      : { labels, datasets }

  const handleExportPNG = () => {
    const chart = chartRef.current
    if (!chart) return
    const url = chart.toBase64Image()
    const link = document.createElement('a')
    link.href = url
    link.download = 'chart.png'
    link.click()
  }

  const handleExportPDF = async () => {
    const chart = chartRef.current
    if (!chart) return
    const { jsPDF } = await import('jspdf')
    const doc = new jsPDF()
    const imgData = chart.toBase64Image()
    doc.addImage(imgData, 'PNG', 10, 10, 180, 100)
    doc.save('chart.pdf')
  }

  return (
    <div className="space-y-2">
      <div className="rounded p-2 bg-white dark:bg-blue-900">
        <ChartWrapper ref={chartRef} type={chartType} data={chartData} options={options} />
      </div>
      <div className="flex gap-2 items-center text-sm">
        <label>
          Start
          <input
            type="number"
            className="ml-1 border p-1 w-16"
            min={0}
            max={data.length - 1}
            value={start}
            onChange={(e) => setStart(Number(e.target.value))}
          />
        </label>
        <label>
          End
          <input
            type="number"
            className="ml-1 border p-1 w-16"
            min={0}
            max={data.length}
            value={end}
            onChange={(e) => setEnd(Number(e.target.value))}
          />
        </label>
        <Button onClick={handleExportPNG} className="ml-auto">
          PNG
        </Button>
        <Button variant="secondary" onClick={handleExportPDF}>
          PDF
        </Button>
      </div>
    </div>
  )
}
